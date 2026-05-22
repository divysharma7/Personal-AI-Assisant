'use client'

import { useMemo, useState, useCallback } from 'react'
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
const MAX_VISIBLE_EVENTS = 3

interface TaskBar {
  event: CalendarEvent
  startCol: number
  span: number
  isTimed: boolean
  timePrefix: string
}

/**
 * Strip time from a Date to get midnight of that day (local time).
 */
function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * Format a time as "HH:MM" from a Date.
 */
function formatTimePrefix(d: Date): string {
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

/**
 * Check if a calendar event is an all-day event.
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

/**
 * MonthView -- standard 6x7 grid with task bars (horizontal pills).
 * Multi-day tasks span across cells. Timed tasks show "14:00 *" prefix.
 * "+N more" overflow when too many tasks per cell.
 * Click cell: creates a task for that date.
 * Click task: opens task detail.
 */
export default function MonthView({
  date,
  events,
  onDayClick,
  showHabitDots = false,
}: MonthViewProps) {
  const cells = getMonthGrid(date)
  const currentMonth = date.getMonth()

  // Build rows (each row = 7 cells = 1 week)
  const rows = useMemo(() => {
    const rowCount = cells.length / 7
    const result: { days: Date[]; taskBars: TaskBar[] }[] = []

    // Filter out habits for bar display
    const nonHabitEvents = events.filter((ev) => !ev.isHabit)

    for (let r = 0; r < rowCount; r++) {
      const days = cells.slice(r * 7, r * 7 + 7)
      const rowStart = stripTime(days[0])
      const rowEnd = stripTime(days[6])
      const bars: TaskBar[] = []

      for (const ev of nonHabitEvents) {
        if (!ev.start) continue
        const evStart = new Date(ev.start)
        const evEnd = ev.end ? new Date(ev.end) : evStart
        const evStartDay = stripTime(evStart)
        const evEndDay = stripTime(evEnd)

        // Skip if event doesn't overlap this row
        if (evStartDay > rowEnd || evEndDay < rowStart) continue

        // Calculate column range
        let startCol = 0
        let endCol = 6

        for (let i = 0; i < 7; i++) {
          const dayDate = stripTime(days[i])
          if (dayDate.getTime() === evStartDay.getTime()) startCol = i
          if (dayDate.getTime() === evEndDay.getTime()) endCol = i
        }

        // Clamp to row bounds
        if (evStartDay < rowStart) startCol = 0
        if (evEndDay > rowEnd) endCol = 6

        const allDay = isAllDayEvent(ev)
        const isTimed = !allDay
        let timePrefix = ''
        if (isTimed) {
          timePrefix = formatTimePrefix(evStart)
        }

        bars.push({
          event: ev,
          startCol,
          span: endCol - startCol + 1,
          isTimed,
          timePrefix,
        })
      }

      result.push({ days, taskBars: bars })
    }

    return result
  }, [cells, events])

  const handleCellClick = useCallback(
    (cellDate: Date) => {
      // Dispatch create-task event for the clicked date
      const dayISO = cellDate.toISOString().split('T')[0]
      window.dispatchEvent(
        new CustomEvent('laif:create-calendar-task', {
          detail: {
            slotIndex: 36, // 9:00 AM (9*4)
            dayISO,
          },
        })
      )
    },
    []
  )

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

      {/* Rows */}
      <div
        className="flex flex-col flex-1 overflow-y-auto"
      >
        {rows.map((row, rowIdx) => (
          <MonthRow
            key={rowIdx}
            days={row.days}
            taskBars={row.taskBars}
            currentMonth={currentMonth}
            events={events}
            showHabitDots={showHabitDots}
            onDayClick={onDayClick}
            onCellClick={handleCellClick}
          />
        ))}
      </div>
    </div>
  )
}

/* ── MonthRow ───────────────────────────────────────────────────── */

interface MonthRowProps {
  days: Date[]
  taskBars: TaskBar[]
  currentMonth: number
  events: CalendarEvent[]
  showHabitDots: boolean
  onDayClick: (date: Date) => void
  onCellClick: (date: Date) => void
}

