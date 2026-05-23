import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ChatSession from '@/lib/models/ChatSession'
import { getAuthUserId } from '@/lib/auth'
import { apiError, api404, api500 } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return apiError('Unauthorized', 401)

    const session = await ChatSession.findOne({
      _id: params.id,
      userId,
    }).lean() as LeanDoc | null

    if (!session) return api404('ChatSession')

    return NextResponse.json({
      ...session,
      _id: String(session._id),
    })
  } catch (err) {
    return api500(err)
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return apiError('Request body is required')

    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return apiError('Unauthorized', 401)

    // Build the update operation
    const update: Record<string, unknown> = {}

    if (typeof body.title === 'string' && body.title.trim()) {
      update.$set = { title: body.title.trim() }
    }

    if (Array.isArray(body.messages) && body.messages.length > 0) {
      const newMessages = body.messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date(),
      }))
      update.$push = { messages: { $each: newMessages } }
    }

    if (!update.$set && !update.$push) {
      return apiError('Provide title or messages to update')
    }

    const session = await ChatSession.findOneAndUpdate(
      { _id: params.id, userId },
      update,
      { new: true },
    ).lean() as LeanDoc | null

    if (!session) return api404('ChatSession')

    return NextResponse.json({
      ...session,
      _id: String(session._id),
    })
  } catch (err) {
    return api500(err)
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return apiError('Unauthorized', 401)

    const session = await ChatSession.findOneAndDelete({
      _id: params.id,
      userId,
    }).lean() as LeanDoc | null

    if (!session) return api404('ChatSession')

    return NextResponse.json({ ok: true })
  } catch (err) {
    return api500(err)
  }
}
