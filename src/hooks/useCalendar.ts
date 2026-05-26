'use client'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''


import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TaskRecord } from './useTasks'

// ─── Query Keys ───

const CALENDAR_EVENTS_KEY = ['calendar', 'events'] as const
const UNSCHEDULED_TASKS_KEY = ['calendar', 'unscheduled'] as const
const OVERDUE_TASKS_KEY = ['calendar', 'overdue'] as const
const CALENDAR_CAPACITY_KEY = ['calendar', 'capacity'] as const
const CALENDAR_PREFERENCES_KEY = ['calendar', 'preferences'] as const

// ─── Types ───

export interface CalendarEvent {
  id: string
  source: 'task' | 'habit' | 'google' | 'focus_session'
  title: string
  start: string
  end: string
  allDay: boolean
  color: string
  isReadOnly: boolean
  metadata: Record<string, unknown>
}

export interface DayCapacity {
  scheduledHours: number
  capacity: number
  fullness: number
}

export interface CalendarPreferences {
  defaultView: 'day' | 'week' | 'month'
  weekStartsOn: 0 | 1 | 6
  hiddenHoursStart: number
  hiddenHoursEnd: number
  dailyCapacityHours: number
  colorCodingMode: 'list' | 'priority' | 'label'
  showHabitsOnCalendar: boolean
  showFocusSessionsOnCalendar: boolean
  showGoogleEventsOnCalendar: boolean
  timeFormat: '12h' | '24h'
  showCurrentTimeIndicator: boolean
}

type IncludeSource = 'tasks' | 'habits' | 'google' | 'focus'

// ─── Fetchers ───

async function fetchCalendarEvents(
  from: string,
  to: string,
  include: IncludeSource[],
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({ from, to, include: include.join(',') })
  const res = await fetch(`${API_BASE}/api/calendar/events?${params}`)
  if (!res.ok) throw new Error('Failed to fetch calendar events')
  return res.json()
}

async function fetchUnscheduledTasks(): Promise<TaskRecord[]> {
  const res = await fetch(`${API_BASE}/api/calendar/unscheduled`)
  if (!res.ok) throw new Error('Failed to fetch unscheduled tasks')
  return res.json()
}

async function fetchOverdueTasks(): Promise<TaskRecord[]> {
  const res = await fetch(`${API_BASE}/api/calendar/overdue`)
  if (!res.ok) throw new Error('Failed to fetch overdue tasks')
  return res.json()
}

async function fetchCalendarCapacity(
  from: string,
  to: string,
): Promise<Record<string, DayCapacity>> {
  const params = new URLSearchParams({ from, to })
  const res = await fetch(`${API_BASE}/api/calendar/capacity?${params}`)
  if (!res.ok) throw new Error('Failed to fetch calendar capacity')
  return res.json()
}

async function fetchCalendarPreferences(): Promise<CalendarPreferences> {
  const res = await fetch(`${API_BASE}/api/users/me/calendar-preferences`)
  if (!res.ok) throw new Error('Failed to fetch calendar preferences')
  return res.json()
}

// ─── Hooks ───

/**
 * Fetches unified calendar events for a date range.
 */
export function useCalendarEvents(from: string, to: string, include: IncludeSource[] = ['tasks', 'habits', 'google', 'focus']) {
  return useQuery({
    queryKey: [...CALENDAR_EVENTS_KEY, from, to, include.join(',')],
    queryFn: () => fetchCalendarEvents(from, to, include),
    enabled: !!from && !!to,
    refetchOnWindowFocus: true,
  })
}

/**
 * Fetches tasks that have no scheduledStart and are not done/dropped.
 */
export function useUnscheduledTasks() {
  return useQuery({
    queryKey: UNSCHEDULED_TASKS_KEY,
    queryFn: fetchUnscheduledTasks,
    refetchOnWindowFocus: true,
  })
}

/**
 * Fetches tasks where scheduledStart is before today and status is not done.
 */
export function useOverdueTasks() {
  return useQuery({
    queryKey: OVERDUE_TASKS_KEY,
    queryFn: fetchOverdueTasks,
    refetchOnWindowFocus: true,
  })
}

/**
 * Fetches per-day capacity for a date range.
 */
export function useCalendarCapacity(from: string, to: string) {
  return useQuery({
    queryKey: [...CALENDAR_CAPACITY_KEY, from, to],
    queryFn: () => fetchCalendarCapacity(from, to),
    enabled: !!from && !!to,
    refetchOnWindowFocus: true,
  })
}

/**
 * Mutation to schedule a task (set scheduledStart/End).
 * Invalidates calendar events, unscheduled, overdue, capacity, and tasks.
 */
export function useScheduleTask() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ id, scheduledStart, scheduledEnd }: { id: string; scheduledStart: string; scheduledEnd?: string }) => {
      const res = await fetch(`${API_BASE}/api/tasks/${id}/schedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledStart, scheduledEnd }),
      })
      if (!res.ok) throw new Error('Failed to schedule task')
      return res.json() as Promise<TaskRecord>
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const scheduleTask = useCallback(
    async (id: string, scheduledStart: string, scheduledEnd?: string) => {
      return mutation.mutateAsync({ id, scheduledStart, scheduledEnd })
    },
    [mutation],
  )

  return { scheduleTask, ...mutation }
}

/**
 * Mutation to unschedule a task (clear scheduledStart/End).
 * Invalidates calendar events, unscheduled, overdue, capacity, and tasks.
 */
export function useUnscheduleTask() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/api/tasks/${id}/unschedule`, {
        method: 'PATCH',
      })
      if (!res.ok) throw new Error('Failed to unschedule task')
      return res.json() as Promise<TaskRecord>
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const unscheduleTask = useCallback(
    async (id: string) => {
      return mutation.mutateAsync(id)
    },
    [mutation],
  )

  return { unscheduleTask, ...mutation }
}

/**
 * Read and update calendar preferences.
 */
export function useCalendarPreferences() {
  const queryClient = useQueryClient()

  const { data: preferences, isLoading } = useQuery({
    queryKey: CALENDAR_PREFERENCES_KEY,
    queryFn: fetchCalendarPreferences,
    refetchOnWindowFocus: true,
  })

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<CalendarPreferences>) => {
      const res = await fetch(`${API_BASE}/api/users/me/calendar-preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update calendar preferences')
      return res.json() as Promise<CalendarPreferences>
    },
    onSuccess: (data) => {
      queryClient.setQueryData(CALENDAR_PREFERENCES_KEY, data)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CALENDAR_PREFERENCES_KEY })
    },
  })

  const updatePreferences = useCallback(
    async (data: Partial<CalendarPreferences>) => {
      return updateMutation.mutateAsync(data)
    },
    [updateMutation],
  )

  return {
    preferences: preferences ?? null,
    isLoading,
    updatePreferences,
  }
}
