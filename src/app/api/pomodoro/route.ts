import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import PomodoroSession from '@/lib/models/PomodoroSession'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET(req: Request) {
  await connectDB()

  const { searchParams } = new URL(req.url)
  const since = searchParams.get('since')
  const limit = parseInt(searchParams.get('limit') ?? '100', 10)

  // Default: last 7 days
  const sinceDate = since
    ? new Date(since)
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const sessions = await PomodoroSession
    .find({ startedAt: { $gte: sinceDate } })
    .sort({ startedAt: -1 })
    .limit(limit)
    .lean() as LeanDoc[]

  return NextResponse.json(
    sessions.map(s => ({ ...s, _id: String(s._id) }))
  )
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const session = await PomodoroSession.create(body)
  const plain = session.toObject() as LeanDoc
  return NextResponse.json({ ...plain, _id: String(plain._id) }, { status: 201 })
}
