import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getAuthUserId } from '@/lib/auth'
import PomodoroSession from '@/lib/models/PomodoroSession'
import { handleApiError } from '@/lib/apiHelpers'
import { UpdatePomodoroSchema, parseBody } from '@/lib/validation'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const body = await req.json()
    const parsed = parseBody(UpdatePomodoroSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
    const session = await PomodoroSession.findOneAndUpdate(
      { _id: params.id, userId },
      parsed.data,
      { new: true }
    ).lean() as LeanDoc | null

    if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ...session, _id: String(session._id) })
  } catch (err) {
    return handleApiError(err)
  }
}
