import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import FocusSession from '@/lib/models/FocusSession'

type LeanDoc = Record<string, unknown> & { _id: unknown }

/**
 * GET /api/focus/stats — Aggregated focus statistics
 * Returns: sessionsToday, sessionsThisWeek, totalMinutesToday, totalMinutesWeek,
 *          totalMinutesAllTime, averageSessionMin, longestSessionMin, currentDailyStreak
 */
export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)

  const dayOfWeek = now.getDay() // 0 = Sunday
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek)

  // Fetch all completed sessions for this user
  const allSessions = await FocusSession.find({
    userId: userId,
    status: 'completed',
  }).sort({ startedAt: -1 }).lean() as LeanDoc[]

  const todaySessions = allSessions.filter(
    s => new Date(s.startedAt as string) >= startOfToday,
  )
  const weekSessions = allSessions.filter(
    s => new Date(s.startedAt as string) >= startOfWeek,
  )

  const totalMinutesToday = todaySessions.reduce(
    (sum, s) => sum + (s.actualDurationMin as number || 0), 0,
  )
  const totalMinutesWeek = weekSessions.reduce(
    (sum, s) => sum + (s.actualDurationMin as number || 0), 0,
  )
  const totalMinutesAllTime = allSessions.reduce(
    (sum, s) => sum + (s.actualDurationMin as number || 0), 0,
  )

  const durations = allSessions.map(s => s.actualDurationMin as number || 0)
  const averageSessionMin = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0
  const longestSessionMin = durations.length > 0
    ? Math.max(...durations)
    : 0

  // Compute current daily focus streak
  // A "focus day" is a day with at least one completed session
  const sessionDates = new Set(
    allSessions.map(s => {
      const d = new Date(s.startedAt as string)
      return d.toLocaleDateString('en-CA', { timeZone: 'UTC' })
    }),
  )

  let currentDailyStreak = 0
  const checkDate = new Date(now)
  checkDate.setHours(12, 0, 0, 0) // avoid DST issues

  // Check today first, if no session today, start from yesterday
  const todayStr = checkDate.toLocaleDateString('en-CA', { timeZone: 'UTC' })
  if (!sessionDates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1)
  }

  while (true) {
    const dateStr = checkDate.toLocaleDateString('en-CA', { timeZone: 'UTC' })
    if (sessionDates.has(dateStr)) {
      currentDailyStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return NextResponse.json({
    sessionsToday: todaySessions.length,
    sessionsThisWeek: weekSessions.length,
    totalMinutesToday,
    totalMinutesWeek,
    totalMinutesAllTime,
    averageSessionMin,
    longestSessionMin,
    currentDailyStreak,
  })
}
