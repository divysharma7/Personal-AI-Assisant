'use client'
import { http } from '@/lib/api/client'
import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ── Types ──────────────────────────────────────────────────────

export interface FocusSession {
  _id: string
  userId: string
  taskId: string | null
  taskTitleSnapshot: string | null
  plannedDurationMin: number
  plannedBreakMin: number
  startedAt: string
  pausedAt: string | null
  totalPausedMs: number
  endedAt: string | null
  status: 'active' | 'completed' | 'cancelled' | 'extended'
  actualDurationMin: number
  extendedByMin: number
  endedReason: 'timer_ended' | 'user_completed' | 'user_cancelled' | null
  postSessionNote: string | null
  createdAt: string
  updatedAt: string
}

export interface FocusStats {
  sessionsToday: number
  sessionsThisWeek: number
  totalMinutesToday: number
  totalMinutesWeek: number
  totalMinutesAllTime: number
  averageSessionMin: number
  longestSessionMin: number
  currentDailyStreak: number
}

export interface FocusPreferences {
  defaultWorkMin: number
  defaultShortBreakMin: number
  defaultLongBreakMin: number
  longBreakEveryNSessions: number
  theme: 'aurora' | 'minimal' | 'liquid'
  soundOnComplete: boolean
  showInSidebar: boolean
  keyboardShortcutsEnabled: boolean
}

export interface FocusHistoryFilters {
  from?: string
  to?: string
  taskId?: string
  limit?: number
}

type SessionAction = 'pause' | 'resume' | 'extend' | 'complete' | 'cancel'

// ── Query keys ─────────────────────────────────────────────────

const FOCUS_KEYS = {
  active: ['focus', 'active'] as const,
  stats: ['focus', 'stats'] as const,
  history: (filters?: FocusHistoryFilters) => ['focus', 'history', filters] as const,
  preferences: ['focus', 'preferences'] as const,
}

// ── Fetchers ───────────────────────────────────────────────────

function fetchActiveSession(): Promise<FocusSession | null> {
  return http.get<FocusSession | null>('/api/focus/sessions/active')
}

function fetchStats(): Promise<FocusStats> {
  return http.get<FocusStats>('/api/focus/stats')
}

function fetchHistory(filters?: FocusHistoryFilters): Promise<FocusSession[]> {
  const params = new URLSearchParams()
  if (filters?.from) params.set('from', filters.from)
  if (filters?.to) params.set('to', filters.to)
  if (filters?.taskId) params.set('taskId', filters.taskId)
  if (filters?.limit) params.set('limit', String(filters.limit))

  const path = `/api/focus/sessions${params.toString() ? `?${params}` : ''}`
  return http.get<FocusSession[]>(path)
}

function fetchPreferences(): Promise<FocusPreferences> {
  return http.get<FocusPreferences>('/api/users/me/focus-preferences')
}

// ── Hooks ──────────────────────────────────────────────────────

/**
 * Poll for the active focus session. Polls every 1s when a session exists.
 */
export function useActiveSession() {
  const { data: session = null, isLoading } = useQuery({
    queryKey: FOCUS_KEYS.active,
    queryFn: fetchActiveSession,
    refetchInterval: (query) => {
      // Poll every 1s when there's an active session
      return query.state.data ? 1000 : false
    },
  })

  return { session, isLoading }
}

/**
 * Start a new focus session.
 */
export function useStartSession() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({
      taskId,
      plannedDurationMin,
      plannedBreakMin,
    }: {
      taskId?: string | null
      plannedDurationMin?: number
      plannedBreakMin?: number
    }) => {
      return http.post<FocusSession>('/api/focus/sessions', { taskId, plannedDurationMin, plannedBreakMin })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOCUS_KEYS.active })
    },
  })

  const startSession = useCallback(
    async (taskId?: string | null, plannedDurationMin?: number, plannedBreakMin?: number) => {
      return mutation.mutateAsync({ taskId, plannedDurationMin, plannedBreakMin })
    },
    [mutation],
  )

  return { startSession, isStarting: mutation.isPending }
}

/**
 * Perform a lifecycle action on a focus session.
 */
export function useSessionAction() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({
      id,
      action,
      additionalMin,
      endedReason,
      postSessionNote,
    }: {
      id: string
      action: SessionAction
      additionalMin?: number
      endedReason?: 'timer_ended' | 'user_completed' | 'user_cancelled'
      postSessionNote?: string
    }) => {
      return http.patch<FocusSession>(`/api/focus/sessions/${id}`, { action, additionalMin, endedReason, postSessionNote })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOCUS_KEYS.active })
      queryClient.invalidateQueries({ queryKey: FOCUS_KEYS.stats })
      queryClient.invalidateQueries({ queryKey: ['focus', 'history'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const performAction = useCallback(
    async (
      id: string,
      action: SessionAction,
      options?: {
        additionalMin?: number
        endedReason?: 'timer_ended' | 'user_completed' | 'user_cancelled'
        postSessionNote?: string
      },
    ) => {
      return mutation.mutateAsync({ id, action, ...options })
    },
    [mutation],
  )

  return { performAction, isActing: mutation.isPending }
}

/**
 * Fetch aggregated focus statistics.
 */
export function useFocusStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: FOCUS_KEYS.stats,
    queryFn: fetchStats,
  })

  return { stats: stats ?? null, isLoading }
}

/**
 * Fetch focus session history with optional filters.
 */
export function useFocusHistory(filters?: FocusHistoryFilters) {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: FOCUS_KEYS.history(filters),
    queryFn: () => fetchHistory(filters),
  })

  return { sessions, isLoading }
}

/**
 * Read and update focus preferences.
 */
export function useFocusPreferences() {
  const queryClient = useQueryClient()

  const { data: preferences, isLoading } = useQuery({
    queryKey: FOCUS_KEYS.preferences,
    queryFn: fetchPreferences,
  })

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<FocusPreferences>) => {
      return http.patch<FocusPreferences>('/api/users/me/focus-preferences', updates)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(FOCUS_KEYS.preferences, data)
    },
  })

  const updatePreferences = useCallback(
    async (updates: Partial<FocusPreferences>) => {
      return updateMutation.mutateAsync(updates)
    },
    [updateMutation],
  )

  return {
    preferences: preferences ?? null,
    isLoading,
    updatePreferences,
    isUpdating: updateMutation.isPending,
  }
}
