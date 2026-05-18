import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ListModel from '@/lib/models/List'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

type LeanDoc = Record<string, unknown> & { _id: unknown }

async function getUserId() {
  const cookieStore = cookies()
  const token = cookieStore.get('pim_token')?.value
  if (!token) return null
  try {
    const payload = await verifyToken(token)
    return payload.userId
  } catch {
    return null
  }
}

export async function GET() {
  await connectDB()
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const lists = await ListModel.find({
    ownerId: userId,
    deletedAt: null,
  }).sort({ createdAt: -1 }).lean() as LeanDoc[]

  return NextResponse.json(lists.map(l => ({ ...l, _id: String(l._id) })))
}

export async function POST(req: Request) {
  await connectDB()
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const doc = await ListModel.create({
    type: body.type || 'standard',
    title: body.title || '',
    icon: body.icon || '',
    coverImageUrl: body.coverImageUrl || '',
    groupId: body.groupId || null,
    ownerId: userId,
    isPrivate: true,
    collaborators: [],
    pinnedToFavorites: false,
    hideCompletedTasks: false,
    blocks: body.blocks || null,
    isInbox: body.isInbox || false,
  })

  const plain = doc.toObject() as LeanDoc
  return NextResponse.json({ ...plain, _id: String(plain._id) }, { status: 201 })
}
