import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getAuthUserId } from '@/lib/auth'
import EventModel from '@/lib/models/Event'
import { scheduleNotification, cancelNotification } from '@/lib/posthook'
import { handleApiError } from '@/lib/apiHelpers'
import { EventRemindSchema, parseBody } from '@/lib/validation'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()

    const body = await req.json()
    const parsed = parseBody(EventRemindSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
    const minutesBefore = parsed.data.minutesBefore ?? 15

    const event = await EventModel.findOne({ _id: params.id, userId }).lean() as Record<string, unknown> & { _id: unknown, posthookId?: string } | null
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const startDate = new Date(event.startDate as string)
    const fireAt    = new Date(startDate.getTime() - minutesBefore * 60 * 1000)

    if (fireAt <= new Date()) {
      return NextResponse.json({ error: 'Reminder time is already in the past' }, { status: 400 })
    }

    // Cancel existing hook before scheduling a new one — prevents duplicate notifications
    if (event.posthookId) {
      await cancelNotification(event.posthookId)
    }

    const hook = await scheduleNotification({ id: params.id, type: 'event', fireAt: startDate, minutesBefore })

    // Store new hook ID
    await EventModel.findByIdAndUpdate(params.id, { posthookId: hook?.id ?? null })

    return NextResponse.json({ ok: true, fireAt: fireAt.toISOString() })
  } catch (err) {
    return handleApiError(err)
  }
}
