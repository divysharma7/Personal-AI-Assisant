import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getAuthUserId } from '@/lib/auth'
import TaskModel from '@/lib/models/Task'
import { UpdateTaskSchema, parseBody } from '@/lib/validation'
import { handleApiError } from '@/lib/apiHelpers'
import { NotFoundError, ValidationError } from '@/lib/errors'

type LeanDoc = Record<string, unknown> & { _id: unknown }

interface ActivityEntry {
  action: string
  detail: string
  timestamp: Date
}

function buildActivities(oldDoc: LeanDoc, updates: Record<string, unknown>): ActivityEntry[] {
  const activities: ActivityEntry[] = []
  const now = new Date()

  if (updates.title !== undefined && updates.title !== oldDoc.title) {
    activities.push({ action: 'title_changed', detail: `Title changed to "${updates.title}"`, timestamp: now })
  }

  if (updates.status !== undefined && updates.status !== oldDoc.status) {
    if (updates.status === 'done') {
      activities.push({ action: 'completed', detail: 'Task completed', timestamp: now })
    } else if (oldDoc.status === 'done') {
      activities.push({ action: 'reopened', detail: 'Task reopened', timestamp: now })
    } else {
      activities.push({ action: 'status_changed', detail: `Status changed from ${oldDoc.status} to ${updates.status}`, timestamp: now })
    }
  }

  if (updates.priority !== undefined && updates.priority !== oldDoc.priority) {
    activities.push({ action: 'priority_changed', detail: `Priority changed from ${oldDoc.priority || 'none'} to ${updates.priority}`, timestamp: now })
  }

  if (updates.dueDate !== undefined) {
    const oldDate = oldDoc.dueDate ? new Date(oldDoc.dueDate as string).toISOString() : null
    const newDate = updates.dueDate ? new Date(updates.dueDate as string).toISOString() : null
    if (oldDate !== newDate) {
      if (newDate) {
        const formatted = new Date(newDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        activities.push({ action: 'due_date_changed', detail: `Due date set to ${formatted}`, timestamp: now })
      } else {
        activities.push({ action: 'due_date_changed', detail: 'Due date removed', timestamp: now })
      }
    }
  }

  if (updates.scheduledStart !== undefined) {
    const oldSched = oldDoc.scheduledStart ? String(oldDoc.scheduledStart) : null
    const newSched = updates.scheduledStart ? String(updates.scheduledStart) : null
    if (oldSched !== newSched) {
      if (newSched) {
        activities.push({ action: 'scheduled', detail: 'Task scheduled', timestamp: now })
      } else {
        activities.push({ action: 'unscheduled', detail: 'Task unscheduled', timestamp: now })
      }
    }
  }

  if (updates.sectionId !== undefined && updates.sectionId !== oldDoc.sectionId) {
    activities.push({ action: 'moved_to_section', detail: `Moved to section`, timestamp: now })
  }

  return activities
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const task = await TaskModel.findOne({ _id: params.id, userId }).lean() as LeanDoc | null
    if (!task) throw new NotFoundError('Task', params.id)
    return NextResponse.json({ ...task, _id: String(task._id), type: 'task' })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json().catch(() => null)
    const parsed = parseBody(UpdateTaskSchema, body)
    if (!parsed.success) throw new ValidationError(parsed.error)

    await connectDB()
    const oldTask = await TaskModel.findOne({ _id: params.id, userId }).lean() as LeanDoc | null
    if (!oldTask) throw new NotFoundError('Task', params.id)

    const newActivities = buildActivities(oldTask, parsed.data as Record<string, unknown>)
    const updateOp = newActivities.length > 0
      ? { ...parsed.data, $push: { activities: { $each: newActivities } } }
      : parsed.data
    const task = await TaskModel.findOneAndUpdate({ _id: params.id, userId }, updateOp, { new: true }).lean() as LeanDoc | null
    if (!task) throw new NotFoundError('Task', params.id)
    return NextResponse.json({ ...task, _id: String(task._id), type: 'task' })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json().catch(() => null)
    const parsed = parseBody(UpdateTaskSchema, body)
    if (!parsed.success) throw new ValidationError(parsed.error)

    await connectDB()
    const oldTask = await TaskModel.findOne({ _id: params.id, userId }).lean() as LeanDoc | null
    if (!oldTask) throw new NotFoundError('Task', params.id)

    const newActivities = buildActivities(oldTask, parsed.data as Record<string, unknown>)
    const updateOp = newActivities.length > 0
      ? { $set: parsed.data, $push: { activities: { $each: newActivities } } }
      : { $set: parsed.data }
    const task = await TaskModel.findOneAndUpdate({ _id: params.id, userId }, updateOp, { new: true }).lean() as LeanDoc | null
    if (!task) throw new NotFoundError('Task', params.id)
    return NextResponse.json({ ...task, _id: String(task._id), type: 'task' })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    await TaskModel.findOneAndDelete({ _id: params.id, userId })
    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
