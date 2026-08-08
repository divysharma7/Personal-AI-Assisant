import { Link as LinkIcon } from 'lucide-react'
import { hexToRgba } from '@/lib/colorUtils'
import type { CalendarEvent } from './types'

interface CalendarBlockProps {
  event: CalendarEvent
  style?: React.CSSProperties
  isGhost?: boolean
  isReadOnly?: boolean
  onClick?: () => void
  compact?: boolean
  onToggleComplete?: (eventId: string) => void
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export default function CalendarBlock({
  event,
  style,
  isGhost = false,
  isReadOnly = false,
  onClick,
  compact = false,
  onToggleComplete,
}: CalendarBlockProps) {
  if (event.isFocusSession) {
    return (
      <div className="cal-block" style={{ ...style, height: 8, background: '#55565d', opacity: 0.6 }}>
        <span className="truncate text-[9px]" style={{ color: '#c4c4c9' }}>{event.title}</span>
      </div>
    )
  }

  if (event.isHabit) {
    return (
      <button
        className="inline-flex cursor-pointer items-center gap-1 rounded px-2 py-0.5"
        style={{ border: `1px solid ${hexToRgba(event.color, 0.55)}`, background: hexToRgba(event.color, 0.7), color: '#fff' }}
        onClick={onClick}
      >
        <span className="truncate text-[10px] font-semibold">{event.title}</span>
      </button>
    )
  }

  const start = new Date(event.start)
  const end = new Date(event.end)
  const tallEnough = end.getTime() - start.getTime() >= 30 * 60 * 1000
  const timeRange = `${formatTime(start)}–${formatTime(end)}`
  const readOnly = isReadOnly || event.isReadOnly

  return (
    <div
      className={isGhost ? 'cal-block cal-block-ghost' : 'cal-block'}
      style={{
        ...style,
        position: 'relative',
        display: 'flex',
        minHeight: 0,
        cursor: readOnly ? 'default' : 'pointer',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        gap: 1,
        overflow: 'hidden',
        padding: compact ? '3px 5px' : '5px 7px',
        border: '1px solid rgba(255,255,255,0.055)',
        borderRadius: 3,
        background: hexToRgba(event.color, event.isExternal ? 0.5 : 0.84),
        boxShadow: 'inset 1px 0 rgba(255,255,255,0.09)',
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', minWidth: 0, alignItems: 'center', gap: 4 }}>
        <button
          type="button"
          className="calendar-event-checkbox"
          onClick={(clickEvent) => {
            clickEvent.stopPropagation()
            onToggleComplete?.(event.id)
          }}
          aria-label={event.isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          <span data-complete={event.isCompleted ? 'true' : 'false'}>
            {event.isCompleted && (
              <svg width="7" height="7" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 5.5 4 7.5 8 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        </button>
        <span
          className="truncate"
          style={{
            color: '#f4f4f5',
            fontSize: compact ? 10 : 11,
            fontWeight: 620,
            lineHeight: 1.25,
            opacity: event.isCompleted ? 0.58 : 1,
            textDecoration: event.isCompleted ? 'line-through' : 'none',
          }}
        >
          {event.isExternal && <LinkIcon className="mr-1 inline" size={9} strokeWidth={2} />}
          {event.title}
        </span>
      </div>

      {tallEnough && (
        <span style={{ paddingLeft: 14, color: 'rgba(255,255,255,0.62)', fontSize: 9, lineHeight: 1.25 }}>
          {timeRange}
        </span>
      )}

      {!readOnly && <div className="cal-resize-handle" aria-hidden="true" />}
    </div>
  )
}
