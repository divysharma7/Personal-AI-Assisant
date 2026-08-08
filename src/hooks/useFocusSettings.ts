import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { env } from '@/config/env'

const API_BASE = env.VITE_API_URL

export interface FocusSettings {
  userId: string
  pomoDurationSeconds: number
  shortBreakDurationSeconds: number
  longBreakDurationSeconds: number
  longBreakAfterPomos: number
  autoStartBreak: boolean
  autoStartPomo: boolean
  notificationsEnabled: boolean
  soundEnabled: boolean
}

interface UpdateSettingsInput {
  pomoDurationSeconds?: number
  shortBreakDurationSeconds?: number
  longBreakDurationSeconds?: number
  longBreakAfterPomos?: number
  autoStartBreak?: boolean
  autoStartPomo?: boolean
  notificationsEnabled?: boolean
  soundEnabled?: boolean
}

async function fetchSettings(): Promise<FocusSettings> {
  const response = await fetch(`${API_BASE}/api/focus/settings`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch settings')
  }

  return response.json()
}

async function updateSettings(data: UpdateSettingsInput): Promise<FocusSettings> {
  const response = await fetch(`${API_BASE}/api/focus/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to update settings')
  }

  return response.json()
}

export function useFocusSettings() {
  return useQuery({
    queryKey: ['focusSettings'],
    queryFn: fetchSettings,
    staleTime: 60_000, // Cache for 1 minute
  })
}

export function useUpdateFocusSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateSettings,
    onMutate: async (newSettings) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['focusSettings'] })

      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData<FocusSettings>(['focusSettings'])

      // Optimistically update
      if (previousSettings) {
        queryClient.setQueryData<FocusSettings>(['focusSettings'], {
          ...previousSettings,
          ...newSettings,
        })
      }

      return { previousSettings }
    },
    onError: (_err, _newSettings, context) => {
      // Rollback on error
      if (context?.previousSettings) {
        queryClient.setQueryData(['focusSettings'], context.previousSettings)
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['focusSettings'] })
    },
  })
}

// Helper to convert seconds to minutes for display
export function secondsToMinutes(seconds: number): number {
  return Math.round(seconds / 60)
}

// Helper to convert minutes to seconds for API
export function minutesToSeconds(minutes: number): number {
  return minutes * 60
}
