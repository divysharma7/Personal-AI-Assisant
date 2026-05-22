import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import KanbanSection from '@/lib/models/KanbanSection'
import { getAuthUserId } from '@/lib/auth'
import { apiError, api500 } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET() {
  try {
    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return apiError('Unauthorized', 401)

    const sections = await KanbanSection.find({ userId })
      .sort({ order: 1 })
      .lean() as LeanDoc[]

    return NextResponse.json(
      sections.map(s => ({ ...s, _id: String(s._id) }))
    )
  } catch (err) {
    return api500(err)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body?.title) return apiError('title is required')

    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return apiError('Unauthorized', 401)

    // Auto-assign order: max existing order + 1
    const last = await KanbanSection.findOne({ userId })
      .sort({ order: -1 })
      .lean() as LeanDoc | null

    const order = last ? (last.order as number) + 1 : 0

    const section = await KanbanSection.create({
      title: body.title,
      order,
      userId,
    })

    const plain = section.toObject() as LeanDoc
    return NextResponse.json(
      { ...plain, _id: String(plain._id) },
      { status: 201 }
    )
  } catch (err) {
    return api500(err)
  }
}
