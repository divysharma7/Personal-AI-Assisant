import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import FocusSession from '@/lib/models/FocusSession'

type LeanDoc = Record<string, unknown> & { _id: unknown }

/**
 * GET /api/focus/sessions/active — Get the currently active focus session
 */
export async function GET() {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let payload
  try {
    payload = await verifyToken(token)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const session = await FocusSession.findOne({
    userId: payload.userId,
    status: 'active',
  }).lean() as LeanDoc | null

  if (!session) {
    return NextResponse.json(null)
  }

  return NextResponse.json({ ...session, _id: String(session._id) })
}
