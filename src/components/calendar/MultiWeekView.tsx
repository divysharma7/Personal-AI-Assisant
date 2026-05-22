'use client'

import { useMemo } from 'react'
import { isSameDay, isToday, isPast, startOfWeek } from './calendarUtils'
import type { CalendarEvent } from './types'

interface MultiWeekViewProps {
  date: Date
  events: CalendarEvent[]
  onDayClick: (date: Date) => void
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MAX_VISIBLE_EVENTS = 3

/**
 * MultiWeekView — compact 2-week (14-day) grid.
 * Two rows of 7 days each, starting from Monday of the current week.
 * Each cell shows the date number and up to 3 event titles with "+N more" overflow.
 * Matches MonthView visual style.
 */
export default function MultiWeekView({
  date,
  events,
  onDayClick,
}: MultiWeekViewProps) {
  const cells = useMemo(() => {
    const weekStart = startOfWeek(date)
    const days: Date[] = []
    for (let i = 0; i < 14; i++) {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      days.push(d)
    }
    return days
  }, [date])

  const currentMonth = date.getMonth()

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Day name headers */}
      <div
        className="grid flex-shrink-0"
        style={{
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="py-2 text-center text-[10px] font-medium"
            style={{ color: 'var(--text-faint)' }}
          >
            {name}
          </div>
        ))}
      </div>

      {/* 2 rows x 7 columns */}
      <div
        className="grid flex-1 overflow-y-auto"
        style={{
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
        }}
      >
        {cells.map((cellDate, i) => {
          const today = isToday(cellDate)
          const past = isPast(cellDate)
          const isCurrentMonth = cellDate.getMonth() === currentMonth
          const cellEvents = events.filter(
            (ev) => ev.start && isSameDay(new Date(ev.start), cellDate) && !ev.isHabit
          )
          const overflow = cellEvents.length - MAX_VISIBLE_EVENTS
          const visibleEvents = cellEvents.slice(0, MAX_VISIBLE_EVENTS)

          return (
            <div
              key={i}
              className="flex flex-col gap-0.5 p-1 cursor-pointer transition-colors duration-100 overflow-hidden"
              style={{
                borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none',
                borderBottom: '1px solid var(--border)',
                opacity: past && !today ? 0.7 : isCurrentMonth ? 1 : 0.4,
                minHeight: 80,
              }}
              onClick={() => onDayClick(cellDate)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {/* Date number */}
              <div className="flex items-center gap-1">
                <span
                  className="flex items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    width: 24,
                    height: 24,
                    color: today ? '#FFFFFF' : 'var(--text-primary)',
                    backgroundColor: today ? 'var(--accent)' : 'transparent',
                    outline: today ? '2px solid var(--accent)' : 'none',
                    outlineOffset: 1,
                  }}
                >
                  {cellDate.getDate()}
                </span>

                {/* Show month abbreviation on the 1st of each month for context */}
                {cellDate.getDate() === 1 && (
                  <span
                    className="text-[9px] font-medium"
                    style={{ color: 'var(--text-faint)' }}
                  >
                    {cellDate.toLocaleString('en-US', { month: 'short' })}
                  </span>
                )}
              </div>

              {/* Event titles */}
              <div className="flex flex-col gap-px">
                {visibleEvents.map((ev) => (
                  <button
                    key={ev.id}
                    className="text-left truncate rounded px-1 py-px text-[10px] font-medium cursor-pointer"
                    style={{
                      backgroundColor: ev.color,
                      color: '#FFFFFF',
                      opacity: ev.isExternal ? 0.7 : 1,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      window.dispatchEvent(
                        new CustomEvent('laif:open-task-detail', {
                          detail: { taskId: ev.id },
                        })
                      )
                    }}
                  >
                    {ev.title}
                  </button>
                ))}

                {/* Overflow indicator */}
                {overflow > 0 && (
                  <span
                    className="text-[10px] font-medium px-1"
                    style={{ color: 'var(--text-faint)' }}
                  >
                    +{overflow} more
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
