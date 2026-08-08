import { motion } from 'framer-motion'
import { buttonPress } from '@/lib/motion'
import { Pause, Play, RotateCcw, Square, SkipForward } from 'lucide-react'
import type { TimerMode, TimerStatus } from '@/hooks/useFocusTimer'

interface TimerControlsProps {
  status: TimerStatus
  mode: TimerMode
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onFinish: () => void
  onReset: () => void
  onSkip?: () => void
}

export default function TimerControls({
  status,
  mode,
  onStart,
  onPause,
  onResume,
  onFinish,
  onReset,
  onSkip,
}: TimerControlsProps) {
  const isRunning = status === 'RUNNING'
  const isPaused = status === 'PAUSED'
  const isIdle = status === 'IDLE'

  // Primary action handler
  const handlePrimaryAction = () => {
    if (isRunning) onPause()
    else if (isPaused) onResume()
    else onStart()
  }

  // Primary button label
  const primaryLabel = isRunning
    ? 'Pause'
    : isPaused
      ? 'Resume'
      : mode === 'POMO'
        ? 'Begin focus'
        : 'Start'

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {/* Reset Button */}
      {!isIdle && (
        <motion.button
          {...buttonPress}
          type="button"
          onClick={onReset}
          aria-label="Reset timer"
          className="flex h-11 w-11 items-center justify-center rounded-full cursor-pointer"
          style={{
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            transition: 'background-color 150ms ease, color 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--overlay-1)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <RotateCcw size={17} />
        </motion.button>
      )}

      {/* Primary Action Button (Start/Pause/Resume) */}
      <motion.button
        {...buttonPress}
        type="button"
        onClick={handlePrimaryAction}
        className="flex min-w-40 items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold cursor-pointer"
        style={{
          backgroundColor: 'var(--accent)',
          color: '#fff',
          transition: 'opacity 150ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
      >
        {isRunning ? (
          <Pause size={17} fill="currentColor" />
        ) : (
          <Play size={17} fill="currentColor" />
        )}
        {primaryLabel}
      </motion.button>

      {/* Finish Button (Stopwatch mode only when running/paused) */}
      {mode === 'STOPWATCH' && !isIdle && (
        <motion.button
          {...buttonPress}
          type="button"
          onClick={onFinish}
          aria-label="Finish session"
          className="flex h-11 w-11 items-center justify-center rounded-full cursor-pointer"
          style={{
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            transition: 'background-color 150ms ease, color 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--overlay-1)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <Square size={17} fill="currentColor" />
        </motion.button>
      )}

      {/* Skip Button (optional) */}
      {onSkip && !isIdle && (
        <motion.button
          {...buttonPress}
          type="button"
          onClick={onSkip}
          aria-label="Skip to next"
          className="flex h-11 w-11 items-center justify-center rounded-full cursor-pointer"
          style={{
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            transition: 'background-color 150ms ease, color 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--overlay-1)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <SkipForward size={17} />
        </motion.button>
      )}
    </div>
  )
}
