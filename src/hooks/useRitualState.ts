import { useCallback, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/api/client'

/* ── Types ─────────────────────────────────────────────────── */

export interface RitualState {
  date: string
  /** Morning Plan: chosen outcome text */
  outcome?: string
  /** Morning Plan: accepted focus window IDs */
  acceptedWindows?: string[]
  /** Morning Plan: whether the plan has been confirmed */
  planCompleted?: boolean
  /** Shutdown: decisions for unfinished tasks (taskId → decision) */
  taskDecisions?: Record<string, 'move' | 'unschedule' | 'complete' | 'drop'>
  /** Shutdown: whether the day has been closed */
  shutdownCompleted?: boolean
}

const STORAGE_KEY = 'lifeos-ritual-state'

/* ── Local storage helpers ─────────────────────────────────── */

function getLocalState(date: string): RitualState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { date }
    const parsed = JSON.parse(raw) as Record<string, RitualState>
    return parsed[date] ?? { date }
  } catch {
    return { date }
  }
}

function setLocalState(state: RitualState): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const all: Record<string, RitualState> = raw ? JSON.parse(raw) : {}
    all[state.date] = state
    // Keep only last 7 days
    const keys = Object.keys(all).sort().reverse()
    for (const key of keys.slice(7)) delete all[key]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // localStorage may be unavailable
  }
}

/* ── API helpers ───────────────────────────────────────────── */

interface RitualApiResponse {
  date: string
  outcome?: string
  acceptedWindows?: string[]
  planCompleted?: boolean
  taskDecisions?: Record<string, 'move' | 'unschedule' | 'complete' | 'drop'>
  shutdownCompleted?: boolean
}

async function fetchRitualState(date: string): Promise<RitualState | null> {
  try {
    return await http.get<RitualApiResponse>(`/api/rituals?date=${date}`)
  } catch {
    // API may not be implemented yet — fall back to local state
    return null
  }
}

async function saveRitualState(state: RitualState): Promise<void> {
  try {
    await http.post('/api/rituals', state)
  } catch {
    // Persist locally even if API fails
  }
}

/* ── Hook ──────────────────────────────────────────────────── */

const RITUAL_KEY = (date: string) => ['ritual', date] as const

export function useRitualState(date: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: RITUAL_KEY(date),
    queryFn: async () => {
      const remote = await fetchRitualState(date)
      if (remote) {
        setLocalState(remote)
        return remote
      }
      return getLocalState(date)
    },
    staleTime: 60_000,
    initialData: () => getLocalState(date),
  })

  const mutation = useMutation({
    mutationFn: async (updates: Partial<RitualState>) => {
      const current = query.data ?? { date }
      const merged: RitualState = { ...current, ...updates, date }
      setLocalState(merged)
      await saveRitualState(merged)
      return merged
    },
    onSuccess: (merged) => {
      queryClient.setQueryData(RITUAL_KEY(date), merged)
    },
  })

  const updateRitual = useCallback(
    (updates: Partial<RitualState>) => {
      return mutation.mutateAsync(updates)
    },
    [mutation],
  )

  return {
    state: query.data ?? { date },
    isLoading: query.isLoading,
    updateRitual,
    isPending: mutation.isPending,
  }
}

/* ── Convenience: today's date string ──────────────────────── */

export function useTodayDate(): string {
  const [date] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  return date
}
