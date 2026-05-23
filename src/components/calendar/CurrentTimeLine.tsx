'use client'

import { useState, useEffect } from 'react'
import { timeToGridRow } from './calendarUtils'

/**
 * CurrentTimeLine — 2px accent line spanning the time grid with a pulsing dot.
 * Updates position every 60 seconds via setInterval.
 * Pulsing dot uses CSS animation for hydration-safe rendering.
 */
export default function CurrentTimeLine() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  // More granular row: use exact minutes, not just 15-min slots
  const totalMinutes = now.getHours() * 60 + now.getMinutes()
  const percentOfDay = totalMinutes / (24 * 60)
  // Position within the 96-row grid (each row = 15 min = 1.04167% of 24h)
  const gridRow = timeToGridRow(now)

  return (
    <>
      <style>{`
        @keyframes calDotPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
      <div
        className="cal-time-indicator"
        style={{
          gridRow: `${gridRow} / ${gridRow + 1}`,
          alignSelf: 'center',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* Pulsing dot — CSS animation avoids hydration mismatch from Date.now() */}
        <div
          className="cal-dot-pulse"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            marginLeft: -4,
            flexShrink: 0,
            animation: 'calDotPulse 4s ease-in-out infinite',
          }}
        />
        {/* Line */}
        <div
          style={{
            flex: 1,
            height: 2,
            backgroundColor: 'var(--accent)',
          }}
        />
      </div>
    </>
  )
}
