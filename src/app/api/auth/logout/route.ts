import { NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth'
import { handleApiError } from '@/lib/apiHelpers'

export async function POST() {
  try {
    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
    return res
  } catch (err) {
    return handleApiError(err)
  }
}
