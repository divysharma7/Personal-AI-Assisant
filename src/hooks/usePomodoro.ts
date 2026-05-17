'use client'
import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface PomodoroSessionDoc {
  _id: string
  taskId: string | null
  taskTitle: string
  type: 'focus' | 'break'
  duration: number          // seconds
  startedAt: string
  completedAt: string | null
  completed: boolean
  createdAt?: string
  updatedAt?: string
}

const SESSIONS_KEY = ['pomodoro-sessions'] as const

async function fetchSessions(): Promise<PomodoroSessionDoc[]> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const res = await fetch(`/api/pomodoro?since=${since}&limit=500`)
  if (!res.ok) throw new Error('Failed to fetch pomodoro sessions')
  return res.json()
}

export function usePomodoro() {
  const queryClient = useQueryClient()

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: fetchSessions,
  })

  // ── Create session mutation ─────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (data: {
      taskId?: string | null
      taskTitle?: string
      type: 'focus' | 'break'
      duration: number
      startedAt: string
    }) => {
      const res = await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create session')
      return res.json() as Promise<PomodoroSessionDoc>
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY })
    },
  })

  // ── Complete session mutation ───────────────────────────────────
  const completeMutation = useMutation({
    mutationFn: async ({ id, completedAt }: { id: string; completedAt: string }) => {
      const res = await fetch(`/api/pomodoro/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedAt, completed: true }),
      })
      if (!res.ok) throw new Error('Failed to complete session')
      return res.json() as Promise<PomodoroSessionDoc>
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY })
    },
  })

  // ── Computed stats ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // start of week (Sunday)

    const completedFocus = sessions.filter(s => s.type === 'focus' && s.completed)

    const todayFocusMinutes = Math.round(
      completedFocus
        .filter(s => new Date(s.startedAt) >= todayStart)
        .reduce((sum, s) => sum + s.duration, 0) / 60
    )

    const weekFocusMinutes = Math.round(
      completedFocus
        .filter(s => new Date(s.startedAt) >= weekStart)
        .reduce((sum, s) => sum + s.duration, 0) / 60
    )

    const totalSessions = completedFocus.length

    // Current streak: consecutive days with at least one completed focus session
    let currentStreak = 0
    const dayMs = 24 * 60 * 60 * 1000
    let checkDate = new Date(todayStart)

    // Check today first
    const hasTodaySession = completedFocus.some(s => new Date(s.startedAt) >= todayStart)
    if (!hasTodaySession) {
      // Check if yesterday had one — if not, streak is 0
      checkDate = new Date(todayStart.getTime() - dayMs)
    }

    while (true) {
      const dayStart = new Date(checkDate)
      const dayEnd = new Date(dayStart.getTime() + dayMs)
      const hasSession = completedFocus.some(s => {
        const d = new Date(s.startedAt)
        return d >= dayStart && d < dayEnd
      })
      if (hasSession) {
        currentStreak++
        checkDate = new Date(checkDate.getTime() - dayMs)
      } else {
        break
      }
    }

    const todayCompletedCount = sessions.filter(
      s => s.type === 'focus' && s.completed && new Date(s.startedAt) >= todayStart
    ).length

    return { todayFocusMinutes, weekFocusMinutes, totalSessions, currentStreak, todayCompletedCount }
  }, [sessions])

  return {
    sessions,
    isLoading,
    createSession: createMutation.mutateAsync,
    completeSession: completeMutation.mutateAsync,
    stats,
  }
}
