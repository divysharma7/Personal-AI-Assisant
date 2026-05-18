'use client'

import { useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LiquidThemeProps {
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
    <span className="inline-block relative" style={{ width: '60px', textAlign: 'center' }} aria-label={label}>
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

// 4 blob keypoint shapes — smooth organic forms
const blobPaths = [
  'M200,80 C260,80 320,120 340,180 C360,240 340,310 280,340 C220,370 140,360 100,300 C60,240 80,160 120,120 C150,90 170,80 200,80Z',
  'M200,70 C270,65 330,110 350,175 C370,250 350,320 290,350 C230,380 150,370 90,310 C40,250 50,150 110,105 C150,75 170,70 200,70Z',
  'M195,75 C255,70 325,115 345,185 C365,255 340,325 275,350 C210,375 135,365 85,295 C45,235 65,145 115,110 C155,85 175,75 195,75Z',
  'M205,85 C265,75 315,125 335,190 C355,245 345,315 285,345 C225,375 145,355 95,290 C55,230 75,155 125,115 C160,90 180,85 205,85Z',
]

// Linear interpolation between two path strings (same structure)
function lerpPaths(pathA: string, pathB: string, t: number): string {
  const numsA = pathA.match(/-?\d+\.?\d*/g) || []
  const numsB = pathB.match(/-?\d+\.?\d*/g) || []
  if (numsA.length !== numsB.length) return pathA

  let idx = 0
  return pathA.replace(/-?\d+\.?\d*/g, () => {
    const a = parseFloat(numsA[idx])
    const b = parseFloat(numsB[idx])
    idx++
    return String(Math.round(a + (b - a) * t))
  })
}

export default function LiquidTheme({
  remainingSeconds,
  totalSeconds,
  isRunning,
  isPaused,
  isBreak,
}: LiquidThemeProps) {
  const svgPathRef = useRef<SVGPathElement>(null)
  const prevMinuteRef = useRef(Math.floor(remainingSeconds / 60))

  const digits = formatDigits(remainingSeconds)
  const completed = remainingSeconds <= 0

  // Morph blob with rAF
  useEffect(() => {
    let raf: number
    const animate = () => {
      if (svgPathRef.current) {
        const t = (Date.now() % 12000) / 12000 // full cycle over 12s
        const totalPaths = blobPaths.length
        const segment = 1 / totalPaths
        const pathIdx = Math.floor(t / segment)
        const localT = (t - pathIdx * segment) / segment
        // Smooth ease
        const eased = localT * localT * (3 - 2 * localT)
        const fromPath = blobPaths[pathIdx % totalPaths]
        const toPath = blobPaths[(pathIdx + 1) % totalPaths]
        svgPathRef.current.setAttribute('d', lerpPaths(fromPath, toPath, eased))
      }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Ripple on minute change
  const currentMinute = Math.floor(remainingSeconds / 60)
  const showRipple = currentMinute !== prevMinuteRef.current && isRunning && !isPaused
  useEffect(() => {
    prevMinuteRef.current = currentMinute
  }, [currentMinute])

  const bgGradient = isBreak
    ? 'linear-gradient(135deg, #c7d2fe, #a5b4fc)'
    : 'linear-gradient(135deg, #fecdd3, #fde68a)'
  const blobFill = isBreak ? '#818cf8' : '#f97316'
  const blobFillSecondary = isBreak ? '#a78bfa' : '#fb923c'
  const textColor = isBreak ? '#1e1b4b' : '#1a1a1a'

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{ background: bgGradient }}
    >
      {/* Blob */}
      <div className="relative flex items-center justify-center" style={{ width: 400, height: 400 }}>
        <svg viewBox="0 0 400 400" width={400} height={400} className="absolute inset-0">
          <defs>
            <linearGradient id="liquid-blob-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={blobFill} stopOpacity="0.9" />
              <stop offset="100%" stopColor={blobFillSecondary} stopOpacity="0.7" />
            </linearGradient>
            <filter id="liquid-blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
          </defs>
          <path
            ref={svgPathRef}
            d={blobPaths[0]}
            fill="url(#liquid-blob-grad)"
            filter="url(#liquid-blur)"
          />
        </svg>

        {/* Ripple on minute change */}
        <AnimatePresence>
          {showRipple && (
            <motion.div
              key={`ripple-${currentMinute}`}
              className="absolute rounded-full"
              style={{
                width: 300,
                height: 300,
                border: `2px solid ${blobFill}`,
                opacity: 0.5,
              }}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* Completion squish */}
        {completed && (
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 0.92, 1.05, 1] }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        )}

        {/* Time display */}
        <div
          className="relative z-10 flex items-center justify-center select-none"
          style={{
            fontSize: 100,
            fontWeight: 500,
            color: textColor,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
          }}
        >
          <Digit value={digits.m1} label="tens of minutes" />
          <Digit value={digits.m2} label="minutes" />
          <span className="mx-1 opacity-50">:</span>
          <Digit value={digits.s1} label="tens of seconds" />
          <Digit value={digits.s2} label="seconds" />
        </div>
      </div>
    </div>
  )
}
