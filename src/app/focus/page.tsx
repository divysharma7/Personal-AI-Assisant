'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, HelpCircle, X } from 'lucide-react'
import { fade, fadeSlideUp, ease, buttonPress } from '@/lib/motion'
import FocusClock from '@/components/focus/FocusClock'
import type { FocusTheme } from '@/components/focus/FocusClock'
import ThemeSwitcher from '@/components/focus/ThemeSwitcher'
import FocusControls from '@/components/focus/FocusControls'
import FocusIdle from '@/components/focus/FocusIdle'
import SessionCompletePrompt from '@/components/focus/SessionCompletePrompt'
import BreakView from '@/components/focus/BreakView'

type FocusState = 'idle' | 'active' | 'break'

export default function FocusPage() {
  // ── State ──
  const [focusState, setFocusState] = useState<FocusState>('idle')
  const [theme, setTheme] = useState<FocusTheme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('laif-focus-theme') as FocusTheme) || 'aurora'
    }
    return 'aurora'
  })
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [taskTitle, setTaskTitle] = useState<string | null>(null)
  const [taskListName, setTaskListName] = useState<string | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Break state
  const [breakRemaining, setBreakRemaining] = useState(0)
  const [breakTotal, setBreakTotal] = useState(0)
  const [breakEnded, setBreakEnded] = useState(false)

  // ── Refs for rAF timer ──
  const startTimeRef = useRef<number>(0)
  const pausedAtRef = useRef<number>(0)
  const targetDurationRef = useRef<number>(0)
  const rafRef = useRef<number>(0)
  const remainingRef = useRef<number>(0)

  // ── Theme persistence ──
  const handleThemeChange = useCallback((newTheme: FocusTheme) => {
    setTheme(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('laif-focus-theme', newTheme)
    }
  }, [])

  // Set data-focus-theme on document for CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-focus-theme', theme)
    return () => {
      document.documentElement.removeAttribute('data-focus-theme')
    }
  }, [theme])

  // ── rAF countdown engine ──
  const tick = useCallback(() => {
    const elapsed = (performance.now() - startTimeRef.current) / 1000
    const remaining = Math.max(0, targetDurationRef.current - elapsed)
    const rounded = Math.ceil(remaining)

    if (rounded !== remainingRef.current) {
      remainingRef.current = rounded
      setRemainingSeconds(rounded)
    }

    if (remaining <= 0) {
      // Timer completed
      setRemainingSeconds(0)
      if (focusState === 'active') {
        setSessionComplete(true)
      } else if (focusState === 'break') {
        setBreakEnded(true)
      }
      return // stop the rAF loop
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [focusState])

  const startTimer = useCallback((durationSeconds: number) => {
    targetDurationRef.current = durationSeconds
    startTimeRef.current = performance.now()
    remainingRef.current = durationSeconds
    setRemainingSeconds(durationSeconds)
    setIsPaused(false)
    setSessionComplete(false)
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const pauseTimer = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    pausedAtRef.current = performance.now()
    setIsPaused(true)
  }, [])

  const resumeTimer = useCallback(() => {
    // Shift startTime forward by the paused duration
    const pausedDuration = performance.now() - pausedAtRef.current
    startTimeRef.current += pausedDuration
    setIsPaused(false)
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const extendTimer = useCallback((extraSeconds: number) => {
    targetDurationRef.current += extraSeconds
    setTotalSeconds((prev) => prev + extraSeconds)
    if (!isPaused) {
      // Already running, just update target
    }
  }, [isPaused])

  // Cleanup rAF on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // ── Actions ──
  const handleStartSession = useCallback((taskId: string | null, durationMinutes: number) => {
    const total = durationMinutes * 60
    setTotalSeconds(total)
    setFocusState('active')
    setSessionComplete(false)
    // Mock task name - will wire to real data post-merge
    if (taskId) {
      const mockTasks: Record<string, { title: string; list: string }> = {
        '1': { title: 'Review pull requests', list: 'Work' },
        '2': { title: 'Write documentation', list: 'Work' },
        '3': { title: 'Design homepage wireframes', list: 'Design' },
        '4': { title: 'Study React patterns', list: 'Learning' },
        '5': { title: 'Plan weekly goals', list: 'Personal' },
      }
      const task = mockTasks[taskId]
      setTaskTitle(task?.title ?? 'Focus session')
      setTaskListName(task?.list ?? null)
    } else {
      setTaskTitle('Free focus session')
      setTaskListName(null)
    }
    startTimer(total)
  }, [startTimer])

  const handlePauseResume = useCallback(() => {
    if (isPaused) {
      resumeTimer()
    } else {
      pauseTimer()
    }
  }, [isPaused, pauseTimer, resumeTimer])

  const handleExtend = useCallback(() => {
    extendTimer(5 * 60)
  }, [extendTimer])

  const handleEnd = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    setFocusState('idle')
    setRemainingSeconds(0)
    setSessionComplete(false)
    setTaskTitle(null)
    setTaskListName(null)
  }, [])

  const handleSessionAction = useCallback((action: 'break' | 'extend15' | 'extend25' | 'done') => {
    setSessionComplete(false)
    switch (action) {
      case 'break': {
        const breakDuration = 5 * 60
        setBreakTotal(breakDuration)
        setBreakRemaining(breakDuration)
        setBreakEnded(false)
        setFocusState('break')
        // Reset timer refs for break
        targetDurationRef.current = breakDuration
        startTimeRef.current = performance.now()
        remainingRef.current = breakDuration
        setRemainingSeconds(breakDuration)
        setTotalSeconds(breakDuration)
        setIsPaused(false)
        rafRef.current = requestAnimationFrame(tick)
        break
      }
      case 'extend15':
        setTotalSeconds(15 * 60)
        startTimer(15 * 60)
        break
      case 'extend25':
        setTotalSeconds(25 * 60)
        startTimer(25 * 60)
        break
      case 'done':
        handleEnd()
        break
    }
  }, [startTimer, handleEnd, tick])

  const handleBreakStartNext = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    setBreakEnded(false)
    setFocusState('active')
    const total = 25 * 60 // default next session
    setTotalSeconds(total)
    startTimer(total)
  }, [startTimer])

  const handleBreakDone = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    handleEnd()
  }, [handleEnd])

  const handleExit = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    handleEnd()
  }, [handleEnd])

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (focusState === 'active' && !sessionComplete) {
            handlePauseResume()
          }
          break
        case 'e':
        case 'E':
          if (focusState === 'active' && !sessionComplete) {
            handleExtend()
          }
          break
        case 'Escape':
          if (showShortcuts) {
            setShowShortcuts(false)
          } else if (focusState === 'active' || focusState === 'break') {
            handleEnd()
          }
          break
        case '1':
          handleThemeChange('aurora')
          break
        case '2':
          handleThemeChange('minimal')
          break
        case '3':
          handleThemeChange('liquid')
          break
        case '?':
          setShowShortcuts((prev) => !prev)
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [focusState, sessionComplete, showShortcuts, handlePauseResume, handleExtend, handleEnd, handleThemeChange])

  // ── Break timer tick updates ──
  useEffect(() => {
    if (focusState === 'break') {
      setBreakRemaining(remainingSeconds)
    }
  }, [focusState, remainingSeconds])

  // ── Render ──
  return (
    <div
      className="focus-page relative flex h-full min-h-screen flex-col items-center justify-center overflow-hidden"
      style={{
        background: focusState === 'idle'
          ? 'var(--bg-canvas)'
          : theme === 'aurora'
            ? 'linear-gradient(135deg, #0a0a2e, #1a0a3e)'
            : theme === 'minimal'
              ? '#0a0a0a'
              : 'linear-gradient(135deg, #fecdd3, #fde68a)',
      }}
    >
      {/* ── IDLE ── */}
      <AnimatePresence mode="wait">
        {focusState === 'idle' && (
          <motion.div
            key="idle"
            {...fade}
            transition={ease.normal}
            className="flex flex-1 flex-col items-center justify-center w-full"
          >
            <FocusIdle onStartSession={handleStartSession} theme={theme} />
          </motion.div>
        )}

        {/* ── ACTIVE ── */}
        {focusState === 'active' && (
          <motion.div
            key="active"
            {...fade}
            transition={ease.normal}
            className="flex flex-1 flex-col items-center justify-center gap-8 w-full relative"
          >
            {/* Clock */}
            <FocusClock
              remainingSeconds={remainingSeconds}
              totalSeconds={totalSeconds}
              isRunning={!isPaused && !sessionComplete}
              isPaused={isPaused}
              theme={theme}
              isBreak={false}
            />

            {/* Task title + list breadcrumb */}
            {taskTitle && (
              <div className="flex flex-col items-center gap-1">
                <p
                  className="text-base font-medium"
                  style={{ color: theme === 'liquid' ? '#1a1a1a' : 'rgba(255, 255, 255, 0.8)' }}
                >
                  {taskTitle}
                </p>
                {taskListName && (
                  <p
                    className="text-xs"
                    style={{ color: theme === 'liquid' ? 'rgba(26, 26, 26, 0.5)' : 'rgba(255, 255, 255, 0.4)' }}
                  >
                    {taskListName}
                  </p>
                )}
              </div>
            )}

            {/* Controls */}
            {!sessionComplete && (
              <FocusControls
                isPaused={isPaused}
                onPauseResume={handlePauseResume}
                onExtend={handleExtend}
                onEnd={handleEnd}
              />
            )}

            {/* Session complete prompt */}
            <AnimatePresence>
              {sessionComplete && (
                <SessionCompletePrompt onAction={handleSessionAction} />
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── BREAK ── */}
        {focusState === 'break' && (
          <motion.div
            key="break"
            {...fade}
            transition={ease.normal}
            className="flex flex-1 flex-col items-center justify-center w-full"
          >
            <BreakView
              remainingSeconds={breakRemaining}
              totalSeconds={breakTotal}
              isRunning={!breakEnded}
              isPaused={false}
              theme={theme}
              breakEnded={breakEnded}
              onStartNext={handleBreakStartNext}
              onDone={handleBreakDone}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom bar ── */}
      {focusState !== 'idle' && (
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
          {/* Exit */}
          <motion.button
            {...buttonPress}
            onClick={handleExit}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-sm cursor-pointer transition-colors duration-150"
            style={{
              color: theme === 'liquid' ? 'rgba(26, 26, 26, 0.5)' : 'rgba(255, 255, 255, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme === 'liquid' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.7)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme === 'liquid' ? 'rgba(26, 26, 26, 0.5)' : 'rgba(255, 255, 255, 0.4)'
            }}
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Exit
          </motion.button>

          {/* Theme switcher */}
          <ThemeSwitcher activeTheme={theme} onThemeChange={handleThemeChange} />
        </div>
      )}

      {/* ── Idle bottom: theme switcher ── */}
      {focusState === 'idle' && (
        <div className="absolute bottom-6 right-6">
          <ThemeSwitcher activeTheme={theme} onThemeChange={handleThemeChange} />
        </div>
      )}

      {/* ── Shortcuts overlay ── */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            {...fade}
            transition={ease.fast}
            role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Keyboard shortcuts"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={ease.normal}
              className="rounded-2xl p-6"
              style={{
                backgroundColor: 'rgba(20, 20, 30, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                minWidth: 320,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  Keyboard shortcuts
                </h3>
                <button
                  onClick={() => setShowShortcuts(false)}
                  aria-label="Close"
                  className="cursor-pointer"
                  style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  ['Space', 'Pause / Resume'],
                  ['E', 'Extend +5 min'],
                  ['Esc', 'Exit / Close'],
                  ['1', 'Aurora theme'],
                  ['2', 'Minimal theme'],
                  ['3', 'Liquid theme'],
                  ['?', 'Toggle shortcuts'],
                ].map(([key, desc]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      {desc}
                    </span>
                    <kbd
                      className="rounded px-2 py-0.5 text-xs font-mono"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        color: 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help button */}
      <motion.button
        {...buttonPress}
        onClick={() => setShowShortcuts(true)}
        className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full cursor-pointer transition-colors duration-150"
        style={{
          color: theme === 'liquid' && focusState !== 'idle'
            ? 'rgba(26, 26, 26, 0.4)'
            : 'rgba(255, 255, 255, 0.3)',
          backgroundColor: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
        title="Keyboard shortcuts (?)"
        aria-label="Show keyboard shortcuts"
      >
        <HelpCircle size={18} strokeWidth={1.5} />
      </motion.button>
    </div>
  )
}
