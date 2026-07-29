'use client'
import { http } from '@/lib/api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

// ── Types ───────────────────────────────────────────────────────────────────

interface ListCollaborator {
  userId: string
  email?: string
  role: 'creator' | 'collaborator'
  pending?: boolean
  invitedAt: string
  acceptedAt?: string
}

export interface ListDoc {
  _id: string
  type: string
  title: string
  icon: string
  coverImageUrl: string
  groupId: string | null
  ownerId: string
  isPrivate: boolean
  collaborators: ListCollaborator[]
  pinnedToFavorites: boolean
  hideCompletedTasks: boolean
  blocks: unknown
  isInbox: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

// ── Keys ────────────────────────────────────────────────────────────────────

const listKeys = {
  all: ['lists'] as const,
  detail: (id: string) => ['lists', id] as const,
}

// ── Hook: useLists ──────────────────────────────────────────────────────────

export function useLists() {
  const queryClient = useQueryClient()

  const listsQuery = useQuery<ListDoc[]>({
    queryKey: listKeys.all,
    queryFn: () => http.get<ListDoc[]>('/api/lists'),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<ListDoc>) =>
      http.post<ListDoc>('/api/lists', data),
    onSuccess: (newList) => {
      queryClient.setQueryData<ListDoc[]>(listKeys.all, (old) =>
        old ? [newList, ...old] : [newList]
      )
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<ListDoc>) =>
      http.patch<ListDoc>(`/api/lists/${id}`, data),
    onMutate: async ({ id, ...data }) => {
      await queryClient.cancelQueries({ queryKey: listKeys.all })
      await queryClient.cancelQueries({ queryKey: listKeys.detail(id) })

      const previousLists = queryClient.getQueryData<ListDoc[]>(listKeys.all)
      const previousDetail = queryClient.getQueryData<ListDoc>(listKeys.detail(id))

      // Optimistic update in list
      queryClient.setQueryData<ListDoc[]>(listKeys.all, (old) =>
        old?.map((l) => (l._id === id ? { ...l, ...data } : l))
      )

      // Optimistic update in detail
      if (previousDetail) {
        queryClient.setQueryData<ListDoc>(listKeys.detail(id), {
          ...previousDetail,
          ...data,
        } as ListDoc)
      }

      return { previousLists, previousDetail }
    },
    onError: (_err, { id }, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(listKeys.all, context.previousLists)
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(listKeys.detail(id), context.previousDetail)
      }
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: listKeys.all })
      queryClient.invalidateQueries({ queryKey: listKeys.detail(id) })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      http.del<{ ok: boolean }>(`/api/lists/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: listKeys.all })
      const previous = queryClient.getQueryData<ListDoc[]>(listKeys.all)
      queryClient.setQueryData<ListDoc[]>(listKeys.all, (old) =>
        old?.filter((l) => l._id !== id)
      )
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKeys.all, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.all })
    },
  })

  return {
    lists: listsQuery.data ?? [],
    isLoading: listsQuery.isLoading,
    error: listsQuery.error,
    createList: createMutation.mutateAsync,
    updateList: updateMutation.mutate,
    updateListAsync: updateMutation.mutateAsync,
    deleteList: deleteMutation.mutate,
    deleteListAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}

// ── Hook: useList (single) ──────────────────────────────────────────────────

export function useList(id: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery<ListDoc>({
    queryKey: listKeys.detail(id ?? ''),
    queryFn: () => http.get<ListDoc>(`/api/lists/${id}`),
    enabled: !!id,
  })

  const updateBlocks = useMutation({
    mutationFn: (blocks: unknown) =>
      http.patch<ListDoc>(`/api/lists/${id}/blocks`, { blocks }),
    onMutate: async (blocks) => {
      if (!id) return
      await queryClient.cancelQueries({ queryKey: listKeys.detail(id) })
      const previous = queryClient.getQueryData<ListDoc>(listKeys.detail(id))
      if (previous) {
        queryClient.setQueryData<ListDoc>(listKeys.detail(id), {
          ...previous,
          blocks,
        })
      }
      return { previous }
    },
    onError: (_err, _blocks, context) => {
      if (id && context?.previous) {
        queryClient.setQueryData(listKeys.detail(id), context.previous)
      }
    },
  })

  const invalidate = useCallback(() => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: listKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: listKeys.all })
    }
  }, [id, queryClient])

  return {
    list: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    updateBlocks: updateBlocks.mutate,
    invalidate,
  }
}

// ── Hook: useListGroups ─────────────────────────────────────────────────────

