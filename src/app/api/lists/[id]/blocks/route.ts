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

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB()
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const doc = await ListModel.findOneAndUpdate(
    { _id: params.id, ownerId: userId, deletedAt: null },
    { $set: { blocks: body.blocks } },
    { new: true }
  ).lean() as LeanDoc | null

  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ...doc, _id: String(doc._id) })
}
