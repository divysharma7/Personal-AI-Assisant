import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuthUserId, COOKIE_NAME } from '@/lib/auth'
import { getAuthUrl } from '@/lib/google-calendar'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Pass the raw JWT as OAuth state so the callback can verify the user
  const token = cookies().get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = getAuthUrl(token)
  return NextResponse.redirect(url)
}
