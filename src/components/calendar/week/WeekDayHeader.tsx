
import { isSameDay, isToday } from '../calendarUtils'
import type { CalendarEvent } from '../types'

interface WeekDayHeaderProps {
  weekDays: Date[]
  eventsByDay: CalendarEvent[][]
  selectedDate?: Date
}

export default function WeekDayHeader({ weekDays, selectedDate }: WeekDayHeaderProps) {
  return (
    <div
      className="grid flex-shrink-0"
      style={{
        gridTemplateColumns: '60px repeat(7, 1fr)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          borderRight: '1px solid var(--border)',
          padding: '8px 0',
        }}
      >
      </div>

      {/* Day columns */}
      {weekDays.map((day, i) => {
        const today = isToday(day) || (!!selectedDate && isSameDay(day, selectedDate))
        return (
          <div
            key={i}
            className="flex flex-col items-center py-2 gap-0.5"
            style={{
              borderRight: i < 6 ? '1px solid var(--border)' : 'none',
              backgroundColor: 'transparent',
            }}
          >
            {/* Day name */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: today ? 'var(--accent)' : 'var(--text-faint)',
                letterSpacing: '0.04em',
              }}
            >
              {day.toLocaleDateString('en-US', { weekday: 'short' })}
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
