import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'
import { signToken, COOKIE_NAME } from '@/lib/auth'
import { handleApiError } from '@/lib/apiHelpers'

type LeanUser = { _id: unknown; username: string; name?: string; passwordHash: string }

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)

    // Accept both "username" and "email" fields (mobile sends "email")
    const username = typeof body?.username === 'string' ? body.username.trim().toLowerCase()
                   : typeof body?.email    === 'string' ? body.email.trim().toLowerCase()
                   : ''
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    await connectDB()
    const user = await UserModel.findOne({ username }).lean() as LeanUser | null

    if (!user) {
      // Constant-time response to prevent username enumeration
      await compare('dummy', '$2a$10$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.')
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = await signToken({ userId: String(user._id), username: user.username, name: user.name || '' })

    const res = NextResponse.json({ ok: true, username: user.username, name: user.name || '' })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24h
    })
    return res
  } catch (err) {
    return handleApiError(err)
  }
}
