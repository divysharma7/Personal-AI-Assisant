'use client'

import { getMonthGrid, isSameDay, isToday, isPast } from './calendarUtils'
import type { CalendarEvent } from './types'

interface MonthViewProps {
  date: Date
  events: CalendarEvent[]
  onDayClick: (date: Date) => void
  /** Whether habit dot overlay is enabled */
  showHabitDots?: boolean
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MAX_VISIBLE_EVENTS = 4

/**
 * MonthView — standard 6x7 grid.
 * Each cell: date number + up to 4 task titles + "+N more" overflow.
 * Today: colored ring around date number. Past days: dimmed.
 * Click cell: switches to Day view. Click task: dispatches detail panel event.
 */
export default function MonthView({
  date,
  events,
  onDayClick,
  showHabitDots = false,
}: MonthViewProps) {
  const cells = getMonthGrid(date)
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

      {/* 6 rows x 7 columns */}
      <div
        className="grid flex-1 overflow-y-auto"
        style={{
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: 'repeat(6, 1fr)',
        }}
      >
        {cells.map((cellDate, i) => {
          const today = isToday(cellDate)
          const past = isPast(cellDate)
          const isCurrentMonth = cellDate.getMonth() === currentMonth
          const cellEvents = events.filter(
            (ev) => ev.start && isSameDay(new Date(ev.start), cellDate) && !ev.isHabit
          )
          const habitEvents = events.filter(
            (ev) => ev.start && isSameDay(new Date(ev.start), cellDate) && ev.isHabit
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
                    outline: today ? `2px solid var(--accent)` : 'none',
                    outlineOffset: 1,
                  }}
                >
                  {cellDate.getDate()}
                </span>

                {/* Habit dots */}
                {showHabitDots && habitEvents.length > 0 && (
                  <div className="flex items-center gap-0.5">
                    {habitEvents.slice(0, 3).map((h) => (
                      <div
                        key={h.id}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: h.color }}
                      />
                    ))}
                  </div>
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
