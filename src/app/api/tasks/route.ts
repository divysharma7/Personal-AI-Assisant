import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'
import { getAuthUserId } from '@/lib/auth'
import { CreateTaskSchema, parseBody } from '@/lib/validation'
import { apiError, api500 } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET() {
  try {
    await connectDB()
    const userId = await getAuthUserId()
    const filter: Record<string, unknown> = userId ? { userId } : {}
    const tasks = await TaskModel.find(filter).sort({ createdAt: -1 }).lean() as LeanDoc[]
    return NextResponse.json(tasks.map(t => ({ ...t, _id: String(t._id), type: 'task' })))
  } catch (err) {
    return api500(err)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = parseBody(CreateTaskSchema, body)
    if (!parsed.success) return apiError(parsed.error)

    await connectDB()
    const taskData = {
      ...parsed.data,
      activities: [{ action: 'created', detail: 'Task created', timestamp: new Date() }],
    }
    const task = await TaskModel.create(taskData)
    const plain = task.toObject() as LeanDoc
    return NextResponse.json({ ...plain, _id: String(plain._id), type: 'task' }, { status: 201 })
  } catch (err) {
    return api500(err)
  }
}
