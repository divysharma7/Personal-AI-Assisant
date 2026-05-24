import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getAuthUserId } from '@/lib/auth'
import ReminderModel from '@/lib/models/Reminder'
import { scheduleNotification, cancelNotification } from '@/lib/posthook'
import { handleApiError } from '@/lib/apiHelpers'
import { ReminderSnoozeSchema, parseBody } from '@/lib/validation'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()

    const body = await req.json()
    const parsed = parseBody(ReminderSnoozeSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const newTime = new Date(Date.now() + parsed.data.snoozeMinutes * 60 * 1000)

    // Fetch first to get existing posthookId
    const existing = await ReminderModel.findOne({ _id: params.id, userId }).lean() as Record<string, unknown> & { _id: unknown, posthookId?: string } | null
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Cancel old hook before scheduling a new one
    if (existing.posthookId) await cancelNotification(existing.posthookId)

    const hook = await scheduleNotification({ id: params.id, type: 'reminder', fireAt: newTime })

    const reminder = await ReminderModel.findByIdAndUpdate(
      params.id,
      { reminderDate: newTime.toISOString(), notified: false, posthookId: hook?.id ?? null },
      { new: true }
    ).lean() as Record<string, unknown> & { _id: unknown } | null

    return NextResponse.json({ ...reminder, _id: String(reminder!._id), type: 'reminder' })
  } catch (err) {
    return handleApiError(err)
  }
}
