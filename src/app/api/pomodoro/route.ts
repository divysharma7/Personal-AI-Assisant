import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getAuthUserId } from '@/lib/auth'
import PomodoroSession from '@/lib/models/PomodoroSession'
import { handleApiError } from '@/lib/apiHelpers'
import { CreatePomodoroSchema, parseBody } from '@/lib/validation'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()

    const { searchParams } = new URL(req.url)
    const since = searchParams.get('since')
    const limit = parseInt(searchParams.get('limit') ?? '100', 10)

    const sinceDate = since
      ? new Date(since)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const sessions = await PomodoroSession
      .find({ userId, startedAt: { $gte: sinceDate } })
      .sort({ startedAt: -1 })
      .limit(limit)
      .lean() as LeanDoc[]

    return NextResponse.json(
      sessions.map(s => ({ ...s, _id: String(s._id) }))
    )
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
    const parsed = parseBody(CreatePomodoroSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
    const session = await PomodoroSession.create({ ...parsed.data, userId })
    const plain = session.toObject() as LeanDoc
    return NextResponse.json({ ...plain, _id: String(plain._id) }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
