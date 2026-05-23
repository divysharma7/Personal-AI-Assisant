import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'
import { handleApiError } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

/**
 * PATCH /api/tasks/[id]/unschedule
 *
 * Clears scheduledStart and scheduledEnd without deleting the task.
 */
export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const task = await TaskModel.findById(params.id).lean() as LeanDoc | null
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const updated = await TaskModel.findByIdAndUpdate(
      params.id,
      { $set: { scheduledStart: null, scheduledEnd: null } },
      { new: true },
    ).lean() as LeanDoc | null

    if (!updated) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ ...updated, _id: String(updated._id), type: 'task' })
  } catch (err) {
    return handleApiError(err)
  }
}
