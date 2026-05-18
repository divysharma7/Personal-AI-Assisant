'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MinimalThemeProps {
  remainingSeconds: number
  totalSeconds: number
  isRunning: boolean
  isPaused: boolean
  isBreak: boolean
}

function formatDigits(seconds: number): { m1: string; m2: string; s1: string; s2: string } {
  const clamped = Math.max(0, seconds)
  const m = Math.floor(clamped / 60)
  const s = clamped % 60
  const mStr = String(m).padStart(2, '0')
  const sStr = String(s).padStart(2, '0')
  return { m1: mStr[0], m2: mStr[1], s1: sStr[0], s2: sStr[1] }
}

function Digit({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-block relative" style={{ width: '80px', textAlign: 'center' }} aria-label={label}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="inline-block"
          style={{ willChange: 'transform, opacity' }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default function MinimalTheme({
  remainingSeconds,
  totalSeconds,
  isRunning,
  isPaused,
  isBreak,
}: MinimalThemeProps) {
  const digits = formatDigits(remainingSeconds)
  const progress = totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0

  // SVG circle parameters
  const size = 400
  const strokeWidth = 2
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  // Dot position on circle for current second
  const secondAngle = useMemo(() => {
    const totalSec = remainingSeconds % 60
    return ((60 - totalSec) / 60) * 360 - 90
  }, [remainingSeconds])

  const dotX = size / 2 + radius * Math.cos((secondAngle * Math.PI) / 180)
  const dotY = size / 2 + radius * Math.sin((secondAngle * Math.PI) / 180)

  const accentColor = isBreak ? '#5DA8FF' : 'var(--accent)'

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{ background: '#0a0a0a' }}
    >
      {/* SVG progress ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="absolute inset-0"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.3s ease',
            }}
          />
        </svg>

        {/* Pulsing dot at current second */}
        {isRunning && (
          <div
            className="absolute rounded-full"
            style={{
              width: 6,
              height: 6,
              backgroundColor: accentColor,
              left: dotX - 3,
              top: dotY - 3,
              boxShadow: `0 0 8px ${accentColor}`,
              animation: 'minimal-dot-pulse 2s ease-in-out infinite',
              willChange: 'opacity',
            }}
          />
        )}

        {/* Time floating in center */}
        <div
          className="absolute inset-0 flex items-center justify-center select-none"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            fontSize: 140,
            fontWeight: 300,
            color: 'rgba(255, 255, 255, 0.95)',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <Digit value={digits.m1} label="tens of minutes" />
          <Digit value={digits.m2} label="minutes" />
          <span className="mx-0.5 opacity-40">:</span>
          <Digit value={digits.s1} label="tens of seconds" />
          <Digit value={digits.s2} label="seconds" />
        </div>
      </div>
    </div>
  )
}
