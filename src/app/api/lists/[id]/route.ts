import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ListModel from '@/lib/models/List'
import { getAuthUserId } from '@/lib/auth'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB()
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doc = await ListModel.findOne({
    _id: params.id,
    ownerId: userId,
    deletedAt: null,
  }).lean() as LeanDoc | null

  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ...doc, _id: String(doc._id) })
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB()
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Only allow updating specific fields
  const allowed = [
    'title', 'icon', 'coverImageUrl', 'pinnedToFavorites',
    'hideCompletedTasks', 'groupId', 'isPrivate', 'collaborators', 'type',
  ]
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const doc = await ListModel.findOneAndUpdate(
    { _id: params.id, ownerId: userId, deletedAt: null },
    { $set: update },
    { new: true }
  ).lean() as LeanDoc | null

  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ...doc, _id: String(doc._id) })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB()
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if it's the inbox — can't delete
  const existing = await ListModel.findOne({
    _id: params.id,
    ownerId: userId,
    deletedAt: null,
  }).lean() as LeanDoc | null

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.isInbox) return NextResponse.json({ error: 'Cannot delete Inbox' }, { status: 400 })

  // Soft delete
  await ListModel.findByIdAndUpdate(params.id, { $set: { deletedAt: new Date() } })
  return NextResponse.json({ ok: true })
}
