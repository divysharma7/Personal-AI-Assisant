import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'
import { signToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const name = typeof body?.name === 'string' ? body.name.trim() : ''

  // Use email as username (or accept explicit username)
  const username = typeof body?.username === 'string'
    ? body.username.trim().toLowerCase()
    : email

  if (!username || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  await connectDB()

  // Check for duplicate
  const existing = await UserModel.findOne({ username }).lean()
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
  }

  const passwordHash = await hash(password, 12)
  const user = await UserModel.create({ username, passwordHash })

  const token = await signToken({ userId: String(user._id), username: user.username })

  const res = NextResponse.json({ ok: true, username: user.username })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24h
  })
  return res
}
