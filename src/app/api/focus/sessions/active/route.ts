import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import FocusSession from '@/lib/models/FocusSession'
import { handleApiError } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

/**
 * GET /api/focus/sessions/active — Get the currently active focus session
 */
export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const session = await FocusSession.findOne({
      userId: userId,
      status: 'active',
    }).lean() as LeanDoc | null

    if (!session) {
      return NextResponse.json(null)
    }

    return NextResponse.json({ ...session, _id: String(session._id) })
  } catch (err) {
    return handleApiError(err)
  }
}
