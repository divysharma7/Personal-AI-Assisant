import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { http } from '@/lib/api/client'

interface AgendaItem {
  id: string
  kind: 'task' | 'habit' | 'external_event' | 'focus_session'
  title: string
  start: string | null
  end: string | null
  allDay: boolean
  completed: boolean
  source: { type: string; displayName?: string; accountId?: string | null; calendarId?: string }
  availability: 'busy' | 'free'
  color: string
  actions: string[]
}

interface UnscheduledTask {
  id: string
  title: string
  priority: 'high' | 'medium' | 'low'
  estimatedMinutes?: number
  dueDate?: string
}

interface AgendaResponse {
  date: string
  timeZone: string
  generatedAt: string
  sync: { state: string; lastSuccessfulAt: string | null }
  items: AgendaItem[]
  unscheduledPriorities: UnscheduledTask[]
}

const EMPTY_AGENDA: AgendaResponse = {
  date: '',
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  generatedAt: '',
  sync: { state: 'not_connected', lastSuccessfulAt: null },
  items: [],
  unscheduledPriorities: [],
}

const AGENDA_KEY = ['agenda'] as const

function fetchAgenda(date: string, timeZone: string): Promise<AgendaResponse> {
  return http.get<AgendaResponse>(`/api/calendar/agenda?date=${date}&timeZone=${encodeURIComponent(timeZone)}`)
}

export function useAgenda(date: string) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: [...AGENDA_KEY, date, timeZone],
    queryFn: () => fetchAgenda(date, timeZone),
    staleTime: 30_000, // 30 seconds
    retry: (failureCount, error: unknown) => {
      // Don't retry auth or validation errors
      const status = (error as { status?: number })?.status
      if (status === 400 || status === 401 || status === 404) return false
      return failureCount < 2
    },
    placeholderData: (prev) => prev, // Keep previous data while loading new date
  })

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [...AGENDA_KEY, date] })
  }, [queryClient, date])

  return {
    agenda: query.data ?? EMPTY_AGENDA,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    invalidate,
  }
}

export type { AgendaItem, UnscheduledTask, AgendaResponse }
