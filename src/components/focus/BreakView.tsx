'use client'

import { motion } from 'framer-motion'
import { Coffee, Play } from 'lucide-react'
import { fadeSlideUp, ease, buttonPress } from '@/lib/motion'
import FocusClock from './FocusClock'
import type { FocusTheme } from './FocusClock'

interface BreakViewProps {
  remainingSeconds: number
  totalSeconds: number
  isRunning: boolean
  isPaused: boolean
  theme: FocusTheme
  breakEnded: boolean
  onStartNext: () => void
  onDone: () => void
}

export default function BreakView({
  remainingSeconds,
  totalSeconds,
  isRunning,
  isPaused,
  theme,
  breakEnded,
  onStartNext,
  onDone,
}: BreakViewProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      {/* Break label */}
      <motion.div
        {...fadeSlideUp}
        transition={ease.normal}
        className="flex items-center gap-2"
      >
        <Coffee size={18} strokeWidth={1.5} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
        <span
          className="text-sm font-medium uppercase tracking-wider"
          style={{ color: 'rgba(255, 255, 255, 0.5)' }}
        >
          Break
        </span>
      </motion.div>

      {/* Clock — desaturated via break prop */}
      <FocusClock
        remainingSeconds={remainingSeconds}
        totalSeconds={totalSeconds}
        isRunning={isRunning}
        isPaused={isPaused}
        theme={theme}
        isBreak
      />

      {/* Break ended prompt */}
      {breakEnded && (
        <motion.div
          {...fadeSlideUp}
          transition={ease.slow}
          className="flex flex-col items-center gap-4 mt-4"
        >
          <p
            className="text-lg font-medium"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Ready for the next session?
          </p>

          <motion.button
            {...buttonPress}
            onClick={onStartNext}
            className="flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold cursor-pointer transition-opacity duration-150"
            style={{
              backgroundColor: 'var(--accent, #FF4D3D)',
              color: '#ffffff',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          >
            <Play size={16} strokeWidth={2} />
            Start next
          </motion.button>

          <motion.button
            {...buttonPress}
            onClick={onDone}
            className="rounded-full px-6 py-2 text-sm font-medium cursor-pointer transition-colors duration-150"
            style={{
              backgroundColor: 'transparent',
              color: 'rgba(255, 255, 255, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'
            }}
          >
            Done for now
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
