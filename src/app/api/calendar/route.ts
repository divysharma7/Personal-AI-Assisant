import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getAuthUserId } from '@/lib/auth'
import EventModel from '@/lib/models/Event'
import TaskModel from '@/lib/models/Task'
import ReminderModel from '@/lib/models/Reminder'
import { handleApiError } from '@/lib/apiHelpers'

interface CalendarItem {
  id: string
  type: 'event' | 'task' | 'reminder'
  title: string
  start: string
  end: string | null
  color: string
  completed: boolean
  priority: string | null
  sourceId: string
}

type LeanDoc = Record<string, unknown> & { _id: unknown }

/**
 * GET /api/calendar?start=<ISO>&end=<ISO>&view=<week|month>
 *
 * Returns a unified list of events, tasks (with dueDate), and reminders
 * within the given date range, sorted by start ascending.
 */
export async function GET(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const startParam = searchParams.get('start')
    const endParam = searchParams.get('end')

    if (!startParam || !endParam) {
      return NextResponse.json(
        { error: 'Both "start" and "end" query parameters are required (ISO date strings).' },
        { status: 400 }
      )
    }

    const start = new Date(startParam)
    const end = new Date(endParam)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO 8601 date strings.' },
        { status: 400 }
      )
    }

    await connectDB()

    // Fetch events where startDate overlaps [start, end]
    const events = await EventModel.find({
      userId,
      startDate: { $lte: end },
      endDate: { $gte: start },
    })
      .sort({ startDate: 1 })
      .lean() as LeanDoc[]

    // Fetch tasks with dueDate within [start, end]
    const tasks = await TaskModel.find({
      userId,
      dueDate: { $gte: start, $lte: end },
    })
      .sort({ dueDate: 1 })
      .lean() as LeanDoc[]

    // Fetch reminders where reminderDate within [start, end]
    const reminders = await ReminderModel.find({
      userId,
      reminderDate: { $gte: start, $lte: end },
    })
      .sort({ reminderDate: 1 })
      .lean() as LeanDoc[]

    // Map to unified shape
    const items: CalendarItem[] = []

    for (const e of events) {
      items.push({
        id: String(e._id),
        type: 'event',
        title: (e.title as string) ?? '',
        start: (e.startDate as Date).toISOString(),
        end: e.endDate ? (e.endDate as Date).toISOString() : null,
        color: (e.color as string) ?? '#5b8ded',
        completed: false,
        priority: null,
        sourceId: String(e._id),
      })
    }

    for (const t of tasks) {
      items.push({
        id: String(t._id),
        type: 'task',
        title: (t.title as string) ?? '',
        start: (t.dueDate as Date).toISOString(),
        end: null,
        color: (t.color as string) ?? '#34d399',
        completed: (t.status as string) === 'done',
        priority: (t.priority as string) ?? 'medium',
        sourceId: String(t._id),
      })
    }

    for (const r of reminders) {
      items.push({
        id: String(r._id),
        type: 'reminder',
        title: (r.title as string) ?? '',
        start: (r.reminderDate as Date).toISOString(),
        end: null,
        color: (r.color as string) ?? '#fbbf24',
        completed: (r.notified as boolean) ?? false,
        priority: null,
        sourceId: String(r._id),
      })
    }

    // Sort all items by start ascending
    items.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

    return NextResponse.json(items)
  } catch (err) {
    return handleApiError(err)
  }
}
