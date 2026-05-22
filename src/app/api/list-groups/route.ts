import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ListGroupModel from '@/lib/models/ListGroup'
import { getAuthUserId } from '@/lib/auth'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET() {
  await connectDB()
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const groups = await ListGroupModel.find({ ownerId: userId })
    .sort({ order: 1 })
    .lean() as LeanDoc[]

  return NextResponse.json(groups.map(g => ({ ...g, _id: String(g._id) })))
}

export async function POST(req: Request) {
  await connectDB()
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'title required' }, { status: 400 })
  }

  const count = await ListGroupModel.countDocuments({ ownerId: userId })
  const doc = await ListGroupModel.create({
    title: body.title.trim(),
    ownerId: userId,
    order: count,
    collapsed: false,
  })

  const plain = doc.toObject() as LeanDoc
  return NextResponse.json({ ...plain, _id: String(plain._id) }, { status: 201 })
}
