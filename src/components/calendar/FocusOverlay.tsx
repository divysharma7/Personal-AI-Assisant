'use client'

import { useState } from 'react'
import { useFocusHistory, type FocusSession } from '@/hooks/useFocus'
import { isSameDay } from './calendarUtils'

interface FocusOverlayProps {
  /** Whether the user has enabled focus sessions overlay */
  showFocusSessionsOnCalendar: boolean
  /** The date to filter sessions for */
  date: Date
}

/**
 * Renders completed focus sessions as thin gray bars (8px height) in past days.
 * Read-only, no drag. Hover shows duration + task title.
 * Purpose: retrospective comparison (planned vs actual).
 */
export default function FocusOverlay({
  showFocusSessionsOnCalendar,
  date,
}: FocusOverlayProps) {
  const { sessions } = useFocusHistory({
    from: new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString(),
    to: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString(),
  })

  if (!showFocusSessionsOnCalendar) return null

  // Only show completed sessions in past days
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dateStart = new Date(date)
  dateStart.setHours(0, 0, 0, 0)
  const isPastDay = dateStart.getTime() < today.getTime()

  const completedSessions = sessions.filter(
    (s) =>
      s.status === 'completed' &&
      s.startedAt &&
      isSameDay(new Date(s.startedAt), date)
  )

  if (!isPastDay || completedSessions.length === 0) return null

  return (
    <>
      {completedSessions.map((session) => (
        <FocusBar key={session._id} session={session} />
      ))}
    </>
  )
}

function FocusBar({ session }: { session: FocusSession }) {
  const [isHovered, setIsHovered] = useState(false)

  const startDate = new Date(session.startedAt)
  const durationMin = session.actualDurationMin || session.plannedDurationMin
  const startRow = startDate.getHours() * 4 + Math.floor(startDate.getMinutes() / 15)

  // Each slot = 16px (minimum), compute top offset
  const topPx = startRow * 16
  const spanSlots = Math.max(1, Math.ceil(durationMin / 15))

  const formatDuration = (min: number) => {
    const h = Math.floor(min / 60)
    const m = min % 60
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
  }

  return (
    <div
      className="absolute left-1 right-1 z-[3] rounded-sm cursor-default"
      style={{
        top: `${topPx}px`,
        height: '8px',
        backgroundColor: 'var(--text-faint)',
        opacity: 0.3,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover tooltip */}
      {isHovered && (
        <div
          className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs shadow-lg"
          style={{
            backgroundColor: 'var(--bg-pane-2)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          <span className="font-medium">{formatDuration(durationMin)}</span>
          {session.taskTitleSnapshot && (
            <span style={{ color: 'var(--text-muted)' }}>
              {' '}
              — {session.taskTitleSnapshot}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