function MonthRow({
  days,
  taskBars,
  currentMonth,
  events,
  showHabitDots,
  onDayClick,
  onCellClick,
}: MonthRowProps) {
  // Group tasks per day for the "+N more" count
  const tasksPerDay = useMemo(() => {
    const map = new Map<number, TaskBar[]>()
    for (let col = 0; col < 7; col++) map.set(col, [])
    for (const bar of taskBars) {
      for (let c = bar.startCol; c < bar.startCol + bar.span; c++) {
        map.get(c)?.push(bar)
      }
    }
    return map
  }, [taskBars])

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: 'repeat(7, 1fr)',
        minHeight: 100,
        flex: '1 0 auto',
      }}
    >
      {days.map((day, colIdx) => {
        const today = isToday(day)
        const past = isPast(day)
        const isCurrentMonth = day.getMonth() === currentMonth
        const dayTasks = tasksPerDay.get(colIdx) ?? []
        // Only show bars that START in this column (bars spanning from earlier cols are rendered via CSS width)
        const visibleBars = taskBars.filter((b) => colIdx === b.startCol)
        const overflowCount = dayTasks.length - MAX_VISIBLE_EVENTS

        // Habit events for this day
        const habitEvents = showHabitDots
          ? events.filter(
              (ev) => ev.start && isSameDay(new Date(ev.start), day) && ev.isHabit
            )
          : []

        return (
          <div
            key={colIdx}
            className="flex flex-col gap-0.5 p-1 cursor-pointer overflow-hidden"
            style={{
              borderRight: (colIdx + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none',
              borderBottom: '1px solid var(--border)',
              opacity: past && !today ? 0.7 : isCurrentMonth ? 1 : 0.4,
              transition: 'background-color 100ms ease',
            }}
            onClick={() => onDayClick(day)}
            onDoubleClick={(e) => {
              e.stopPropagation()
              onCellClick(day)
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            {/* Date number + habit dots */}
            <div className="flex items-center gap-1">
              <span
                className="flex items-center justify-center rounded-full text-xs font-semibold"
                style={{
                  width: 24,
                  height: 24,
                  color: today ? '#FFFFFF' : 'var(--text-primary)',
                  backgroundColor: today ? 'var(--accent)' : 'transparent',
                  outline: today ? '2px solid var(--accent)' : 'none',
                  outlineOffset: 1,
                }}
              >
                {day.getDate()}
              </span>

              {/* Habit dots */}
              {habitEvents.length > 0 && (
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

            {/* Task bars */}
            <div className="flex flex-col gap-px overflow-hidden">
              {visibleBars.slice(0, MAX_VISIBLE_EVENTS).map((bar) => (
                <MonthTaskBar
                  key={bar.event.id}
                  bar={bar}
                />
              ))}

              {/* Overflow indicator */}
              {overflowCount > 0 && (
                <MoreTasksButton
                  day={day}
                  tasks={dayTasks}
                  overflowCount={overflowCount}
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── MonthTaskBar ───────────────────────────────────────────────── */

interface MonthTaskBarProps {
  bar: TaskBar
}

function MonthTaskBar({ bar }: MonthTaskBarProps) {
  const { event } = bar
  const isCompleted = !!event.isCompleted

  return (
    <button
      className="text-left truncate cursor-pointer flex items-center shrink-0"
      style={{
        height: 20,
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 3,
        fontSize: 10,
        fontWeight: 500,
        backgroundColor: event.color + '33', // 20% opacity
        borderLeft: `3px solid ${event.color}`,
        opacity: isCompleted ? 0.5 : event.isExternal ? 0.7 : 1,
        textDecoration: isCompleted ? 'line-through' : 'none',
        // Multi-day bars span multiple columns
        width: bar.span > 1 ? `calc(${bar.span * 100}% + ${(bar.span - 1)}px)` : undefined,
        zIndex: bar.span > 1 ? 2 : 1,
        position: 'relative',
        transition: 'background-color 100ms ease',
      }}
      onClick={(e) => {
        e.stopPropagation()
        window.dispatchEvent(
          new CustomEvent('laif:open-task-detail', {
            detail: { taskId: event.id },
          })
        )
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = event.color + '44'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = event.color + '33'
      }}
      title={event.title}
    >
      {bar.isTimed && (
        <span
          style={{
            color: 'var(--text-faint)',
            fontSize: 9,
            marginRight: 3,
            flexShrink: 0,
          }}
        >
          {bar.timePrefix} &bull;
        </span>
      )}
      <span
        className="truncate"
        style={{ color: event.color }}
      >
        {event.title}
      </span>
    </button>
  )
}

/* ── MoreTasksButton ────────────────────────────────────────────── */

interface MoreTasksButtonProps {
  day: Date
  tasks: TaskBar[]
  overflowCount: number
}

function MoreTasksButton({ day, tasks, overflowCount }: MoreTasksButtonProps) {
  const [showPopover, setShowPopover] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="text-[10px] font-medium cursor-pointer shrink-0 text-left"
        style={{
          color: 'var(--text-faint)',
          padding: '0 4px',
          background: 'none',
          border: 'none',
        }}
        onClick={(e) => {
          e.stopPropagation()
          setShowPopover(!showPopover)
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-faint)'
        }}
      >
        +{overflowCount} more
      </button>

      {showPopover && (
        <>
          {/* Backdrop to close popover */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 40,
            }}
            onClick={(e) => {
              e.stopPropagation()
              setShowPopover(false)
            }}
          />
          {/* Popover */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 50,
              width: 220,
              maxHeight: 200,
              overflowY: 'auto',
              padding: 8,
              borderRadius: 10,
              backgroundColor: 'var(--bg-pane)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-faint)',
                marginBottom: 6,
              }}
            >
              {day.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <div className="flex flex-col gap-1">
              {tasks.map((bar) => (
                <button
                  key={bar.event.id}
                  className="flex items-center truncate cursor-pointer"
                  style={{
                    height: 22,
                    paddingLeft: 4,
                    paddingRight: 4,
                    borderRadius: 3,
                    fontSize: 10,
                    fontWeight: 500,
                    backgroundColor: bar.event.color + '33',
                    borderLeft: `3px solid ${bar.event.color}`,
                    opacity: bar.event.isCompleted ? 0.5 : 1,
                    textDecoration: bar.event.isCompleted ? 'line-through' : 'none',
                    border: 'none',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowPopover(false)
                    window.dispatchEvent(
                      new CustomEvent('laif:open-task-detail', {
                        detail: { taskId: bar.event.id },
                      })
                    )
                  }}
                >
                  {bar.isTimed && (
                    <span
                      style={{
                        color: 'var(--text-faint)',
                        fontSize: 9,
                        marginRight: 3,
                        flexShrink: 0,
                      }}
                    >
                      {bar.timePrefix} &bull;
                    </span>
                  )}
                  <span className="truncate" style={{ color: bar.event.color }}>
                    {bar.event.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
