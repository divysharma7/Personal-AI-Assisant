import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getAuthUserId } from '@/lib/auth'
import ReminderModel from '@/lib/models/Reminder'
import { addComment } from '@/lib/addComment'
import { handleApiError } from '@/lib/apiHelpers'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const reminder = await ReminderModel.findOne({ _id: params.id, userId }).lean()
    if (!reminder) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { text } = await req.json()
    return addComment(ReminderModel, params.id, text)
  } catch (err) {
    return handleApiError(err)
  }
}
