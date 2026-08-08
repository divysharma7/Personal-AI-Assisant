import { useMemo } from 'react'
import { getMiniMonthGrid, isToday } from './calendarUtils'
import type { CalendarEvent } from './types'

interface YearViewProps {
  date: Date
  events: CalendarEvent[]
  onDayClick: (date: Date) => void
  onMonthClick?: (date: Date) => void
  onWeekClick?: (date: Date) => void
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const HEAT = ['transparent', 'rgba(76,88,175,.30)', 'rgba(79,91,184,.48)', 'rgba(82,94,193,.68)', '#555fc0']

function keyForDate(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function densityTier(count: number) {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count <= 4) return 3
  return 4
}

export default function YearView({ date, events, onDayClick, onMonthClick, onWeekClick }: YearViewProps) {
  const year = date.getFullYear()
  const counts = useMemo(() => {
    const next = new Map<string, number>()
    for (const event of events) {
      if (!event.start) continue
      const eventDate = new Date(event.start)
      const key = keyForDate(eventDate)
      next.set(key, (next.get(key) ?? 0) + 1)
    }
    return next
  }, [events])

  return (
    <div className="calendar-year-view flex flex-1 overflow-y-auto">
      <div className="calendar-year-grid">
        {MONTH_NAMES.map((monthName, monthIndex) => {
          const cells = getMiniMonthGrid(year, monthIndex)
          return (
            <section className="calendar-year-month" key={monthName}>
              <button className="calendar-year-month__title" onClick={() => onMonthClick?.(new Date(year, monthIndex, 1))}>
                {monthName}
              </button>
              <div className="calendar-year-month__weekdays">
                {DAY_LABELS.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}
              </div>
              <div className="calendar-year-month__days">
                {cells.map((cell, index) => {
                  if (!cell) return <span key={`blank-${index}`} />
                  const count = counts.get(keyForDate(cell)) ?? 0
                  const inMonth = cell.getMonth() === monthIndex
                  const today = isToday(cell)
                  return (
                    <button
                      key={cell.toISOString()}
                      data-outside={!inMonth}
                      data-today={today}
                      style={{ background: HEAT[densityTier(count)] }}
                      title={`${cell.toLocaleDateString()} · ${count} event${count === 1 ? '' : 's'}`}
                      onClick={() => (onWeekClick ?? onDayClick)(cell)}
                    >
                      {cell.getDate()}
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
