'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  timeToGridRow,
  gridRowSpan,
  getHourLabels,
  isSameDay,
  isToday,
} from './calendarUtils'
import CalendarBlock from './CalendarBlock'
import DraggableBlock from './DraggableBlock'
import DroppableSlot from './DroppableSlot'
import CurrentTimeLine from './CurrentTimeLine'
import CalendarEmpty from './CalendarEmpty'
import CapacityBar from './CapacityBar'
import HiddenHoursDivider from './week/HiddenHoursDivider'
import type { CalendarEvent } from './types'
import { MOCK_CAPACITY } from './mockData'
import { useCalendarStore } from '@/stores/calendarStore'

interface DayViewProps {
  date: Date
  events: CalendarEvent[]
}

const HOUR_LABELS = getHourLabels()
/** Total grid columns in day view: 1 time-label + 1 content column */
const DAY_GRID_COLUMNS = 2

/**
 * Check if a calendar event is an all-day event.
 * All-day events either have no time component (midnight to midnight)
 * or span 24+ hours.
 */
function isAllDay(ev: CalendarEvent): boolean {
  if (ev.isAllDay) return true
  const start = new Date(ev.start)
  const end = new Date(ev.end)
  // Midnight-to-midnight on same or next day
  if (start.getHours() === 0 && start.getMinutes() === 0) {
    if (end.getHours() === 0 && end.getMinutes() === 0) return true
    if (end.getHours() === 23 && end.getMinutes() === 59) return true
  }
  // Spans 24+ hours
  return end.getTime() - start.getTime() >= 24 * 60 * 60 * 1000
}

