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
      className="focus-mode-switch flex rounded-full p-[3px]"
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
          className="min-w-[78px] rounded-full px-4 py-1.5 text-[11px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: mode === item.value ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: mode === item.value ? 'var(--focus-text)' : 'var(--focus-muted)',
            transition: 'background-color 150ms ease, color 150ms ease',
          }}
        >
          {item.label}
        </motion.button>
      ))}
    </div>
  )
}
