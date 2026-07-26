'use client'
import { http } from '@/lib/api/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ListDoc } from '@/hooks/useLists'

// ── Types ───────────────────────────────────────────────────────────────────

interface CreateFolderInput {
  title: string
  icon?: string
  groupId?: string
  groupTitle?: string
  coverImageUrl?: string
  isPrivate?: boolean
}

interface UpdateFolderInput {
  title?: string
  icon?: string
  coverImageUrl?: string
  isPrivate?: boolean
  groupId?: string
  groupTitle?: string
}

interface CreateFolderResponse {
  list: ListDoc
  group: { _id: string; title: string } | null
  created: { list: boolean; group: boolean }
}

// ── Query keys ──────────────────────────────────────────────────────────────

const folderKeys = {
  all: ['folders'] as const,
}

const listKeys = {
  all: ['lists'] as const,
}

const taskKeys = {
  all: ['tasks'] as const,
}

// ── Hook: useFolders ────────────────────────────────────────────────────────

export function useFolders() {
  const queryClient = useQueryClient()

  // ── Create folder ─────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (input: CreateFolderInput) =>
      http.post<CreateFolderResponse>('/api/folders', input),
    onSuccess: (result) => {
      // Add to lists cache optimistically
      queryClient.setQueryData<ListDoc[]>(listKeys.all, (old) =>
        old ? [result.list, ...old] : [result.list]
      )
      // Invalidate both caches
      queryClient.invalidateQueries({ queryKey: folderKeys.all })
      queryClient.invalidateQueries({ queryKey: listKeys.all })
    },
  })

  // ── Update folder ─────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & UpdateFolderInput) =>
      http.patch<ListDoc>(`/api/folders/${id}`, updates),
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: listKeys.all })
      const previousLists = queryClient.getQueryData<ListDoc[]>(listKeys.all)
      queryClient.setQueryData<ListDoc[]>(listKeys.all, (old) =>
        old?.map((l) => (l._id === id ? { ...l, ...updates } : l))
      )
      return { previousLists }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(listKeys.all, context.previousLists)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all })
      queryClient.invalidateQueries({ queryKey: listKeys.all })
    },
  })

  // ── Delete folder ─────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      http.del<{ deleted: boolean; folderId: string }>(`/api/folders/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: listKeys.all })
      const previousLists = queryClient.getQueryData<ListDoc[]>(listKeys.all)
      queryClient.setQueryData<ListDoc[]>(listKeys.all, (old) =>
        old?.filter((l) => l._id !== id)
      )
      return { previousLists }
    },
    onError: (_err, _id, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(listKeys.all, context.previousLists)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all })
      queryClient.invalidateQueries({ queryKey: listKeys.all })
    },
  })

  // ── Move task to folder ───────────────────────────────────────────────────

  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, folderId }: { taskId: string; folderId: string }) =>
      http.patch(`/api/folders/${folderId}/tasks`, { taskId }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      queryClient.invalidateQueries({ queryKey: folderKeys.all })
      queryClient.invalidateQueries({ queryKey: listKeys.all })
    },
  })

  return {
    createFolder: createMutation.mutateAsync,
    updateFolder: updateMutation.mutateAsync,
    deleteFolder: deleteMutation.mutateAsync,
    moveTaskToFolder: moveTaskMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
