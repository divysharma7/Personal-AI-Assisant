'use client'

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AuroraThemeProps {
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
    <span className="inline-block relative" style={{ width: '56px', textAlign: 'center' }} aria-label={label}>
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

export default function AuroraTheme({
  remainingSeconds,
  totalSeconds,
  isRunning,
  isPaused,
  isBreak,
}: AuroraThemeProps) {
  const circleRef = useRef<HTMLDivElement>(null)
  const heartbeatRef = useRef<HTMLDivElement>(null)

  // Heartbeat pulse: derive from Date.now() % 4000 / 4000 for sync
  useEffect(() => {
    let raf: number
    const animate = () => {
      if (heartbeatRef.current) {
        const t = (Date.now() % 4000) / 4000
        // Sine wave: 1.0 -> 1.02 -> 1.0
        const scale = 1 + 0.02 * Math.sin(t * Math.PI * 2)
        heartbeatRef.current.style.transform = `scale(${scale})`
      }
      raf = requestAnimationFrame(animate)
    }
    if (isRunning && !isPaused) {
      raf = requestAnimationFrame(animate)
    }
    return () => cancelAnimationFrame(raf)
  }, [isRunning, isPaused])

  const digits = formatDigits(remainingSeconds)
  const progress = totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0
  const isLowTime = remainingSeconds < 120 && remainingSeconds > 0

  // Gradient shifts warm when < 2min
  const bgStyle = isBreak
    ? 'linear-gradient(135deg, #0a1a2e, #0a2e3e)'
    : isLowTime
      ? 'linear-gradient(135deg, #2e0a1a, #3e1a0a)'
      : 'linear-gradient(135deg, #0a0a2e, #1a0a3e)'

  return (
    <div
      className="aurora-theme-bg relative flex flex-col items-center justify-center"
      style={{
        '--aurora-primary': isBreak ? '#3a7ced' : '#7c3aed',
        '--aurora-secondary': isBreak ? '#84b0fc' : '#c084fc',
        '--aurora-glow': isBreak ? 'rgba(58, 124, 237, 0.3)' : isLowTime ? 'rgba(237, 124, 58, 0.3)' : 'rgba(124, 58, 237, 0.3)',
        background: bgStyle,
      } as React.CSSProperties}
    >
      {/* Outer heartbeat container */}
      <div
        ref={heartbeatRef}
        className="relative flex items-center justify-center"
        style={{ willChange: 'transform' }}
      >
        {/* Circle container */}
        <div
          ref={circleRef}
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 400,
            height: 400,
            background: `conic-gradient(from ${progress * 360}deg, var(--aurora-primary), var(--aurora-secondary), var(--aurora-primary))`,
            boxShadow: `0 0 80px var(--aurora-glow), 0 0 160px var(--aurora-glow)`,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Inner dark fill */}
          <div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              width: 380,
              height: 380,
              background: isBreak
                ? 'radial-gradient(circle, #0a1828 0%, #060f1c 100%)'
                : isLowTime
                  ? 'radial-gradient(circle, #1c0a0a 0%, #120606 100%)'
                  : 'radial-gradient(circle, #0c0c24 0%, #060618 100%)',
            }}
          />

          {/* Time display */}
          <div
            className="relative z-10 flex items-center justify-center select-none"
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 200,
              fontSize: 96,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <Digit value={digits.m1} label="tens of minutes" />
            <Digit value={digits.m2} label="minutes" />
            <span className="mx-1 opacity-60">:</span>
            <Digit value={digits.s1} label="tens of seconds" />
            <Digit value={digits.s2} label="seconds" />
          </div>
        </div>
      </div>
    </div>
  )
}
