import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET() {
  const token = cookies().get(COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await verifyToken(token)
    await connectDB()
    const user = await UserModel.findOne({ username: payload.username }).lean() as LeanDoc | null
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      connected: !!user.googleCalendarConnected,
      calendarId: (user.googleCalendarId as string) || 'primary',
    })
  } catch {
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}
