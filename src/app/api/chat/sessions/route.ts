import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ChatSession from '@/lib/models/ChatSession'
import { getAuthUserId } from '@/lib/auth'
import { handleApiError } from '@/lib/apiHelpers'
import { CreateChatSessionSchema, parseBody } from '@/lib/validation'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET() {
  try {
    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sessions = await ChatSession.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(50)
      .select('title updatedAt messages')
      .lean() as LeanDoc[]

    return NextResponse.json({
      sessions: sessions.map(s => ({
        _id: String(s._id),
        title: s.title,
        updatedAt: s.updatedAt,
        messageCount: Array.isArray(s.messages) ? s.messages.length : 0,
      })),
    })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const parsed = parseBody(CreateChatSessionSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
    const title = parsed.data.title?.trim() || 'New chat'

    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await ChatSession.create({ userId, title })
    const plain = session.toObject() as LeanDoc

    return NextResponse.json(
      {
        _id: String(plain._id),
        title: plain.title,
        updatedAt: plain.updatedAt,
        messages: plain.messages,
        messageCount: 0,
      },
      { status: 201 },
    )
  } catch (err) {
    return handleApiError(err)
  }
}
