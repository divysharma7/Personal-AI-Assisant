'use client'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ── Types ───────────────────────────────────────────────────────────────────

export interface WorkflowColumn {
  id: string
  title: string
  order: number
  color: string | null
  wipLimit: number | null
}

export interface WorkflowDoc {
  _id: string
  name: string
  icon: string
  color: string
  ownerId: string
  templateType: string
  columns: WorkflowColumn[]
  order: number
  archived: boolean
  createdAt: string
  updatedAt: string
}

interface CreateWorkflowInput {
  name: string
  templateType: string
  icon?: string
  color?: string
  columns?: WorkflowColumn[]
  order?: number
}

type UpdateWorkflowInput = Partial<CreateWorkflowInput> & {
  archived?: boolean
}

// ── Keys ────────────────────────────────────────────────────────────────────

const workflowKeys = {
  all: ['workflows'] as const,
  detail: (id: string) => ['workflows', id] as const,
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

// ── Hook: useWorkflows ─────────────────────────────────────────────────────

export function useWorkflows() {
  const queryClient = useQueryClient()

  const workflowsQuery = useQuery<WorkflowDoc[]>({
    queryKey: workflowKeys.all,
    queryFn: () => fetchJson<WorkflowDoc[]>('/api/workflows'),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateWorkflowInput) =>
      fetchJson<WorkflowDoc>('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: workflowKeys.all })
      const prev = queryClient.getQueryData<WorkflowDoc[]>(workflowKeys.all)
      const maxOrder = (prev ?? []).reduce((max, w) => Math.max(max, w.order), -1)
      const optimistic: WorkflowDoc = {
        _id: `temp-${Date.now()}`,
        name: data.name,
        icon: data.icon ?? '📋',
        color: data.color ?? '#0f62fe',
        ownerId: '',
        templateType: data.templateType,
        columns: data.columns ?? [],
        order: data.order ?? maxOrder + 1,
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      queryClient.setQueryData<WorkflowDoc[]>(workflowKeys.all, (old) =>
        old ? [...old, optimistic] : [optimistic]
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(workflowKeys.all, context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: UpdateWorkflowInput & { id: string }) =>
      fetchJson<WorkflowDoc>(`/api/workflows/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onMutate: async ({ id, ...data }) => {
      await queryClient.cancelQueries({ queryKey: workflowKeys.all })
      const prev = queryClient.getQueryData<WorkflowDoc[]>(workflowKeys.all)
      queryClient.setQueryData<WorkflowDoc[]>(workflowKeys.all, (old) =>
        old?.map((w) => (w._id === id ? { ...w, ...data } : w))
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(workflowKeys.all, context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetchJson<{ ok: boolean }>(`/api/workflows/${id}`, {
        method: 'DELETE',
      }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: workflowKeys.all })
      const prev = queryClient.getQueryData<WorkflowDoc[]>(workflowKeys.all)
      queryClient.setQueryData<WorkflowDoc[]>(workflowKeys.all, (old) =>
        old?.filter((w) => w._id !== id)
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(workflowKeys.all, context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
    },
  })

  return {
    workflows: workflowsQuery.data ?? [],
    isLoading: workflowsQuery.isLoading,
    error: workflowsQuery.error,
    createWorkflow: createMutation.mutateAsync,
    updateWorkflow: updateMutation.mutateAsync,
    deleteWorkflow: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}

// ── Hook: useWorkflow (single) ─────────────────────────────────────────────

export function useWorkflow(id: string | null) {
  const queryClient = useQueryClient()

  const workflowQuery = useQuery<WorkflowDoc>({
    queryKey: workflowKeys.detail(id!),
    queryFn: () => fetchJson<WorkflowDoc>(`/api/workflows/${id}`),
    enabled: !!id,
  })

  const updateColumnsMutation = useMutation({
    mutationFn: (columns: WorkflowColumn[]) =>
      fetchJson<WorkflowDoc>(`/api/workflows/${id}/columns`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns }),
      }),
    onMutate: async (columns) => {
      const key = workflowKeys.detail(id!)
      await queryClient.cancelQueries({ queryKey: key })
      const prev = queryClient.getQueryData<WorkflowDoc>(key)
      if (prev) {
        queryClient.setQueryData<WorkflowDoc>(key, { ...prev, columns })
      }
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(workflowKeys.detail(id!), context.prev)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(id!) })
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
    },
  })

  const addColumnMutation = useMutation({
    mutationFn: (data: { title: string; color?: string | null; wipLimit?: number | null }) =>
      fetchJson<WorkflowDoc>(`/api/workflows/${id}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onMutate: async (data) => {
      const key = workflowKeys.detail(id!)
      await queryClient.cancelQueries({ queryKey: key })
      const prev = queryClient.getQueryData<WorkflowDoc>(key)
      if (prev) {
        const maxOrder = prev.columns.reduce((max, c) => Math.max(max, c.order), -1)
        const optimisticCol: WorkflowColumn = {
          id: `temp-${Date.now()}`,
          title: data.title,
          order: maxOrder + 1,
          color: data.color ?? null,
          wipLimit: data.wipLimit ?? null,
        }
        queryClient.setQueryData<WorkflowDoc>(key, {
          ...prev,
          columns: [...prev.columns, optimisticCol],
        })
      }
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(workflowKeys.detail(id!), context.prev)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(id!) })
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
    },
  })

  return {
    workflow: workflowQuery.data ?? null,
    isLoading: workflowQuery.isLoading,
    error: workflowQuery.error,
    updateColumns: updateColumnsMutation.mutateAsync,
    addColumn: addColumnMutation.mutateAsync,
  }
}
