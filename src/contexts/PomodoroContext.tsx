'use client'
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { usePomodoro } from '@/hooks/usePomodoro'

const WORK_SEC = 25 * 60
const BREAK_SEC = 5 * 60

interface PomodoroState {
  mode: 'work' | 'break'
  totalSec: number
  secondsLeft: number
  running: boolean
  sessions: number
  taskId: string | null
  taskTitle: string
  todayCompleted: number
}

interface PomodoroActions {
  start: () => void
  pause: () => void
  reset: () => void
  switchMode: (m: 'work' | 'break') => void
  setTask: (id: string | null, title: string, durationSec?: number) => void
}

interface PomodoroContextValue {
  state: PomodoroState
  actions: PomodoroActions
}

const PomodoroCtx = createContext<PomodoroContextValue | null>(null)

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const { createSession, completeSession, stats } = usePomodoro()

  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [totalSec, setTotalSec] = useState(WORK_SEC)
  const [secondsLeft, setSecondsLeft] = useState(WORK_SEC)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [taskTitle, setTaskTitle] = useState('')

  // Track current session id for persistence
  const currentSessionId = useRef<string | null>(null)
  const startTimeRef = useRef<Date | null>(null)

  // Play chime sound
  const playChime = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      const audio = new Audio('/sounds/chime.wav')
      audio.volume = 0.6
      audio.play().catch(() => {})
    } catch {
      // Audio playback not available
    }
  }, [])

  // Show in-app toast fallback
  const showToast = useCallback((title: string, body: string) => {
    if (typeof window === 'undefined') return
    // Create a temporary toast element as fallback (no Sonner dependency)
    const toast = document.createElement('div')
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 99999;
      background: var(--card, #1e1e2e); color: var(--text-1, #fff);
      border: 1px solid var(--border, #333); border-radius: 12px;
      padding: 14px 18px; max-width: 320px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
      font-family: inherit;
    `
    toast.innerHTML = `
      <p style="font-weight:600;font-size:14px;margin:0">${title}</p>
      <p style="font-size:13px;opacity:0.7;margin:4px 0 0">${body}</p>
    `
    // Add animation keyframe
    if (!document.getElementById('toast-anim')) {
      const style = document.createElement('style')
      style.id = 'toast-anim'
      style.textContent = `@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`
      document.head.appendChild(style)
    }
    document.body.appendChild(toast)
    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s'
      toast.style.opacity = '0'
      setTimeout(() => toast.remove(), 300)
    }, 4000)
  }, [])

  // Notify on timer end
  const sendNotification = useCallback((title: string, body: string) => {
    if (typeof window === 'undefined') return
    playChime()
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/logo_new.png' })
    } else {
      // Fallback: in-app toast when notification permission not granted
      showToast(title, body)
    }
  }, [playChime, showToast])

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Timer tick
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          setRunning(false)
          // Session completed
          if (currentSessionId.current) {
            completeSession({
              id: currentSessionId.current,
              completedAt: new Date().toISOString(),
            }).catch(() => {})
            currentSessionId.current = null
          }

          if (mode === 'work') {
            setSessions(n => n + 1)
            sendNotification('Focus session complete!', taskTitle || 'Great work! Time for a break.')
            setMode('break')
            setTotalSec(BREAK_SEC)
            return BREAK_SEC
          } else {
            sendNotification('Break is over!', 'Ready to focus again?')
            setMode('work')
            const dur = totalSec === BREAK_SEC ? WORK_SEC : totalSec
            setTotalSec(WORK_SEC)
            return WORK_SEC
          }
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode, taskTitle, completeSession, sendNotification])

  const start = useCallback(async () => {
    setRunning(true)
    startTimeRef.current = new Date()
    // Create persistent session
    try {
      const session = await createSession({
        taskId: taskId || undefined,
        taskTitle: taskTitle || '',
        type: mode === 'work' ? 'focus' : 'break',
        duration: totalSec,
        startedAt: new Date().toISOString(),
      })
      currentSessionId.current = session._id
    } catch {
      // still run timer even if persistence fails
    }
  }, [createSession, taskId, taskTitle, mode, totalSec])

  const pause = useCallback(() => {
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    setRunning(false)
    // If interrupted (was running, didn't complete)
    if (currentSessionId.current) {
      // Mark as incomplete — it already exists with completed: false
      currentSessionId.current = null
    }
    if (mode === 'work') {
      setTotalSec(WORK_SEC)
      setSecondsLeft(WORK_SEC)
    } else {
      setTotalSec(BREAK_SEC)
      setSecondsLeft(BREAK_SEC)
    }
  }, [mode])

  const switchMode = useCallback((next: 'work' | 'break') => {
    if (next === mode) return
    setRunning(false)
    if (currentSessionId.current) {
      currentSessionId.current = null
    }
    setMode(next)
    if (next === 'work') {
      setTotalSec(WORK_SEC)
      setSecondsLeft(WORK_SEC)
    } else {
      setTotalSec(BREAK_SEC)
      setSecondsLeft(BREAK_SEC)
    }
  }, [mode])

  const setTask = useCallback((id: string | null, title: string, durationSec?: number) => {
    setTaskId(id)
    setTaskTitle(title)
    if (mode === 'work') {
      const dur = durationSec ?? WORK_SEC
      setTotalSec(dur)
      setSecondsLeft(dur)
      setRunning(false)
    }
  }, [mode])

  const state: PomodoroState = {
    mode,
    totalSec,
    secondsLeft,
    running,
    sessions,
    taskId,
    taskTitle,
    todayCompleted: stats.todayCompletedCount,
  }

  const actions: PomodoroActions = { start, pause, reset, switchMode, setTask }

  return (
    <PomodoroCtx.Provider value={{ state, actions }}>
      {children}
    </PomodoroCtx.Provider>
  )
}

export function usePomodoroContext() {
  const ctx = useContext(PomodoroCtx)
  if (!ctx) throw new Error('usePomodoroContext must be used within PomodoroProvider')
  return ctx
}
