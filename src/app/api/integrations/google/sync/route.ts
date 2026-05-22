import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { taskId } = await req.json()

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
    }

    await connectDB()
    const user = await UserModel.findById(userId).lean() as LeanDoc | null
    if (!user || !user.googleCalendarConnected) {
      return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 400 })
    }

    const task = await TaskModel.findById(taskId).lean() as LeanDoc | null
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const client = getAuthenticatedClient({
      googleAccessToken: user.googleAccessToken as string | null,
      googleRefreshToken: user.googleRefreshToken as string | null,
    })

    const calendarId = (user.googleCalendarId as string) || 'primary'

    const taskData = {
      title: task.title as string,
      description: (task.description as string) || '',
      scheduledStart: task.scheduledStart as Date | null,
      scheduledEnd: task.scheduledEnd as Date | null,
      dueDate: task.dueDate as Date | null,
    }

    let eventId: string | null

    if (task.googleEventId) {
      await updateCalendarEvent(client, task.googleEventId as string, taskData, calendarId)
      eventId = task.googleEventId as string
    } else {
      eventId = await createCalendarEvent(client, taskData, calendarId)
    }

    if (eventId) {
      await TaskModel.findByIdAndUpdate(taskId, {
        googleEventId: eventId,
        calendarSynced: true,
      })
    }

    return NextResponse.json({ success: true, eventId })
  } catch {
    return NextResponse.json({ error: 'Failed to sync to Google Calendar' }, { status: 500 })
  }
}
