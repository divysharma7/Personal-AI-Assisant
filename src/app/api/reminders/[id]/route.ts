import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getAuthUserId } from '@/lib/auth'
import ReminderModel from '@/lib/models/Reminder'
import { handleApiError } from '@/lib/apiHelpers'
import { UpdateReminderSchema, parseBody } from '@/lib/validation'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const body = await req.json()
    const parsed = parseBody(UpdateReminderSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
    const reminder = await ReminderModel.findOneAndUpdate(
      { _id: params.id, userId },
      parsed.data,
      { new: true },
    ).lean() as LeanDoc | null
    if (!reminder) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ...reminder, _id: String(reminder._id), type: 'reminder' })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    await ReminderModel.findOneAndDelete({ _id: params.id, userId })
    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
