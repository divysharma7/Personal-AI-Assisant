'use client'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''


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

// ── Fetch helper ────────────────────────────────────────────────────────────

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
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
      fetchJson<CreateFolderResponse>('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }),
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
      fetchJson<ListDoc>(`/api/folders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
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
      fetchJson<{ deleted: boolean; folderId: string }>(`/api/folders/${id}`, {
        method: 'DELETE',
      }),
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
      fetchJson(`/api/folders/${folderId}/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      }),
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
