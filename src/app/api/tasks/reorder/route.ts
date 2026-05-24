import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'
import { getAuthUserId } from '@/lib/auth'
import { handleApiError } from '@/lib/apiHelpers'
import { TaskReorderSchema, parseBody } from '@/lib/validation'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = parseBody(TaskReorderSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const update: Record<string, unknown> = {
      kanbanOrder: parsed.data.kanbanOrder,
    }

    if (parsed.data.sectionId !== undefined) update.sectionId = parsed.data.sectionId ?? null
    if (parsed.data.status !== undefined) update.status = parsed.data.status
    if (parsed.data.dueDate !== undefined) update.dueDate = parsed.data.dueDate ?? null

    const task = await TaskModel.findOneAndUpdate(
      { _id: parsed.data.taskId, userId },
      { $set: update },
      { new: true }
    ).lean() as LeanDoc | null

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    return NextResponse.json({ ...task, _id: String(task._id), type: 'task' })
  } catch (err) {
    return handleApiError(err)
  }
}
