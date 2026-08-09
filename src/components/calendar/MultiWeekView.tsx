
import { useMemo } from 'react'
import { formatClockTime, isSameDay, isToday, startOfWeekWithPreference } from './calendarUtils'
import { hexToRgba } from '@/lib/colorUtils'
import type { CalendarEvent } from './types'
import { useCalendarDisplayPreferences } from './CalendarDisplayPreferences'

interface MultiWeekViewProps {
  date: Date
  events: CalendarEvent[]
  onDayClick: (date: Date) => void
}

const DAY_NAMES = Array.from({ length: 7 }, (_, day) => new Date(2024, 0, 7 + day).toLocaleDateString(undefined, { weekday: 'short' }))
const MAX_VISIBLE_EVENTS = 4

function eventTime(event: CalendarEvent, timeFormat: '12h' | '24h') {
  const start = new Date(event.start)
  return formatClockTime(start, timeFormat)
}

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
  const { timeFormat, weekStartsOn } = useCalendarDisplayPreferences()
  const cells = useMemo(() => {
    const weekStart = startOfWeekWithPreference(date, weekStartsOn)
    const days: Date[] = []
    for (let i = 0; i < 14; i++) {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      days.push(d)
    }
    return days
  }, [date, weekStartsOn])
  const dayNames = useMemo(() => Array.from({ length: 7 }, (_, index) => DAY_NAMES[(weekStartsOn + index) % 7]), [weekStartsOn])

  const currentMonth = date.getMonth()

  return (
    <div className="calendar-multiweek-view flex flex-col flex-1 overflow-hidden">
      {/* Day name headers */}
      <div
        className="grid flex-shrink-0"
        style={{
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {dayNames.map((name) => (
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
          const today = isToday(cellDate) || isSameDay(cellDate, date)
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
                opacity: isCurrentMonth ? 1 : 0.58,
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
                    outline: 'none',
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
                    {cellDate.toLocaleString(undefined, { month: 'short' })}
                  </span>
                )}
              </div>

              {/* Event titles */}
              <div className="flex flex-col gap-px">
                {visibleEvents.map((ev) => (
                  <button
                    key={ev.id}
                    className="flex items-center gap-1 truncate rounded px-1 py-px text-left text-[10px] font-medium cursor-pointer"
                    style={{
                      backgroundColor: hexToRgba(ev.color, 0.78),
                      color: '#FFFFFF',
                      opacity: ev.isExternal ? 0.7 : 1,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      window.dispatchEvent(
                        new CustomEvent('laif:detail-task', {
                          detail: { taskId: ev.id },
                        })
                      )
                    }}
                  >
                    <span style={{ width: 8, height: 8, flex: '0 0 8px', border: '1px solid rgba(255,255,255,.48)', borderRadius: 2 }} />
                    <span className="truncate">{ev.title}</span>
                    <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,.55)', fontSize: 8 }}>{eventTime(ev, timeFormat)}</span>
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
