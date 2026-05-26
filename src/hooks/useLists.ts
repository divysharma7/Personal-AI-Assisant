'use client'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

// ── Types ───────────────────────────────────────────────────────────────────

export interface ListCollaborator {
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

export interface ListGroupDoc {
  _id: string
  title: string
  ownerId: string
  order: number
  collapsed: boolean
  createdAt: string
  updatedAt: string
}

// ── Keys ────────────────────────────────────────────────────────────────────

const listKeys = {
  all: ['lists'] as const,
  detail: (id: string) => ['lists', id] as const,
  groups: ['list-groups'] as const,
}

// ── Fetch helpers ───────────────────────────────────────────────────────────

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

// ── Hook: useLists ──────────────────────────────────────────────────────────

export function useLists() {
  const queryClient = useQueryClient()

  const listsQuery = useQuery<ListDoc[]>({
    queryKey: listKeys.all,
    queryFn: () => fetchJson<ListDoc[]>('/api/lists'),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<ListDoc>) =>
      fetchJson<ListDoc>('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (newList) => {
      queryClient.setQueryData<ListDoc[]>(listKeys.all, (old) =>
        old ? [newList, ...old] : [newList]
      )
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<ListDoc>) =>
      fetchJson<ListDoc>(`/api/lists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
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
      fetchJson<{ ok: boolean }>(`/api/lists/${id}`, { method: 'DELETE' }),
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
    queryFn: () => fetchJson<ListDoc>(`/api/lists/${id}`),
    enabled: !!id,
  })

  const updateBlocks = useMutation({
    mutationFn: (blocks: unknown) =>
      fetchJson<ListDoc>(`/api/lists/${id}/blocks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      }),
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

export function useListGroups() {
  const queryClient = useQueryClient()

  const query = useQuery<ListGroupDoc[]>({
    queryKey: listKeys.groups,
    queryFn: () => fetchJson<ListGroupDoc[]>('/api/list-groups'),
  })

  const createGroup = useMutation({
    mutationFn: (data: { title: string }) =>
      fetchJson<ListGroupDoc>('/api/list-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.groups })
    },
  })

  const updateGroup = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<ListGroupDoc>) =>
      fetchJson<ListGroupDoc>(`/api/list-groups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onMutate: async ({ id, ...data }) => {
      await queryClient.cancelQueries({ queryKey: listKeys.groups })
      const previous = queryClient.getQueryData<ListGroupDoc[]>(listKeys.groups)
      queryClient.setQueryData<ListGroupDoc[]>(listKeys.groups, (old) =>
        old?.map((g) => (g._id === id ? { ...g, ...data } : g))
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKeys.groups, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.groups })
    },
  })

  const deleteGroup = useMutation({
    mutationFn: (id: string) =>
      fetchJson<{ ok: boolean }>(`/api/list-groups/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.groups })
      queryClient.invalidateQueries({ queryKey: listKeys.all })
    },
  })

  return {
    groups: query.data ?? [],
    isLoading: query.isLoading,
    createGroup: createGroup.mutateAsync,
    updateGroup: updateGroup.mutate,
    deleteGroup: deleteGroup.mutate,
  }
}
