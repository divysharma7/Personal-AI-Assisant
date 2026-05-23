import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'
import TaskModel from '@/lib/models/Task'
import FocusSessionModel from '@/lib/models/FocusSession'
import ExternalCalendarEventModel from '@/lib/models/ExternalCalendarEvent'
import { handleApiError } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

interface CalendarEvent {
  id: string
  source: 'task' | 'habit' | 'google' | 'focus_session'
  title: string
  start: string
  end: string
  allDay: boolean
  color: string
  isReadOnly: boolean
  metadata: Record<string, unknown>
}

function computeColor(
  source: 'task' | 'habit' | 'google' | 'focus_session',
  doc: LeanDoc,
  colorCodingMode: string,
): string {
  if (source === 'google') return '#4285f4'
  if (source === 'focus_session') return '#8b5cf6'
  if (source === 'habit') return (doc.habitColor as string) || '#f59e0b'

  // Tasks: color based on mode
  if (colorCodingMode === 'priority') {
    const priority = doc.priority as string
    if (priority === 'high') return '#ef4444'
    if (priority === 'medium') return '#f59e0b'
    return '#22c55e'
  }
  if (colorCodingMode === 'label') {
    return (doc.color as string) || '#34d399'
  }
  // 'list' mode — use the task's color
  return (doc.color as string) || '#34d399'
}

/**
 * GET /api/calendar/events?from=ISO&to=ISO&include=tasks,habits,google,focus
 *
 * Returns a unified array of calendar events within the date range.
 */
export async function GET(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    if (!fromParam || !toParam) {
      return NextResponse.json(
        { error: 'Both "from" and "to" query parameters are required (ISO date strings).' },
        { status: 400 },
      )
    }

    const from = new Date(fromParam)
    const to = new Date(toParam)

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return NextResponse.json({ error: 'Invalid date format.' }, { status: 400 })
    }

    const includeParam = searchParams.get('include') || 'tasks,habits,google,focus'
    const include = includeParam.split(',').map((s) => s.trim())

    await connectDB()

    const user = await UserModel.findById(userId).lean() as LeanDoc | null
    const colorCodingMode = ((user?.calendarPreferences as Record<string, unknown>)?.colorCodingMode as string) || 'list'

    const events: CalendarEvent[] = []

    // Tasks (non-habit) with scheduledStart in range
    if (include.includes('tasks')) {
      const tasks = (await TaskModel.find({
        scheduledStart: { $gte: from, $lte: to },
        isHabit: { $ne: true },
      })
        .sort({ scheduledStart: 1 })
        .lean()) as LeanDoc[]

      for (const t of tasks) {
        const start = t.scheduledStart as Date
        const end = (t.scheduledEnd as Date) || new Date(start.getTime() + (((t.estimatedEffort as number) || 1) * 60 * 60 * 1000))
        events.push({
          id: String(t._id),
          source: 'task',
          title: (t.title as string) || '',
          start: start.toISOString(),
          end: end.toISOString(),
          allDay: false,
          color: computeColor('task', t, colorCodingMode),
          isReadOnly: false,
          metadata: {
            status: t.status,
            priority: t.priority,
            listId: t.listId,
            estimatedEffort: t.estimatedEffort,
            googleEventId: t.googleEventId,
          },
        })
      }
    }

    // Habits with due in range
    if (include.includes('habits')) {
      const habits = (await TaskModel.find({
        isHabit: true,
      }).lean()) as LeanDoc[]

      for (const h of habits) {
        const freq = h.habitFrequency as Record<string, unknown> | null
        if (!freq) continue

        // Generate occurrences within the range
        const current = new Date(from)
        current.setHours(0, 0, 0, 0)
        const endDate = new Date(to)
        endDate.setHours(23, 59, 59, 999)

        while (current <= endDate) {
          let shouldInclude = false
          const dayOfWeek = current.getDay()

          if (freq.type === 'daily') {
            const daysOfWeek = freq.daysOfWeek as number[] | undefined
            shouldInclude = !daysOfWeek || daysOfWeek.includes(dayOfWeek)
          } else if (freq.type === 'interval') {
            const everyDays = (freq.everyDays as number) || 1
            const createdAt = h.createdAt ? new Date(h.createdAt as string) : new Date()
            const diffDays = Math.floor((current.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
            shouldInclude = diffDays >= 0 && diffDays % everyDays === 0
          } else if (freq.type === 'weekly') {
            // Weekly habits: show on their reminder day or default Monday
            shouldInclude = dayOfWeek === 1
          }

          if (shouldInclude) {
            const dateStr = current.toISOString().slice(0, 10)
            events.push({
              id: `${String(h._id)}_${dateStr}`,
              source: 'habit',
              title: (h.title as string) || '',
              start: current.toISOString(),
              end: new Date(current.getTime() + 30 * 60 * 1000).toISOString(),
              allDay: false,
              color: computeColor('habit', h, colorCodingMode),
              isReadOnly: true,
              metadata: {
                habitId: String(h._id),
                habitGoalType: h.habitGoalType,
                habitTarget: h.habitTarget,
                habitIcon: h.habitIcon,
                date: dateStr,
              },
            })
          }

          current.setDate(current.getDate() + 1)
        }
      }
    }

    // Google Calendar events
    if (include.includes('google')) {
      const googleEvents = (await ExternalCalendarEventModel.find({
        userId: userId,
        start: { $lte: to },
        end: { $gte: from },
      })
        .sort({ start: 1 })
        .lean()) as LeanDoc[]

      for (const g of googleEvents) {
        events.push({
          id: String(g._id),
          source: 'google',
          title: (g.title as string) || '',
          start: (g.start as Date).toISOString(),
          end: (g.end as Date).toISOString(),
          allDay: (g.allDay as boolean) || false,
          color: computeColor('google', g, colorCodingMode),
          isReadOnly: true,
          metadata: {
            externalId: g.externalId,
            calendarId: g.calendarId,
            source: g.source,
          },
        })
      }
    }

    // Focus sessions
    if (include.includes('focus')) {
      const sessions = (await FocusSessionModel.find({
        userId: userId,
        startedAt: { $gte: from, $lte: to },
        status: 'completed',
      })
        .sort({ startedAt: 1 })
        .lean()) as LeanDoc[]

      for (const s of sessions) {
        const startedAt = s.startedAt as Date
        const durationMs = ((s.actualDurationMin as number) || 25) * 60 * 1000
        events.push({
          id: String(s._id),
          source: 'focus_session',
          title: (s.taskTitleSnapshot as string) || 'Focus session',
          start: startedAt.toISOString(),
          end: new Date(startedAt.getTime() + durationMs).toISOString(),
          allDay: false,
          color: computeColor('focus_session', s, colorCodingMode),
          isReadOnly: true,
          metadata: {
            taskId: s.taskId,
            actualDurationMin: s.actualDurationMin,
            plannedDurationMin: s.plannedDurationMin,
          },
        })
      }
    }

    // Sort all events by start ascending
    events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

    return NextResponse.json(events)
  } catch (err) {
    return handleApiError(err)
  }
}
