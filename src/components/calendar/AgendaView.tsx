'use client'

import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { fadeSlideUp, ease, stagger } from '@/lib/motion'
import { isSameDay, isToday, isPast, formatDuration } from './calendarUtils'
import type { CalendarEvent } from './types'

interface AgendaViewProps {
  date: Date
  events: CalendarEvent[]
}

const INITIAL_DAYS = 30
const LOAD_MORE_DAYS = 30

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Hex color to rgba helper.
 * Accepts "#RRGGBB" and returns rgba at specified opacity.
 */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  if (clean.length < 6) return `rgba(120,120,140,${alpha})`
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/**
 * Check if a calendar event is an all-day event.
 */
function isAllDay(ev: CalendarEvent): boolean {
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
 * Format a time string like "9:00 AM" from a Date.
 */
function formatTime(d: Date): string {
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  const ampm = hours < 12 ? 'AM' : 'PM'
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`
  return `${hour12}:${minStr} ${ampm}`
}

/**
 * Get a short relative label for the date header badge.
 */
function getRelativeLabel(d: Date): string | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const compare = new Date(d)
  compare.setHours(0, 0, 0, 0)
  const diffDays = Math.round(
    (compare.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  return null
}

/**
 * AgendaView -- TickTick-style timeline layout with:
 * - Large date number + day name headers
 * - Time column with right-aligned labels
 * - Checkbox column with vertical timeline connector
 * - Pastel task cards with left color border
 * - IntersectionObserver infinite scroll
 */
export default function AgendaView({ date, events }: AgendaViewProps) {
  const [visibleDays, setVisibleDays] = useState(INITIAL_DAYS)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const bottomSentinelRef = useRef<HTMLDivElement>(null)
  const todayRef = useRef<HTMLDivElement>(null)

  // Build an array of dates starting from `date`
  const days = useMemo(() => {
    const result: Date[] = []
    for (let i = 0; i < visibleDays; i++) {
      const d = new Date(date)
      d.setDate(date.getDate() + i)
      d.setHours(0, 0, 0, 0)
      result.push(d)
    }
    return result
  }, [date, visibleDays])

  // Group events by day, filtering out empty days
  const daysWithEvents = useMemo(() => {
    const result: { day: Date; events: CalendarEvent[] }[] = []
    for (const day of days) {
      const dayEvents = events
        .filter((ev) => ev.start && isSameDay(new Date(ev.start), day))
        .sort((a, b) => {
          // Completed events last
          if (a.isCompleted && !b.isCompleted) return 1
          if (!a.isCompleted && b.isCompleted) return -1
          // All-day events first, then by start time
          const aAllDay = isAllDay(a)
          const bAllDay = isAllDay(b)
          if (aAllDay && !bAllDay) return -1
          if (!aAllDay && bAllDay) return 1
          // Overdue items first within their group
          if ((a.daysOverdue ?? 0) > 0 && !(b.daysOverdue ?? 0)) return -1
          if (!(a.daysOverdue ?? 0) && (b.daysOverdue ?? 0) > 0) return 1
          return new Date(a.start).getTime() - new Date(b.start).getTime()
        })

      if (dayEvents.length > 0) {
        result.push({ day, events: dayEvents })
      }
    }
    return result
  }, [days, events])

  const handleLoadMore = useCallback(() => {
    setVisibleDays((prev) => prev + LOAD_MORE_DAYS)
  }, [])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const container = scrollContainerRef.current
    const sentinel = bottomSentinelRef.current
    if (!container || !sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisibleDays((prev) => prev + LOAD_MORE_DAYS)
          }
        }
      },
      { root: container, rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  // Scroll to today on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      todayRef.current?.scrollIntoView({ block: 'start' })
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      ref={scrollContainerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflowY: 'auto',
        padding: '8px 0 16px 0',
      }}
      variants={stagger(0.03)}
      initial="initial"
      animate="animate"
    >
      {daysWithEvents.length === 0 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            color: 'var(--text-faint)',
            fontSize: 14,
            padding: 48,
          }}
        >
          No events in the next {visibleDays} days
        </div>
      ) : (
        daysWithEvents.map(({ day, events: dayEvents }) => (
          <DayGroup
            key={day.toDateString()}
            day={day}
            dayEvents={dayEvents}
            todayRef={isToday(day) ? todayRef : undefined}
          />
        ))
      )}

      {/* Bottom sentinel for IntersectionObserver infinite scroll */}
      <div ref={bottomSentinelRef} style={{ height: 1 }} />

      {/* Manual load more button (fallback) */}
      {daysWithEvents.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '12px 16px 8px',
          }}
        >
          <button
            type="button"
            onClick={handleLoadMore}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--accent)',
              backgroundColor: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '8px 24px',
              cursor: 'pointer',
              transition: 'background-color 100ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Load more ({LOAD_MORE_DAYS} days)
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ── Day Group ──────────────────────────────────────────────────

interface DayGroupProps {
  day: Date
  dayEvents: CalendarEvent[]
  todayRef?: React.RefObject<HTMLDivElement>
}

function DayGroup({ day, dayEvents, todayRef }: DayGroupProps) {
  const today = isToday(day)
  const past = isPast(day) && !today
  const relativeLabel = getRelativeLabel(day)

  return (
    <motion.div
      ref={todayRef}
      variants={fadeSlideUp}
      transition={ease.normal}
      style={{
        marginBottom: 32,
        opacity: past ? 0.6 : 1,
      }}
    >
      {/* Date header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
          padding: '0 20px 10px',
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1,
            color: today ? 'var(--accent)' : 'var(--text-primary)',
          }}
        >
          {day.getDate()}
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: today ? 'var(--accent)' : 'var(--text-muted)',
          }}
        >
          {relativeLabel || SHORT_DAYS[day.getDay()]}
        </span>
      </div>

      {/* Event rows */}
      <div style={{ padding: '0 12px 0 20px' }}>
        {dayEvents.map((ev, idx) => (
          <AgendaRow
            key={ev.id}
            ev={ev}
            isLast={idx === dayEvents.length - 1}
            dayIsPast={past}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ── Agenda Row ─────────────────────────────────────────────────

interface AgendaRowProps {
  ev: CalendarEvent
  isLast: boolean
  dayIsPast: boolean
}

function AgendaRow({ ev, isLast, dayIsPast }: AgendaRowProps) {
  const allDay = isAllDay(ev)
  const startDate = new Date(ev.start)
  const endDate = new Date(ev.end)
  const isOverdue = (ev.daysOverdue ?? 0) > 0
  const isCompleted = !!ev.isCompleted
  const hasTimed = !allDay

  const cardColor = isOverdue && !isCompleted
    ? '#ef4444'
    : ev.color || 'var(--accent)'

  // For hexToRgba we need an actual hex; fallback for CSS var
  const cardColorHex = cardColor.startsWith('#') ? cardColor : '#5DA8FF'

  const handleToggleComplete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    window.dispatchEvent(
      new CustomEvent('laif:detail-task', {
        detail: { taskId: ev.id, action: 'toggle-complete' },
      })
    )
  }, [ev.id])

  const handleOpenDetail = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('laif:detail-task', {
        detail: { taskId: ev.id },
      })
    )
  }, [ev.id])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        minHeight: hasTimed ? 68 : 52,
      }}
    >
      {/* Time column */}
      <div
        style={{
          width: 80,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: 12,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: isOverdue && !isCompleted ? '#ef4444' : 'var(--text-faint)',
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          {allDay ? 'All Day' : formatTime(startDate)}
        </span>
      </div>

      {/* Checkbox + vertical timeline connector */}
      <div
        style={{
          width: 24,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Top connector line */}
        <div
          style={{
            flex: 1,
            width: 1,
            borderLeft: '1px dashed var(--border)',
            visibility: 'visible',
          }}
        />

        {/* Checkbox circle */}
        <button
          type="button"
          onClick={handleToggleComplete}
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: isCompleted
              ? 'none'
              : `1.5px solid ${isOverdue && !isCompleted ? '#ef4444' : 'var(--border)'}`,
            backgroundColor: isCompleted ? 'var(--accent)' : 'transparent',
            cursor: 'pointer',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            transition: 'background-color 150ms ease, border-color 150ms ease',
          }}
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {isCompleted && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M2 5L4.5 7.5L8 3"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        {/* Bottom connector line */}
        <div
          style={{
            flex: 1,
            width: 1,
            borderLeft: isLast ? 'none' : '1px dashed var(--border)',
          }}
        />
      </div>

      {/* Task card */}
      <button
        type="button"
        onClick={handleOpenDetail}
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          margin: '3px 0 3px 10px',
          padding: '10px 14px',
          borderRadius: 8,
          border: 'none',
          borderLeft: `3px solid ${hexToRgba(cardColorHex, 0.4)}`,
          backgroundColor: hexToRgba(cardColorHex, 0.08),
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background-color 100ms ease',
          opacity: isCompleted ? 0.45 : dayIsPast && !isOverdue ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = hexToRgba(cardColorHex, 0.14)
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = hexToRgba(cardColorHex, 0.08)
        }}
      >
        {/* Title + time range area */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minWidth: 0,
            gap: hasTimed ? 2 : 0,
          }}
        >
          {/* Time range line (for timed tasks) */}
          {hasTimed && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 400,
                color: cardColor.startsWith('#') ? cardColor : 'var(--accent)',
                lineHeight: 1.3,
              }}
            >
              {formatTime(startDate)} - {formatTime(endDate)}
            </span>
          )}

          {/* Title */}
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: isOverdue && !isCompleted
                ? '#ef4444'
                : 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textDecoration: isCompleted ? 'line-through' : 'none',
              lineHeight: 1.3,
            }}
          >
            {ev.title}
          </span>
        </div>

        {/* Overdue badge */}
        {isOverdue && !isCompleted && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              padding: '2px 6px',
              borderRadius: 4,
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {ev.daysOverdue}d overdue
          </span>
        )}

        {/* Calendar icon for timed / external events */}
        {(hasTimed || ev.isExternal) && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            style={{ flexShrink: 0, opacity: 0.35 }}
          >
            <rect
              x="2"
              y="3"
              width="12"
              height="11"
              rx="2"
              stroke="var(--text-faint)"
              strokeWidth="1.3"
            />
            <path
              d="M2 7h12"
              stroke="var(--text-faint)"
              strokeWidth="1.3"
            />
            <path
              d="M5.5 1.5v3M10.5 1.5v3"
              stroke="var(--text-faint)"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </div>
  )
}
