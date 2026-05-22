'use client'

import { useMemo } from 'react'
import {
  startOfWeek,
  isSameDay,
} from './calendarUtils'
import type { CalendarEvent } from './types'
import WeekDayHeader from './week/WeekDayHeader'
import WeekAllDayBar from './week/WeekAllDayBar'
import WeekTimeGrid from './week/WeekTimeGrid'

interface WeekViewProps {
  date: Date
  events: CalendarEvent[]
}

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

export default function WeekView({ date, events }: WeekViewProps) {
  const weekStart = startOfWeek(date)
  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      return d
    }),
    [weekStart]
  )

  const eventsByDay = useMemo(() =>
    weekDays.map((day) =>
      events.filter(
        (ev) => ev.start && isSameDay(new Date(ev.start), day) && !ev.isHabit && !isAllDayEvent(ev)
      )
    ),
    [weekDays, events]
  )

  const allDayByDay = useMemo(() =>
    weekDays.map((day) =>
      events.filter(
        (ev) => ev.start && isSameDay(new Date(ev.start), day) && !ev.isHabit && isAllDayEvent(ev)
      )
    ),
    [weekDays, events]
  )

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <WeekDayHeader weekDays={weekDays} eventsByDay={eventsByDay} />
      <WeekAllDayBar weekDays={weekDays} allDayByDay={allDayByDay} />
      <WeekTimeGrid weekDays={weekDays} eventsByDay={eventsByDay} />
    </div>
  )
}
