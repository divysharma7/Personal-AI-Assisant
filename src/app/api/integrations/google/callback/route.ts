import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { exchangeCode } from '@/lib/google-calendar'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) {
    return NextResponse.redirect(new URL('/settings?google=error', req.url))
  }

  try {
    const payload = await verifyToken(state)
    const tokens = await exchangeCode(code)

    await connectDB()
    await UserModel.findOneAndUpdate(
      { username: payload.username },
      {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleCalendarConnected: true,
      }
    )

    return NextResponse.redirect(new URL('/settings?google=success', req.url))
  } catch {
    return NextResponse.redirect(new URL('/settings?google=error', req.url))
  }
}
