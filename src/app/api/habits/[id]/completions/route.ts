import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'

type LeanDoc = Record<string, unknown> & { _id: unknown }

interface CompletionEntry {
  date: string
  status: string
  value?: number
  reason?: string
  loggedAt?: Date
}

/**
 * GET /api/habits/[id]/completions?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns the completion log for a habit within the given date range.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  await connectDB()

  const habit = await TaskModel.findOne({
    _id: id,
    createdBy: userId,
    isHabit: true,
  }).lean() as LeanDoc | null

  if (!habit) {
    return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
  }

  let completions = (habit.completions as CompletionEntry[]) ?? []

  // Filter by date range if provided
  if (from) {
    completions = completions.filter((c) => c.date >= from)
  }
  if (to) {
    completions = completions.filter((c) => c.date <= to)
  }

  // Sort by date ascending
  completions.sort((a, b) => a.date.localeCompare(b.date))

  return NextResponse.json({
    habitId: String(habit._id),
    completions,
    total: completions.length,
  })
}
