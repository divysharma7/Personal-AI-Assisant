import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { google } from 'googleapis'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'
import ExternalCalendarEventModel from '@/lib/models/ExternalCalendarEvent'
import { getAuthenticatedClient } from '@/lib/google-calendar'

type LeanDoc = Record<string, unknown> & { _id: unknown }

/**
 * POST /api/calendar/sync-google
 *
 * Manual trigger to sync Google Calendar events into the ExternalCalendarEvent collection.
 * Query: ?from=ISO&to=ISO (defaults to current month if omitted)
 */
export async function POST(req: Request) {
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
  if (!user || !user.googleCalendarConnected) {
    return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 400 })
  }

  const { searchParams } = new URL(req.url)

  // Default range: current month
  const now = new Date()
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1)
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : defaultFrom
  const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : defaultTo

  try {
    const client = getAuthenticatedClient({
      googleAccessToken: user.googleAccessToken as string | null,
      googleRefreshToken: user.googleRefreshToken as string | null,
    })

    const calendar = google.calendar({ version: 'v3', auth: client })
    const calendarId = (user.googleCalendarId as string) || 'primary'

    const res = await calendar.events.list({
      calendarId,
      timeMin: from.toISOString(),
      timeMax: to.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
    })

    const googleEvents = res.data.items || []
    let synced = 0

    for (const event of googleEvents) {
      if (!event.id) continue

      const isAllDay = !!event.start?.date
      const start = isAllDay
        ? new Date(event.start!.date!)
        : new Date(event.start!.dateTime!)
      const end = isAllDay
        ? new Date(event.end!.date!)
        : new Date(event.end!.dateTime!)

      await ExternalCalendarEventModel.findOneAndUpdate(
        { userId: payload.userId, externalId: event.id },
        {
          $set: {
            userId: payload.userId,
            source: 'google',
            externalId: event.id,
            title: event.summary || '',
            start,
            end,
            allDay: isAllDay,
            lastSyncedAt: new Date(),
            calendarId,
          },
        },
        { upsert: true },
      )
      synced++
    }

    return NextResponse.json({ success: true, synced })
  } catch {
    return NextResponse.json({ error: 'Failed to sync Google Calendar' }, { status: 500 })
  }
}
