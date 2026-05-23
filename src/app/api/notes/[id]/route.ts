import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import NoteModel from '@/lib/models/Note'
import { handleApiError } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const body = await req.json()
    const note = await NoteModel.findByIdAndUpdate(params.id, body, { new: true }).lean() as LeanDoc | null
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ...note, _id: String(note._id) })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    await NoteModel.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
