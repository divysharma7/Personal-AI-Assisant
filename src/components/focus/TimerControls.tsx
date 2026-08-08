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
      : 'Start'

  return (
    <div className="flex min-h-12 flex-wrap items-center justify-center gap-3">
      {/* Reset Button */}
      {!isIdle && (
        <motion.button
          {...buttonPress}
          type="button"
          onClick={onReset}
          aria-label="Reset timer"
          className="focus-utility-button flex h-10 w-10 items-center justify-center rounded-full cursor-pointer"
          style={{
            color: 'var(--focus-muted)',
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
        className="focus-primary-button flex h-[42px] min-w-[148px] items-center justify-center gap-2 rounded-full px-8 text-[12px] font-semibold cursor-pointer"
        style={{
          backgroundColor: 'var(--focus-accent)',
          color: '#fff',
          transition: 'opacity 150ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
      >
        {isRunning ? <Pause className="sr-only" size={1} /> : <Play className="sr-only" size={1} />}
        {primaryLabel}
      </motion.button>

      {/* Finish Button (Stopwatch mode only when running/paused) */}
      {mode === 'STOPWATCH' && !isIdle && (
        <motion.button
          {...buttonPress}
          type="button"
          onClick={onFinish}
          aria-label="Finish session"
          className="focus-utility-button flex h-10 w-10 items-center justify-center rounded-full cursor-pointer"
          style={{
            color: 'var(--focus-muted)',
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
          className="focus-utility-button flex h-10 w-10 items-center justify-center rounded-full cursor-pointer"
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
