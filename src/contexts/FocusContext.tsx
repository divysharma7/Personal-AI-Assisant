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
  taskId: string | null
  taskTitle: string
  remainingSeconds: number
  totalSeconds: number
}

interface FocusContextValue {
  focus: FocusState
  startSession: (taskId: string, taskTitle: string) => Promise<void>
}

const DEFAULT_STATE: FocusState = {
  isActive: false,
  taskId: null,
  taskTitle: '',
  remainingSeconds: 0,
  totalSeconds: 0,
}

const FocusContext = createContext<FocusContextValue | undefined>(undefined)

export default function FocusProvider({ children }: { children: ReactNode }) {
  const [focus, setFocus] = useState<FocusState>(DEFAULT_STATE)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
          setFocus({
            isActive: remaining > 0 && !data.pausedAt,
            taskId: data.taskId || null,
            taskTitle: data.taskTitleSnapshot || '',
            remainingSeconds: remaining,
            totalSeconds: duration,
          })
          return
        }
      }
      // No active session
      setFocus(DEFAULT_STATE)
    } catch {
      // Network error — keep current state
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

  // Tick the remaining seconds every second when active
  useEffect(() => {
    if (focus.isActive && focus.remainingSeconds > 0) {
      tickRef.current = setInterval(() => {
        setFocus((prev) => {
          if (prev.remainingSeconds <= 1) {
            return { ...prev, isActive: false, remainingSeconds: 0 }
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 }
        })
      }, 1000)
      return () => {
        if (tickRef.current) clearInterval(tickRef.current)
      }
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [focus.isActive, focus.remainingSeconds > 0]) // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for 'laif:start-focus' custom events
  useEffect(() => {
    function handleStartFocus(e: Event) {
      const custom = e as CustomEvent<{ taskId: string; taskTitle: string }>
      const { taskId, taskTitle } = custom.detail
      startSession(taskId, taskTitle)
    }
    window.addEventListener('laif:start-focus', handleStartFocus)
    return () => window.removeEventListener('laif:start-focus', handleStartFocus)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startSession = useCallback(
    async (taskId: string, taskTitle: string) => {
      try {
        const res = await fetch(`${API_BASE}/api/focus/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId,
            plannedDurationMin: 25,
            plannedBreakMin: 5,
          }),
          credentials: 'include',
        })
        if (res.ok) {
          setFocus({
            isActive: true,
            taskId,
            taskTitle,
            remainingSeconds: 1500,
            totalSeconds: 1500,
          })
          window.location.href = '/focus'
        }
      } catch {
        // Failed silently
      }
    },
    []
  )

  return (
    <FocusContext.Provider value={{ focus, startSession }}>
      {children}
    </FocusContext.Provider>
  )
}

export function useFocusState() {
  const ctx = useContext(FocusContext)
  if (!ctx) throw new Error('useFocusState must be used within FocusProvider')
  return ctx
}
