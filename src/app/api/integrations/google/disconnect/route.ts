import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'

export async function POST() {
  const token = cookies().get(COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await verifyToken(token)
    await connectDB()
    await UserModel.findOneAndUpdate(
      { username: payload.username },
      {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleCalendarConnected: false,
      }
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}
