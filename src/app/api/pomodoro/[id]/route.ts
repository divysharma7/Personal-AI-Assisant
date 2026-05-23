import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import PomodoroSession from '@/lib/models/PomodoroSession'
import { handleApiError } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const body = await req.json()
    const session = await PomodoroSession.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    ).lean() as LeanDoc | null

    if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ...session, _id: String(session._id) })
  } catch (err) {
    return handleApiError(err)
  }
}
