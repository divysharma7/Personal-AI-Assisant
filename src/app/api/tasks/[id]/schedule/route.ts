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

type LeanDoc = Record<string, unknown> & { _id: unknown }

/**
 * PATCH /api/tasks/[id]/schedule
 *
 * Body: { scheduledStart: ISO, scheduledEnd: ISO }
 * Auto-promotes backlog -> todo. Pushes to Google Calendar if synced.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { scheduledStart, scheduledEnd } = body

  if (!scheduledStart) {
    return NextResponse.json({ error: 'scheduledStart is required' }, { status: 400 })
  }

  await connectDB()

  const task = await TaskModel.findById(params.id).lean() as LeanDoc | null
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  // Build update: set schedule and auto-promote backlog -> todo
  const update: Record<string, unknown> = {
    scheduledStart: new Date(scheduledStart),
    scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
  }

  if ((task.status as string) === 'backlog') {
    update.status = 'todo'
  }

  const updated = await TaskModel.findByIdAndUpdate(
    params.id,
    { $set: update },
    { new: true },
  ).lean() as LeanDoc | null

  if (!updated) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  // Push to Google Calendar if user has it connected
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
          await TaskModel.findByIdAndUpdate(params.id, {
            $set: { googleEventId: eventId, calendarSynced: true },
          })
        }
      }
    }
  } catch {
    // Google Calendar sync failure is non-blocking
  }

  return NextResponse.json({ ...updated, _id: String(updated._id), type: 'task' })
}
