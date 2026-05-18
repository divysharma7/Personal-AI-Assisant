'use client'

import {
  startOfWeek,
  isSameDay,
  isToday,
  timeToGridRow,
  gridRowSpan,
  getHourLabels,
} from './calendarUtils'
import CalendarBlock from './CalendarBlock'
import CapacityBar from './CapacityBar'
import type { CalendarEvent } from './types'
import { MOCK_CAPACITY } from './mockData'

interface WeekViewProps {
  date: Date
  events: CalendarEvent[]
}

const HOUR_LABELS = getHourLabels()
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Visible range: 7 AM - 9 PM (rows 29-84) */
const FIRST_VISIBLE_ROW = 29
const LAST_VISIBLE_ROW = 84
const VISIBLE_ROW_COUNT = LAST_VISIBLE_ROW - FIRST_VISIBLE_ROW + 1

/**
 * WeekView — 7-column layout with compressed time grids.
 * Header row with day names + date numbers, today highlighted.
 * Per-column mini capacity bar at top.
 */
export default function WeekView({ date, events }: WeekViewProps) {
  const weekStart = startOfWeek(date)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  // Group events by day
  const eventsByDay = weekDays.map((day) =>
    events.filter(
      (ev) =>
        ev.start && isSameDay(new Date(ev.start), day) && !ev.isHabit
    )
  )

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Week header row */}
      <div
        className="grid flex-shrink-0"
        style={{
          gridTemplateColumns: '60px repeat(7, 1fr)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Empty corner cell */}
        <div style={{ borderRight: '1px solid var(--border)' }} />

        {/* Day headers */}
        {weekDays.map((day, i) => {
          const today = isToday(day)
          return (
            <div
              key={i}
              className="flex flex-col items-center py-2 gap-1"
              style={{
                borderRight: i < 6 ? '1px solid var(--border)' : 'none',
                backgroundColor: today ? 'var(--accent-soft)' : 'transparent',
              }}
            >
              <span
                className="text-[10px] font-medium"
                style={{
                  color: today ? 'var(--accent)' : 'var(--text-faint)',
                }}
              >
                {DAY_NAMES[i]}
              </span>
              <span
                className="flex items-center justify-center rounded-full text-sm font-semibold"
                style={{
                  width: 28,
                  height: 28,
                  color: today ? '#FFFFFF' : 'var(--text-primary)',
                  backgroundColor: today ? 'var(--accent)' : 'transparent',
                }}
              >
                {day.getDate()}
              </span>
              {/* Mini capacity bar */}
              <div className="w-full px-1">
                <CapacityBar
                  scheduledHours={
                    eventsByDay[i].reduce((acc, ev) => {
                      const s = new Date(ev.start)
                      const e = new Date(ev.end)
                      return acc + (e.getTime() - s.getTime()) / (1000 * 60 * 60)
                    }, 0)
                  }
                  capacityHours={MOCK_CAPACITY.capacityHours}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Time grid body */}
      <div className="flex-1 overflow-y-auto">
        <div
          className="cal-grid"
          style={{
            gridTemplateColumns: '60px repeat(7, 1fr)',
            gridTemplateRows: `repeat(${VISIBLE_ROW_COUNT}, minmax(12px, 1fr))`,
            minHeight: VISIBLE_ROW_COUNT * 12,
          }}
        >
          {/* Hour labels column */}
          {Array.from({ length: VISIBLE_ROW_COUNT }, (_, i) => {
            const actualRow = FIRST_VISIBLE_ROW + i
            const hour = Math.floor((actualRow - 1) / 4)
            const isHourStart = (actualRow - 1) % 4 === 0
            const gridRowIndex = i + 1

            return (
              <div
                key={`hlabel-${actualRow}`}
                className="cal-hour-label flex items-start justify-end pr-2"
                style={{
                  gridColumn: '1 / 2',
                  gridRow: `${gridRowIndex} / ${gridRowIndex + 1}`,
                  borderTop: isHourStart ? '1px solid var(--border)' : 'none',
                  borderRight: '1px solid var(--border)',
                  paddingTop: isHourStart ? 1 : 0,
                }}
              >
                {isHourStart && (
                  <span style={{ fontSize: 9 }}>{HOUR_LABELS[hour]}</span>
                )}
              </div>
            )
          })}

          {/* Day columns: grid lines */}
          {weekDays.map((day, colIndex) => {
            const today = isToday(day)
            return Array.from({ length: VISIBLE_ROW_COUNT }, (_, i) => {
              const actualRow = FIRST_VISIBLE_ROW + i
              const isHourStart = (actualRow - 1) % 4 === 0
              const gridRowIndex = i + 1

              return (
                <div
                  key={`grid-${colIndex}-${actualRow}`}
                  style={{
                    gridColumn: `${colIndex + 2} / ${colIndex + 3}`,
                    gridRow: `${gridRowIndex} / ${gridRowIndex + 1}`,
                    borderTop: isHourStart ? '1px solid var(--border)' : 'none',
                    borderRight:
                      colIndex < 6 ? '1px solid var(--border)' : 'none',
                    backgroundColor: today
                      ? 'var(--accent-soft)'
                      : 'transparent',
                    minHeight: 12,
                  }}
                />
              )
            })
          })}

          {/* Event blocks */}
          {weekDays.map((day, colIndex) =>
            eventsByDay[colIndex].map((ev) => {
              const start = new Date(ev.start)
              const end = new Date(ev.end)
              const startRow = timeToGridRow(start)
              const span = gridRowSpan(start, end)

              const visibleStart = startRow - FIRST_VISIBLE_ROW + 1
              const visibleEnd = visibleStart + span

              if (visibleStart > VISIBLE_ROW_COUNT || visibleEnd < 1) return null

              return (
                <div
                  key={ev.id}
                  style={{
                    gridColumn: `${colIndex + 2} / ${colIndex + 3}`,
                    gridRow: `${Math.max(1, visibleStart)} / ${Math.min(VISIBLE_ROW_COUNT + 1, visibleEnd)}`,
                    padding: '0 2px',
                    zIndex: 5,
                  }}
                >
                  <CalendarBlock
                    event={ev}
                    compact
                    style={{ height: '100%' }}
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent('laif:open-task-detail', {
                          detail: { taskId: ev.id },
                        })
                      )
                    }}
                  />
                </div>
              )
            })
          )}

          {/* Current time indicator for today's column */}
          {weekDays.map((day, colIndex) => {
            if (!isToday(day)) return null
            const now = new Date()
            const totalMinutes = now.getHours() * 60 + now.getMinutes()
            const currentRow = totalMinutes / 15 + 1
            const visiblePosition = currentRow - FIRST_VISIBLE_ROW
            const percent = (visiblePosition / VISIBLE_ROW_COUNT) * 100

            if (percent < 0 || percent > 100) return null

            return (
              <div
                key={`time-${colIndex}`}
                style={{
                  gridColumn: `${colIndex + 2} / ${colIndex + 3}`,
                  gridRow: '1 / -1',
                  position: 'relative',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: `${percent}%`,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent)',
                      marginLeft: -3,
                      flexShrink: 0,
                      animation: 'cal-dot-pulse 4s ease-in-out infinite',
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      backgroundColor: 'var(--accent)',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
