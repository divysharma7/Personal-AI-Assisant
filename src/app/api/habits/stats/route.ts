import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'
import UserModel from '@/lib/models/User'
import {
  computeStreak,
  computeBestStreak,
  getCompletionRate,
} from '@/lib/services/streakService'

type LeanDoc = Record<string, unknown> & { _id: unknown }

interface CompletionEntry {
  date: string
  status: string
  value?: number
}

/**
 * GET /api/habits/stats
 * Returns aggregated stats: completion rates, streaks, day-of-week breakdown.
 */
export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const user = await UserModel.findById(userId).lean() as LeanDoc | null
  const timezone = (user?.timezone as string) || 'UTC'

  const habits = await TaskModel.find({
    userId,
    isHabit: true,
  }).lean() as LeanDoc[]

  if (habits.length === 0) {
    return NextResponse.json({
      totalHabits: 0,
      overallCompletionRate: 0,
      longestCurrentStreak: 0,
      longestBestStreak: 0,
      habitStats: [],
      dayOfWeekBreakdown: [0, 0, 0, 0, 0, 0, 0],
    })
  }

  // Per-habit stats
  const habitStats = habits.map((h) => {
    const currentStreak = computeStreak(h as never, timezone)
    const bestStreak = computeBestStreak(h as never, timezone)
    const completionRate7 = getCompletionRate(h as never, 7, timezone)
    const completionRate30 = getCompletionRate(h as never, 30, timezone)

    return {
      habitId: String(h._id),
      title: h.title as string,
      currentStreak,
      bestStreak,
      completionRate7d: Math.round(completionRate7 * 100),
      completionRate30d: Math.round(completionRate30 * 100),
    }
  })

  // Aggregated stats
  const longestCurrentStreak = Math.max(...habitStats.map((s) => s.currentStreak))
  const longestBestStreak = Math.max(...habitStats.map((s) => s.bestStreak))
  const overallCompletionRate =
    habitStats.length > 0
      ? Math.round(
          habitStats.reduce((sum, s) => sum + s.completionRate30d, 0) / habitStats.length,
        )
      : 0

  // Day-of-week breakdown: count 'achieved' completions per day of week
  // Index 0 = Sunday, 6 = Saturday
  const dayOfWeekBreakdown = [0, 0, 0, 0, 0, 0, 0]
  for (const h of habits) {
    const completions = (h.completions as CompletionEntry[]) ?? []
    for (const c of completions) {
      if (c.status === 'achieved') {
        const dow = new Date(c.date + 'T12:00:00Z').getDay()
        dayOfWeekBreakdown[dow]++
      }
    }
  }

  return NextResponse.json({
    totalHabits: habits.length,
    overallCompletionRate,
    longestCurrentStreak,
    longestBestStreak,
    habitStats,
    dayOfWeekBreakdown,
  })
}
