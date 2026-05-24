import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getAuthUserId } from '@/lib/auth'
import NoteModel from '@/lib/models/Note'
import { handleApiError } from '@/lib/apiHelpers'
import { UpdateNoteSchema, parseBody } from '@/lib/validation'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const body = await req.json()
    const parsed = parseBody(UpdateNoteSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const note = await NoteModel.findOneAndUpdate({ _id: params.id, userId }, parsed.data, { new: true }).lean() as LeanDoc | null
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ...note, _id: String(note._id) })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    await NoteModel.findOneAndDelete({ _id: params.id, userId })
    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
