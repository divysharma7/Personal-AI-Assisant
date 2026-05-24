import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'
import UserModel from '@/lib/models/User'
import { isDueToday, computeStreak, computeBestStreak } from '@/lib/services/streakService'
import { handleApiError } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

/**
 * GET /api/habits/today
 * Returns habits due today with completion status.
 */
export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const user = await UserModel.findById(userId).lean() as LeanDoc | null
    const timezone = (user?.timezone as string) || 'UTC'

    // Find all habits owned by this user
    const habits = await TaskModel.find({
      userId,
      isHabit: true,
    }).lean() as LeanDoc[]

    // Filter to ones due today and enrich with computed streak data
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: timezone })

    const todayHabits = habits
      .filter((h) => isDueToday(h as never, timezone))
      .map((h) => {
        const completions = (h.completions as Array<{ date: string; status: string; value?: number }>) ?? []
        const todayCompletion = completions.find((c) => c.date === todayStr) ?? null

        return {
          ...h,
          _id: String(h._id),
          streakCurrent: computeStreak(h as never, timezone),
          streakBest: computeBestStreak(h as never, timezone),
          todayStatus: todayCompletion?.status ?? null,
          todayValue: todayCompletion?.value ?? null,
        }
      })

    return NextResponse.json(todayHabits)
  } catch (err) {
    return handleApiError(err)
  }
}
