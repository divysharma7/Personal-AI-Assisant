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

const ACCOUNTS_KEY = ['google-accounts'] as const

function fetchAccounts(): Promise<ConnectedAccount[]> {
  return http.get<ConnectedAccount[]>('/api/integrations/google/accounts')
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

  // Sync/reconnect/disconnect are LOS-305 — stubs for now
  const syncNow = useCallback(async (_accountId: string) => {
    // TODO: POST /api/integrations/google/accounts/:id/sync (LOS-305)
  }, [])

  const retry = useCallback(async (accountId: string) => {
    await syncNow(accountId)
  }, [syncNow])

  const reconnect = useCallback(async (_accountId: string) => {
    // TODO: Redirect to Google OAuth (LOS-305)
  }, [])

  const disconnect = useCallback(async (_accountId: string) => {
    // TODO: DELETE /api/integrations/google/accounts/:id (LOS-305)
  }, [])

  const toggleCalendar = useCallback((_accountId: string, _calendarId: string) => {
    // TODO: Use useCalendarControls().toggleVisibility instead
  }, [])

  return {
    accounts,
    syncingIds: new Set<string>(),
    syncNow,
    retry,
    reconnect,
    disconnect,
    toggleCalendar,
    isLoading: query.isLoading,
    error: query.error,
  }
}
