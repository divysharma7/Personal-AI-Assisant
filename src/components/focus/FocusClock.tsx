'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { motionTokens } from '@/lib/motion'

export type FocusTheme = 'aurora' | 'minimal' | 'liquid'

interface FocusClockProps {
  remainingSeconds: number
  totalSeconds: number
  isRunning: boolean
  isPaused: boolean
  isBreak: boolean
  taskTitle?: string
  theme?: FocusTheme
}

const SIZE = 320
const STROKE = 8
const RADIUS = (SIZE - STROKE * 2) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function formatTime(seconds: number): { minutes: string; secs: string } {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return {
    minutes: String(m).padStart(2, '0'),
    secs: String(s).padStart(2, '0'),
  }
}

export default function FocusClock({
  remainingSeconds,
  totalSeconds,
  isRunning,
  isPaused,
  isBreak,
  taskTitle,
}: FocusClockProps) {
  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0
  const dashOffset = CIRCUMFERENCE * (1 - progress)
  const { minutes, secs } = formatTime(remainingSeconds)
  const isLowTime = remainingSeconds <= 120 && remainingSeconds > 0

  const ringColor = isBreak
    ? 'var(--success, #34d399)'
    : isLowTime
    ? '#f59e0b'
    : 'var(--accent)'

  const glowColor = isBreak
    ? 'rgba(52, 211, 153, 0.12)'
    : isLowTime
    ? 'rgba(245, 158, 11, 0.12)'
    : 'rgba(248, 79, 57, 0.08)'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 24, userSelect: 'none',
    }}>
      {/* Session label */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: motionTokens.duration.normal }}
        style={{
          fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: isBreak ? 'var(--success, #34d399)' : 'var(--text-muted)',
          backgroundColor: isBreak ? 'rgba(52,211,153,0.1)' : 'var(--overlay-1, rgba(108,108,158,0.06))',
          padding: '4px 14px', borderRadius: 999,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {isBreak ? 'Break' : 'Focus'}
      </motion.div>

      {/* Clock ring */}
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', inset: STROKE * 3, borderRadius: '50%',
          boxShadow: `0 0 60px ${glowColor}, 0 0 120px ${glowColor}`,
          transition: 'box-shadow 1s ease',
        }} />

        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            fill="none"
            stroke="var(--overlay-2, rgba(108,108,158,0.12))"
            strokeWidth={STROKE}
          />
          <motion.circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animate={{
              strokeDashoffset: dashOffset,
              opacity: isPaused ? [1, 0.4, 1] : 1,
            }}
            transition={isPaused
              ? { opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }
              : { strokeDashoffset: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }
            }
          />
        </svg>

        {/* Time */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            display: 'flex', alignItems: 'baseline',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontVariantNumeric: 'tabular-nums',
          }}>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={minutes}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: motionTokens.duration.fast }}
                style={{ fontSize: 72, fontWeight: 200, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
              >
                {minutes}
              </motion.span>
            </AnimatePresence>

            <motion.span
              animate={{ opacity: isPaused ? [1, 0.3, 1] : 1 }}
              transition={isPaused ? { duration: 1.2, repeat: Infinity } : {}}
              style={{ fontSize: 72, fontWeight: 200, color: 'var(--text-faint)', margin: '0 2px' }}
            >
              :
            </motion.span>

            <AnimatePresence mode="popLayout">
              <motion.span
                key={secs}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: motionTokens.duration.fast }}
                style={{ fontSize: 72, fontWeight: 200, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
              >
                {secs}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Status dot + label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            {isRunning && !isPaused && (
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: ringColor }}
              />
            )}
            <span style={{
              fontSize: 12, fontWeight: 500, color: 'var(--text-faint)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              {isPaused ? 'Paused' : isRunning ? 'In progress' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Task title */}
      {taskTitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: motionTokens.duration.normal }}
          style={{
            fontSize: 15, fontWeight: 500, maxWidth: 280, textAlign: 'center',
            color: 'var(--text-muted)', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.4,
          }}
        >
          {taskTitle}
        </motion.p>
      )}
    </div>
  )
}
