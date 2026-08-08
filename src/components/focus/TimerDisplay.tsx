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

const TICK_COUNT = 96
const TICKS = Array.from({ length: TICK_COUNT }, (_, index) => {
  const angle = (index / TICK_COUNT) * Math.PI * 2 - Math.PI / 2
  const innerRadius = 137
  const outerRadius = index % 4 === 0 ? 151 : 147
  return {
    x1: 160 + Math.cos(angle) * innerRadius,
    y1: 160 + Math.sin(angle) * innerRadius,
    x2: 160 + Math.cos(angle) * outerRadius,
    y2: 160 + Math.sin(angle) * outerRadius,
  }
})

export default function TimerDisplay({
  mode,
  remainingSeconds,
  elapsedSeconds,
  status,
  progress,
}: TimerDisplayProps) {
  // Determine display value based on mode
  const displaySeconds = mode === 'POMO' ? remainingSeconds : elapsedSeconds
  const showHours = mode === 'STOPWATCH' && elapsedSeconds >= 3600

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative flex h-[286px] w-[286px] items-center justify-center sm:h-[336px] sm:w-[336px]">
        <svg
          aria-hidden="true"
          viewBox="0 0 320 320"
          className="absolute inset-0 h-full w-full"
        >
          {TICKS.map((tick, index) => {
            const isActive = mode === 'POMO' && index / TICK_COUNT <= progress && progress > 0
            return (
              <line
                key={index}
                {...tick}
                stroke={isActive ? 'var(--focus-accent)' : 'var(--focus-tick)'}
                strokeWidth={index % 4 === 0 ? 1.8 : 1.25}
                strokeLinecap="round"
                style={{ transition: 'stroke 240ms linear' }}
              />
            )
          })}
        </svg>

        <div className="relative text-center">
          <motion.div
            role="timer"
            aria-live="off"
            aria-label={`${formatTimerDisplay(displaySeconds)} ${mode === 'POMO' ? 'remaining' : 'elapsed'}`}
            className="text-[46px] font-medium leading-none tracking-[-0.045em] tabular-nums sm:text-[54px]"
            style={{ color: 'var(--focus-text)' }}
            animate={{ opacity: status === 'PAUSED' ? [1, 0.5, 1] : 1 }}
            transition={status === 'PAUSED' ? { repeat: Infinity, duration: 1.5 } : {}}
          >
            {formatTimerDisplay(displaySeconds, showHours)}
          </motion.div>
          <span className="sr-only">{status === 'PAUSED' ? 'Paused' : status === 'RUNNING' ? 'In progress' : 'Ready'}</span>
        </div>
      </div>
    </div>
  )
}
