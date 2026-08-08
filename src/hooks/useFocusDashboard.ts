import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { env } from '@/config/env'
import type { FocusRecord } from '@/components/focus/RecordCard'

const API_BASE = env.VITE_API_URL

interface FocusDashboardData {
  activeSession: {
    _id: string
    mode: 'POMO' | 'STOPWATCH'
    targetType: 'TASK' | 'HABIT' | 'NONE'
    taskId?: string | null
    habitId?: string | null
    taskTitleSnapshot?: string | null
    startedAt: string
    pausedAt?: string | null
    totalPausedMs?: number
    plannedDurationMin?: number
    extendedByMin?: number
  } | null
  overview: {
    todayPomo: number
    todayFocusSeconds: number
    totalPomo: number
    totalFocusSeconds: number
  }
  records: FocusRecord[]
  nextCursor: string | null
  hasMore: boolean
}

async function fetchDashboard(timezone?: string): Promise<FocusDashboardData> {
  const params = new URLSearchParams()
  if (timezone) params.set('timezone', timezone)

  const response = await fetch(`${API_BASE}/api/focus/dashboard?${params}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch focus dashboard')
  }

  return response.json()
}

async function fetchRecords(cursor?: string, limit: number = 50) {
  const params = new URLSearchParams({ limit: String(limit) })
  if (cursor) params.set('cursor', cursor)

  const response = await fetch(`${API_BASE}/api/focus/records?${params}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch records')
  }

  const result = await response.json()
  return {
    records: result.items ?? [],
    nextCursor: result.nextCursor ?? null,
    hasMore: result.hasMore ?? false,
  } as {
    records: FocusRecord[]
    nextCursor: string | null
    hasMore: boolean
  }
}

export function useFocusDashboard() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return useQuery({
    queryKey: ['focusDashboard', timezone],
    queryFn: () => fetchDashboard(timezone),
    staleTime: 30_000, // Cache for 30 seconds
    refetchInterval: 60_000, // Refetch every minute
  })
}

export function useFocusRecords(cursor?: string) {
  return useQuery({
    queryKey: ['focusRecords', cursor],
    queryFn: () => fetchRecords(cursor),
    staleTime: 30_000,
  })
}

export function useInfiniteFocusRecords() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['focusRecords', 'infinite'],
    queryFn: () => fetchRecords(),
    staleTime: 30_000,
  })

  const loadMore = async () => {
    if (!query.data?.nextCursor) return

    const newData = await fetchRecords(query.data.nextCursor)

    queryClient.setQueryData(['focusRecords', 'infinite'], (old: Awaited<ReturnType<typeof fetchRecords>> | undefined) => {
      if (!old) return newData
      return {
        ...newData,
        records: [...old.records, ...newData.records],
      }
    })
  }

  return {
    ...query,
    loadMore,
    hasMore: query.data?.hasMore ?? false,
  }
}

export function useRefreshDashboard() {
  const queryClient = useQueryClient()

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['focusDashboard'] })
    queryClient.invalidateQueries({ queryKey: ['focusRecords'] })
    queryClient.invalidateQueries({ queryKey: ['focusStats'] })
  }, [queryClient])
}
