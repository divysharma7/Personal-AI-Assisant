import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'
import TaskModel from '@/lib/models/Task'
import {
  getAuthenticatedClient,
  createCalendarEvent,
  updateCalendarEvent,
} from '@/lib/google-calendar'
import { handleApiError } from '@/lib/apiHelpers'
import { TaskScheduleSchema, parseBody } from '@/lib/validation'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = parseBody(TaskScheduleSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
    const { scheduledStart, scheduledEnd } = parsed.data

    await connectDB()

    const task = await TaskModel.findOne({ _id: params.id, userId }).lean() as LeanDoc | null
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const update: Record<string, unknown> = {
      scheduledStart: new Date(scheduledStart),
      scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
    }

    if ((task.status as string) === 'backlog') {
      update.status = 'todo'
    }

    const updated = await TaskModel.findOneAndUpdate(
      { _id: params.id, userId },
      { $set: update },
      { new: true },
    ).lean() as LeanDoc | null

    if (!updated) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    try {
      const user = await UserModel.findById(userId).lean() as LeanDoc | null
      if (user && user.googleCalendarConnected) {
        const client = getAuthenticatedClient({
          googleAccessToken: user.googleAccessToken as string | null,
          googleRefreshToken: user.googleRefreshToken as string | null,
        })
        const calendarId = (user.googleCalendarId as string) || 'primary'
        const taskData = {
          title: updated.title as string,
          description: (updated.description as string) || '',
          scheduledStart: updated.scheduledStart as Date | null,
          scheduledEnd: updated.scheduledEnd as Date | null,
          dueDate: updated.dueDate as Date | null,
        }

        if (updated.googleEventId) {
          await updateCalendarEvent(client, updated.googleEventId as string, taskData, calendarId)
        } else {
          const eventId = await createCalendarEvent(client, taskData, calendarId)
          if (eventId) {
            await TaskModel.findOneAndUpdate(
              { _id: params.id, userId },
              { $set: { googleEventId: eventId, calendarSynced: true } },
            )
          }
        }
      }
    } catch {
      // Google Calendar sync failure is non-blocking
    }

    return NextResponse.json({ ...updated, _id: String(updated._id), type: 'task' })
  } catch (err) {
    return handleApiError(err)
  }
}
