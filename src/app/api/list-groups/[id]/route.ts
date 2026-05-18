import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ListGroupModel from '@/lib/models/ListGroup'
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

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB()
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const allowed = ['title', 'order', 'collapsed']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const doc = await ListGroupModel.findOneAndUpdate(
    { _id: params.id, ownerId: userId },
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
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Un-group child lists by clearing their groupId
  await ListModel.updateMany(
    { groupId: params.id, ownerId: userId },
    { $set: { groupId: null } }
  )

  await ListGroupModel.findOneAndDelete({ _id: params.id, ownerId: userId })
  return NextResponse.json({ ok: true })
}
