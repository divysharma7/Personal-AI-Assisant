'use client'

import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const SETTINGS_KEY = ['settings', 'calendarPreferences'] as const
const USER_KEY = ['settings', 'user'] as const

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

export interface UserProfile {
  username: string
  name: string
  timezone?: string
}

async function fetchCalendarPreferences(): Promise<CalendarPreferences> {
  const res = await fetch('/api/users/me/calendar-preferences')
  if (!res.ok) throw new Error('Failed to fetch settings')
  return res.json()
}

async function fetchUserProfile(): Promise<UserProfile> {
  const res = await fetch('/api/auth/me')
  if (!res.ok) throw new Error('Failed to fetch user')
  return res.json()
}

/**
 * Fetch the user's calendar preferences.
 */
export function useSettings() {
  const { data: preferences, isLoading } = useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: fetchCalendarPreferences,
    staleTime: 60 * 1000,
  })

  return {
    preferences: preferences ?? null,
    isLoading,
  }
}

/**
 * Mutation to update the user's calendar preferences.
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: Partial<CalendarPreferences>) => {
      const res = await fetch('/api/users/me/calendar-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update settings')
      return res.json() as Promise<CalendarPreferences>
    },
    onSuccess: (data) => {
      queryClient.setQueryData(SETTINGS_KEY, data)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEY })
      queryClient.invalidateQueries({ queryKey: ['calendar', 'preferences'] })
    },
  })

  const updateSettings = useCallback(
    async (data: Partial<CalendarPreferences>) => {
      return mutation.mutateAsync(data)
    },
    [mutation],
  )

  return {
    updateSettings,
    isPending: mutation.isPending,
  }
}

/**
 * Fetch the current user's profile info.
 */
export function useUserProfile() {
  const { data: user, isLoading } = useQuery({
    queryKey: USER_KEY,
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000,
  })

  return {
    user: user ?? null,
    isLoading,
  }
}
