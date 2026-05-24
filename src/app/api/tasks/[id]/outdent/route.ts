import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'
import { getAuthUserId } from '@/lib/auth'
import { handleApiError } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const task = await TaskModel.findOne({ _id: params.id, userId }).lean() as LeanDoc | null
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Cannot outdent a root-level task
    if (!task.parentId) {
      return NextResponse.json(
        { error: 'Task is already at root level' },
        { status: 400 }
      )
    }

    // Find the current parent to get grandparent
    const parent = await TaskModel.findOne({ _id: task.parentId, userId }).lean() as LeanDoc | null
    if (!parent) {
      return NextResponse.json(
        { error: 'Parent task not found' },
        { status: 404 }
      )
    }

    const newParentId = parent.parentId ?? null // grandparent (could be null = root)
    const newDepth = Math.max(0, ((task.depth as number) ?? 1) - 1)

    // Rebuild path: remove the last segment
    const currentPath = (task.path as string) ?? '/'
    const pathSegments = currentPath.split('/').filter(Boolean)
    pathSegments.pop() // remove last ancestor from path
    const newPath = pathSegments.length > 0 ? `/${pathSegments.join('/')}` : '/'

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
