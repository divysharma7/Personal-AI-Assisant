import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getAuthUserId } from '@/lib/auth'
import ContactModel from '@/lib/models/Contact'
import { handleApiError } from '@/lib/apiHelpers'
import { UpdateContactSchema, parseBody } from '@/lib/validation'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    const parsed = parseBody(UpdateContactSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

    await connectDB()
    const updated = await ContactModel.findOneAndUpdate(
      { _id: params.id, userId },
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).lean()
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    await ContactModel.findOneAndDelete({ _id: params.id, userId })
    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
