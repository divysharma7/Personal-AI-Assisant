'use client'
import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AnyItem, CalendarEvent, Task, Reminder } from '@/types'

const ITEMS_KEY = ['items'] as const

// Mock data for frontend development — inline to avoid webpack dynamic import issues
const MOCK_ITEMS: AnyItem[] = [
  { _id: 'mock-1', type: 'task', title: 'Write LinkedIn post', status: 'todo', priority: 'high', dueDate: new Date().toISOString(), color: '#34d399' } as unknown as Task,
  { _id: 'mock-2', type: 'task', title: 'Review PRs', status: 'todo', priority: 'medium', dueDate: new Date().toISOString(), color: '#34d399' } as unknown as Task,
  { _id: 'mock-3', type: 'task', title: 'Gym workout', status: 'todo', priority: 'low', color: '#34d399' } as unknown as Task,
  { _id: 'mock-4', type: 'task', title: 'Plan Q3 roadmap', status: 'backlog', priority: 'high', color: '#34d399' } as unknown as Task,
  { _id: 'mock-5', type: 'task', title: 'Read 30 pages', status: 'todo', priority: 'medium', color: '#34d399' } as unknown as Task,
] as AnyItem[]

async function fetchItems(): Promise<AnyItem[]> {
  // TODO: Switch back to API calls when backend is connected:
  // const [events, tasks, reminders] = await Promise.all([
  //   fetch('/api/events').then(r => r.json()),
  //   fetch('/api/tasks').then(r => r.json()),
  //   fetch('/api/reminders').then(r => r.json()),
  // ])
  // return [...events, ...tasks, ...reminders] as AnyItem[]
  return MOCK_ITEMS
}

export function useItems() {
  const queryClient = useQueryClient()

  const { data: items = [], isLoading: loading, refetch } = useQuery({
    queryKey: ITEMS_KEY,
    queryFn: fetchItems,
  })

  // Silent refresh just invalidates the cache (background refetch)
  const silentRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ITEMS_KEY })
  }, [queryClient])

  // ── Add Item ───────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async ({ type, data }: { type: AnyItem['type']; data: Partial<CalendarEvent | Task | Reminder> }) => {
      const endpoint = type === 'event' ? '/api/events' : type === 'task' ? '/api/tasks' : '/api/reminders'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create item')
      return await res.json() as AnyItem
    },
    onMutate: async ({ type, data }) => {
      await queryClient.cancelQueries({ queryKey: ITEMS_KEY })
      const prev = queryClient.getQueryData<AnyItem[]>(ITEMS_KEY)
      // Optimistic: add a temp item at the start
      const optimistic = { ...data, type, _id: `temp-${Date.now()}` } as AnyItem
      queryClient.setQueryData<AnyItem[]>(ITEMS_KEY, old => [optimistic, ...(old ?? [])])
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(ITEMS_KEY, context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_KEY })
    },
  })

  const addItem = useCallback(async (type: AnyItem['type'], data: Partial<CalendarEvent | Task | Reminder>) => {
    return addMutation.mutateAsync({ type, data })
  }, [addMutation])

  // ── Update Item ────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async ({ type, id, data }: { type: AnyItem['type']; id: string; data: Partial<AnyItem> }) => {
      const endpoint = type === 'event' ? `/api/events/${id}` : type === 'task' ? `/api/tasks/${id}` : `/api/reminders/${id}`
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update item')
      return await res.json() as AnyItem
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ITEMS_KEY })
      const prev = queryClient.getQueryData<AnyItem[]>(ITEMS_KEY)
      queryClient.setQueryData<AnyItem[]>(ITEMS_KEY, old =>
        (old ?? []).map(i => i._id === id ? { ...i, ...data } as AnyItem : i)
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(ITEMS_KEY, context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_KEY })
    },
  })

  const updateItem = useCallback(async (type: AnyItem['type'], id: string, data: Partial<AnyItem>) => {
    return updateMutation.mutateAsync({ type, id, data })
  }, [updateMutation])

  // ── Delete Item ────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: AnyItem['type']; id: string }) => {
      const endpoint = type === 'event' ? `/api/events/${id}` : type === 'task' ? `/api/tasks/${id}` : `/api/reminders/${id}`
      await fetch(endpoint, { method: 'DELETE' })
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ITEMS_KEY })
      const prev = queryClient.getQueryData<AnyItem[]>(ITEMS_KEY)
      queryClient.setQueryData<AnyItem[]>(ITEMS_KEY, old =>
        (old ?? []).filter(i => i._id !== id)
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(ITEMS_KEY, context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_KEY })
    },
  })

  const deleteItem = useCallback(async (type: AnyItem['type'], id: string) => {
    return deleteMutation.mutateAsync({ type, id })
  }, [deleteMutation])

  return { items, loading, refetch, silentRefresh, addItem, updateItem, deleteItem }
}
