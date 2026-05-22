'use client'

import { useMemo, useState, useCallback } from 'react'
import { isSameDay, isToday, startOfWeek } from './calendarUtils'
import type { CalendarEvent } from './types'

interface YearViewProps {
  date: Date
  events: CalendarEvent[]
  onDayClick: (date: Date) => void
  /** Called when a month name is clicked — switches to month view */
  onMonthClick?: (date: Date) => void
  /** Called when a day is clicked — switches to week view for that week */
  onWeekClick?: (date: Date) => void
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/**
 * Get a grid of date cells for a month, starting on Sunday.
 * Returns only the rows needed (5 or 6 weeks) instead of always 42.
 */
function getMiniMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1)
  const startDayOfWeek = firstOfMonth.getDay() // 0 = Sunday
  const startDate = new Date(year, month, 1 - startDayOfWeek)

  // Calculate how many rows we need
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCellsNeeded = startDayOfWeek + daysInMonth
  const rows = Math.ceil(totalCellsNeeded / 7)
  const totalCells = rows * 7

  const cells: Date[] = []
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    cells.push(d)
  }
  return cells
}

/**
 * Heatmap color based on completed task count.
 * Uses 5 tiers for density visualization.
 */
const HEATMAP_TIERS = [
  'transparent',                     // 0 tasks
  'rgba(248, 79, 57, 0.15)',         // 1 task
  'rgba(248, 79, 57, 0.3)',          // 2-3 tasks
  'rgba(248, 79, 57, 0.5)',          // 4-5 tasks
  'rgba(248, 79, 57, 0.8)',          // 6+ tasks
]

function getHeatmapTier(count: number): number {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 5) return 3
  return 4
}

function getHeatmapColor(count: number): string {
  return HEATMAP_TIERS[getHeatmapTier(count)]
}

const LEGEND_LEVELS = [
  { label: '0' },
  { label: '1' },
  { label: '2-3' },
  { label: '4-5' },
  { label: '6+' },
]

/**
 * YearView -- 12 mini-month grids in a 4x3 layout with heatmap based on
 * completed task density (5 tiers).
 *
 * - Hover tooltip showing "May 22 -- N tasks completed"
 * - Click month name -> switches to month view
 * - Click day -> switches to week view for that week
 * - "Less [][][][][] More" legend at bottom
 */
