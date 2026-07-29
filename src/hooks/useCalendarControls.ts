import { useState, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────

export type CalendarGroup = 'active' | 'passive'

export interface CalendarEntry {
  id: string
  name: string
  color: string
  accountEmail: string
  accountLabel: string
  readOnly: boolean
  group: CalendarGroup
  visible: boolean
  order: number
}

// ── Mock data ──────────────────────────────────────────────────

export const INITIAL_CALENDARS: CalendarEntry[] = [
  {
    id: 'cal-1',
    name: 'Primary',
    color: '#0f62fe',
    accountEmail: 'divya.s@gmail.com',
    accountLabel: 'Divya S',
    readOnly: false,
    group: 'active',
    visible: true,
    order: 0,
  },
  {
    id: 'cal-2',
    name: 'Work',
    color: '#da1e28',
    accountEmail: 'divya.s@gmail.com',
    accountLabel: 'Divya S',
    readOnly: false,
    group: 'active',
    visible: true,
    order: 1,
  },
  {
    id: 'cal-3',
    name: 'Personal',
    color: '#34d399',
    accountEmail: 'divya.s@gmail.com',
    accountLabel: 'Divya S',
    readOnly: false,
    group: 'active',
    visible: true,
    order: 2,
  },
  {
    id: 'cal-4',
    name: 'Holidays in India',
    color: '#f59e0b',
    accountEmail: 'divya.s@gmail.com',
    accountLabel: 'Divya S',
    readOnly: true,
    group: 'passive',
    visible: true,
    order: 0,
  },
  {
    id: 'cal-5',
    name: 'Primary',
    color: '#8f89fa',
    accountEmail: 'divya.work@company.com',
    accountLabel: 'Divya — Work',
    readOnly: false,
    group: 'passive',
    visible: true,
    order: 1,
  },
  {
    id: 'cal-6',
    name: 'Team Standups',
    color: '#7ae1ec',
    accountEmail: 'divya.work@company.com',
    accountLabel: 'Divya — Work',
    readOnly: true,
    group: 'passive',
    visible: false,
    order: 2,
  },
  {
    id: 'cal-7',
    name: 'Birthdays',
    color: '#ec4899',
    accountEmail: 'divya.s@gmail.com',
    accountLabel: 'Divya S',
    readOnly: true,
    group: 'passive',
    visible: true,
    order: 3,
  },
]

// ── Simulated API latency ──────────────────────────────────────

const API_DELAY = 600

function simulateApi(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, API_DELAY))
}

// Randomly fail ~15% of the time to demonstrate rollback
function shouldFail(): boolean {
  return Math.random() < 0.15
}

// ── Hook ───────────────────────────────────────────────────────

export function useCalendarControls() {
  const [calendars, setCalendars] = useState<CalendarEntry[]>(INITIAL_CALENDARS)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [errorIds, setErrorIds] = useState<Set<string>>(new Set())

  const markPending = useCallback((id: string) => {
    setPendingIds((prev) => new Set(prev).add(id))
    setErrorIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const clearPending = useCallback((id: string) => {
    setPendingIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const markError = useCallback((id: string) => {
    setErrorIds((prev) => new Set(prev).add(id))
    setTimeout(() => {
      setErrorIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 3000)
  }, [])

  /**
   * Move a calendar between Active and Passive groups.
   * Applies optimistic update; rolls back on simulated API error.
   */
  const moveToGroup = useCallback(async (calendarId: string, targetGroup: CalendarGroup) => {
    const snapshot = calendars
    const entry = snapshot.find((c) => c.id === calendarId)
    if (!entry || entry.group === targetGroup) return

    // Optimistic update
    setCalendars((prev) =>
      prev.map((c) =>
        c.id === calendarId
          ? {
              ...c,
              group: targetGroup,
              order: prev.filter((x) => x.group === targetGroup && x.id !== calendarId).length,
            }
          : c,
      ),
    )

    markPending(calendarId)
    try {
      await simulateApi()
      if (shouldFail()) throw new Error('Network error')
    } catch {
      // Rollback
      setCalendars(snapshot)
      markError(calendarId)
    } finally {
      clearPending(calendarId)
    }
  }, [calendars, markPending, clearPending, markError])

  /**
   * Reorder a calendar within its group.
   * Moves the entry from `fromIndex` to `toIndex` in the group-local order.
   */
  const reorder = useCallback(async (calendarId: string, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    const snapshot = calendars
    const entry = snapshot.find((c) => c.id === calendarId)
    if (!entry) return

    // Optimistic reorder within the group
    setCalendars((prev) => {
      const groupItems = prev
        .filter((c) => c.group === entry.group)
        .sort((a, b) => a.order - b.order)

      // Build the reordered list
      const [moved] = groupItems.splice(fromIndex, 1)
      groupItems.splice(toIndex, 0, moved)

      // Assign new order values
      const orderMap = new Map<string, number>()
      groupItems.forEach((item, idx) => orderMap.set(item.id, idx))

      return prev.map((c) =>
        c.group === entry.group
          ? { ...c, order: orderMap.get(c.id) ?? c.order }
          : c,
      )
    })

    markPending(calendarId)
    try {
      await simulateApi()
      if (shouldFail()) throw new Error('Network error')
    } catch {
      setCalendars(snapshot)
      markError(calendarId)
    } finally {
      clearPending(calendarId)
    }
  }, [calendars, markPending, clearPending, markError])

  /**
   * Toggle the visibility of a calendar within the Calendar view.
   * Separate from active/passive grouping.
   */
  const toggleVisibility = useCallback(async (calendarId: string) => {
    const snapshot = calendars
    const entry = snapshot.find((c) => c.id === calendarId)
    if (!entry) return

    // Optimistic toggle
    setCalendars((prev) =>
      prev.map((c) =>
        c.id === calendarId ? { ...c, visible: !c.visible } : c,
      ),
    )

    markPending(calendarId)
    try {
      await simulateApi()
      if (shouldFail()) throw new Error('Network error')
    } catch {
      setCalendars(snapshot)
      markError(calendarId)
    } finally {
      clearPending(calendarId)
    }
  }, [calendars, markPending, clearPending, markError])

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
  }
}
