import { env } from '@/config/env'
import { useCallback, useEffect, useRef, useState } from 'react'
import { trackEvent } from '@/lib/analytics'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeSlideUp, buttonPress, ease } from '@/lib/motion'
import {
  ArrowLeft,
  Check,
  Coffee,
  Maximize,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipForward,
  Target,
} from 'lucide-react'
import LifeOSMark from '@/components/brand/LifeOSMark'

const API_BASE = env.VITE_API_URL

type Mode = 'focus' | 'shortBreak' | 'longBreak'

interface Preset {
  id: string
  label: string
  description: string
  focus: number
  short: number
  long: number
}

interface FocusStats {
  today: { sessions: number; totalMin: number }
  week: { sessions: number; totalMin: number }
  total: { sessions: number; totalMin: number }
  avgSessionMin: number
}

interface ActiveSession {
  _id: string
  plannedDurationMin?: number
  extendedByMin?: number
  startedAt: string
  pausedAt?: string | null
  totalPausedMs?: number
  taskTitleSnapshot?: string | null
}

const presets: Preset[] = [
  {
    id: 'reset',
    label: '25 / 5',
    description: 'Quick reset',
    focus: 25,
    short: 5,
    long: 15,
  },
  {
    id: 'flow',
    label: '50 / 10',
    description: 'Sustained flow',
    focus: 50,
    short: 10,
    long: 20,
  },
  {
    id: 'deep',
    label: '90 / 15',
    description: 'Deep work',
    focus: 90,
    short: 15,
    long: 30,
  },
]

