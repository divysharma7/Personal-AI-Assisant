import { useCallback, useEffect, useRef, useState } from 'react'

export type TimerMode = 'POMO' | 'STOPWATCH'
export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED'

interface UseFocusTimerOptions {
  mode: TimerMode
  durationSeconds?: number // Required for POMO mode
  onComplete?: () => void
  onTick?: (elapsed: number, remaining: number) => void
}

interface UseFocusTimerReturn {
  status: TimerStatus
  remainingSeconds: number
  elapsedSeconds: number
  progress: number // 0-1 for POMO mode
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  finish: () => void
  restore: (elapsedSeconds: number, status: Extract<TimerStatus, 'RUNNING' | 'PAUSED'>) => void
}

export function useFocusTimer({
  mode,
  durationSeconds = 0,
  onComplete,
  onTick,
}: UseFocusTimerOptions): UseFocusTimerReturn {
  const [status, setStatus] = useState<TimerStatus>('IDLE')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Use refs for timestamp-based tracking (accurate even in background tabs)
  const startTimestampRef = useRef<number | null>(null)
  const pausedElapsedRef = useRef<number>(0)
  const animationFrameRef = useRef<number>(0)
  const completedRef = useRef(false)
  const hasRestoredRef = useRef(false)

  // Calculate remaining seconds based on mode
  const remainingSeconds = mode === 'POMO'
    ? Math.max(0, durationSeconds - elapsedSeconds)
    : elapsedSeconds // For stopwatch, remaining = elapsed (or we show elapsed)

  // Progress for POMO mode (0-1)
  const progress = mode === 'POMO' && durationSeconds > 0
    ? Math.min(1, elapsedSeconds / durationSeconds)
    : 0

  // Tick function using requestAnimationFrame for smooth updates
  const tick = useCallback(() => {
    if (startTimestampRef.current === null) return

    const now = performance.now()
    const elapsed = pausedElapsedRef.current + (now - startTimestampRef.current) / 1000
    const roundedElapsed = Math.floor(elapsed)

    setElapsedSeconds(roundedElapsed)

    // Call onTick callback
    if (onTick) {
      const remaining = mode === 'POMO'
        ? Math.max(0, durationSeconds - roundedElapsed)
        : roundedElapsed
      onTick(roundedElapsed, remaining)
    }

    // Check completion for POMO mode
    if (mode === 'POMO' && roundedElapsed >= durationSeconds && !completedRef.current) {
      completedRef.current = true
      setElapsedSeconds(durationSeconds)
      setStatus('IDLE')
      onComplete?.()
      return
    }

    // Continue animation if running
    if (status === 'RUNNING') {
      animationFrameRef.current = requestAnimationFrame(tick)
    }
  }, [mode, durationSeconds, onComplete, onTick, status])

  // Start the timer
  const start = useCallback(() => {
    completedRef.current = false
    pausedElapsedRef.current = 0
    startTimestampRef.current = performance.now()
    setElapsedSeconds(0)
    setStatus('RUNNING')
  }, [])

  // Pause the timer
  const pause = useCallback(() => {
    if (status !== 'RUNNING') return
    const startedAt = startTimestampRef.current
    if (startedAt === null) return

    // Save elapsed time
    const now = performance.now()
    pausedElapsedRef.current += (now - startedAt) / 1000
    startTimestampRef.current = null

    cancelAnimationFrame(animationFrameRef.current)
    setStatus('PAUSED')
  }, [status])

  // Resume the timer
  const resume = useCallback(() => {
    if (status !== 'PAUSED') return

    startTimestampRef.current = performance.now()
    setStatus('RUNNING')
  }, [status])

  // Reset the timer
  const reset = useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current)
    startTimestampRef.current = null
    pausedElapsedRef.current = 0
    completedRef.current = false
    setElapsedSeconds(0)
    setStatus('IDLE')
  }, [])

  // Finish manually (for Stopwatch mode)
  const finish = useCallback(() => {
    if (mode !== 'STOPWATCH') return

    cancelAnimationFrame(animationFrameRef.current)

    // Calculate final elapsed
    let finalElapsed = pausedElapsedRef.current
    if (startTimestampRef.current !== null) {
      finalElapsed += (performance.now() - startTimestampRef.current) / 1000
    }

    setElapsedSeconds(Math.floor(finalElapsed))
    setStatus('IDLE')
    onComplete?.()
  }, [mode, onComplete])

  const restore = useCallback((elapsed: number, restoredStatus: Extract<TimerStatus, 'RUNNING' | 'PAUSED'>) => {
    cancelAnimationFrame(animationFrameRef.current)
    const safeElapsed = Math.max(0, elapsed)
    completedRef.current = false
    pausedElapsedRef.current = safeElapsed
    startTimestampRef.current = restoredStatus === 'RUNNING' ? performance.now() : null
    setElapsedSeconds(Math.floor(safeElapsed))
    setStatus(restoredStatus)
  }, [])

  // Start animation loop when running
  useEffect(() => {
    if (status === 'RUNNING') {
      animationFrameRef.current = requestAnimationFrame(tick)
    }
    return () => cancelAnimationFrame(animationFrameRef.current)
  }, [status, tick])

  // Handle visibility change (background tab accuracy)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === 'RUNNING') {
        const startedAt = startTimestampRef.current
        if (startedAt === null) return
        // Recalculate elapsed time from timestamps
        const now = performance.now()
        const elapsed = pausedElapsedRef.current + (now - startedAt) / 1000
        const roundedElapsed = Math.floor(elapsed)

        setElapsedSeconds(roundedElapsed)

        // Check if POMO should complete
        if (mode === 'POMO' && roundedElapsed >= durationSeconds && !completedRef.current) {
          completedRef.current = true
          setElapsedSeconds(durationSeconds)
          setStatus('IDLE')
          onComplete?.()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [status, mode, durationSeconds, onComplete])

  // Save state to sessionStorage for refresh recovery
  useEffect(() => {
    // Effects run in declaration order; preserve an existing snapshot until the
    // restore effect below has had a chance to read it.
    if (!hasRestoredRef.current) return
    if (status === 'RUNNING' || status === 'PAUSED') {
      const state = {
        version: 1,
        mode,
        durationSeconds,
        elapsedSeconds,
        status,
        savedAt: Date.now(),
      }
      sessionStorage.setItem('focusTimerState', JSON.stringify(state))
    } else {
      sessionStorage.removeItem('focusTimerState')
    }
  }, [status, mode, durationSeconds, elapsedSeconds])

  // Restore state on mount
  useEffect(() => {
    hasRestoredRef.current = true
    try {
      const saved = sessionStorage.getItem('focusTimerState')
      if (!saved) return

      const state = JSON.parse(saved) as {
        version?: number
        mode?: TimerMode
        durationSeconds?: number
        elapsedSeconds?: number
        status?: TimerStatus
        savedAt?: number
      }
      if (
        state.version !== 1
        || state.mode !== mode
        || state.durationSeconds !== durationSeconds
        || typeof state.elapsedSeconds !== 'number'
        || typeof state.savedAt !== 'number'
      ) {
        sessionStorage.removeItem('focusTimerState')
        return
      }

      // Running timers advance while away; paused timers remain frozen.
      const timeSinceSave = Math.max(0, (Date.now() - state.savedAt) / 1000)
      const totalElapsed = state.status === 'RUNNING'
        ? state.elapsedSeconds + timeSinceSave
        : state.elapsedSeconds

      if (mode === 'POMO' && totalElapsed >= durationSeconds) {
        setElapsedSeconds(durationSeconds)
        sessionStorage.removeItem('focusTimerState')
        completedRef.current = true
        queueMicrotask(() => onComplete?.())
        return
      }

      // Restore state
      setElapsedSeconds(Math.floor(totalElapsed))
      pausedElapsedRef.current = totalElapsed
      startTimestampRef.current = null

      if (state.status === 'RUNNING') {
        startTimestampRef.current = performance.now()
        pausedElapsedRef.current = totalElapsed
        setStatus('RUNNING')
      } else if (state.status === 'PAUSED') {
        setStatus('PAUSED')
      }
    } catch {
      sessionStorage.removeItem('focusTimerState')
    }
  }, []) // Restore once from the persisted timer snapshot.

  return {
    status,
    remainingSeconds,
    elapsedSeconds,
    progress,
    start,
    pause,
    resume,
    reset,
    finish,
    restore,
  }
}
