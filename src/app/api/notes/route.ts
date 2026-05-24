import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import NoteModel from '@/lib/models/Note'
import { handleApiError } from '@/lib/apiHelpers'
import { getAuthUserId } from '@/lib/auth'
import { CreateNoteSchema, parseBody } from '@/lib/validation'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const notes = await NoteModel.find({ userId }).sort({ createdAt: -1 }).lean() as LeanDoc[]
    return NextResponse.json(notes.map(n => ({ ...n, _id: String(n._id) })))
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const body = await req.json()
    const parsed = parseBody(CreateNoteSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const note = await NoteModel.create({ ...parsed.data, userId })
    const plain = note.toObject() as LeanDoc
    return NextResponse.json({ ...plain, _id: String(plain._id) }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
