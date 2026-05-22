import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'
import { getAuthUserId } from '@/lib/auth'
import { apiError, api404, api500 } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body?.taskId) return apiError('taskId is required')
    if (typeof body.kanbanOrder !== 'number') return apiError('kanbanOrder must be a number')

    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return apiError('Unauthorized', 401)

    const update: Record<string, unknown> = {
      kanbanOrder: body.kanbanOrder,
    }

    if ('sectionId' in body) update.sectionId = body.sectionId ?? null
    if ('status' in body) update.status = body.status
    if ('dueDate' in body) update.dueDate = body.dueDate ?? null

    const task = await TaskModel.findByIdAndUpdate(
      body.taskId,
      { $set: update },
      { new: true }
    ).lean() as LeanDoc | null

    if (!task) return api404('Task')
    return NextResponse.json({ ...task, _id: String(task._id), type: 'task' })
  } catch (err) {
    return api500(err)
  }
}
