'use client'

import { isToday } from '../calendarUtils'
import { hexToRgba } from '@/lib/colorUtils'
import type { CalendarEvent } from '../types'

interface WeekAllDayBarProps {
  weekDays: Date[]
  allDayByDay: CalendarEvent[][]
}

export default function WeekAllDayBar({ weekDays, allDayByDay }: WeekAllDayBarProps) {
  const hasAnyAllDay = allDayByDay.some((dayEvents) => dayEvents.length > 0)

  if (!hasAnyAllDay) return null

  return (
    <div
      className="grid flex-shrink-0"
      style={{
        gridTemplateColumns: '60px repeat(7, 1fr)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left gutter label */}
      <div
        className="flex items-center justify-center"
        style={{
          borderRight: '1px solid var(--border)',
          padding: '4px 0',
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: 'var(--text-faint)',
          }}
        >
          All Day
        </span>
      </div>

      {/* Day columns */}
      {weekDays.map((day, i) => {
        const today = isToday(day)
        const dayAllDay = allDayByDay[i]
        return (
          <div
            key={`allday-${i}`}
            className="flex flex-wrap items-start gap-1 px-1 py-1.5"
            style={{
              borderRight: i < 6 ? '1px solid var(--border)' : 'none',
              backgroundColor: today ? 'var(--accent-soft)' : 'transparent',
              minHeight: 32,
            }}
          >
            {dayAllDay.map((ev) => (
              <button
                key={ev.id}
                className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 cursor-pointer"
                style={{
                  backgroundColor: hexToRgba(ev.color, 0.08),
                  border: 'none',
                  maxWidth: '100%',
                  transition: 'background-color 120ms ease',
                }}
                title={ev.title}
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('laif:detail-task', {
                      detail: { taskId: ev.id },
                    })
                  )
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = hexToRgba(ev.color, 0.15)
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = hexToRgba(ev.color, 0.08)
                }}
              >
                {/* Circle checkbox */}
                <span
                  style={{
                    width: 12,
                    height: 12,
                    minWidth: 12,
                    borderRadius: '50%',
                    border: ev.isCompleted
                      ? 'none'
                      : `1.5px solid ${hexToRgba(ev.color, 0.45)}`,
                    backgroundColor: ev.isCompleted ? ev.color : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {ev.isCompleted && (
                    <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5.5L4 7.5L8 3"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>

                {/* Title */}
                <span
                  className="truncate"
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: ev.color,
                    textDecoration: ev.isCompleted ? 'line-through' : 'none',
                    opacity: ev.isCompleted ? 0.6 : 1,
                    lineHeight: 1.3,
                  }}
                >
                  {ev.title}
                </span>
              </button>
            ))}
          </div>
        )
      })}
    </div>
  )
}
