import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import KanbanSection from '@/lib/models/KanbanSection'
import TaskModel from '@/lib/models/Task'
import { getAuthUserId } from '@/lib/auth'
import { handleApiError } from '@/lib/apiHelpers'
import { CreateKanbanSectionSchema, parseBody } from '@/lib/validation'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = parseBody(CreateKanbanSectionSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const section = await KanbanSection.findOneAndUpdate(
      { _id: params.id, userId },
      { $set: { title: parsed.data.title } },
      { new: true }
    ).lean() as LeanDoc | null

    if (!section) return NextResponse.json({ error: 'KanbanSection not found' }, { status: 404 })
    return NextResponse.json({ ...section, _id: String(section._id) })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const section = await KanbanSection.findOneAndDelete({
      _id: params.id,
      userId,
    }).lean() as LeanDoc | null

    if (!section) return NextResponse.json({ error: 'KanbanSection not found' }, { status: 404 })

    // Clear sectionId on all tasks that referenced this section
    await TaskModel.updateMany(
      { sectionId: params.id },
      { $set: { sectionId: null } }
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleApiError(err)
  }
}
