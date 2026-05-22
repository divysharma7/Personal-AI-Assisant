'use client'

import { useMemo, useState, useCallback } from 'react'
import {
  isSameDay,
  isToday,
  timeToGridRow,
  gridRowSpan,
  getHourLabels,
} from './calendarUtils'
import CalendarBlock from './CalendarBlock'
import DraggableBlock from './DraggableBlock'
import DroppableSlot from './DroppableSlot'
import CapacityBar from './CapacityBar'
import type { CalendarEvent } from './types'
import { MOCK_CAPACITY } from './mockData'

interface ThreeDayViewProps {
  date: Date
  events: CalendarEvent[]
}

const HOUR_LABELS = getHourLabels()
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Check if a calendar event is an all-day event.
 * All-day events have the isAllDay flag, span midnight-to-midnight,
 * or span 24+ hours.
 */
function isAllDayEvent(ev: CalendarEvent): boolean {
  if (ev.isAllDay) return true
  const start = new Date(ev.start)
  const end = new Date(ev.end)
  if (start.getHours() === 0 && start.getMinutes() === 0) {
    if (end.getHours() === 0 && end.getMinutes() === 0) return true
    if (end.getHours() === 23 && end.getMinutes() === 59) return true
  }
  return end.getTime() - start.getTime() >= 24 * 60 * 60 * 1000
}

// Show 7 AM (row 29) through 9 PM (row 84) by default — same as WeekView
const FIRST_VISIBLE_ROW = 29
const LAST_VISIBLE_ROW = 84
const VISIBLE_ROW_COUNT = LAST_VISIBLE_ROW - FIRST_VISIBLE_ROW + 1

