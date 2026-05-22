'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { getHourLabels } from '../calendarUtils'

const HOUR_LABELS = getHourLabels()

interface HiddenHoursDividerProps {
  position: 'top' | 'bottom'
  /** Current boundary hour (e.g. 7 for top, 21 for bottom) */
  hour: number
  onDrag: (newHour: number) => void
  onToggleExpand: () => void
  /** Whether the hidden section is currently expanded (all hours shown) */
  isExpanded: boolean
  /** Number of grid columns (for spanning the full width) */
  gridColumns: number
}

/** Format hour as "12 AM", "7 AM", "9 PM", etc. */
function formatHour(h: number): string {
  if (h === 0 || h === 24) return '12 AM'
  if (h === 12) return '12 PM'
  return HOUR_LABELS[h % 24]
}

/** Build the label describing the hidden range. */
function getHiddenLabel(position: 'top' | 'bottom', hour: number): string {
  if (position === 'top') {
    return `${formatHour(0)} \u2013 ${formatHour(hour)} hidden`
  }
  return `${formatHour(hour)} \u2013 ${formatHour(24)} hidden`
}

export default function HiddenHoursDivider({
  position,
  hour,
  onDrag,
  onToggleExpand,
  isExpanded,
  gridColumns,
}: HiddenHoursDividerProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewHour, setPreviewHour] = useState<number | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef(0)
  const dragStartHour = useRef(hour)

  const hasHiddenHours = position === 'top' ? hour > 0 : hour < 24
  const displayHour = previewHour ?? hour

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only start drag from the grip area
      const target = e.target as HTMLElement
      if (!target.closest('[data-grip]')) return

      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
      dragStartY.current = e.clientY
      dragStartHour.current = hour
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [hour],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      e.preventDefault()

      const deltaY = e.clientY - dragStartY.current
      // Approximate: each hour ~64px in the grid (4 rows * 16px)
      const parentGrid = barRef.current?.closest('.cal-grid')
      const rowHeight = parentGrid
        ? parentGrid.scrollHeight / (parentGrid.children.length > 0 ? 96 : 1)
        : 16
      const hourPixels = rowHeight * 4
      const deltaHours = Math.round(deltaY / hourPixels)

      let newHour: number
      if (position === 'top') {
        newHour = Math.max(0, Math.min(12, dragStartHour.current + deltaHours))
      } else {
        newHour = Math.max(12, Math.min(24, dragStartHour.current + deltaHours))
      }
      setPreviewHour(newHour)
    },
    [isDragging, position],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      setIsDragging(false)

      if (previewHour !== null && previewHour !== hour) {
        onDrag(previewHour)
      }
      setPreviewHour(null)
    },
    [isDragging, previewHour, hour, onDrag],
  )

  // Cancel drag on Escape
  useEffect(() => {
    if (!isDragging) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDragging(false)
        setPreviewHour(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isDragging])

  if (!hasHiddenHours && !isExpanded) return null

  const label = getHiddenLabel(position, displayHour)

  return (
    <div
      ref={barRef}
      style={{
        gridColumn: `1 / ${gridColumns + 1}`,
        height: 24,
        position: 'relative',
        zIndex: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        backgroundColor: isDragging
          ? 'color-mix(in srgb, var(--border) 60%, transparent)'
          : 'color-mix(in srgb, var(--border) 35%, transparent)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        transition: isDragging ? 'none' : 'background-color 150ms ease',
      }}
      onClick={(e) => {
        // Don't toggle if we just finished dragging
        if (isDragging) return
        const target = e.target as HTMLElement
        if (target.closest('[data-grip]')) return
        onToggleExpand()
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Hidden range label */}
      {hasHiddenHours && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: 'var(--text-faint)',
            marginRight: 8,
            pointerEvents: 'none',
          }}
        >
          {label}
        </span>
      )}

      {/* Grip handle */}
      <div
        data-grip
        style={{
          width: 40,
          height: 16,
          borderRadius: 8,
          backgroundColor: isDragging
            ? 'color-mix(in srgb, var(--border) 90%, transparent)'
            : 'color-mix(in srgb, var(--border) 60%, transparent)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          cursor: 'ns-resize',
          transition: isDragging ? 'none' : 'background-color 150ms ease',
        }}
      >
        {/* Three horizontal grip lines */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 12,
              height: 1.5,
              borderRadius: 1,
              backgroundColor: 'var(--text-faint)',
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      {/* Tooltip */}
      {showTooltip && !isDragging && (
        <div
          style={{
            position: 'absolute',
            top: position === 'top' ? -32 : 'auto',
            bottom: position === 'bottom' ? -32 : 'auto',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--bg-elevated, #1a1a1f)',
            color: 'var(--text-on-dark, #fff)',
            fontSize: 11,
            fontWeight: 500,
            padding: '4px 10px',
            borderRadius: 6,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          Drag to adjust the hidden time
        </div>
      )}
    </div>
  )
}
