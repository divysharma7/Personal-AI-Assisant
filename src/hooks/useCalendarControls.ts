import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { http } from '@/lib/api/client'

// ── Types ──────────────────────────────────────────────────────

export type CalendarGroup = 'active' | 'passive'

export interface CalendarEntry {
  id: string
  accountId: string
  providerCalendarId: string
  name: string
  color: string
  accountEmail: string
  accountLabel: string
  readOnly: boolean
  group: CalendarGroup
  visible: boolean
  order: number
  isDefaultWrite: boolean
}

interface CalendarUpdatePayload {
  group?: CalendarGroup
  visible?: boolean
  order?: number
  color?: string
  isDefaultWrite?: boolean
}

const CALENDARS_KEY = ['google-calendars'] as const

function fetchCalendars(): Promise<CalendarEntry[]> {
  return http.get<CalendarEntry[]>('/api/integrations/google/calendars')
}

function updateCalendar(calendarId: string, data: CalendarUpdatePayload): Promise<CalendarEntry> {
  return http.patch<CalendarEntry>(`/api/integrations/google/calendars/${calendarId}`, data)
}

// ── Hook ───────────────────────────────────────────────────────

export function useCalendarControls() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: CALENDARS_KEY,
    queryFn: fetchCalendars,
    staleTime: 60_000, // 1 minute
    retry: (failureCount, error: unknown) => {
      const status = (error as { status?: number })?.status
      if (status === 400 || status === 401 || status === 404) return false
      return failureCount < 2
    },
  })

  const calendars = query.data ?? []

  const mutation = useMutation({
    mutationFn: ({ calendarId, data }: { calendarId: string; data: CalendarUpdatePayload }) =>
      updateCalendar(calendarId, data),
    onMutate: async ({ calendarId, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: CALENDARS_KEY })
      const prev = queryClient.getQueryData<CalendarEntry[]>(CALENDARS_KEY)
      queryClient.setQueryData<CalendarEntry[]>(CALENDARS_KEY, (old) =>
        (old ?? []).map((c) => (c.id === calendarId ? { ...c, ...data } : c))
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      // Rollback
      if (context?.prev) queryClient.setQueryData(CALENDARS_KEY, context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CALENDARS_KEY })
    },
  })

  const pendingIds = new Set(mutation.isPending ? [mutation.variables?.calendarId ?? ''] : [])
  const errorIds = new Set(mutation.isError ? [mutation.variables?.calendarId ?? ''] : [])

  const moveToGroup = useCallback(async (calendarId: string, targetGroup: CalendarGroup) => {
    mutation.mutate({ calendarId, data: { group: targetGroup } })
  }, [mutation])

  const reorder = useCallback(async (calendarId: string, _fromIndex: number, toIndex: number) => {
    mutation.mutate({ calendarId, data: { order: toIndex } })
  }, [mutation])

  const toggleVisibility = useCallback(async (calendarId: string) => {
    const entry = calendars.find((c) => c.id === calendarId)
    if (!entry) return
    mutation.mutate({ calendarId, data: { visible: !entry.visible } })
  }, [mutation, calendars])

  const activeCalendars = calendars
    .filter((c) => c.group === 'active')
    .sort((a, b) => a.order - b.order)

  const passiveCalendars = calendars
    .filter((c) => c.group === 'passive')
    .sort((a, b) => a.order - b.order)

  return {
    activeCalendars,
    passiveCalendars,
    pendingIds,
    errorIds,
    moveToGroup,
    reorder,
    toggleVisibility,
    isLoading: query.isLoading,
    error: query.error,
  }
}
