import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'
import { computeStreak, computeBestStreak } from '@/lib/services/streakService'
import { scheduleStreakMilestone } from '@/lib/services/notificationService'

type LeanDoc = Record<string, unknown> & { _id: unknown }

interface CheckinBody {
  date: string         // 'YYYY-MM-DD'
  status: 'achieved' | 'unachieved' | 'skipped' | 'frozen'
  value?: number
  reason?: string
}

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365]

/**
 * POST /api/habits/[id]/checkin
 * Idempotent check-in for a habit on a given date.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let payload
  try {
    payload = await verifyToken(token)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = (await req.json()) as CheckinBody

  if (!body.date || !body.status) {
    return NextResponse.json({ error: 'date and status are required' }, { status: 400 })
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return NextResponse.json({ error: 'date must be YYYY-MM-DD' }, { status: 400 })
  }

  if (!['achieved', 'unachieved', 'skipped', 'frozen'].includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  await connectDB()

  const habit = await TaskModel.findOne({
    _id: id,
    createdBy: payload.userId,
    isHabit: true,
  }).lean() as LeanDoc | null

  if (!habit) {
    return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
  }

  const completions = (habit.completions as Array<{ date: string; status: string; value?: number; reason?: string; loggedAt?: Date }>) ?? []

  // Idempotent: remove existing entry for this date, then add new one
  const filtered = completions.filter((c) => c.date !== body.date)
  filtered.push({
    date: body.date,
    status: body.status,
    value: body.value,
    reason: body.reason,
    loggedAt: new Date(),
  })

  // Sort by date
  filtered.sort((a, b) => a.date.localeCompare(b.date))

  // Update the habit with new completions
  const updated = await TaskModel.findByIdAndUpdate(
    id,
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
  await TaskModel.findByIdAndUpdate(id, {
    $set: { streakCurrent: currentStreak, streakBest: bestStreak },
  })

  // Check for streak milestones and schedule notifications
  if (body.status === 'achieved') {
    for (const milestone of STREAK_MILESTONES) {
      if (currentStreak === milestone) {
        await scheduleStreakMilestone(payload.userId, id, milestone)
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
