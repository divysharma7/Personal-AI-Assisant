'use client'

import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const GCAL_STATUS_KEY = ['google-calendar-status'] as const
const TASKS_KEY = ['tasks'] as const

interface GCalStatus {
  connected: boolean
  calendarId: string
}

async function fetchStatus(): Promise<GCalStatus> {
  const res = await fetch('/api/integrations/google/status')
  if (!res.ok) return { connected: false, calendarId: 'primary' }
  return res.json()
}

export function useGoogleCalendar() {
  const queryClient = useQueryClient()

  const { data: status } = useQuery({
    queryKey: GCAL_STATUS_KEY,
    queryFn: fetchStatus,
  })

  const connected = status?.connected ?? false

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/integrations/google/disconnect', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to disconnect')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GCAL_STATUS_KEY })
    },
  })

  const syncMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch('/api/integrations/google/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      })
      if (!res.ok) throw new Error('Failed to sync')
      return res.json()
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })

  const unsyncMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch('/api/integrations/google/unsync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      })
      if (!res.ok) throw new Error('Failed to unsync')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })

  const disconnect = useCallback(async () => {
    return disconnectMutation.mutateAsync()
  }, [disconnectMutation])

  const syncTask = useCallback(async (taskId: string) => {
    return syncMutation.mutateAsync(taskId)
  }, [syncMutation])

  const unsyncTask = useCallback(async (taskId: string) => {
    return unsyncMutation.mutateAsync(taskId)
  }, [unsyncMutation])

  return {
    connected,
    calendarId: status?.calendarId ?? 'primary',
    disconnect,
    syncTask,
    unsyncTask,
    isSyncing: syncMutation.isPending,
  }
}
