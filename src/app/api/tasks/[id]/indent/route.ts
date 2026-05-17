import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'

type LeanDoc = Record<string, unknown> & { _id: unknown }

/**
 * PATCH /api/tasks/[id]/indent
 *
 * Makes this task a child of the task directly above it
 * (same parentId, lower order).
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

  // Find the sibling directly above (same parent, lower order, closest)
  const sibling = await TaskModel.findOne({
    parentId: task.parentId ?? null,
    order: { $lt: task.order ?? 0 },
  })
    .sort({ order: -1 })
    .lean() as LeanDoc | null

  if (!sibling) {
    return NextResponse.json(
      { error: 'No sibling above to indent under' },
      { status: 400 }
    )
  }

  const newParentId = sibling._id
  const newDepth = ((sibling.depth as number) ?? 0) + 1
  const siblingPath = (sibling.path as string) ?? '/'
  const newPath = siblingPath === '/'
    ? `/${String(sibling._id)}`
    : `${siblingPath}/${String(sibling._id)}`

  // Get the max order among children of the new parent to append at the end
  const lastChild = await TaskModel.findOne({ parentId: newParentId })
    .sort({ order: -1 })
    .lean() as LeanDoc | null
  const newOrder = lastChild ? ((lastChild.order as number) ?? 0) + 1 : 0

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
