import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import KanbanSection from '@/lib/models/KanbanSection'
import TaskModel from '@/lib/models/Task'
import { getAuthUserId } from '@/lib/auth'
import { apiError, api404, api500 } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => null)
    if (!body?.title) return apiError('title is required')

    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return apiError('Unauthorized', 401)

    const section = await KanbanSection.findOneAndUpdate(
      { _id: params.id, userId },
      { $set: { title: body.title } },
      { new: true }
    ).lean() as LeanDoc | null

    if (!section) return api404('KanbanSection')
    return NextResponse.json({ ...section, _id: String(section._id) })
  } catch (err) {
    return api500(err)
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return apiError('Unauthorized', 401)

    const section = await KanbanSection.findOneAndDelete({
      _id: params.id,
      userId,
    }).lean() as LeanDoc | null

    if (!section) return api404('KanbanSection')

    // Clear sectionId on all tasks that referenced this section
    await TaskModel.updateMany(
      { sectionId: params.id },
      { $set: { sectionId: null } }
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    return api500(err)
  }
}
