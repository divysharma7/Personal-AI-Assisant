import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'

type LeanDoc = Record<string, unknown> & { _id: unknown }

/**
 * PATCH /api/tasks/[id]/outdent
 *
 * Promotes a task one level up — sets parentId to grandparent.
 * Decrements depth, updates path.
 */
export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB()

  const task = await TaskModel.findById(params.id).lean() as LeanDoc | null
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
  const parent = await TaskModel.findById(task.parentId).lean() as LeanDoc | null
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
  const lastSibling = await TaskModel.findOne({ parentId: newParentId })
    .sort({ order: -1 })
    .lean() as LeanDoc | null
  const newOrder = lastSibling ? ((lastSibling.order as number) ?? 0) + 1 : 0

  const updated = await TaskModel.findByIdAndUpdate(
    params.id,
    { parentId: newParentId, depth: newDepth, path: newPath, order: newOrder },
    { new: true }
  ).lean() as LeanDoc | null

  if (!updated) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ ...updated, _id: String(updated._id), type: 'task' })
}
