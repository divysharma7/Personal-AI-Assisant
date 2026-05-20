'use client'

import { useMemo } from 'react'
import { isSameDay, isToday } from './calendarUtils'
import type { CalendarEvent } from './types'

interface YearViewProps {
  date: Date
  events: CalendarEvent[]
  onDayClick: (date: Date) => void
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/**
 * Get a 6-row x 7-column grid (42 cells) for a month, starting on Sunday.
 */
function getMiniMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1)
  const startDayOfWeek = firstOfMonth.getDay() // 0 = Sunday
  const startDate = new Date(year, month, 1 - startDayOfWeek)

  const cells: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    cells.push(d)
  }
  return cells
}

/**
 * Heatmap background color based on event count.
 * Uses the accent color (#f84f39) decomposed into rgba.
 */
function getHeatmapColor(count: number): string {
  if (count === 0) return 'transparent'
  if (count === 1) return 'rgba(248, 79, 57, 0.12)'
  if (count === 2) return 'rgba(248, 79, 57, 0.25)'
  return 'rgba(248, 79, 57, 0.4)'
}

/**
 * YearView -- 12 mini-month grids in a 4x3 layout with event heatmap.
 * Today is highlighted with a blue accent circle.
 * Days outside each month are dimmed. Click a day to drill down.
 */
export default function YearView({ date, events, onDayClick }: YearViewProps) {
  const year = date.getFullYear()

  // Pre-compute event counts keyed by "YYYY-MM-DD" for fast lookup
  const eventCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const ev of events) {
      if (!ev.start) continue
      const d = new Date(ev.start)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      map[key] = (map[key] || 0) + 1
    }
    return map
  }, [events])

  function getEventCount(d: Date): number {
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    return eventCountMap[key] || 0
  }

  return (
    <div
      className="grid gap-6 p-4 overflow-y-auto flex-1"
      style={{
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(3, auto)',
      }}
    >
      {Array.from({ length: 12 }, (_, monthIdx) => {
        const cells = getMiniMonthGrid(year, monthIdx)

        return (
          <div key={monthIdx} className="flex flex-col gap-1">
            {/* Month name header */}
            <div
              className="text-[13px] font-semibold mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {MONTH_NAMES[monthIdx]}
            </div>

            {/* Day-of-week labels */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="text-center text-[10px] font-medium pb-0.5"
                  style={{ color: 'var(--text-faint)' }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* 6-row date grid */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {cells.map((cellDate, i) => {
                const isCurrentMonth = cellDate.getMonth() === monthIdx
                const today = isToday(cellDate)
                const count = getEventCount(cellDate)
                const heatmap = getHeatmapColor(count)

                return (
                  <button
                    key={i}
                    type="button"
                    className="flex items-center justify-center rounded-full cursor-pointer transition-colors duration-75"
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      fontSize: 11,
                      lineHeight: 1,
                      color: today
                        ? '#FFFFFF'
                        : isCurrentMonth
                          ? 'var(--text-primary)'
                          : 'var(--text-primary)',
                      opacity: isCurrentMonth ? 1 : 0.3,
                      backgroundColor: today ? 'var(--accent)' : heatmap,
                      border: 'none',
                      outline: 'none',
                      padding: 0,
                    }}
                    onClick={() => onDayClick(cellDate)}
                    onMouseEnter={(e) => {
                      if (!today) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!today) {
                        e.currentTarget.style.backgroundColor = heatmap
                      }
                    }}
                  >
                    {cellDate.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
