import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getAuthUserId } from '@/lib/auth'
import EventModel from '@/lib/models/Event'
import { scheduleNotification } from '@/lib/posthook'
import { handleApiError } from '@/lib/apiHelpers'
import { CreateEventSchema, parseBody } from '@/lib/validation'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const events = await EventModel.find({ userId }).sort({ startDate: 1 }).lean() as LeanDoc[]
    return NextResponse.json(events.map(e => ({ ...e, _id: String(e._id), type: 'event' })))
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
    const parsed = parseBody(CreateEventSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
    const event = await EventModel.create({ ...parsed.data, userId })
    const plain = event.toObject() as LeanDoc

    const minutesBefore = typeof parsed.data.notifyBefore === 'number' ? parsed.data.notifyBefore : null
    if (plain.startDate && minutesBefore !== null) {
      const hook = await scheduleNotification({
        id:            String(plain._id),
        type:          'event',
        fireAt:        new Date(plain.startDate as string),
        minutesBefore,
      }).catch(err => { console.error('[posthook] schedule error:', err); return null })

      // Store hook ID so it can be cancelled before re-scheduling
      if (hook?.id) {
        await EventModel.findByIdAndUpdate(plain._id, { posthookId: hook.id })
      }
    }

    return NextResponse.json({ ...plain, _id: String(plain._id), type: 'event' }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
