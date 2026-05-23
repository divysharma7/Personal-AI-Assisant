'use client'

import { useRef, useMemo, useState, useCallback } from 'react'
import {
  isToday,
  timeToGridRow,
  gridRowSpan,
  getHourLabels,
} from '../calendarUtils'
import CalendarBlock from '../CalendarBlock'
import DraggableBlock from '../DraggableBlock'
import DroppableSlot from '../DroppableSlot'
import type { CalendarEvent } from '../types'
import { computeOverlapLayout } from '@/lib/calendarLayout'
import type { TimedEvent } from '@/lib/calendarLayout'
import {
  useWeekInteractions,
  computeVisibleRange,
} from './useWeekInteractions'
import HiddenHoursDivider from './HiddenHoursDivider'
import { useCalendarStore } from '@/stores/calendarStore'

const HOUR_LABELS = getHourLabels()
/** Total grid columns: 1 time-label + 7 day columns */
const GRID_COLUMNS = 8

interface WeekTimeGridProps {
  weekDays: Date[]
  eventsByDay: CalendarEvent[][]
}

/**
 * Convert CalendarEvent[] for a single day into TimedEvent[] for the layout algorithm,
 * then map the result back to the { columnIndex, totalColumns } shape.
 */
function computeDayOverlapLayout(dayEvents: CalendarEvent[]): Map<string, { columnIndex: number; totalColumns: number }> {
  const result = new Map<string, { columnIndex: number; totalColumns: number }>()
  if (dayEvents.length === 0) return result

  const timedEvents: TimedEvent[] = dayEvents.map((ev) => {
    const s = new Date(ev.start)
    const e = new Date(ev.end)
    return {
      id: ev.id,
      startMinutes: s.getHours() * 60 + s.getMinutes(),
      endMinutes: Math.max(s.getHours() * 60 + s.getMinutes() + 1, e.getHours() * 60 + e.getMinutes()),
    }
  })

  const layoutMap = computeOverlapLayout(timedEvents)
  layoutMap.forEach((slot, id) => {
    result.set(id, { columnIndex: slot.column, totalColumns: slot.totalColumns })
  })
  return result
}

