import { google, calendar_v3 } from 'googleapis'

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
]

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

export function getAuthUrl(state: string): string {
  const client = getOAuth2Client()
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state,
  })
}

export async function exchangeCode(code: string) {
  const client = getOAuth2Client()
  const { tokens } = await client.getToken(code)
  return tokens
}

interface UserTokens {
  googleAccessToken?: string | null
  googleRefreshToken?: string | null
}

export function getAuthenticatedClient(user: UserTokens) {
  const client = getOAuth2Client()
  client.setCredentials({
    access_token: user.googleAccessToken ?? undefined,
    refresh_token: user.googleRefreshToken ?? undefined,
  })
  return client
}

interface TaskForCalendar {
  title: string
  description?: string
  scheduledStart?: Date | string | null
  scheduledEnd?: Date | string | null
  dueDate?: Date | string | null
}

export async function createCalendarEvent(
  client: ReturnType<typeof getOAuth2Client>,
  task: TaskForCalendar,
  calendarId = 'primary'
): Promise<string | null> {
  const calendar = google.calendar({ version: 'v3', auth: client })

  const start = task.scheduledStart
    ? new Date(task.scheduledStart)
    : task.dueDate
    ? new Date(task.dueDate)
    : null

  if (!start) return null

  const end = task.scheduledEnd
    ? new Date(task.scheduledEnd)
    : new Date(start.getTime() + 60 * 60 * 1000) // default 1 hour

  const event: calendar_v3.Schema$Event = {
    summary: task.title,
    description: task.description || '',
    start: {
      dateTime: start.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  }

  const res = await calendar.events.insert({
    calendarId,
    requestBody: event,
  })

  return res.data.id ?? null
}

export async function updateCalendarEvent(
  client: ReturnType<typeof getOAuth2Client>,
  eventId: string,
  task: TaskForCalendar,
  calendarId = 'primary'
): Promise<void> {
  const calendar = google.calendar({ version: 'v3', auth: client })

  const start = task.scheduledStart
    ? new Date(task.scheduledStart)
    : task.dueDate
    ? new Date(task.dueDate)
    : null

  if (!start) return

  const end = task.scheduledEnd
    ? new Date(task.scheduledEnd)
    : new Date(start.getTime() + 60 * 60 * 1000)

  const event: calendar_v3.Schema$Event = {
    summary: task.title,
    description: task.description || '',
    start: {
      dateTime: start.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  }

  await calendar.events.update({
    calendarId,
    eventId,
    requestBody: event,
  })
}

export async function deleteCalendarEvent(
  client: ReturnType<typeof getOAuth2Client>,
  eventId: string,
  calendarId = 'primary'
): Promise<void> {
  const calendar = google.calendar({ version: 'v3', auth: client })
  await calendar.events.delete({
    calendarId,
    eventId,
  })
}