export default function DayView({ date, events }: DayViewProps) {
  const hiddenHoursStart = useCalendarStore((s) => s.hiddenHoursStart)
  const hiddenHoursEnd = useCalendarStore((s) => s.hiddenHoursEnd)
  const setHiddenHoursStart = useCalendarStore((s) => s.setHiddenHoursStart)
  const setHiddenHoursEnd = useCalendarStore((s) => s.setHiddenHoursEnd)

  const [showEarlyHours, setShowEarlyHours] = useState(false)
  const [showLateHours, setShowLateHours] = useState(false)
  const [newTaskSlot, setNewTaskSlot] = useState<number | null>(null)

  const dayEvents = useMemo(
    () => events.filter((ev) => ev.start && isSameDay(new Date(ev.start), date) && !ev.isHabit && !isAllDay(ev)),
    [events, date]
  )

  const allDayEvents = useMemo(
    () => events.filter((ev) => ev.start && isSameDay(new Date(ev.start), date) && !ev.isHabit && isAllDay(ev)),
    [events, date]
  )

  const habitEvents = useMemo(
    () => events.filter((ev) => ev.start && isSameDay(new Date(ev.start), date) && ev.isHabit),
    [events, date]
  )

  const showToday = isToday(date)
  const dayISO = date.toISOString().split('T')[0]

  const effectiveStart = showEarlyHours ? 0 : hiddenHoursStart
  const effectiveEnd = showLateHours ? 24 : hiddenHoursEnd
  const firstVisibleRow = effectiveStart * 4 + 1
  const lastVisibleRow = effectiveEnd * 4
  const visibleRowCount = lastVisibleRow - firstVisibleRow + 1

  const hasHiddenTop = hiddenHoursStart > 0
  const hasHiddenBottom = hiddenHoursEnd < 24
  const topDividerRows = hasHiddenTop ? 1 : 0
  const bottomDividerRows = hasHiddenBottom ? 1 : 0
  const totalGridRows = topDividerRows + visibleRowCount + bottomDividerRows

  // Build a map of which slots are occupied by which events
  const slotOccupancy = useMemo(() => {
    const map = new Map<number, string[]>()
    for (const ev of dayEvents) {
      const start = new Date(ev.start)
      const end = new Date(ev.end)
      const startSlot = (start.getHours() * 4 + Math.floor(start.getMinutes() / 15))
      const endSlot = (end.getHours() * 4 + Math.floor(end.getMinutes() / 15))
      for (let s = startSlot; s < endSlot; s++) {
        if (!map.has(s)) map.set(s, [])
        map.get(s)!.push(ev.id)
      }
    }
    return map
  }, [dayEvents])

  const handleSlotClick = useCallback((row: number) => {
    setNewTaskSlot(row)
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
          const slotIndex = newTaskSlot - 1 // convert from 1-indexed grid row to 0-indexed slot
          window.dispatchEvent(
            new CustomEvent('laif:create-calendar-task', {
              detail: { title, slotIndex, dayISO },
            })
          )
        }
        setNewTaskSlot(null)
      }
    },
    [newTaskSlot, dayISO]
  )

  const handleDragTop = useCallback(
    (newHour: number) => {
      setHiddenHoursStart(newHour)
      if (newHour === 0) setShowEarlyHours(false)
    },
    [setHiddenHoursStart],
  )

  const handleDragBottom = useCallback(
    (newHour: number) => {
      setHiddenHoursEnd(newHour)
      if (newHour === 24) setShowLateHours(false)
    },
    [setHiddenHoursEnd],
  )

  /** Map an absolute grid row to the local grid row (accounting for top divider). */
  const toLocalRow = (absoluteRow: number): number => {
    return absoluteRow - firstVisibleRow + 1 + topDividerRows
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Habit chips row */}
      {habitEvents.length > 0 && (
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          {habitEvents.map((ev) => (
            <CalendarBlock key={ev.id} event={ev} />
          ))}
        </div>
      )}

      {/* All-day event lane */}
      {allDayEvents.length > 0 && (
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span
            className="text-[10px] font-medium shrink-0"
            style={{ color: 'var(--text-faint)', width: 44, textAlign: 'right' }}
          >
            All Day
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto flex-1">
            {allDayEvents.map((ev) => (
              <button
                key={ev.id}
                className="flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium whitespace-nowrap cursor-pointer"
                style={{
                  backgroundColor: ev.color + '22',
                  color: ev.color,
                  border: `1px solid ${ev.color}33`,
                }}
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
        </div>
      )}

      {/* Capacity bar */}
      <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <CapacityBar
          scheduledHours={MOCK_CAPACITY.scheduledHours}
          capacityHours={MOCK_CAPACITY.capacityHours}
        />
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        {dayEvents.length === 0 && !newTaskSlot ? (
          <CalendarEmpty />
        ) : (
          <div
            className="cal-grid relative"
            style={{
              gridTemplateColumns: '60px 1fr',
              gridTemplateRows: hasHiddenTop || hasHiddenBottom
                ? `${hasHiddenTop ? '24px ' : ''}repeat(${visibleRowCount}, minmax(16px, 1fr))${hasHiddenBottom ? ' 24px' : ''}`
                : `repeat(${visibleRowCount}, minmax(16px, 1fr))`,
              minHeight: visibleRowCount * 16 + topDividerRows * 24 + bottomDividerRows * 24,
            }}
          >
            {/* Top hidden hours divider */}
            {hasHiddenTop && (
              <HiddenHoursDivider
                position="top"
                hour={hiddenHoursStart}
                onDrag={handleDragTop}
                onToggleExpand={() => setShowEarlyHours((p) => !p)}
                isExpanded={showEarlyHours}
                gridColumns={DAY_GRID_COLUMNS}
              />
            )}

            {/* Hour labels */}
            {Array.from({ length: visibleRowCount }, (_, i) => {
              const actualRow = firstVisibleRow + i
              const hour = Math.floor((actualRow - 1) / 4)
              const isHourStart = (actualRow - 1) % 4 === 0
              const gridRowIndex = i + 1 + topDividerRows

              return (
                <div
                  key={`label-${actualRow}`}
                  className="cal-hour-label flex items-start justify-end pr-2"
                  style={{
                    gridColumn: '1 / 2',
                    gridRow: `${gridRowIndex} / ${gridRowIndex + 1}`,
                    borderTop: isHourStart ? '1px solid var(--border)' : 'none',
                    paddingTop: isHourStart ? 2 : 0,
                  }}
                >
                  {isHourStart && <span>{HOUR_LABELS[hour]}</span>}
                </div>
              )
            })}

            {/* Droppable time slots */}
            {Array.from({ length: visibleRowCount }, (_, i) => {
              const actualRow = firstVisibleRow + i
              const slotIndex = actualRow - 1 // 0-indexed
              const gridRowIndex = i + 1 + topDividerRows
              const isHourStart = (actualRow - 1) % 4 === 0
              const slotId = `slot-${dayISO}-${slotIndex}`
              const occupied = slotOccupancy.get(slotIndex) || []

              return (
                <div
                  key={`slot-${actualRow}`}
                  style={{
                    gridColumn: '2 / 3',
                    gridRow: `${gridRowIndex} / ${gridRowIndex + 1}`,
                    borderTop: isHourStart ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <DroppableSlot
                    id={slotId}
                    slotIndex={slotIndex}
                    day={dayISO}
                    occupiedBy={occupied}
                  >
                    <div
                      className="h-full w-full"
                      style={{ minHeight: 16 }}
                      onClick={() => handleSlotClick(actualRow)}
                    />
                  </DroppableSlot>
                </div>
              )
            })}

            {/* Bottom hidden hours divider */}
            {hasHiddenBottom && (
              <HiddenHoursDivider
                position="bottom"
                hour={hiddenHoursEnd}
                onDrag={handleDragBottom}
                onToggleExpand={() => setShowLateHours((p) => !p)}
                isExpanded={showLateHours}
                gridColumns={DAY_GRID_COLUMNS}
              />
            )}

            {/* Event blocks -- wrapped in DraggableBlock */}
            {dayEvents.map((ev) => {
              const start = new Date(ev.start)
              const end = new Date(ev.end)
              const startRow = timeToGridRow(start)
              const span = gridRowSpan(start, end)
              const visibleStart = toLocalRow(startRow)
              const visibleEnd = visibleStart + span

              if (visibleStart > totalGridRows || visibleEnd < 1 + topDividerRows) return null

              const isReadOnly = !!(ev.isExternal || ev.isFocusSession || ev.isReadOnly)

              return (
                <div
                  key={ev.id}
                  style={{
                    gridColumn: '2 / 3',
                    gridRow: `${Math.max(1 + topDividerRows, visibleStart)} / ${Math.min(totalGridRows - bottomDividerRows + 1, visibleEnd)}`,
                    padding: '0 4px',
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
                      style={{ height: '100%' }}
                      isReadOnly={isReadOnly}
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
            })}

            {/* Inline new task input */}
            {newTaskSlot !== null && (() => {
              const visibleSlot = toLocalRow(newTaskSlot)
              if (visibleSlot < 1 + topDividerRows || visibleSlot > totalGridRows - bottomDividerRows) return null
              return (
                <div
                  style={{
                    gridColumn: '2 / 3',
                    gridRow: `${visibleSlot} / ${visibleSlot + 4}`,
                    padding: '0 4px',
                    zIndex: 15,
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 8,
                      backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                      border: '2px solid var(--accent)',
                      display: 'flex', alignItems: 'flex-start',
                      padding: '6px 10px',
                    }}
                  >
                    <input
                      autoFocus
                      placeholder="Type task name, press Enter..."
                      style={{
                        width: '100%',
                        background: 'transparent', border: 'none', outline: 'none',
                        fontSize: 13, fontWeight: 600,
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
            {showToday && (
              <div
                style={{
                  gridColumn: '2 / 3',
                  gridRow: '1 / -1',
                  position: 'relative',
                  pointerEvents: 'none',
                }}
              >
                <CurrentTimeLinePositioned firstVisibleRow={firstVisibleRow} rowCount={visibleRowCount} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CurrentTimeLinePositioned({
  firstVisibleRow,
  rowCount,
}: {
  firstVisibleRow: number
  rowCount: number
}) {
  const now = new Date()
  const totalMinutes = now.getHours() * 60 + now.getMinutes()
  const currentRow = totalMinutes / 15 + 1
  const visiblePosition = currentRow - firstVisibleRow
  const percent = (visiblePosition / rowCount) * 100

  if (percent < 0 || percent > 100) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: `${percent}%`,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <div
        className="cal-dot-pulse"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          marginLeft: -4,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, height: 2, backgroundColor: 'var(--accent)' }} />
    </div>
  )
}
