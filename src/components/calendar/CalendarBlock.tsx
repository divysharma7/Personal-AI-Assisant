'use client'

import { Link as LinkIcon } from 'lucide-react'
import { formatDuration } from './calendarUtils'
import type { CalendarEvent } from './types'

interface CalendarBlockProps {
  event: CalendarEvent
  style?: React.CSSProperties
  isGhost?: boolean
  isReadOnly?: boolean
  onClick?: () => void
  /** Compact mode for week view (narrower, no duration) */
  compact?: boolean
  /** Optional callback when checkbox is toggled */
  onToggleComplete?: (eventId: string) => void
}

/**
 * Hex color to rgba helper.
 * Accepts "#RRGGBB" and returns rgba at specified opacity.
 */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  if (clean.length < 6) return `rgba(120,120,140,${alpha})`
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/**
 * Format time for display: "2:00 PM"
 */
function formatTime(date: Date): string {
  const h = date.getHours()
  const m = date.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  const mins = m === 0 ? '' : `:${m.toString().padStart(2, '0')}`
  return `${hour12}${mins} ${ampm}`
}

/**
 * CalendarBlock — visual representation of a task/event on the calendar grid.
 *
 * TickTick-style: soft pastel backgrounds derived from list color,
 * circle checkbox, title + time range, subtle left border.
 */
export default function CalendarBlock({
  event,
  style,
  isGhost = false,
  isReadOnly = false,
  onClick,
  compact = false,
  onToggleComplete,
}: CalendarBlockProps) {
  // Focus sessions: thin bar
  if (event.isFocusSession) {
    return (
      <div
        className="cal-block"
        style={{
          ...style,
          height: 8,
          backgroundColor: '#6B6B75',
          opacity: 0.5,
          cursor: 'default',
          display: 'flex',
          alignItems: 'center',
          padding: '0 6px',
        }}
      >
        <span
          className="text-[9px] truncate"
          style={{ color: '#A0A0AA' }}
        >
          {event.title}
        </span>
      </div>
    )
  }

  // Habit chips: small rounded pill
  if (event.isHabit) {
    return (
      <div
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 cursor-pointer"
        style={{
          backgroundColor: hexToRgba(event.color, 0.15),
          border: `1px solid ${hexToRgba(event.color, 0.3)}`,
          ...style,
        }}
        onClick={onClick}
      >
        <span
          className="text-[10px] font-medium truncate"
          style={{ color: event.color }}
        >
          {event.title}
        </span>
      </div>
    )
  }

  const start = event.start ? new Date(event.start) : null
  const end = event.end ? new Date(event.end) : null
  const duration = start && end ? formatDuration(start, end) : null
  // Block is "tall enough" if it spans more than 30 minutes
  const isTallEnough =
    start && end && end.getTime() - start.getTime() >= 30 * 60 * 1000

  // Time range string: "2:00 PM - 3:00 PM"
  const timeRange =
    start && end ? `${formatTime(start)}-${formatTime(end)}` : null

  // Pastel background from event color
  const bgColor = hexToRgba(event.color, event.isExternal ? 0.08 : 0.12)
  const borderLeftColor = hexToRgba(event.color, 0.45)
  const titleColor = event.color

  return (
    <div
      className={isGhost ? 'cal-block cal-block-ghost' : 'cal-block'}
      style={{
        backgroundColor: bgColor,
        borderLeft: `2.5px solid ${borderLeftColor}`,
        cursor: isReadOnly || event.isReadOnly ? 'default' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        minHeight: 0,
        overflow: 'hidden',
        position: 'relative',
        padding: compact ? '3px 6px' : '4px 8px',
        gap: 1,
        ...style,
      }}
      onClick={onClick}
    >
      {/* Top row: checkbox + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
        {/* Circle checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete?.(event.id)
          }}
          style={{
            width: 14,
            height: 14,
            minWidth: 14,
            borderRadius: '50%',
            border: event.isCompleted
              ? 'none'
              : `1.5px solid ${hexToRgba(event.color, 0.5)}`,
            backgroundColor: event.isCompleted ? event.color : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            flexShrink: 0,
          }}
          aria-label={event.isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {event.isCompleted && (
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <path
                d="M2 5.5L4 7.5L8 3"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        {/* Title */}
        <span
          className="truncate"
          style={{
            fontSize: compact ? 11 : 12,
            fontWeight: 500,
            color: titleColor,
            lineHeight: 1.3,
            textDecoration: event.isCompleted ? 'line-through' : 'none',
            opacity: event.isCompleted ? 0.6 : 1,
          }}
        >
          {event.isExternal && (
            <LinkIcon
              size={compact ? 9 : 10}
              strokeWidth={2}
              className="inline mr-1"
              style={{ verticalAlign: 'middle', opacity: 0.7 }}
            />
          )}
          {event.title}
        </span>
      </div>

      {/* Time range label — shown when tall enough */}
      {isTallEnough && timeRange && (
        <span
          style={{
            fontSize: 10,
            color: hexToRgba(event.color, 0.6),
            fontWeight: 400,
            paddingLeft: 19,
            lineHeight: 1.3,
          }}
        >
          {timeRange}
        </span>
      )}

      {/* Duration label — only on non-compact tall blocks */}
      {!compact && isTallEnough && duration && !timeRange && (
        <span
          style={{
            fontSize: 10,
            color: 'var(--text-faint)',
            opacity: 0.7,
            paddingLeft: 19,
          }}
        >
          {duration}
        </span>
      )}

      {/* Resize handle at bottom — visible ↕ icon on hover (TickTick-style) */}
      {!isReadOnly && !event.isReadOnly && (
        <div
          className="cal-resize-handle"
          style={{
            position: 'absolute',
            bottom: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 24,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'ns-resize',
            opacity: 0,
            transition: 'opacity 150ms ease',
            zIndex: 15,
            pointerEvents: 'auto',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L5 5H11L8 2Z" fill="var(--text-muted, #6b7280)" />
            <path d="M8 14L5 11H11L8 14Z" fill="var(--text-muted, #6b7280)" />
            <rect x="7" y="6" width="2" height="4" rx="1" fill="var(--text-muted, #6b7280)" />
          </svg>
        </div>
      )}
    </div>
  )
}
