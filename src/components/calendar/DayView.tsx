'use client'

import { useState, useCallback } from 'react'
import {
  timeToGridRow,
  gridRowSpan,
  getHourLabels,
  isSameDay,
  isToday,
} from './calendarUtils'
import CalendarBlock from './CalendarBlock'
import CurrentTimeLine from './CurrentTimeLine'
import CalendarEmpty from './CalendarEmpty'
import CapacityBar from './CapacityBar'
import type { CalendarEvent } from './types'
import { MOCK_CAPACITY } from './mockData'

interface DayViewProps {
  date: Date
  events: CalendarEvent[]
}

const HOUR_LABELS = getHourLabels()

/** Default hidden range: 21:00 (row 85) to 07:00 (row 29) */
const COLLAPSE_START_HOUR = 21
const COLLAPSE_END_HOUR = 7

/**
 * DayView — vertical time grid with 96 rows (15-min slots).
 * Left column: hour labels. Right column: task blocks via grid row placement.
 * Current time indicator shown when viewing today.
 */
export default function DayView({ date, events }: DayViewProps) {
  const [showEarlyHours, setShowEarlyHours] = useState(false)
  const [showLateHours, setShowLateHours] = useState(false)
  const [newTaskSlot, setNewTaskSlot] = useState<number | null>(null)

  // Filter events for this day (exclude habits — they go in a chip row above)
  const dayEvents = events.filter((ev) => {
    if (!ev.start) return false
    return isSameDay(new Date(ev.start), date) && !ev.isHabit
  })

  const habitEvents = events.filter((ev) => {
    if (!ev.start) return false
    return isSameDay(new Date(ev.start), date) && ev.isHabit
  })

  const showToday = isToday(date)

  // Determine visible row range
  const firstVisibleRow = showEarlyHours ? 1 : COLLAPSE_END_HOUR * 4 + 1  // row 29 = 07:00
  const lastVisibleRow = showLateHours ? 96 : COLLAPSE_START_HOUR * 4     // row 84 = 21:00
  const visibleRowCount = lastVisibleRow - firstVisibleRow + 1

  const handleSlotClick = useCallback((row: number) => {
    setNewTaskSlot(row)
  }, [])

  const handleNewTaskKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        setNewTaskSlot(null)
      }
    },
    []
  )

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

      {/* Capacity bar */}
      <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <CapacityBar
          scheduledHours={MOCK_CAPACITY.scheduledHours}
          capacityHours={MOCK_CAPACITY.capacityHours}
        />
      </div>

      {/* Early hours toggle */}
      {!showEarlyHours && (
        <button
          onClick={() => setShowEarlyHours(true)}
          className="text-[10px] font-medium py-1 cursor-pointer"
          style={{ color: 'var(--text-faint)', backgroundColor: 'var(--bg-pane-2)' }}
        >
          Show 12 AM - 7 AM
        </button>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        {dayEvents.length === 0 && !newTaskSlot ? (
          <CalendarEmpty />
        ) : (
          <div
            className="cal-grid"
            style={{
              gridTemplateColumns: '60px 1fr',
              gridTemplateRows: `repeat(${visibleRowCount}, minmax(15px, 1fr))`,
              minHeight: visibleRowCount * 15,
            }}
          >
            {/* Hour labels + grid lines */}
            {Array.from({ length: visibleRowCount }, (_, i) => {
              const actualRow = firstVisibleRow + i
              const hour = Math.floor((actualRow - 1) / 4)
              const isHourStart = (actualRow - 1) % 4 === 0
              const gridRowIndex = i + 1

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
                  {isHourStart && (
                    <span>{HOUR_LABELS[hour]}</span>
                  )}
                </div>
              )
            })}

            {/* Clickable empty slots */}
            {Array.from({ length: visibleRowCount }, (_, i) => {
              const actualRow = firstVisibleRow + i
              const gridRowIndex = i + 1
              const isHourStart = (actualRow - 1) % 4 === 0

              return (
                <div
                  key={`slot-${actualRow}`}
                  style={{
                    gridColumn: '2 / 3',
                    gridRow: `${gridRowIndex} / ${gridRowIndex + 1}`,
                    borderTop: isHourStart ? '1px solid var(--border)' : 'none',
                    minHeight: 15,
                  }}
                  onClick={() => handleSlotClick(actualRow)}
                />
              )
            })}

            {/* Event blocks */}
            {dayEvents.map((ev) => {
              const start = new Date(ev.start)
              const end = new Date(ev.end)
              const startRow = timeToGridRow(start)
              const span = gridRowSpan(start, end)

              // Convert to visible grid coordinates
              const visibleStart = startRow - firstVisibleRow + 1
              const visibleEnd = visibleStart + span

              // Skip if entirely outside visible range
              if (visibleStart > visibleRowCount || visibleEnd < 1) return null

              return (
                <div
                  key={ev.id}
                  style={{
                    gridColumn: '2 / 3',
                    gridRow: `${Math.max(1, visibleStart)} / ${Math.min(visibleRowCount + 1, visibleEnd)}`,
                    padding: '0 4px',
                    zIndex: 5,
                  }}
                >
                  <CalendarBlock
                    event={ev}
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
            })}

            {/* Inline new task input */}
            {newTaskSlot !== null && (() => {
              const visibleSlot = newTaskSlot - firstVisibleRow + 1
              if (visibleSlot < 1 || visibleSlot > visibleRowCount) return null
              return (
                <div
                  style={{
                    gridColumn: '2 / 3',
                    gridRow: `${visibleSlot} / ${visibleSlot + 2}`,
                    padding: '0 4px',
                    zIndex: 15,
                  }}
                >
                  <input
                    autoFocus
                    placeholder="New task"
                    className="w-full h-full rounded-md px-2 text-xs outline-none"
                    style={{
                      backgroundColor: 'var(--bg-pane-2)',
                      border: '1px solid var(--accent)',
                      color: 'var(--text-primary)',
                    }}
                    onBlur={() => setNewTaskSlot(null)}
                    onKeyDown={handleNewTaskKeyDown}
                  />
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

      {/* Late hours toggle */}
      {!showLateHours && (
        <button
          onClick={() => setShowLateHours(true)}
          className="text-[10px] font-medium py-1 cursor-pointer"
          style={{ color: 'var(--text-faint)', backgroundColor: 'var(--bg-pane-2)' }}
        >
          Show 9 PM - 12 AM
        </button>
      )}
    </div>
  )
}

/**
 * Positioned current time indicator within the grid.
 * Uses percentage-based positioning instead of grid rows to get sub-row accuracy.
 */
function CurrentTimeLinePositioned({
  firstVisibleRow,
  rowCount,
}: {
  firstVisibleRow: number
  rowCount: number
}) {
  const now = new Date()
  const totalMinutes = now.getHours() * 60 + now.getMinutes()
  const currentRow = totalMinutes / 15 + 1 // fractional row
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
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          marginLeft: -4,
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
  )
}