export default function YearView({ date, events, onDayClick, onMonthClick, onWeekClick }: YearViewProps) {
  const year = date.getFullYear()
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    text: string
  } | null>(null)

  // Pre-compute completed event counts keyed by "YYYY-MM-DD" for heatmap
  const completedCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const ev of events) {
      if (!ev.start) continue
      // Count completed tasks for heatmap density
      if (!ev.isCompleted) continue
      const d = new Date(ev.start)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      map[key] = (map[key] || 0) + 1
    }
    return map
  }, [events])

  // Also compute total event counts for tooltip info
  const totalCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const ev of events) {
      if (!ev.start) continue
      const d = new Date(ev.start)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      map[key] = (map[key] || 0) + 1
    }
    return map
  }, [events])

  const getCompletedCount = useCallback(
    (d: Date): number => {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      return completedCountMap[key] || 0
    },
    [completedCountMap]
  )

  const getTotalCount = useCallback(
    (d: Date): number => {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      return totalCountMap[key] || 0
    },
    [totalCountMap]
  )

  const formatTooltipDate = useCallback((d: Date): string => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    return `${months[d.getMonth()]} ${d.getDate()}`
  }, [])

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent, cellDate: Date) => {
      const completed = getCompletedCount(cellDate)
      const rect = e.currentTarget.getBoundingClientRect()
      const parentRect = e.currentTarget.closest('[data-year-grid]')?.getBoundingClientRect()
      if (parentRect) {
        setTooltip({
          x: rect.left - parentRect.left + rect.width / 2,
          y: rect.top - parentRect.top - 4,
          text: `${formatTooltipDate(cellDate)} \u2014 ${completed} task${completed !== 1 ? 's' : ''} completed`,
        })
      }
    },
    [getCompletedCount, formatTooltipDate]
  )

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  const handleDayClick = useCallback(
    (cellDate: Date) => {
      // If onWeekClick is provided, switch to week view for that week
      if (onWeekClick) {
        onWeekClick(cellDate)
      } else {
        onDayClick(cellDate)
      }
    },
    [onDayClick, onWeekClick]
  )

  const handleMonthNameClick = useCallback(
    (monthIdx: number) => {
      const monthDate = new Date(year, monthIdx, 1)
      if (onMonthClick) {
        onMonthClick(monthDate)
      } else {
        onDayClick(monthDate)
      }
    },
    [year, onDayClick, onMonthClick]
  )

  return (
    <div
      data-year-grid
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
    >
      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            padding: '4px 8px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 500,
            color: '#fff',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 50,
            backdropFilter: 'blur(4px)',
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Scrollable month grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
          padding: 16,
          overflowY: 'auto',
          flex: 1,
        }}
      >
        {Array.from({ length: 12 }, (_, monthIdx) => {
          const cells = getMiniMonthGrid(year, monthIdx)
          const isCurrentMonthHighlight = year === currentYear && monthIdx === currentMonth

          return (
            <div
              key={monthIdx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                padding: 8,
                borderRadius: 10,
                backgroundColor: isCurrentMonthHighlight
                  ? 'var(--overlay-1)'
                  : 'transparent',
                transition: 'background-color 150ms ease',
              }}
            >
              {/* Month name header — clickable to switch to month view */}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 4,
                  color: isCurrentMonthHighlight
                    ? 'var(--accent)'
                    : 'var(--text-primary)',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  borderRadius: 4,
                }}
                onClick={() => handleMonthNameClick(monthIdx)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {MONTH_NAMES[monthIdx]}
              </div>

              {/* Day-of-week labels */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {DAY_LABELS.map((label, i) => (
                  <div
                    key={i}
                    style={{
                      textAlign: 'center',
                      fontSize: 10,
                      fontWeight: 500,
                      paddingBottom: 2,
                      color: 'var(--text-faint)',
                      userSelect: 'none',
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Date grid with heatmap */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                {cells.map((cellDate, i) => {
                  const isCurrentMonth = cellDate.getMonth() === monthIdx
                  const today = isToday(cellDate)
                  const completedCount = getCompletedCount(cellDate)
                  const heatmap = getHeatmapColor(completedCount)

                  return (
                    <button
                      key={i}
                      type="button"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        aspectRatio: '1',
                        fontSize: 11,
                        lineHeight: 1,
                        fontWeight: today ? 600 : 400,
                        color: today
                          ? '#FFFFFF'
                          : isCurrentMonth
                            ? 'var(--text-primary)'
                            : 'var(--text-primary)',
                        opacity: isCurrentMonth ? 1 : 0.2,
                        backgroundColor: today ? 'var(--accent)' : heatmap,
                        border: 'none',
                        outline: 'none',
                        padding: 0,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        transition: 'background-color 100ms ease, transform 100ms ease',
                      }}
                      onClick={() => handleDayClick(cellDate)}
                      onMouseEnter={(e) => {
                        handleMouseEnter(e, cellDate)
                        if (!today) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                          e.currentTarget.style.transform = 'scale(1.15)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        handleMouseLeave()
                        if (!today) {
                          e.currentTarget.style.backgroundColor = heatmap
                          e.currentTarget.style.transform = 'scale(1)'
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

      {/* Heatmap legend — "Less [] [] [] [] [] More" */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          padding: '8px 16px 12px',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-faint)',
            marginRight: 4,
          }}
        >
          Less
        </span>
        {LEGEND_LEVELS.map((level, i) => (
          <div
            key={i}
            title={level.label}
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              backgroundColor: i === 0 ? 'var(--overlay-1)' : HEATMAP_TIERS[i],
            }}
          />
        ))}
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-faint)',
            marginLeft: 4,
          }}
        >
          More
        </span>
      </div>
    </div>
  )
}
