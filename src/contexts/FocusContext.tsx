import { env } from '@/config/env'
const API_BASE = env.VITE_API_URL

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export interface FocusState {
  isActive: boolean
  mode: 'POMO' | 'STOPWATCH'
  targetType: 'TASK' | 'HABIT' | 'NONE'
  targetId: string | null
  targetTitle: string
  remainingSeconds: number
  totalSeconds: number
}

interface FocusContextValue {
  focus: FocusState
  error: string | null
  clearError: () => void
  startSession: (
    taskId: string,
    taskTitle: string,
    options?: { mode?: 'POMO' | 'STOPWATCH'; targetType?: 'TASK' | 'HABIT' }
  ) => Promise<void>
}

const DEFAULT_STATE: FocusState = {
  isActive: false,
  mode: 'POMO',
  targetType: 'NONE',
  targetId: null,
  targetTitle: '',
  remainingSeconds: 0,
  totalSeconds: 0,
}

const FocusContext = createContext<FocusContextValue | undefined>(undefined)

export default function FocusProvider({ children }: { children: ReactNode }) {
  const [focus, setFocus] = useState<FocusState>(DEFAULT_STATE)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const clockRef = useRef<{ remainingSeconds: number; capturedAt: number } | null>(null)

  // Poll for active session every 30 seconds
  const pollActiveSession = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/focus/sessions/active`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data && data.startedAt) {
          const startedAt = new Date(data.startedAt).getTime()
          const duration = ((data.plannedDurationMin || 25) + (data.extendedByMin || 0)) * 60
          const endAt = data.pausedAt ? new Date(data.pausedAt).getTime() : Date.now()
          const elapsed = Math.floor((endAt - startedAt - (data.totalPausedMs || 0)) / 1000)
          const remaining = Math.max(0, duration - elapsed)
          const isStopwatch = data.mode === 'STOPWATCH'
          clockRef.current = isStopwatch ? null : { remainingSeconds: remaining, capturedAt: Date.now() }

          setFocus({
            isActive: !data.pausedAt && (isStopwatch || remaining > 0),
            mode: data.mode || 'POMO',
            targetType: data.targetType || 'NONE',
            targetId: data.taskId || data.habitId || null,
            targetTitle: data.taskTitleSnapshot || '',
            remainingSeconds: isStopwatch ? 0 : remaining,
            totalSeconds: isStopwatch ? 0 : duration,
          })
          return
        }
      }
      // No active session
      clockRef.current = null
      setFocus(DEFAULT_STATE)
    } catch {
      // Network error — keep current state
      setError('Focus status could not be refreshed. Your active session is still preserved.')
    }
  }, [])

  // Initial poll + interval
  useEffect(() => {
    pollActiveSession()
    pollRef.current = setInterval(pollActiveSession, 30_000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [pollActiveSession])

  // Derive the visible clock from timestamps so background-tab throttling
  // cannot make the global timer drift from the server session.
  useEffect(() => {
    if (focus.isActive && focus.mode === 'POMO' && clockRef.current) {
      tickRef.current = setInterval(() => {
        setFocus((prev) => {
          const anchor = clockRef.current
          if (!anchor) return prev
          const elapsed = Math.floor((Date.now() - anchor.capturedAt) / 1000)
          const remainingSeconds = Math.max(0, anchor.remainingSeconds - elapsed)
          return { ...prev, isActive: remainingSeconds > 0, remainingSeconds }
        })
      }, 1000)
      return () => {
        if (tickRef.current) clearInterval(tickRef.current)
      }
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [focus.isActive, focus.mode])

  // Listen for 'laif:start-focus' custom events
  useEffect(() => {
    function handleStartFocus(e: Event) {
      const custom = e as CustomEvent<{
        taskId: string
        taskTitle: string
        mode?: 'POMO' | 'STOPWATCH'
        targetType?: 'TASK' | 'HABIT'
      }>
      const { taskId, taskTitle, mode, targetType } = custom.detail
      startSession(taskId, taskTitle, { mode, targetType })
    }
    window.addEventListener('laif:start-focus', handleStartFocus)
    return () => window.removeEventListener('laif:start-focus', handleStartFocus)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startSession = useCallback(
    async (
      taskId: string,
      taskTitle: string,
      options?: { mode?: 'POMO' | 'STOPWATCH'; targetType?: 'TASK' | 'HABIT' }
    ) => {
      try {
        setError(null)
        const mode = options?.mode || 'POMO'
        const targetType = options?.targetType || 'TASK'

        const res = await fetch(`${API_BASE}/api/focus/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode,
            targetType,
            targetId: taskId,
            taskTitle,
          }),
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Focus could not be started')
        const session = await res.json()
        const duration = mode === 'POMO' ? (session.plannedDurationMin || 25) * 60 : 0
        clockRef.current = mode === 'POMO' ? { remainingSeconds: duration, capturedAt: Date.now() } : null
        setFocus({
          isActive: true,
          mode,
          targetType,
          targetId: taskId,
          targetTitle: taskTitle,
          remainingSeconds: duration,
          totalSeconds: duration,
        })
        window.location.assign('/focus')
      } catch {
        setError('Focus could not be started. Check your connection and try again.')
      }
    },
    []
  )

  return (
    <FocusContext.Provider value={{ focus, error, clearError: () => setError(null), startSession }}>
      {children}
    </FocusContext.Provider>
  )
}

export function useFocusState() {
  const ctx = useContext(FocusContext)
  if (!ctx) throw new Error('useFocusState must be used within FocusProvider')
  return ctx
}
