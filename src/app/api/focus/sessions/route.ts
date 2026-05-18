import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import FocusSession from '@/lib/models/FocusSession'
import TaskModel from '@/lib/models/Task'

type LeanDoc = Record<string, unknown> & { _id: unknown }

function serialize(doc: LeanDoc) {
  return { ...doc, _id: String(doc._id) }
}

/**
 * POST /api/focus/sessions — Start a new focus session
 */
export async function POST(req: Request) {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let payload
  try {
    payload = await verifyToken(token)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  // Check no other active session exists for this user
  const existing = await FocusSession.findOne({
    userId: payload.userId,
    status: 'active',
  }).lean() as LeanDoc | null

  if (existing) {
    return NextResponse.json(
      { error: 'An active session already exists', session: serialize(existing) },
      { status: 409 },
    )
  }

  const body = await req.json().catch(() => ({}))
  const {
    taskId = null,
    plannedDurationMin = 25,
    plannedBreakMin = 5,
  } = body as { taskId?: string | null; plannedDurationMin?: number; plannedBreakMin?: number }

  // If taskId provided, snapshot the task title
  let taskTitleSnapshot: string | null = null
  if (taskId) {
    const task = await TaskModel.findById(taskId).lean() as LeanDoc | null
    if (task) {
      taskTitleSnapshot = task.title as string
    }
  }

  const session = await FocusSession.create({
    userId: payload.userId,
    taskId,
    taskTitleSnapshot,
    plannedDurationMin,
    plannedBreakMin,
    startedAt: new Date(),
    status: 'active',
  })

  const plain = session.toObject() as LeanDoc
  return NextResponse.json(serialize(plain), { status: 201 })
}

/**
 * GET /api/focus/sessions — List sessions with optional filters
 * Query: ?from=&to=&taskId=&limit=
 */
export async function GET(req: Request) {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let payload
  try {
    payload = await verifyToken(token)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const taskId = searchParams.get('taskId')
  const limit = parseInt(searchParams.get('limit') ?? '50', 10)

  const filter: Record<string, unknown> = { userId: payload.userId }

  if (from || to) {
    const dateRange: Record<string, Date> = {}
    if (from) dateRange.$gte = new Date(from)
    if (to) dateRange.$lte = new Date(to)
    filter.startedAt = dateRange
  }

  if (taskId) {
    filter.taskId = taskId
  }

  const sessions = await FocusSession
    .find(filter)
    .sort({ startedAt: -1 })
    .limit(limit)
    .lean() as LeanDoc[]

  return NextResponse.json(sessions.map(serialize))
}
