import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ListGroupModel from '@/lib/models/ListGroup'
import ListModel from '@/lib/models/List'
import { getAuthUserId } from '@/lib/auth'
import { handleApiError } from '@/lib/apiHelpers'
import { UpdateListGroupSchema, parseBody } from '@/lib/validation'

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
    const parsed = parseBody(UpdateListGroupSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const doc = await ListGroupModel.findOneAndUpdate(
      { _id: params.id, ownerId: userId },
      { $set: parsed.data },
      { new: true }
    ).lean() as LeanDoc | null

    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ...doc, _id: String(doc._id) })
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

    // Un-group child lists by clearing their groupId
    await ListModel.updateMany(
      { groupId: params.id, ownerId: userId },
      { $set: { groupId: null } }
    )

    await ListGroupModel.findOneAndDelete({ _id: params.id, ownerId: userId })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleApiError(err)
  }
}
