'use client'

import { useState, useEffect } from 'react'
import { timeToGridRow } from './calendarUtils'

/**
 * CurrentTimeLine — 2px accent line spanning the time grid with a pulsing dot.
 * Updates position every 60 seconds via setInterval.
 * Pulsing dot syncs to Date.now() % 4000 heartbeat.
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

  // Pulsing opacity synced to heartbeat: Date.now() % 4000
  const heartbeat = (Date.now() % 4000) / 4000
  const pulseOpacity = 0.6 + 0.4 * Math.sin(heartbeat * Math.PI * 2)

  return (
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
      {/* Pulsing dot */}
      <div
        className="cal-dot-pulse"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          marginLeft: -4,
          flexShrink: 0,
          opacity: pulseOpacity,
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
  )
}
