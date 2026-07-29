import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { http } from '@/lib/api/client'

// ── Types ──────────────────────────────────────────────────────

export type ConnectionStatus = 'healthy' | 'syncing' | 'delayed' | 'needs_attention'

export interface ConnectedAccount {
  id: string
  email: string
  displayName: string
  avatarUrl?: string | null
  status: ConnectionStatus
  lastSyncAt: string | null
  calendars: { id: string; name: string; selected: boolean }[]
}

interface SyncResult {
  ok: boolean
  state: string
  alreadyRunning: boolean
  calendarsDiscovered: number
  calendarsSynced: number
  eventsUpserted: number
  eventsDeleted: number
  failures: string[]
}

const ACCOUNTS_KEY = ['google-accounts'] as const

function fetchAccounts(): Promise<ConnectedAccount[]> {
  return http.get<ConnectedAccount[]>('/api/integrations/google/accounts')
}

function syncAccount(accountId: string): Promise<SyncResult> {
  return http.post<SyncResult>('/api/integrations/google/sync', { accountId })
}

function disconnectAccount(accountId: string): Promise<{ ok: boolean; disconnected: number }> {
  return http.post('/api/integrations/google/disconnect', { accountId })
}

// ── Hook ───────────────────────────────────────────────────────

export function useGoogleCalendarAccounts() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: fetchAccounts,
    staleTime: 60_000, // 1 minute
    retry: (failureCount, error: unknown) => {
      const status = (error as { status?: number })?.status
      if (status === 400 || status === 401 || status === 404) return false
      return failureCount < 2
    },
  })

  const accounts = query.data ?? []

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: syncAccount,
    onMutate: async (accountId) => {
      // Optimistic: mark account as syncing
      await queryClient.cancelQueries({ queryKey: ACCOUNTS_KEY })
      const prev = queryClient.getQueryData<ConnectedAccount[]>(ACCOUNTS_KEY)
      queryClient.setQueryData<ConnectedAccount[]>(ACCOUNTS_KEY, (old) =>
        (old ?? []).map((a) => a.id === accountId ? { ...a, status: 'syncing' as const } : a)
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(ACCOUNTS_KEY, context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['google-calendars'] })
    },
  })

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: disconnectAccount,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['google-calendars'] })
    },
  })

  const syncingIds = new Set(
    syncMutation.isPending ? [syncMutation.variables ?? ''] : []
  )

  const syncNow = useCallback(async (accountId: string) => {
    return syncMutation.mutateAsync(accountId)
  }, [syncMutation])

  const retry = useCallback(async (accountId: string) => {
    return syncMutation.mutateAsync(accountId)
  }, [syncMutation])

  const reconnect = useCallback(async (_accountId: string) => {
    // Redirect to Google OAuth flow
    window.location.href = '/api/integrations/google/auth'
  }, [])

  const disconnect = useCallback(async (accountId: string) => {
    return disconnectMutation.mutateAsync(accountId)
  }, [disconnectMutation])

  const toggleCalendar = useCallback((_accountId: string, _calendarId: string) => {
    // Use useCalendarControls().toggleVisibility instead
  }, [])

  return {
    accounts,
    syncingIds,
    syncNow,
    retry,
    reconnect,
    disconnect,
    toggleCalendar,
    isLoading: query.isLoading,
    error: query.error,
  }
}
