'use client'

import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const TASKS_KEY = ['tasks'] as const

export interface TaskRecord {
  _id: string
  type: string
  title: string
  description?: string
  notes?: object | null
  dueDate?: string | null
  priority: string
  status: string
  color?: string
  tags?: string[]
  parentId?: string | null
  depth?: number
  path?: string
  order?: number
  labelIds?: string[]
  assigneeId?: string | null
  comments?: { text: string; createdAt?: string; authorName?: string; authorAvatar?: string }[]
  repeat?: string | null
  completedAt?: string | null
  scheduledStart?: string | null
  scheduledEnd?: string | null
  estimatedEffort?: number | null
  actualEffort?: number
  googleEventId?: string | null
  calendarSynced?: boolean
  listId?: string | null
  createdBy?: string | null
  createdAt?: string
  updatedAt?: string
}

async function fetchTasks(): Promise<TaskRecord[]> {
  const res = await fetch('/api/tasks')
  if (!res.ok) throw new Error('Failed to fetch tasks')
  return res.json()
}

export function useTasks() {
  const queryClient = useQueryClient()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: TASKS_KEY,
    queryFn: fetchTasks,
  })

  // Create
  const createMutation = useMutation({
    mutationFn: async (data: Partial<TaskRecord>) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create task')
      return res.json() as Promise<TaskRecord>
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY })
      const prev = queryClient.getQueryData<TaskRecord[]>(TASKS_KEY)
      const optimistic = { ...data, _id: `temp-${Date.now()}`, type: 'task' } as TaskRecord
      queryClient.setQueryData<TaskRecord[]>(TASKS_KEY, old => [optimistic, ...(old ?? [])])
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(TASKS_KEY, context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })

  // Update
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TaskRecord> }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update task')
      return res.json() as Promise<TaskRecord>
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY })
      const prev = queryClient.getQueryData<TaskRecord[]>(TASKS_KEY)
      queryClient.setQueryData<TaskRecord[]>(TASKS_KEY, old =>
        (old ?? []).map(t => t._id === id ? { ...t, ...data } as TaskRecord : t)
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

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY })
      const prev = queryClient.getQueryData<TaskRecord[]>(TASKS_KEY)
      queryClient.setQueryData<TaskRecord[]>(TASKS_KEY, old =>
        (old ?? []).filter(t => t._id !== id)
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

  const createTask = useCallback(async (data: Partial<TaskRecord>) => {
    return createMutation.mutateAsync(data)
  }, [createMutation])

  const updateTask = useCallback(async (id: string, data: Partial<TaskRecord>) => {
    return updateMutation.mutateAsync({ id, data })
  }, [updateMutation])

  const deleteTask = useCallback(async (id: string) => {
    return deleteMutation.mutateAsync(id)
  }, [deleteMutation])

  const toggleComplete = useCallback(async (id: string) => {
    const task = tasks.find(t => t._id === id)
    if (!task) return
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    return updateMutation.mutateAsync({ id, data: { status: newStatus } })
  }, [tasks, updateMutation])

  return {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
  }
}
