import { useCallback, useRef, useState } from 'react'
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

export interface CloseDayDecision {
  taskId: string
  action: 'move' | 'unschedule' | 'complete' | 'drop'
  scheduledStart?: string | null
  scheduledEnd?: string | null
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

async function saveRitualState(state: RitualState): Promise<RitualState> {
  return http.post<RitualState>('/api/rituals', state)
}

/* ── Hook ──────────────────────────────────────────────────── */

const RITUAL_KEY = (date: string) => ['ritual', date] as const

export function useRitualState(date: string) {
  const queryClient = useQueryClient()
  const closeCommandRef = useRef<{ id: string; payload: string } | null>(null)

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
    placeholderData: () => getLocalState(date),
  })

  const mutation = useMutation({
    mutationFn: async (updates: Partial<RitualState>) => {
      const current = query.data ?? { date }
      const remote = await saveRitualState({ ...updates, date })
      const merged: RitualState = { ...current, ...remote, date }
      setLocalState(merged)
      return merged
    },
    onSuccess: (merged) => {
      queryClient.setQueryData(RITUAL_KEY(date), merged)
    },
  })

  const closeMutation = useMutation({
    mutationFn: async (decisions: CloseDayDecision[]) => {
      const payload = JSON.stringify(decisions)
      if (!closeCommandRef.current || closeCommandRef.current.payload !== payload) {
        closeCommandRef.current = { id: crypto.randomUUID(), payload }
      }
      return http.post<RitualState>('/api/rituals/close-day', {
        date,
        commandId: closeCommandRef.current.id,
        decisions,
      })
    },
    onSuccess: (remote) => {
      closeCommandRef.current = null
      setLocalState(remote)
      queryClient.setQueryData(RITUAL_KEY(date), remote)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const updateRitual = useCallback(
    (updates: Partial<RitualState>) => {
      return mutation.mutateAsync(updates)
    },
    [mutation],
  )

  const closeDay = useCallback(
    (decisions: CloseDayDecision[]) => closeMutation.mutateAsync(decisions),
    [closeMutation],
  )

  return {
    state: query.data ?? { date },
    isLoading: query.isLoading,
    updateRitual,
    closeDay,
    isPending: mutation.isPending || closeMutation.isPending,
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
