'use client'

import { useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buttonPress } from '@/lib/motion'
import { isSameDay, isToday } from '../calendarUtils'
import type { CalendarEvent } from '../types'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function getMiniMonthGrid(year: number, month: number): (Date | null)[] {
  const firstOfMonth = new Date(year, month, 1)
  const startDow = firstOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (Date | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length < 42) cells.push(null)
  return cells
}

function isSameWeek(a: Date, b: Date): boolean {
  const startA = new Date(a)
  startA.setDate(startA.getDate() - startA.getDay())
  startA.setHours(0, 0, 0, 0)
  const startB = new Date(b)
  startB.setDate(startB.getDate() - startB.getDay())
  startB.setHours(0, 0, 0, 0)
  return startA.getTime() === startB.getTime()
}

interface MiniMonthCalendarProps {
  currentDate: Date
  events: CalendarEvent[]
  onDateSelect: (date: Date) => void
  displayMonth: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  onGoToday: () => void
  selectedView?: string
}

export default function MiniMonthCalendar({
  currentDate,
  events,
  onDateSelect,
  displayMonth,
  onPrevMonth,
  onNextMonth,
  onGoToday,
  selectedView,
}: MiniMonthCalendarProps) {
  const cells = useMemo(
    () => getMiniMonthGrid(displayMonth.getFullYear(), displayMonth.getMonth()),
    [displayMonth]
  )

  const nextDisplayMonth = useMemo(() => new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1), [displayMonth])
  const cellsNext = useMemo(
    () => getMiniMonthGrid(nextDisplayMonth.getFullYear(), nextDisplayMonth.getMonth()),
    [nextDisplayMonth]
  )

  // Event dot lookup
  const eventDates = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const ev of events) {
      const d = new Date(ev.start)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!map.has(key)) map.set(key, new Set())
      map.get(key)!.add(ev.color)
    }
    return map
  }, [events])

  const monthLabel = displayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const nextMonthLabel = nextDisplayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const getWeekRows = useCallback((gridCells: (Date | null)[]) => {
    const rows: (Date | null)[][] = []
    for (let i = 0; i < gridCells.length; i += 7) {
      rows.push(gridCells.slice(i, i + 7))
    }
    return rows
  }, [])

  const renderMiniMonth = (gridCells: (Date | null)[], label: string, showNav: boolean) => {
    const weekRows = getWeekRows(gridCells)
    const nonEmptyRows = weekRows.filter((row) => row.some((c) => c !== null))
    const isWeekView = selectedView === 'week' || selectedView === '3day'

    return (
      <div>
        {/* Month header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {label}
          </span>
          {showNav && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <motion.button
                {...buttonPress}
                onClick={onPrevMonth}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, borderRadius: 6, cursor: 'pointer',
                  backgroundColor: 'transparent', border: 'none',
                  color: 'var(--text-muted)',
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <ChevronLeft size={14} strokeWidth={1.5} />
              </motion.button>
              <motion.button
                {...buttonPress}
                onClick={onGoToday}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, borderRadius: 999, cursor: 'pointer',
                  backgroundColor: 'var(--overlay-1, transparent)', border: 'none',
                  color: 'var(--accent)',
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2, var(--bg-hover))' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, transparent)' }}
              >
                <span style={{ fontSize: 10, fontWeight: 700 }}>&bull;</span>
              </motion.button>
              <motion.button
                {...buttonPress}
                onClick={onNextMonth}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, borderRadius: 6, cursor: 'pointer',
                  backgroundColor: 'transparent', border: 'none',
                  color: 'var(--text-muted)',
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <ChevronRight size={14} strokeWidth={1.5} />
              </motion.button>
            </div>
          )}
        </div>

        {/* Weekday header with week number column */}
        <div style={{ display: 'grid', gridTemplateColumns: '20px repeat(7, 1fr)', marginBottom: 2 }}>
          <span style={{ fontSize: 9, color: 'var(--text-faint)', textAlign: 'center', lineHeight: '18px' }}>W</span>
          {WEEKDAYS.map((day, i) => (
            <span
              key={i}
              style={{
                textAlign: 'center',
                fontSize: 10,
                fontWeight: 500,
                color: 'var(--text-faint)',
                padding: '2px 0',
              }}
            >
              {day}
            </span>
          ))}
        </div>

        {/* Day grid with week numbers */}
        {nonEmptyRows.map((row, rowIndex) => {
          const firstDate = row.find((c) => c !== null)
          const weekNum = firstDate ? getWeekNumber(firstDate) : null
          const isCurrentWeekRow = firstDate ? isSameWeek(firstDate, currentDate) : false

          return (
            <div
              key={rowIndex}
              style={{
                display: 'grid',
                gridTemplateColumns: '20px repeat(7, 1fr)',
                borderRadius: 6,
                backgroundColor: isCurrentWeekRow && isWeekView
                  ? 'var(--overlay-1, rgba(108,108,158,0.06))'
                  : 'transparent',
                transition: 'background-color 150ms ease',
              }}
            >
              {/* Week number */}
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  color: 'var(--text-faint)',
                  opacity: 0.6,
                  userSelect: 'none',
                }}
              >
                {weekNum}
              </span>

              {/* Day cells */}
              {row.map((cell, colIndex) => {
                if (!cell) {
                  return <div key={`empty-${rowIndex}-${colIndex}`} style={{ height: 28 }} />
                }

                const isSelected = isSameDay(cell, currentDate)
                const isTodayDate = isToday(cell)
                const key = `${cell.getFullYear()}-${cell.getMonth()}-${cell.getDate()}`
                const dotColors = eventDates.get(key)

                const inSelectedWeek = isWeekView && isSameWeek(cell, currentDate) && !isSelected && !isTodayDate

                return (
                  <button
                    key={key}
                    onClick={() => onDateSelect(cell)}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      height: 28,
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 999,
                      fontSize: 11,
                      cursor: 'pointer',
                      border: 'none',
                      color: isSelected || isTodayDate ? '#fff' : inSelectedWeek ? 'var(--accent)' : 'var(--text-primary)',
                      backgroundColor: isSelected
                        ? 'var(--accent)'
                        : isTodayDate
                        ? 'var(--accent-soft, rgba(248,79,57,0.2))'
                        : inSelectedWeek
                        ? 'color-mix(in srgb, var(--accent) 8%, transparent)'
                        : 'transparent',
                      fontWeight: isTodayDate || inSelectedWeek ? 700 : 400,
                      transition: 'background-color 100ms ease, color 100ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !isTodayDate) e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected && !isTodayDate) {
                        e.currentTarget.style.backgroundColor = inSelectedWeek
                          ? 'color-mix(in srgb, var(--accent) 8%, transparent)'
                          : 'transparent'
                      }
                    }}
                  >
                    {cell.getDate()}
                    {/* Event dots */}
                    {dotColors && dotColors.size > 0 && (
                      <span style={{ position: 'absolute', bottom: 2, display: 'flex', gap: 1 }}>
                        {Array.from(dotColors).slice(0, 3).map((color, j) => (
                          <span
                            key={j}
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: 999,
                              backgroundColor: color,
                            }}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <>
      {renderMiniMonth(cells, monthLabel, true)}
      <div style={{ marginTop: 12 }}>
        {renderMiniMonth(cellsNext, nextMonthLabel, false)}
      </div>
    </>
  )
}
