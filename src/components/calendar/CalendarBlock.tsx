'use client'

import { Link as LinkIcon } from 'lucide-react'
import { formatDuration, getContrastTextColor } from './calendarUtils'
import type { CalendarEvent } from './types'

interface CalendarBlockProps {
  event: CalendarEvent
  style?: React.CSSProperties
  isGhost?: boolean
  isReadOnly?: boolean
  onClick?: () => void
  /** Compact mode for week view (narrower, no duration) */
  compact?: boolean
}

/**
 * CalendarBlock — visual representation of a task/event on the calendar grid.
 *
 * - Regular tasks: colored bar with title + duration
 * - Google events: lighter opacity, link icon, no drag
 * - Focus sessions: thin 8px bar, gray, read-only
 * - Habit chips: small rounded pill, not in time grid
 */
export default function CalendarBlock({
  event,
  style,
  isGhost = false,
  isReadOnly = false,
  onClick,
  compact = false,
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
          backgroundColor: event.color,
          opacity: 0.8,
          ...style,
        }}
        onClick={onClick}
      >
        <span
          className="text-[10px] font-medium truncate"
          style={{ color: getContrastTextColor(event.color) }}
        >
          {event.title}
        </span>
      </div>
    )
  }

  const textColor = getContrastTextColor(event.color)
  const start = event.start ? new Date(event.start) : null
  const end = event.end ? new Date(event.end) : null
  const duration = start && end ? formatDuration(start, end) : null
  // Block is "tall enough" if it spans more than 30 minutes
  const isTallEnough =
    start && end && end.getTime() - start.getTime() >= 30 * 60 * 1000

  return (
    <div
      className={isGhost ? 'cal-block cal-block-ghost' : 'cal-block'}
      style={{
        backgroundColor: event.color,
        opacity: event.isExternal ? 0.6 : 1,
        cursor: isReadOnly || event.isReadOnly ? 'default' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isTallEnough && !compact ? 'space-between' : 'center',
        minHeight: 0,
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
      onClick={onClick}
    >
      {/* Title */}
      <span
        className="truncate font-medium"
        style={{
          fontSize: compact ? 11 : 13,
          color: textColor,
          lineHeight: 1.2,
        }}
      >
        {event.isExternal && (
          <LinkIcon
            size={compact ? 9 : 11}
            strokeWidth={2}
            className="inline mr-1"
            style={{ verticalAlign: 'middle', opacity: 0.8 }}
          />
        )}
        {event.title}
      </span>

      {/* Duration label — only shown when tall enough and not compact */}
      {!compact && isTallEnough && duration && (
        <span
          className="text-center"
          style={{
            fontSize: 11,
            color: textColor,
            opacity: 0.75,
          }}
        >
          {duration}
        </span>
      )}

      {/* Resize handle at bottom (visual only — drag agent handles logic) */}
      {!isReadOnly && !event.isReadOnly && !compact && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            cursor: 'ns-resize',
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: '0 0 6px 6px',
          }}
        />
      )}
    </div>
  )
}
