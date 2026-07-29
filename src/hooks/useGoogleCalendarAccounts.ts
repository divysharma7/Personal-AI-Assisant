import { useState, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────

export type ConnectionStatus = 'healthy' | 'syncing' | 'delayed' | 'needs_attention'

export interface ConnectedAccount {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  status: ConnectionStatus
  lastSyncAt: string // ISO-8601
  calendars: { id: string; name: string; selected: boolean }[]
}

// ── Mock data ──────────────────────────────────────────────────

const MOCK_ACCOUNTS: ConnectedAccount[] = [
  {
    id: 'acc-1',
    email: 'divya.s@gmail.com',
    displayName: 'Divya S',
    status: 'healthy',
    lastSyncAt: new Date(Date.now() - 3 * 60_000).toISOString(), // 3 min ago
    calendars: [
      { id: 'primary', name: 'Primary', selected: true },
      { id: 'work', name: 'Work', selected: true },
      { id: 'holidays', name: 'Holidays in India', selected: false },
    ],
  },
  {
    id: 'acc-2',
    email: 'divya.work@company.com',
    displayName: 'Divya — Work',
    status: 'delayed',
    lastSyncAt: new Date(Date.now() - 45 * 60_000).toISOString(), // 45 min ago
    calendars: [
      { id: 'primary', name: 'Primary', selected: true },
    ],
  },
]

// ── Hook ───────────────────────────────────────────────────────

export function useGoogleCalendarAccounts() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(MOCK_ACCOUNTS)
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set())

  const syncNow = useCallback(async (accountId: string) => {
    setSyncingIds((prev) => new Set(prev).add(accountId))

    // Simulate a 2-second sync
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? { ...acc, status: 'healthy' as const, lastSyncAt: new Date().toISOString() }
          : acc,
      ),
    )
    setSyncingIds((prev) => {
      const next = new Set(prev)
      next.delete(accountId)
      return next
    })
  }, [])

  const retry = useCallback(async (accountId: string) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId ? { ...acc, status: 'syncing' as const } : acc,
      ),
    )
    await syncNow(accountId)
  }, [syncNow])

  const reconnect = useCallback(async (accountId: string) => {
    // In real impl this would redirect to Google OAuth
    await retry(accountId)
  }, [retry])

  const disconnect = useCallback(async (accountId: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== accountId))
  }, [])

  const toggleCalendar = useCallback((accountId: string, calendarId: string) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? {
            ...acc,
            calendars: acc.calendars.map((cal) =>
              cal.id === calendarId ? { ...cal, selected: !cal.selected } : cal,
            ),
          }
          : acc,
      ),
    )
  }, [])

  return {
    accounts,
    syncingIds,
    syncNow,
    retry,
    reconnect,
    disconnect,
    toggleCalendar,
  }
}
