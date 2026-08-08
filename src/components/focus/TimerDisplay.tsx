import { motion } from 'framer-motion'
import type { TimerMode, TimerStatus } from '@/hooks/useFocusTimer'
import { formatTimerDisplay } from '@/lib/formatDuration'

interface TimerDisplayProps {
  mode: TimerMode
  remainingSeconds: number
  elapsedSeconds: number
  status: TimerStatus
  progress: number // 0-1 for POMO mode
}

const modeLabels: Record<TimerMode, string> = {
  POMO: 'Focus',
  STOPWATCH: 'Stopwatch',
}

export default function TimerDisplay({
  mode,
  remainingSeconds,
  elapsedSeconds,
  status,
  progress,
}: TimerDisplayProps) {
  // Calculate SVG circle properties
  const radius = 132
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  // Determine display value based on mode
  const displaySeconds = mode === 'POMO' ? remainingSeconds : elapsedSeconds
  const showHours = mode === 'STOPWATCH' && elapsedSeconds >= 3600

  // Status label
  const statusLabel = status === 'PAUSED'
    ? 'Paused'
    : status === 'RUNNING'
      ? 'In progress'
      : modeLabels[mode]

  return (
    <div className="relative flex flex-col items-center">
      {/* Circular Progress Ring */}
      <div className="relative flex h-[300px] w-[300px] items-center justify-center sm:h-[340px] sm:w-[340px]">
        <svg
          aria-hidden="true"
          viewBox="0 0 300 300"
          className="absolute inset-0 h-full w-full -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="150"
            cy="150"
            r={radius}
            fill="none"
            stroke="var(--overlay-2, rgba(222,221,249,0.07))"
            strokeWidth="5"
          />
          {/* Progress circle */}
          <motion.circle
            cx="150"
            cy="150"
            r={radius}
            fill="none"
            stroke={mode === 'POMO' ? 'var(--accent)' : 'var(--accent-purple, var(--accent))'}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.3, ease: 'linear' }}
          />
        </svg>

        {/* Center content */}
        <div className="relative text-center">
          <p
            className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: 'var(--text-faint)' }}
          >
            {statusLabel}
          </p>
          <motion.div
            role="timer"
            aria-live="off"
            aria-label={`${formatTimerDisplay(displaySeconds)} ${mode === 'POMO' ? 'remaining' : 'elapsed'}`}
            className="text-[72px] font-semibold leading-none tracking-[-0.065em] tabular-nums sm:text-[84px]"
            style={{ color: 'var(--text-primary)' }}
            animate={{ opacity: status === 'PAUSED' ? [1, 0.5, 1] : 1 }}
            transition={status === 'PAUSED' ? { repeat: Infinity, duration: 1.5 } : {}}
          >
            {formatTimerDisplay(displaySeconds, showHours)}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
