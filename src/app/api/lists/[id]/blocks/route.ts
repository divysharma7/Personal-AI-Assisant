import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ListModel from '@/lib/models/List'
import { getAuthUserId } from '@/lib/auth'
import { handleApiError } from '@/lib/apiHelpers'
import { ListBlocksSchema, parseBody } from '@/lib/validation'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = parseBody(ListBlocksSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const doc = await ListModel.findOneAndUpdate(
      { _id: params.id, ownerId: userId, deletedAt: null },
      { $set: { blocks: parsed.data.blocks } },
      { new: true }
    ).lean() as LeanDoc | null

    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ...doc, _id: String(doc._id) })
  } catch (err) {
    return handleApiError(err)
  }
}
