import { motion } from 'framer-motion'
import { buttonPress } from '@/lib/motion'
import type { TimerMode, TimerStatus } from '@/hooks/useFocusTimer'

interface ModeSelectorProps {
  mode: TimerMode
  status: TimerStatus
  onChange: (mode: TimerMode) => void
}

const modes: { value: TimerMode; label: string }[] = [
  { value: 'POMO', label: 'Pomo' },
  { value: 'STOPWATCH', label: 'Stopwatch' },
]

export default function ModeSelector({ mode, status, onChange }: ModeSelectorProps) {
  const isDisabled = status === 'RUNNING' || status === 'PAUSED'

  return (
    <div
      className="flex rounded-full p-1"
      style={{ backgroundColor: 'var(--overlay-1)' }}
      aria-label="Timer mode"
    >
      {modes.map((item) => (
        <motion.button
          {...buttonPress}
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          disabled={isDisabled}
          aria-pressed={mode === item.value}
          className="rounded-full px-3 py-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: mode === item.value ? 'var(--accent)' : 'transparent',
            color: mode === item.value ? '#fff' : 'var(--text-muted)',
            transition: 'background-color 150ms ease, color 150ms ease',
          }}
        >
          {item.label}
        </motion.button>
      ))}
    </div>
  )
}
