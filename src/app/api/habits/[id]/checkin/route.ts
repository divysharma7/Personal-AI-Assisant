import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'
import { computeStreak, computeBestStreak } from '@/lib/services/streakService'
import { scheduleStreakMilestone } from '@/lib/services/notificationService'
import { HabitCheckinSchema, parseBody } from '@/lib/validation'

type LeanDoc = Record<string, unknown> & { _id: unknown }

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365]

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = parseBody(HabitCheckinSchema, body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  await connectDB()

  const habit = await TaskModel.findOne({
    _id: id,
    userId,
    isHabit: true,
  }).lean() as LeanDoc | null

  if (!habit) {
    return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
  }

  const completions = (habit.completions as Array<{ date: string; status: string; value?: number; reason?: string; loggedAt?: Date }>) ?? []

  // Idempotent: remove existing entry for this date, then add new one
  const filtered = completions.filter((c) => c.date !== parsed.data.date)
  filtered.push({
    date: parsed.data.date,
    status: parsed.data.status,
    value: parsed.data.value,
    reason: parsed.data.reason,
    loggedAt: new Date(),
  })

  // Sort by date
  filtered.sort((a, b) => a.date.localeCompare(b.date))

  // Update the habit with new completions
  const updated = await TaskModel.findOneAndUpdate(
    { _id: id, userId },
    {
      $set: {
        completions: filtered,
        streakLastUpdated: new Date(),
      },
    },
    { new: true },
  ).lean() as LeanDoc

  // Compute streaks after update
  const currentStreak = computeStreak(updated as never)
  const bestStreak = computeBestStreak(updated as never)

  // Update streak fields
  await TaskModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: { streakCurrent: currentStreak, streakBest: bestStreak } },
  )

  // Check for streak milestones and schedule notifications
  if (parsed.data.status === 'achieved') {
    for (const milestone of STREAK_MILESTONES) {
      if (currentStreak === milestone) {
        await scheduleStreakMilestone(userId, id, milestone)
        break
      }
    }
  }

  return NextResponse.json({
    ...updated,
    _id: String(updated._id),
    streakCurrent: currentStreak,
    streakBest: bestStreak,
  })
}
