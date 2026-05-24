import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getAuthUserId } from '@/lib/auth'
import ReminderModel from '@/lib/models/Reminder'
import { scheduleNotification } from '@/lib/posthook'
import { handleApiError } from '@/lib/apiHelpers'
import { CreateReminderSchema, parseBody } from '@/lib/validation'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const reminders = await ReminderModel.find({ userId }).sort({ reminderDate: 1 }).lean() as LeanDoc[]
    return NextResponse.json(reminders.map(r => ({ ...r, _id: String(r._id), type: 'reminder' })))
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const body = await req.json()
    const parsed = parseBody(CreateReminderSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
    const reminder = await ReminderModel.create({ ...parsed.data, userId })
    const plain = reminder.toObject() as LeanDoc

    if (plain.reminderDate) {
      const hook = await scheduleNotification({
        id:     String(plain._id),
        type:   'reminder',
        fireAt: new Date(plain.reminderDate as string),
      }).catch(err => { console.error('[posthook] schedule error:', err); return null })

      if (hook?.id) {
        await ReminderModel.findByIdAndUpdate(plain._id, { posthookId: hook.id })
      }
    }

    return NextResponse.json({ ...plain, _id: String(plain._id), type: 'reminder' }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
