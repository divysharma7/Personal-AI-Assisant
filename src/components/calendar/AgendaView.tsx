import { useMemo } from 'react'
import { hexToRgba } from '@/lib/colorUtils'
import type { CalendarEvent } from './types'

interface AgendaViewProps {
  date: Date
  events: CalendarEvent[]
}

interface AgendaDay {
  date: Date
  events: CalendarEvent[]
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function timeLabel(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function groupEvents(events: CalendarEvent[], date: Date): AgendaDay[] {
  const rangeStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const rangeEnd = new Date(rangeStart)
  rangeEnd.setDate(rangeEnd.getDate() + 62)
  const groups = new Map<string, AgendaDay>()

  for (const event of events) {
    if (!event.start || event.isHabit) continue
    const eventDate = new Date(event.start)
    if (eventDate < rangeStart || eventDate >= rangeEnd) continue
    const key = dayKey(eventDate)
    const current = groups.get(key) ?? {
      date: new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()),
      events: [],
    }
    current.events.push(event)
    groups.set(key, current)
  }

  return Array.from(groups.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((group) => ({
      ...group,
      events: group.events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    }))
}

export default function AgendaView({ date, events }: AgendaViewProps) {
  const days = useMemo(() => groupEvents(events, date), [events, date])

  return (
    <div className="calendar-agenda-view flex flex-1 overflow-y-auto">
      <div className="calendar-agenda-content">
        {days.map((day) => (
          <section className="calendar-agenda-day" key={dayKey(day.date)}>
            <header className="calendar-agenda-day__date">
              <strong>{day.date.getDate()}</strong>
              <span>{day.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            </header>

            <div className="calendar-agenda-day__events">
              {day.events.map((event, index) => {
                const start = new Date(event.start)
                const end = new Date(event.end)
                return (
                  <div className="calendar-agenda-row" key={event.id}>
                    <time>{timeLabel(start)}</time>
                    <div className="calendar-agenda-row__rail" data-last={index === day.events.length - 1}>
                      <span style={{ borderColor: event.color }} />
                    </div>
                    <button
                      className="calendar-agenda-card"
                      style={{
                        borderLeftColor: event.color,
                        background: hexToRgba(event.color, 0.17),
                      }}
                      onClick={() => window.dispatchEvent(new CustomEvent('laif:detail-task', { detail: { taskId: event.id } }))}
                    >
                      <span className="calendar-agenda-card__time">{timeLabel(start)} – {timeLabel(end)}</span>
                      <strong>{event.title}</strong>
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        {days.length === 0 && (
          <div className="calendar-agenda-empty">
            <strong>No events in this period</strong>
            <span>Use the plus button to schedule the first item.</span>
          </div>
        )}
      </div>
    </div>
  )
}
