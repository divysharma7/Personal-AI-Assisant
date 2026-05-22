import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'

type LeanDoc = Record<string, unknown> & { _id: unknown }

/**
 * GET /api/calendar/overdue
 *
 * Returns tasks where scheduledStart is before today and status is not done or dropped.
 */
export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tasks = (await TaskModel.find({
    scheduledStart: { $lt: today, $ne: null },
    status: { $nin: ['done', 'dropped'] },
    isHabit: { $ne: true },
  })
    .sort({ scheduledStart: 1 })
    .lean()) as LeanDoc[]

  const result = tasks.map((t) => ({
    ...t,
    _id: String(t._id),
    type: 'task',
  }))

  return NextResponse.json(result)
}
