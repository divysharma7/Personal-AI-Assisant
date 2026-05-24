import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'
import { getAuthUserId } from '@/lib/auth'
import { handleApiError } from '@/lib/apiHelpers'
import { TaskReparentSchema, parseBody } from '@/lib/validation'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = parseBody(TaskReparentSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
    const newParentId: string | null = parsed.data.parentId ?? null

    const task = await TaskModel.findOne({ _id: params.id, userId }).lean() as LeanDoc | null
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Prevent reparenting to self
    if (newParentId === params.id) {
      return NextResponse.json(
        { error: 'Cannot reparent a task to itself' },
        { status: 400 }
      )
    }

    let newDepth = 0
    let newPath = '/'

    if (newParentId) {
      const newParent = await TaskModel.findOne({ _id: newParentId, userId }).lean() as LeanDoc | null
      if (!newParent) {
        return NextResponse.json(
          { error: 'New parent task not found' },
          { status: 404 }
        )
      }

      // Prevent circular reparenting (new parent is a descendant of this task)
      const taskPath = (task.path as string) ?? '/'
      const parentPath = (newParent.path as string) ?? '/'
      if (parentPath.includes(params.id)) {
        return NextResponse.json(
          { error: 'Cannot reparent to a descendant task' },
          { status: 400 }
        )
      }

      newDepth = ((newParent.depth as number) ?? 0) + 1
      const parentPathStr = parentPath === '/' ? '' : parentPath
      newPath = `${parentPathStr}/${String(newParent._id)}`
    }

    // Get the max order among new siblings to append at the end
    const lastSibling = await TaskModel.findOne({ parentId: newParentId, userId })
      .sort({ order: -1 })
      .lean() as LeanDoc | null
    const newOrder = lastSibling ? ((lastSibling.order as number) ?? 0) + 1 : 0

    const updated = await TaskModel.findOneAndUpdate(
      { _id: params.id, userId },
      { parentId: newParentId, depth: newDepth, path: newPath, order: newOrder },
      { new: true }
    ).lean() as LeanDoc | null

    if (!updated) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ ...updated, _id: String(updated._id), type: 'task' })
  } catch (err) {
    return handleApiError(err)
  }
}
