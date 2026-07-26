'use client'
import { http } from '@/lib/api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TaskRecord } from './useTasks'

// ── Types ───────────────────────────────────────────────────────────────────

export interface KanbanSectionDoc {
  _id: string
  title: string
  order: number
  userId: string
  createdAt: string
  updatedAt: string
}

interface ReorderPayload {
  taskId: string
  sectionId?: string | null
  status?: string
  kanbanOrder: number
  dueDate?: string | null
}

// ── Keys ────────────────────────────────────────────────────────────────────

const sectionKeys = {
  all: ['kanban-sections'] as const,
}

const TASKS_KEY = ['tasks'] as const

// ── Hook: useKanbanSections ─────────────────────────────────────────────────

export function useKanbanSections() {
  const queryClient = useQueryClient()

  const sectionsQuery = useQuery<KanbanSectionDoc[]>({
    queryKey: sectionKeys.all,
    queryFn: () => http.get<KanbanSectionDoc[]>('/api/kanban-sections'),
  })

  const createMutation = useMutation({
    mutationFn: (data: { title: string }) =>
      http.post<KanbanSectionDoc>('/api/kanban-sections', data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: sectionKeys.all })
      const prev = queryClient.getQueryData<KanbanSectionDoc[]>(sectionKeys.all)
      const maxOrder = (prev ?? []).reduce((max, s) => Math.max(max, s.order), -1)
      const optimistic: KanbanSectionDoc = {
        _id: `temp-${Date.now()}`,
        title: data.title,
        order: maxOrder + 1,
        userId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      queryClient.setQueryData<KanbanSectionDoc[]>(sectionKeys.all, (old) =>
        old ? [...old, optimistic] : [optimistic]
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(sectionKeys.all, context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.all })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      http.put<KanbanSectionDoc>(`/api/kanban-sections/${id}`, { title }),
    onMutate: async ({ id, title }) => {
      await queryClient.cancelQueries({ queryKey: sectionKeys.all })
      const prev = queryClient.getQueryData<KanbanSectionDoc[]>(sectionKeys.all)
      queryClient.setQueryData<KanbanSectionDoc[]>(sectionKeys.all, (old) =>
        old?.map((s) => (s._id === id ? { ...s, title } : s))
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(sectionKeys.all, context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.all })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      http.del<{ ok: boolean }>(`/api/kanban-sections/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: sectionKeys.all })
      const prev = queryClient.getQueryData<KanbanSectionDoc[]>(sectionKeys.all)
      queryClient.setQueryData<KanbanSectionDoc[]>(sectionKeys.all, (old) =>
        old?.filter((s) => s._id !== id)
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(sectionKeys.all, context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.all })
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })

  const reorderMutation = useMutation({
    mutationFn: (payload: ReorderPayload) =>
      http.post<TaskRecord>('/api/tasks/reorder', payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY })
      const prev = queryClient.getQueryData<TaskRecord[]>(TASKS_KEY)
      queryClient.setQueryData<TaskRecord[]>(TASKS_KEY, (old) =>
        (old ?? []).map((t) =>
          t._id === payload.taskId
            ? {
                ...t,
                kanbanOrder: payload.kanbanOrder,
                ...(payload.sectionId !== undefined && { sectionId: payload.sectionId }),
                ...(payload.status !== undefined && { status: payload.status }),
                ...(payload.dueDate !== undefined && { dueDate: payload.dueDate }),
              }
            : t
        )
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(TASKS_KEY, context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })

  return {
    sections: sectionsQuery.data ?? [],
    isLoading: sectionsQuery.isLoading,
    error: sectionsQuery.error,
    createSection: createMutation.mutateAsync,
    updateSection: updateMutation.mutate,
    updateSectionAsync: updateMutation.mutateAsync,
    deleteSection: deleteMutation.mutate,
    deleteSectionAsync: deleteMutation.mutateAsync,
    reorderTask: reorderMutation.mutate,
    reorderTaskAsync: reorderMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}
