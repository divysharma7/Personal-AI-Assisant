'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { fadeSlideUp, ease, stagger } from '@/lib/motion'
import { isSameDay, isToday, isPast } from './calendarUtils'
import type { CalendarEvent } from './types'

interface AgendaViewProps {
  date: Date
  events: CalendarEvent[]
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const AGENDA_DAYS = 14

/**
 * Check if a calendar event is an all-day event.
 * All-day events either have no time component (midnight to midnight)
 * or span 24+ hours.
 */
function isAllDay(ev: CalendarEvent): boolean {
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

/**
 * Format a time string like "9:30 AM" from a Date.
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
 * AgendaView -- scrollable list of events grouped by day.
 * Shows 14 days starting from the given date.
 * Today's header is accented; past dates are dimmed.
 * Clicking an event opens the task detail panel.
 */
export default function AgendaView({ date, events }: AgendaViewProps) {
  // Build an array of 14 dates starting from `date`
  const days = useMemo(() => {
    const result: Date[] = []
    for (let i = 0; i < AGENDA_DAYS; i++) {
      const d = new Date(date)
      d.setDate(date.getDate() + i)
      d.setHours(0, 0, 0, 0)
      result.push(d)
    }
    return result
  }, [date])

  // Group events by day for quick lookup
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const day of days) {
      const key = day.toDateString()
      const dayEvents = events
        .filter((ev) => ev.start && isSameDay(new Date(ev.start), day))
        .sort((a, b) => {
          // All-day events first, then sort by start time
          const aAllDay = isAllDay(a)
          const bAllDay = isAllDay(b)
          if (aAllDay && !bAllDay) return -1
          if (!aAllDay && bAllDay) return 1
          return new Date(a.start).getTime() - new Date(b.start).getTime()
        })
      map.set(key, dayEvents)
    }
    return map
  }, [days, events])

  return (
    <motion.div
      className="flex flex-col flex-1 overflow-y-auto px-4 py-2"
      variants={stagger(0.04)}
      initial="initial"
      animate="animate"
    >
      {days.map((day) => {
        const today = isToday(day)
        const past = isPast(day) && !today
        const dayEvents = eventsByDay.get(day.toDateString()) || []
        const weekday = WEEKDAYS[day.getDay()]

        return (
          <motion.div
            key={day.toDateString()}
            variants={fadeSlideUp}
            transition={ease.normal}
            className="flex gap-4 py-3"
            style={{
              borderBottom: '1px solid var(--border)',
              opacity: past ? 0.5 : 1,
            }}
          >
            {/* Left: day number + weekday */}
            <div
              className="flex flex-col items-center flex-shrink-0"
              style={{ width: 48 }}
            >
              <span
                className="text-2xl font-bold leading-none"
                style={{
                  color: today ? 'var(--accent)' : 'var(--text-primary)',
                }}
              >
                {day.getDate()}
              </span>
              <span
                className="text-xs mt-0.5"
                style={{
                  color: today ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {weekday}
              </span>
            </div>

            {/* Right: event list */}
            <div className="flex flex-col flex-1 gap-1 min-w-0">
              {dayEvents.length === 0 ? (
                <div
                  className="text-sm py-1"
                  style={{ color: 'var(--text-faint)' }}
                >
                  No tasks
                </div>
              ) : (
                dayEvents.map((ev) => {
                  const allDay = isAllDay(ev)
                  const startDate = new Date(ev.start)

                  return (
                    <button
                      key={ev.id}
                      type="button"
                      className="flex items-center gap-2 py-1.5 px-1 rounded-md text-left cursor-pointer transition-colors duration-75 w-full"
                      style={{ border: 'none', background: 'none' }}
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent('laif:detail-task', {
                            detail: { taskId: ev.id },
                          })
                        )
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      {/* Time label */}
                      <span
                        className="text-xs flex-shrink-0 w-16 text-right"
                        style={{
                          color: 'var(--text-faint)',
                          fontSize: 12,
                        }}
                      >
                        {allDay ? 'All Day' : formatTime(startDate)}
                      </span>

                      {/* Colored dot */}
                      <span
                        className="flex-shrink-0 rounded-full"
                        style={{
                          width: 6,
                          height: 6,
                          backgroundColor: ev.color,
                        }}
                      />

                      {/* Event title */}
                      <span
                        className="text-sm truncate"
                        style={{
                          color: 'var(--text-primary)',
                          fontSize: 14,
                        }}
                      >
                        {ev.title}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
