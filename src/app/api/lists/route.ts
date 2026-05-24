import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ListModel from '@/lib/models/List'
import { getAuthUserId } from '@/lib/auth'
import { handleApiError } from '@/lib/apiHelpers'
import { CreateListSchema, parseBody } from '@/lib/validation'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET() {
  try {
    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const lists = await ListModel.find({
      ownerId: userId,
      deletedAt: null,
    }).sort({ createdAt: -1 }).lean() as LeanDoc[]

    return NextResponse.json(lists.map(l => ({ ...l, _id: String(l._id) })))
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: Request) {
  try {
    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = parseBody(CreateListSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const doc = await ListModel.create({
      type: parsed.data.type || 'standard',
      title: parsed.data.title || '',
      icon: parsed.data.icon || '',
      coverImageUrl: parsed.data.coverImageUrl || '',
      groupId: parsed.data.groupId || null,
      ownerId: userId,
      isPrivate: true,
      collaborators: [],
      pinnedToFavorites: false,
      hideCompletedTasks: false,
      blocks: parsed.data.blocks || null,
      isInbox: parsed.data.isInbox || false,
    })

    const plain = doc.toObject() as LeanDoc
    return NextResponse.json({ ...plain, _id: String(plain._id) }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