const modeLabels: Record<Mode, string> = {
  focus: 'Focus',
  shortBreak: 'Reset',
  longBreak: 'Long reset',
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`
}

function playCompletionSound() {
  try {
    const context = new AudioContext()
    const notes = [523, 659, 784]

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const start = context.currentTime + index * 0.1

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, start)
      gain.gain.setValueAtTime(0.12, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(start)
      oscillator.stop(start + 0.24)
    })

    window.setTimeout(() => context.close(), 900)
  } catch {
    // Sound is a progressive enhancement.
  }
}

export default function FocusPage() {
  const [searchParams] = useSearchParams()
  const linkedTaskId = searchParams.get('taskId')
  const linkedTaskTitle = searchParams.get('task')

  const [preset, setPreset] = useState(presets[1])
  const [mode, setMode] = useState<Mode>('focus')
  const [remaining, setRemaining] = useState(presets[1].focus * 60)
  const [total, setTotal] = useState(presets[1].focus * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [intention, setIntention] = useState(linkedTaskTitle || searchParams.get('habit') || '')
  const [autoStart, setAutoStart] = useState(false)
  const [stats, setStats] = useState<FocusStats | null>(null)
  const [statusMessage, setStatusMessage] = useState('')

  const startedAtRef = useRef(0)
  const targetSecondsRef = useRef(presets[1].focus * 60)
  const frameRef = useRef(0)
  const sessionIdRef = useRef<string | null>(null)
  const completedRef = useRef(false)
  const notificationPermissionRef = useRef(false)

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/focus/stats`, { credentials: 'include' })
      if (response.ok) setStats(await response.json())
    } catch {
      // Stats should never block a focus session.
    }
  }, [])

  const updateSession = useCallback(async (
    action: 'pause' | 'resume' | 'extend' | 'complete' | 'cancel',
    extra: Record<string, unknown> = {},
  ) => {
    const sessionId = sessionIdRef.current
    if (!sessionId) return

    try {
      await fetch(`${API_BASE}/api/focus/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, ...extra }),
      })
      if (action === 'complete' || action === 'cancel') sessionIdRef.current = null
    } catch {
      // The local timer remains usable if persistence is temporarily unavailable.
    }
  }, [])

  const requestNotificationPermission = useCallback(() => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'granted') {
      notificationPermissionRef.current = true
      return
    }
    if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        notificationPermissionRef.current = permission === 'granted'
      })
    }
  }, [])

  const durationFor = useCallback((nextMode: Mode, nextPreset = preset) => {
    if (nextMode === 'focus') return nextPreset.focus * 60
    if (nextMode === 'shortBreak') return nextPreset.short * 60
    return nextPreset.long * 60
  }, [preset])

  const beginCountdown = useCallback((seconds: number, preserveTotal = false) => {
    cancelAnimationFrame(frameRef.current)
    targetSecondsRef.current = seconds
    startedAtRef.current = performance.now()
    completedRef.current = false
    if (!preserveTotal) setTotal(seconds)
    setRemaining(seconds)
    setIsPaused(false)
    setIsRunning(true)
  }, [])

  const createFocusSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/focus/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          taskId: linkedTaskId || undefined,
          taskTitle: linkedTaskTitle || intention || undefined,
          plannedDurationMin: preset.focus,
          plannedBreakMin: preset.short,
        }),
      })
      if (response.ok) {
        const session = await response.json()
        sessionIdRef.current = session._id
      }
    } catch {
      // The timer still starts offline and can be used without persistence.
    }
  }, [preset, linkedTaskId, linkedTaskTitle, intention])

  const start = useCallback(async () => {
    requestNotificationPermission()
    const seconds = durationFor(mode)
    if (mode === 'focus') void createFocusSession()
    beginCountdown(seconds)
    setStatusMessage('')
  }, [beginCountdown, createFocusSession, durationFor, mode, requestNotificationPermission])

  const pause = useCallback(() => {
    cancelAnimationFrame(frameRef.current)
    setIsPaused(true)
    setIsRunning(false)
    if (mode === 'focus') void updateSession('pause')
  }, [mode, updateSession])

  const resume = useCallback(() => {
    if (mode === 'focus') void updateSession('resume')
    beginCountdown(remaining, true)
  }, [beginCountdown, mode, remaining, updateSession])

  const reset = useCallback(() => {
    cancelAnimationFrame(frameRef.current)
    if (mode === 'focus' && sessionIdRef.current) {
      void updateSession('cancel', { endedReason: 'user_cancelled' })
    }
    const seconds = durationFor(mode)
    setRemaining(seconds)
    setTotal(seconds)
    setIsRunning(false)
    setIsPaused(false)
    setStatusMessage('')
  }, [durationFor, mode, updateSession])

  const switchMode = useCallback((nextMode: Mode) => {
    cancelAnimationFrame(frameRef.current)
    if (sessionIdRef.current) void updateSession('cancel', { endedReason: 'user_cancelled' })
    const seconds = durationFor(nextMode)
    setMode(nextMode)
    setRemaining(seconds)
    setTotal(seconds)
    setIsRunning(false)
    setIsPaused(false)
    setStatusMessage('')
  }, [durationFor, updateSession])

  const changePreset = useCallback((nextPreset: Preset) => {
    if (isRunning) return
    setPreset(nextPreset)
    const seconds = durationFor(mode, nextPreset)
    setRemaining(seconds)
    setTotal(seconds)
    setIsPaused(false)
  }, [durationFor, isRunning, mode])

  const extend = useCallback(() => {
    const extraSeconds = 5 * 60
    targetSecondsRef.current += extraSeconds
    setRemaining((value) => value + extraSeconds)
    setTotal((value) => value + extraSeconds)
    if (mode === 'focus') void updateSession('extend', { additionalMin: 5 })
  }, [mode, updateSession])

  const complete = useCallback(async () => {
    if (completedRef.current) return
    completedRef.current = true
    cancelAnimationFrame(frameRef.current)
    setRemaining(0)
    setIsRunning(false)
    setIsPaused(false)
    playCompletionSound()

    if (mode === 'focus') {
      await updateSession('complete', {
        endedReason: 'timer_ended',
        ...(intention.trim() ? { postSessionNote: intention.trim().slice(0, 200) } : {}),
      })
      await fetchStats()
      // Privacy-safe milestone: user completed a focus session.
      trackEvent('first_focus_session')
    }

    if (notificationPermissionRef.current) {
      try {
        new Notification('Life OS', { body: `${modeLabels[mode]} complete.` })
      } catch {
        // Notifications are optional.
      }
    }

    const nextMode: Mode = mode === 'focus' ? 'shortBreak' : 'focus'
    setStatusMessage(mode === 'focus' ? 'Session complete. Take a real reset.' : 'Reset complete. Ready when you are.')

    if (autoStart) {
      window.setTimeout(() => {
        setMode(nextMode)
        if (nextMode === 'focus') void createFocusSession()
        beginCountdown(durationFor(nextMode))
      }, 2200)
    }
  }, [autoStart, beginCountdown, createFocusSession, durationFor, fetchStats, intention, mode, updateSession])

  const tick = useCallback(() => {
    const elapsed = (performance.now() - startedAtRef.current) / 1000
    const nextRemaining = Math.max(0, Math.ceil(targetSecondsRef.current - elapsed))
    setRemaining(nextRemaining)

    if (nextRemaining <= 0) {
      void complete()
      return
    }

    frameRef.current = requestAnimationFrame(tick)
  }, [complete])

  useEffect(() => {
    if (isRunning) {
      frameRef.current = requestAnimationFrame(tick)
    }
    return () => cancelAnimationFrame(frameRef.current)
  }, [isRunning, tick])

  useEffect(() => {
    fetchStats()

    const restoreActiveSession = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/focus/sessions/active`, { credentials: 'include' })
        if (!response.ok) return
        const session = await response.json() as ActiveSession | null
        if (!session?.startedAt) return

        const plannedSeconds = ((session.plannedDurationMin || 25) + (session.extendedByMin || 0)) * 60
        const endAt = session.pausedAt ? new Date(session.pausedAt).getTime() : Date.now()
        const elapsedSeconds = Math.floor(
          (endAt - new Date(session.startedAt).getTime() - (session.totalPausedMs || 0)) / 1000,
        )
        const secondsLeft = Math.max(0, plannedSeconds - elapsedSeconds)
        if (secondsLeft <= 0) return

        sessionIdRef.current = session._id
        setMode('focus')
        setTotal(plannedSeconds)
        setRemaining(secondsLeft)
        targetSecondsRef.current = secondsLeft
        if (session.taskTitleSnapshot) setIntention(session.taskTitleSnapshot)

        if (session.pausedAt) {
          setIsPaused(true)
          setIsRunning(false)
        } else {
          startedAtRef.current = performance.now()
          setIsRunning(true)
        }
      } catch {
        // Start with a fresh local timer if restoration fails.
      }
    }

    void restoreActiveSession()
  }, [fetchStats])

  useEffect(() => {
    document.title = isRunning
      ? `${formatTime(remaining)} — ${modeLabels[mode]}`
      : 'Focus — Life OS'
    return () => {
      document.title = 'Life OS'
    }
  }, [isRunning, mode, remaining])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.matches('input, textarea, select, [contenteditable="true"]')) return

      if (event.code === 'Space') {
        event.preventDefault()
        if (isRunning) pause()
        else if (isPaused) resume()
        else void start()
      }

      if (event.key.toLowerCase() === 'r') reset()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPaused, isRunning, pause, reset, resume, start])

  const progress = total > 0 ? Math.min(1, Math.max(0, (total - remaining) / total)) : 0
  const circumference = 2 * Math.PI * 132
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}>
      <header className="flex items-center justify-between px-5 py-4 sm:px-8" style={{ borderBottom: '1px solid var(--border)' }}>
        <LifeOSMark />
        <div className="flex items-center gap-2">
          <motion.button
            {...buttonPress}
            type="button"
            onClick={() => document.documentElement.requestFullscreen?.()}
            aria-label="Enter full screen"
            className="flex h-9 w-9 items-center justify-center rounded-full cursor-pointer"
            style={{ color: 'var(--text-muted)', transition: 'background-color 150ms ease, color 150ms ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <Maximize size={17} />
          </motion.button>
          <motion.button
            {...buttonPress}
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold cursor-pointer"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', transition: 'background-color 150ms ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <ArrowLeft size={15} />
            Leave focus
          </motion.button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1180px] gap-6 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:px-8 lg:py-10">
        <motion.section
          {...fadeSlideUp}
          transition={ease.normal}
          className="relative overflow-hidden p-5 sm:p-8 lg:min-h-[690px] rounded-[16px]"
          style={{ backgroundColor: 'var(--bg-pane)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="absolute left-0 top-0 h-1 w-full" style={{ backgroundColor: 'var(--overlay-1)' }}>
            <div
              className="h-full"
              style={{ backgroundColor: 'var(--accent)', width: `${progress * 100}%`, transition: 'width 250ms linear' }}
            />
          </div>

          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--text-faint)' }}>
                Focus protocol
              </p>
              <h1
                className="mt-2 text-[38px] leading-none"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '-0.02em' }}
              >
                Do one thing well.
              </h1>
            </div>

            <div className="flex rounded-full p-1" style={{ backgroundColor: 'var(--overlay-1)' }} aria-label="Session type">
              {(['focus', 'shortBreak', 'longBreak'] as Mode[]).map((item) => (
                <motion.button
                  {...buttonPress}
                  key={item}
                  type="button"
                  onClick={() => switchMode(item)}
                  aria-pressed={mode === item}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold cursor-pointer"
                  style={{
                    backgroundColor: mode === item ? 'var(--accent)' : 'transparent',
                    color: mode === item ? '#fff' : 'var(--text-muted)',
                    transition: 'background-color 150ms ease, color 150ms ease',
                  }}
                >
                  {modeLabels[item]}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-7 flex max-w-[520px] flex-col items-center">
            <div className="relative flex h-[300px] w-[300px] items-center justify-center sm:h-[340px] sm:w-[340px]">
              <svg
                aria-hidden="true"
                viewBox="0 0 300 300"
                className="absolute inset-0 h-full w-full -rotate-90"
              >
                <circle cx="150" cy="150" r="132" fill="none" stroke="var(--overlay-2, rgba(222,221,249,0.07))" strokeWidth="5" />
                <circle
                  cx="150"
                  cy="150"
                  r="132"
                  fill="none"
                  stroke={mode === 'focus' ? 'var(--accent)' : 'var(--accent-purple)'}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="relative text-center">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-faint)' }}>
                  {isPaused ? 'Paused' : isRunning ? 'In progress' : modeLabels[mode]}
                </p>
                <div
                  role="timer"
                  aria-live="off"
                  aria-label={`${formatTime(remaining)} remaining`}
                  className="text-[72px] font-semibold leading-none tracking-[-0.065em] tabular-nums sm:text-[84px]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {formatTime(remaining)}
                </div>
              </div>
            </div>

            {mode === 'focus' ? (
              <div className="w-full max-w-md">
                <label
                  htmlFor="focus-intention"
                  className="mb-2 block text-center text-[10px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: 'var(--text-faint)' }}
                >
                  Session intention
                </label>
                <input
                  id="focus-intention"
                  value={intention}
                  onChange={(event) => setIntention(event.target.value)}
                  placeholder="What will be true when this session ends?"
                  className="w-full border-0 border-b bg-transparent px-2 py-3 text-center text-[15px] outline-none focus:ring-0"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
                />
              </div>
            ) : (
              <p className="max-w-sm text-center text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
                Step away from the screen. Water, movement, and distance count.
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <motion.button
                {...buttonPress}
                type="button"
                onClick={reset}
                aria-label="Reset timer"
                className="flex h-11 w-11 items-center justify-center rounded-full cursor-pointer"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', transition: 'background-color 150ms ease, color 150ms ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <RotateCcw size={17} />
              </motion.button>
              <motion.button
                {...buttonPress}
                type="button"
                onClick={() => {
                  if (isRunning) pause()
                  else if (isPaused) resume()
                  else void start()
                }}
                className="flex min-w-40 items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold cursor-pointer"
                style={{ backgroundColor: 'var(--accent)', color: '#fff', transition: 'opacity 150ms ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                {isRunning ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
                {isRunning ? 'Pause' : isPaused ? 'Resume' : mode === 'focus' ? 'Begin focus' : 'Begin reset'}
              </motion.button>
              <motion.button
                {...buttonPress}
                type="button"
                onClick={() => switchMode(mode === 'focus' ? 'shortBreak' : 'focus')}
                aria-label={mode === 'focus' ? 'Skip to reset' : 'Skip to focus'}
                className="flex h-11 w-11 items-center justify-center rounded-full cursor-pointer"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', transition: 'background-color 150ms ease, color 150ms ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <SkipForward size={17} />
              </motion.button>
            </div>

            {isRunning && mode === 'focus' && (
              <motion.button
                {...buttonPress}
                type="button"
                onClick={extend}
                className="mt-4 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                style={{ color: 'var(--text-muted)', transition: 'color 150ms ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <Plus size={14} />
                Add 5 minutes
              </motion.button>
            )}

            {statusMessage && (
              <p role="status" aria-live="polite" className="mt-5 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--success)' }}>
                <Check size={16} />
                {statusMessage}
              </p>
            )}
          </div>
        </motion.section>

        <motion.aside {...fadeSlideUp} transition={ease.normal} className="space-y-5">
          <section className="p-5 rounded-[16px]" style={{ backgroundColor: 'var(--bg-pane-2)', border: '1px solid var(--border)' }}>
            <div className="mb-5 flex items-center gap-2">
              <Target size={17} style={{ color: 'var(--text-muted)' }} />
              <h2 className="text-sm font-semibold">Choose a rhythm</h2>
            </div>
            <div className="space-y-2">
              {presets.map((item) => (
                <motion.button
                  {...buttonPress}
                  key={item.id}
                  type="button"
                  onClick={() => changePreset(item)}
                  disabled={isRunning}
                  aria-pressed={preset.id === item.id}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  style={{
                    backgroundColor: preset.id === item.id ? 'var(--accent)' : 'var(--overlay-1)',
                    color: preset.id === item.id ? '#fff' : 'var(--text-primary)',
                    transition: 'background-color 150ms ease, color 150ms ease',
                  }}
                >
                  <span>
                    <span className="block text-sm font-semibold tabular-nums">{item.label}</span>
                    <span className="mt-0.5 block text-[11px]" style={{ color: preset.id === item.id ? 'rgba(255,255,255,0.6)' : 'var(--text-faint)' }}>
                      {item.description}
                    </span>
                  </span>
                  {preset.id === item.id && <Check size={16} />}
                </motion.button>
              ))}
            </div>
          </section>

          <section className="p-5 rounded-[16px]" style={{ backgroundColor: 'var(--bg-pane-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Coffee size={17} style={{ color: 'var(--text-muted)' }} />
              <h2 className="text-sm font-semibold">Today&apos;s focus</h2>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-faint)' }}>Sessions</p>
                <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] tabular-nums" style={{ color: 'var(--accent)' }}>
                  {stats?.today.sessions ?? 0}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-faint)' }}>Focused</p>
                <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] tabular-nums" style={{ color: 'var(--accent)' }}>
                  {formatMinutes(stats?.today.totalMin ?? 0)}
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              Weekly total: <strong style={{ color: 'var(--text-primary)' }}>{formatMinutes(stats?.week.totalMin ?? 0)}</strong>
            </div>
          </section>

          <section className="p-5 rounded-[16px]" style={{ backgroundColor: 'var(--bg-pane-2)', border: '1px solid var(--border)' }}>
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <span>
                <span className="block text-sm font-semibold">Continue the rhythm</span>
                <span className="mt-1 block text-xs leading-5" style={{ color: 'var(--text-faint)' }}>
                  Start the next reset or focus session automatically.
                </span>
              </span>
              <input
                type="checkbox"
                checked={autoStart}
                onChange={(event) => setAutoStart(event.target.checked)}
                className="h-4 w-4 shrink-0"
                style={{ accentColor: 'var(--accent)' }}
              />
            </label>
          </section>

          <p className="px-1 text-[11px] leading-5" style={{ color: 'var(--text-faint)' }}>
            Space starts or pauses · R resets
          </p>
        </motion.aside>
      </main>
    </div>
  )
}
