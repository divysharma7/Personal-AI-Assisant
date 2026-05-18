import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'

type LeanDoc = Record<string, unknown> & { _id: unknown }

interface CalendarPreferences {
  defaultView?: string
  weekStartsOn?: number
  hiddenHoursStart?: number
  hiddenHoursEnd?: number
  dailyCapacityHours?: number
  colorCodingMode?: string
  showHabitsOnCalendar?: boolean
  showFocusSessionsOnCalendar?: boolean
  showGoogleEventsOnCalendar?: boolean
  timeFormat?: string
  showCurrentTimeIndicator?: boolean
}

const DEFAULT_PREFERENCES: CalendarPreferences = {
  defaultView: 'day',
  weekStartsOn: 1,
  hiddenHoursStart: 21,
  hiddenHoursEnd: 7,
  dailyCapacityHours: 8,
  colorCodingMode: 'list',
  showHabitsOnCalendar: false,
  showFocusSessionsOnCalendar: false,
  showGoogleEventsOnCalendar: true,
  timeFormat: '12h',
  showCurrentTimeIndicator: true,
}

const VALID_VIEWS = ['day', 'week', 'month']
const VALID_WEEK_STARTS = [0, 1, 6]
const VALID_COLOR_MODES = ['list', 'priority', 'label']
const VALID_TIME_FORMATS = ['12h', '24h']

/**
 * GET /api/users/me/calendar-preferences — Read calendar preferences
 */
export async function GET() {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let payload
  try {
    payload = await verifyToken(token)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const user = await UserModel.findById(payload.userId).lean() as LeanDoc | null
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const prefs = (user.calendarPreferences as CalendarPreferences) ?? DEFAULT_PREFERENCES

  return NextResponse.json(prefs)
}

/**
 * PATCH /api/users/me/calendar-preferences — Update calendar preferences
 */
export async function PATCH(req: Request) {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let payload
  try {
    payload = await verifyToken(token)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as CalendarPreferences

  // Validate enums if provided
  if (body.defaultView && !VALID_VIEWS.includes(body.defaultView)) {
    return NextResponse.json({ error: 'Invalid defaultView' }, { status: 400 })
  }
  if (body.weekStartsOn !== undefined && !VALID_WEEK_STARTS.includes(body.weekStartsOn)) {
    return NextResponse.json({ error: 'Invalid weekStartsOn' }, { status: 400 })
  }
  if (body.colorCodingMode && !VALID_COLOR_MODES.includes(body.colorCodingMode)) {
    return NextResponse.json({ error: 'Invalid colorCodingMode' }, { status: 400 })
  }
  if (body.timeFormat && !VALID_TIME_FORMATS.includes(body.timeFormat)) {
    return NextResponse.json({ error: 'Invalid timeFormat' }, { status: 400 })
  }

  await connectDB()

  // Build update object with only valid fields
  const setFields: Record<string, unknown> = {}
  if (body.defaultView !== undefined) setFields['calendarPreferences.defaultView'] = body.defaultView
  if (body.weekStartsOn !== undefined) setFields['calendarPreferences.weekStartsOn'] = body.weekStartsOn
  if (body.hiddenHoursStart !== undefined) setFields['calendarPreferences.hiddenHoursStart'] = body.hiddenHoursStart
  if (body.hiddenHoursEnd !== undefined) setFields['calendarPreferences.hiddenHoursEnd'] = body.hiddenHoursEnd
  if (body.dailyCapacityHours !== undefined) setFields['calendarPreferences.dailyCapacityHours'] = body.dailyCapacityHours
  if (body.colorCodingMode !== undefined) setFields['calendarPreferences.colorCodingMode'] = body.colorCodingMode
  if (body.showHabitsOnCalendar !== undefined) setFields['calendarPreferences.showHabitsOnCalendar'] = body.showHabitsOnCalendar
  if (body.showFocusSessionsOnCalendar !== undefined) setFields['calendarPreferences.showFocusSessionsOnCalendar'] = body.showFocusSessionsOnCalendar
  if (body.showGoogleEventsOnCalendar !== undefined) setFields['calendarPreferences.showGoogleEventsOnCalendar'] = body.showGoogleEventsOnCalendar
  if (body.timeFormat !== undefined) setFields['calendarPreferences.timeFormat'] = body.timeFormat
  if (body.showCurrentTimeIndicator !== undefined) setFields['calendarPreferences.showCurrentTimeIndicator'] = body.showCurrentTimeIndicator

  if (Object.keys(setFields).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const updated = await UserModel.findByIdAndUpdate(
    payload.userId,
    { $set: setFields },
    { new: true },
  ).lean() as LeanDoc | null

  if (!updated) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json((updated.calendarPreferences as CalendarPreferences) ?? DEFAULT_PREFERENCES)
}