export default function ThreeDayView({ date, events }: ThreeDayViewProps) {
  const [newTaskSlot, setNewTaskSlot] = useState<{ col: number; row: number } | null>(null)

  // Center on the given date: yesterday, today, tomorrow
  const threeDays = useMemo(() => {
    const days: Date[] = []
    for (let offset = -1; offset <= 1; offset++) {
      const d = new Date(date)
      d.setDate(date.getDate() + offset)
      d.setHours(0, 0, 0, 0)
      days.push(d)
    }
    return days
  }, [date])

  const eventsByDay = useMemo(() =>
    threeDays.map((day) =>
      events.filter(
        (ev) => ev.start && isSameDay(new Date(ev.start), day) && !ev.isHabit && !isAllDayEvent(ev)
      )
    ),
    [threeDays, events]
  )

  const allDayByDay = useMemo(() =>
    threeDays.map((day) =>
      events.filter(
        (ev) => ev.start && isSameDay(new Date(ev.start), day) && !ev.isHabit && isAllDayEvent(ev)
      )
    ),
    [threeDays, events]
  )

  const hasAnyAllDay = allDayByDay.some((dayEvents) => dayEvents.length > 0)

  // Build slot occupancy per day for overlap detection
  const slotOccupancyByDay = useMemo(() => {
    return threeDays.map((_, dayIdx) => {
      const map = new Map<number, string[]>()
      for (const ev of eventsByDay[dayIdx]) {
        const start = new Date(ev.start)
        const end = new Date(ev.end)
        const startSlot = start.getHours() * 4 + Math.floor(start.getMinutes() / 15)
        const endSlot = end.getHours() * 4 + Math.floor(end.getMinutes() / 15)
        for (let s = startSlot; s < endSlot; s++) {
          if (!map.has(s)) map.set(s, [])
          map.get(s)!.push(ev.id)
        }
      }
      return map
    })
  }, [threeDays, eventsByDay])

  const handleSlotClick = useCallback((colIndex: number, actualRow: number) => {
    setNewTaskSlot({ col: colIndex, row: actualRow })
  }, [])

  const handleNewTaskKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setNewTaskSlot(null)
        return
      }
      if (e.key === 'Enter') {
        const title = (e.target as HTMLInputElement).value.trim()
        if (title && newTaskSlot !== null) {
          const slotIndex = newTaskSlot.row - 1
          const dayISO = threeDays[newTaskSlot.col].toISOString().split('T')[0]
          window.dispatchEvent(
            new CustomEvent('laif:create-calendar-task', {
              detail: { title, slotIndex, dayISO },
            })
          )
        }
        setNewTaskSlot(null)
      }
    },
    [newTaskSlot, threeDays]
  )

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Day header row */}
      <div
        className="grid flex-shrink-0"
        style={{
          gridTemplateColumns: '60px repeat(3, 1fr)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ borderRight: '1px solid var(--border)' }} />
        {threeDays.map((day, i) => {
          const today = isToday(day)
          return (
            <div
              key={i}
              className="flex flex-col items-center py-2 gap-1"
              style={{
                borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                backgroundColor: today ? 'var(--accent-soft)' : 'transparent',
              }}
            >
              <span
                className="text-[10px] font-medium"
                style={{ color: today ? 'var(--accent)' : 'var(--text-faint)' }}
              >
                {DAY_NAMES[day.getDay()]}
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

      {/* All-day event band */}
      {hasAnyAllDay && (
        <div
          className="grid flex-shrink-0"
          style={{
            gridTemplateColumns: '60px repeat(3, 1fr)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            className="flex items-center justify-end pr-2"
            style={{
              borderRight: '1px solid var(--border)',
              padding: '4px 0',
            }}
          >
            <span
              className="text-[9px] font-medium"
              style={{ color: 'var(--text-faint)' }}
            >
              All Day
            </span>
          </div>
          {threeDays.map((day, i) => {
            const today = isToday(day)
            const dayAllDay = allDayByDay[i]
            return (
              <div
                key={`allday-${i}`}
                className="flex flex-wrap items-center gap-1 px-1 py-1.5"
                style={{
                  borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                  backgroundColor: today ? 'var(--accent-soft)' : 'transparent',
                  minHeight: 28,
                }}
              >
                {dayAllDay.map((ev) => (
                  <button
                    key={ev.id}
                    className="flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium whitespace-nowrap cursor-pointer truncate"
                    style={{
                      backgroundColor: ev.color + '22',
                      color: ev.color,
                      border: `1px solid ${ev.color}33`,
                      maxWidth: '100%',
                    }}
                    title={ev.title}
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent('laif:detail-task', {
                          detail: { taskId: ev.id },
                        })
                      )
                    }}
                  >
                    {ev.title}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* Time grid body */}
      <div className="flex-1 overflow-y-auto">
        {eventsByDay.every((dayEvents) => dayEvents.length === 0) && (
          <div
            className="flex items-center justify-center py-12"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="text-sm">No scheduled tasks for these 3 days</span>
          </div>
        )}
        <div
          className="cal-grid"
          style={{
            gridTemplateColumns: '60px repeat(3, 1fr)',
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
                {isHourStart && <span style={{ fontSize: 9 }}>{HOUR_LABELS[hour]}</span>}
              </div>
            )
          })}

          {/* Day columns: droppable time slots */}
          {threeDays.map((day, colIndex) => {
            const today = isToday(day)
            const dayISO = day.toISOString().split('T')[0]
            const occupancy = slotOccupancyByDay[colIndex]

            return Array.from({ length: VISIBLE_ROW_COUNT }, (_, i) => {
              const actualRow = FIRST_VISIBLE_ROW + i
              const slotIndex = actualRow - 1
              const isHourStart = (actualRow - 1) % 4 === 0
              const gridRowIndex = i + 1
              const slotId = `slot-${dayISO}-${slotIndex}`
              const occupied = occupancy.get(slotIndex) || []

              return (
                <div
                  key={`grid-${colIndex}-${actualRow}`}
                  style={{
                    gridColumn: `${colIndex + 2} / ${colIndex + 3}`,
                    gridRow: `${gridRowIndex} / ${gridRowIndex + 1}`,
                    borderTop: isHourStart ? '1px solid var(--border)' : 'none',
                    borderRight: colIndex < 2 ? '1px solid var(--border)' : 'none',
                    backgroundColor: today ? 'var(--accent-soft)' : 'transparent',
                  }}
                >
                  <DroppableSlot
                    id={slotId}
                    slotIndex={slotIndex}
                    day={dayISO}
                    occupiedBy={occupied}
                  >
                    <div
                      style={{ minHeight: 12 }}
                      className="h-full w-full"
                      onClick={() => handleSlotClick(colIndex, actualRow)}
                    />
                  </DroppableSlot>
                </div>
              )
            })
          })}

          {/* Event blocks — wrapped in DraggableBlock */}
          {threeDays.map((day, colIndex) =>
            eventsByDay[colIndex].map((ev) => {
              const start = new Date(ev.start)
              const end = new Date(ev.end)
              const startRow = timeToGridRow(start)
              const span = gridRowSpan(start, end)
              const visibleStart = startRow - FIRST_VISIBLE_ROW + 1
              const visibleEnd = visibleStart + span

              if (visibleStart > VISIBLE_ROW_COUNT || visibleEnd < 1) return null

              const isReadOnly = !!(ev.isExternal || ev.isFocusSession || ev.isReadOnly)

              return (
                <div
                  key={ev.id}
                  style={{
                    gridColumn: `${colIndex + 2} / ${colIndex + 3}`,
                    gridRow: `${Math.max(1, visibleStart)} / ${Math.min(VISIBLE_ROW_COUNT + 1, visibleEnd)}`,
                    padding: '0 2px',
                    zIndex: 5,
                    pointerEvents: 'auto',
                  }}
                >
                  <DraggableBlock
                    id={ev.id}
                    scheduledStart={ev.start}
                    scheduledEnd={ev.end}
                    isReadOnly={isReadOnly}
                  >
                    <CalendarBlock
                      event={ev}
                      isReadOnly={isReadOnly}
                      style={{ height: '100%' }}
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent('laif:detail-task', {
                            detail: { taskId: ev.id },
                          })
                        )
                      }}
                    />
                  </DraggableBlock>
                </div>
              )
            })
          )}

          {/* Inline new task input */}
          {newTaskSlot !== null && (() => {
            const visibleSlot = newTaskSlot.row - FIRST_VISIBLE_ROW + 1
            if (visibleSlot < 1 || visibleSlot > VISIBLE_ROW_COUNT) return null
            return (
              <div
                style={{
                  gridColumn: `${newTaskSlot.col + 2} / ${newTaskSlot.col + 3}`,
                  gridRow: `${visibleSlot} / ${visibleSlot + 4}`,
                  padding: '0 2px',
                  zIndex: 15,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: 8,
                    backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                    border: '2px solid var(--accent)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '6px 10px',
                  }}
                >
                  <input
                    autoFocus
                    placeholder="Type task name, press Enter..."
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                    onBlur={() => setNewTaskSlot(null)}
                    onKeyDown={handleNewTaskKeyDown}
                  />
                </div>
              </div>
            )
          })()}

          {/* Current time indicator */}
          {threeDays.map((day, colIndex) => {
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
                    className="cal-dot-pulse"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent)',
                      marginLeft: -3,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, height: 2, backgroundColor: 'var(--accent)' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
