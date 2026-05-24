import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'
import { handleApiError } from '@/lib/apiHelpers'
import { FocusPreferencesSchema, parseBody } from '@/lib/validation'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const user = await UserModel.findById(userId).lean() as LeanDoc | null
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const prefs = (user.focusPreferences as Record<string, unknown>) ?? {
      defaultWorkMin: 25,
      defaultShortBreakMin: 5,
      defaultLongBreakMin: 15,
      longBreakEveryNSessions: 4,
      theme: 'aurora',
      soundOnComplete: true,
      showInSidebar: true,
      keyboardShortcutsEnabled: true,
    }

    return NextResponse.json(prefs)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = parseBody(FocusPreferencesSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

    await connectDB()

    const setFields: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) setFields[`focusPreferences.${key}`] = value
    }

    if (Object.keys(setFields).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const updated = await UserModel.findByIdAndUpdate(
      userId,
      { $set: setFields },
      { new: true },
    ).lean() as LeanDoc | null

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json((updated.focusPreferences as Record<string, unknown>) ?? {})
  } catch (err) {
    return handleApiError(err)
  }
}