export default function WeekTimeGrid({ weekDays, eventsByDay }: WeekTimeGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Hidden hours state from store
  const hiddenHoursStart = useCalendarStore((s) => s.hiddenHoursStart)
  const hiddenHoursEnd = useCalendarStore((s) => s.hiddenHoursEnd)
  const setHiddenHoursStart = useCalendarStore((s) => s.setHiddenHoursStart)
  const setHiddenHoursEnd = useCalendarStore((s) => s.setHiddenHoursEnd)

  // Track whether the user has temporarily expanded hidden sections
  const [earlyExpanded, setEarlyExpanded] = useState(false)
  const [lateExpanded, setLateExpanded] = useState(false)

  // Compute effective visible range (accounting for temporary expansion)
  const effectiveStart = earlyExpanded ? 0 : hiddenHoursStart
  const effectiveEnd = lateExpanded ? 24 : hiddenHoursEnd

  const visibleRange = useMemo(
    () => computeVisibleRange(effectiveStart, effectiveEnd),
    [effectiveStart, effectiveEnd],
  )
  const { firstVisibleRow, visibleRowCount } = visibleRange

  // Flatten events for resize lookup
  const allEvents = useMemo(() => eventsByDay.flat(), [eventsByDay])

  const {
    dragCreate,
    resizingEvent,
    handleSlotClick,
    handleGridMouseDown,
    handleResizeStart,
  } = useWeekInteractions(weekDays, allEvents, scrollContainerRef, visibleRange)

  // Compute overlap layouts per day
  const overlapLayoutsByDay = useMemo(() =>
    eventsByDay.map((dayEvents) => computeDayOverlapLayout(dayEvents)),
    [eventsByDay]
  )

  // Build slot occupancy per day for overlap detection
  const slotOccupancyByDay = useMemo(() => {
    return weekDays.map((_, dayIdx) => {
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
  }, [weekDays, eventsByDay])

  const hasHiddenTop = hiddenHoursStart > 0
  const hasHiddenBottom = hiddenHoursEnd < 24

  // Extra rows for divider bars (each occupies ~1 grid row equivalent)
  const topDividerRows = hasHiddenTop ? 1 : 0
  const bottomDividerRows = hasHiddenBottom ? 1 : 0
  const totalGridRows = topDividerRows + visibleRowCount + bottomDividerRows

  const handleToggleEarly = useCallback(() => {
    setEarlyExpanded((prev) => !prev)
  }, [])

  const handleToggleLate = useCallback(() => {
    setLateExpanded((prev) => !prev)
  }, [])

  const handleDragTop = useCallback(
    (newHour: number) => {
      setHiddenHoursStart(newHour)
      if (newHour === 0) setEarlyExpanded(false)
    },
    [setHiddenHoursStart],
  )

  const handleDragBottom = useCallback(
    (newHour: number) => {
      setHiddenHoursEnd(newHour)
      if (newHour === 24) setLateExpanded(false)
    },
    [setHiddenHoursEnd],
  )

  /** Map an absolute grid row (1-indexed, 96 total) to the local grid row in this component. */
  const toLocalRow = (absoluteRow: number): number => {
    return absoluteRow - firstVisibleRow + 1 + topDividerRows
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto"
      style={{ scrollBehavior: 'smooth' }}
    >
      {eventsByDay.every((dayEvents) => dayEvents.length === 0) && (
        <div
          className="flex items-center justify-center py-12"
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="text-sm">No scheduled tasks this week</span>
        </div>
      )}
      <div
        className="cal-grid"
        style={{
          gridTemplateColumns: '60px repeat(7, 1fr)',
          gridTemplateRows: hasHiddenTop || hasHiddenBottom
            ? `${hasHiddenTop ? '24px ' : ''}repeat(${visibleRowCount}, minmax(16px, 1fr))${hasHiddenBottom ? ' 24px' : ''}`
            : `repeat(${visibleRowCount}, minmax(16px, 1fr))`,
          minHeight: visibleRowCount * 16 + topDividerRows * 24 + bottomDividerRows * 24,
          position: 'relative',
        }}
      >
        {/* Top hidden hours divider */}
        {hasHiddenTop && (
          <HiddenHoursDivider
            position="top"
            hour={hiddenHoursStart}
            onDrag={handleDragTop}
            onToggleExpand={handleToggleEarly}
            isExpanded={earlyExpanded}
            gridColumns={GRID_COLUMNS}
          />
        )}

        {/* Hour labels column */}
        {Array.from({ length: visibleRowCount }, (_, i) => {
          const actualRow = firstVisibleRow + i
          const hour = Math.floor((actualRow - 1) / 4)
          const isHourStart = (actualRow - 1) % 4 === 0
          const gridRowIndex = i + 1 + topDividerRows

          return (
            <div
              key={`hlabel-${actualRow}`}
              className="cal-hour-label flex items-start justify-end pr-2"
              style={{
                gridColumn: '1 / 2',
                gridRow: `${gridRowIndex} / ${gridRowIndex + 1}`,
                borderTop: isHourStart ? '1px solid var(--border)' : 'none',
                borderRight: '1px solid var(--border)',
                paddingTop: isHourStart ? 2 : 0,
              }}
            >
              {isHourStart && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 400,
                    color: 'var(--text-faint)',
                    lineHeight: 1,
                  }}
                >
                  {hour === 12 ? 'Noon' : HOUR_LABELS[hour]}
                </span>
              )}
            </div>
          )
        })}

        {/* Day columns: droppable time slots */}
        {weekDays.map((day, colIndex) => {
          const today = isToday(day)
          const dayISO = day.toISOString().split('T')[0]
          const occupancy = slotOccupancyByDay[colIndex]

          return Array.from({ length: visibleRowCount }, (_, i) => {
            const actualRow = firstVisibleRow + i
            const slotIndex = actualRow - 1
            const isHourStart = (actualRow - 1) % 4 === 0
            const gridRowIndex = i + 1 + topDividerRows
            const slotId = `slot-${dayISO}-${slotIndex}`
            const occupied = occupancy.get(slotIndex) || []

            return (
              <div
                key={`grid-${colIndex}-${actualRow}`}
                style={{
                  gridColumn: `${colIndex + 2} / ${colIndex + 3}`,
                  gridRow: `${gridRowIndex} / ${gridRowIndex + 1}`,
                  borderTop: isHourStart ? '1px solid var(--border)' : 'none',
                  borderRight: colIndex < 6 ? '1px solid var(--border)' : 'none',
                  backgroundColor: today ? 'var(--accent-soft)' : 'transparent',
                  transition: 'background-color 120ms ease',
                }}
                className="week-slot"
                onMouseDown={(e) => handleGridMouseDown(e, colIndex, actualRow)}
              >
                <DroppableSlot
                  id={slotId}
                  slotIndex={slotIndex}
                  day={dayISO}
                  occupiedBy={occupied}
                >
                  <div
                    style={{ minHeight: 16 }}
                    className="h-full w-full"
                    onClick={(e) => handleSlotClick(colIndex, actualRow, e)}
                  />
                </DroppableSlot>
              </div>
            )
          })
        })}

        {/* Bottom hidden hours divider */}
        {hasHiddenBottom && (
          <HiddenHoursDivider
            position="bottom"
            hour={hiddenHoursEnd}
            onDrag={handleDragBottom}
            onToggleExpand={handleToggleLate}
            isExpanded={lateExpanded}
            gridColumns={GRID_COLUMNS}
          />
        )}

        {/* Event blocks -- with overlap column layout */}
        {weekDays.map((day, colIndex) => {
          const layouts = overlapLayoutsByDay[colIndex]
          return eventsByDay[colIndex].map((ev) => {
            const start = new Date(ev.start)
            const end = new Date(ev.end)
            const startRow = timeToGridRow(start)
            let span = gridRowSpan(start, end)

            if (resizingEvent && resizingEvent.eventId === ev.id) {
              const resizedEnd = resizingEvent.currentEndRow
              span = Math.max(1, resizedEnd - startRow)
            }

            const visibleStart = toLocalRow(startRow)
            const visibleEnd = visibleStart + span

            if (visibleStart > totalGridRows || visibleEnd < 1 + topDividerRows) return null

            const isReadOnly = !!(ev.isExternal || ev.isFocusSession || ev.isReadOnly)

            const layout = layouts.get(ev.id)
            const colIdx = layout?.columnIndex ?? 0
            const totalCols = layout?.totalColumns ?? 1

            const GAP = 2
            const widthPercent = (1 / totalCols) * 100
            const leftPercent = colIdx * widthPercent

            return (
              <div
                key={ev.id}
                style={{
                  gridColumn: `${colIndex + 2} / ${colIndex + 3}`,
                  gridRow: `${Math.max(1 + topDividerRows, visibleStart)} / ${Math.min(totalGridRows - bottomDividerRows + 1, visibleEnd)}`,
                  position: 'relative',
                  zIndex: 5,
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `calc(${leftPercent}% + ${GAP / 2}px)`,
                    width: `calc(${widthPercent}% - ${GAP}px)`,
                    pointerEvents: 'auto',
                    transition: 'left 200ms ease, width 200ms ease',
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
                      compact
                      isReadOnly={isReadOnly}
                      style={{
                        height: '100%',
                        borderRadius: 8,
                      }}
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent('laif:detail-task', {
                            detail: { taskId: ev.id },
                          })
                        )
                      }}
                    />
                    {/* Resize handle */}
                    {!isReadOnly && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 10,
                          cursor: 'ns-resize',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '0 0 8px 8px',
                          zIndex: 6,
                        }}
                        onMouseDown={(e) => {
                          const endRow = timeToGridRow(end)
                          handleResizeStart(e, ev.id, colIndex, endRow)
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 3,
                            borderRadius: 2,
                            backgroundColor: 'rgba(255,255,255,0.4)',
                            opacity: 0,
                            transition: 'opacity 150ms ease',
                          }}
                          className="resize-handle-pill"
                        />
                      </div>
                    )}
                  </DraggableBlock>
                </div>
              </div>
            )
          })
        })}

        {/* Drag-to-create preview block */}
        {dragCreate && (() => {
          const minRow = Math.min(dragCreate.startRow, dragCreate.currentRow)
          const maxRow = Math.max(dragCreate.startRow, dragCreate.currentRow)
          const visStart = toLocalRow(minRow)
          const visEnd = toLocalRow(maxRow)

          if (visStart > totalGridRows || visEnd < 1 + topDividerRows) return null

          const startSlot = minRow - 1
          const endSlot = maxRow - 1
          const startH = Math.floor(startSlot / 4)
          const startM = (startSlot % 4) * 15
          const endH = Math.floor(endSlot / 4)
          const endM = (endSlot % 4) * 15
          const timeLabel = `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')} - ${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`

          return (
            <div
              style={{
                gridColumn: `${dragCreate.colIndex + 2} / ${dragCreate.colIndex + 3}`,
                gridRow: `${Math.max(1 + topDividerRows, visStart)} / ${Math.min(totalGridRows - bottomDividerRows + 1, visEnd + 1)}`,
                padding: '0 2px',
                zIndex: 12,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: 8,
                  backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
                  border: '2px dashed var(--accent)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '4px 8px',
                  transition: 'height 50ms ease',
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--accent)',
                    opacity: 0.9,
                  }}
                >
                  {timeLabel}
                </span>
              </div>
            </div>
          )
        })()}

        {/* Inline input removed — slot clicks now open QuickAddPopover via event */}

        {/* Current time indicator */}
        {weekDays.map((day, colIndex) => {
          if (!isToday(day)) return null
          const now = new Date()
          const totalMinutes = now.getHours() * 60 + now.getMinutes()
          const currentRow = totalMinutes / 15 + 1
          const visiblePosition = currentRow - firstVisibleRow
          const percent = (visiblePosition / visibleRowCount) * 100

          if (percent < 0 || percent > 100) return null

          // Offset the percentage to account for divider rows in the grid
          const gridContentStart = hasHiddenTop ? 24 : 0 // 24px for divider
          const gridContentHeight = visibleRowCount * 16
          const totalHeight = gridContentHeight + (hasHiddenTop ? 24 : 0) + (hasHiddenBottom ? 24 : 0)
          const adjustedPercent = ((gridContentStart + (percent / 100) * gridContentHeight) / totalHeight) * 100

          return (
            <div
              key={`time-${colIndex}`}
              style={{
                gridColumn: `1 / -1`,
                gridRow: '1 / -1',
                position: 'relative',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: `${adjustedPercent}%`,
                  left: 56,
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  className="cal-dot-pulse"
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    marginLeft: -5,
                    flexShrink: 0,
                    boxShadow: '0 0 6px 2px color-mix(in srgb, var(--accent) 40%, transparent)',
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    background: 'linear-gradient(to right, var(--accent), color-mix(in srgb, var(--accent) 30%, transparent))',
                  }}
                />
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: `${adjustedPercent}%`,
                  left: 60,
                  right: 0,
                  height: 16,
                  background: 'linear-gradient(to bottom, color-mix(in srgb, var(--accent) 6%, transparent), transparent)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Inline styles for hover effects and transitions */}
      <style jsx>{`
        .week-slot:hover {
          background-color: var(--overlay-1, rgba(108,108,158,0.04)) !important;
        }
        .cal-block {
          border-radius: 8px;
          transition: transform 100ms ease, box-shadow 100ms ease, filter 100ms ease;
        }
        .cal-block:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          filter: brightness(0.97);
        }
        .resize-handle-pill {
          opacity: 0;
        }
        .cal-block:hover .resize-handle-pill,
        div:hover > .resize-handle-pill {
          opacity: 1 !important;
        }
        @keyframes dot-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }
        .cal-dot-pulse {
          animation: dot-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
