'use client'

import { isToday } from '../calendarUtils'
import type { CalendarEvent } from '../types'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/**
 * ISO week number (1-53) for a given date.
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

interface WeekDayHeaderProps {
  weekDays: Date[]
  eventsByDay: CalendarEvent[][]
}

export default function WeekDayHeader({ weekDays }: WeekDayHeaderProps) {
  const weekNum = weekDays.length > 0 ? getWeekNumber(weekDays[0]) : 0

  return (
    <div
      className="grid flex-shrink-0"
      style={{
        gridTemplateColumns: '60px repeat(7, 1fr)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Week number in left gutter */}
      <div
        className="flex items-center justify-center"
        style={{
          borderRight: '1px solid var(--border)',
          padding: '8px 0',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--text-faint)',
            letterSpacing: '0.02em',
          }}
        >
          W{weekNum}
        </span>
      </div>

      {/* Day columns */}
      {weekDays.map((day, i) => {
        const today = isToday(day)
        return (
          <div
            key={i}
            className="flex flex-col items-center py-2 gap-0.5"
            style={{
              borderRight: i < 6 ? '1px solid var(--border)' : 'none',
              backgroundColor: today ? 'var(--accent-soft)' : 'transparent',
            }}
          >
            {/* Day name */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: today ? 'var(--accent)' : 'var(--text-faint)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {DAY_NAMES[i]}
            </span>

            {/* Date number */}
            <span
              className="flex items-center justify-center rounded-full"
              style={{
                width: 28,
                height: 28,
                fontSize: 14,
                fontWeight: today ? 700 : 500,
                color: today ? '#FFFFFF' : 'var(--text-primary)',
                backgroundColor: today ? 'var(--accent)' : 'transparent',
                lineHeight: 1,
              }}
            >
              {day.getDate()}
            </span>
          </div>
        )
      })}
    </div>
  )
}
