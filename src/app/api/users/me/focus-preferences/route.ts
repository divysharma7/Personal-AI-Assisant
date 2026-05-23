import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'
import { handleApiError } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

const VALID_THEMES = ['aurora', 'minimal', 'liquid'] as const

interface FocusPreferences {
  defaultWorkMin?: number
  defaultShortBreakMin?: number
  defaultLongBreakMin?: number
  longBreakEveryNSessions?: number
  theme?: string
  soundOnComplete?: boolean
  showInSidebar?: boolean
  keyboardShortcutsEnabled?: boolean
}

/**
 * GET /api/users/me/focus-preferences — Read focus preferences
 */
export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const user = await UserModel.findById(userId).lean() as LeanDoc | null
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const prefs = (user.focusPreferences as FocusPreferences) ?? {
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

/**
 * PATCH /api/users/me/focus-preferences — Update focus preferences
 */
export async function PATCH(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = (await req.json()) as FocusPreferences

    // Validate theme if provided
    if (body.theme && !VALID_THEMES.includes(body.theme as typeof VALID_THEMES[number])) {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 })
    }

    await connectDB()

    // Build update object with only valid fields
    const setFields: Record<string, unknown> = {}
    if (body.defaultWorkMin !== undefined) setFields['focusPreferences.defaultWorkMin'] = body.defaultWorkMin
    if (body.defaultShortBreakMin !== undefined) setFields['focusPreferences.defaultShortBreakMin'] = body.defaultShortBreakMin
    if (body.defaultLongBreakMin !== undefined) setFields['focusPreferences.defaultLongBreakMin'] = body.defaultLongBreakMin
    if (body.longBreakEveryNSessions !== undefined) setFields['focusPreferences.longBreakEveryNSessions'] = body.longBreakEveryNSessions
    if (body.theme !== undefined) setFields['focusPreferences.theme'] = body.theme
    if (body.soundOnComplete !== undefined) setFields['focusPreferences.soundOnComplete'] = body.soundOnComplete
    if (body.showInSidebar !== undefined) setFields['focusPreferences.showInSidebar'] = body.showInSidebar
    if (body.keyboardShortcutsEnabled !== undefined) setFields['focusPreferences.keyboardShortcutsEnabled'] = body.keyboardShortcutsEnabled

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

    return NextResponse.json((updated.focusPreferences as FocusPreferences) ?? {})
  } catch (err) {
    return handleApiError(err)
  }
}
