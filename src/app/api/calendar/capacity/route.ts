import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'
import TaskModel from '@/lib/models/Task'
import { handleApiError } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

interface DayCapacity {
  scheduledHours: number
  capacity: number
  fullness: number
}

/**
 * GET /api/calendar/capacity?from=ISO&to=ISO
 *
 * Returns per-day capacity aggregation: { [dateISO]: { scheduledHours, capacity, fullness } }
 */
export async function GET(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    if (!fromParam || !toParam) {
      return NextResponse.json(
        { error: 'Both "from" and "to" query parameters are required (ISO date strings).' },
        { status: 400 },
      )
    }

    const from = new Date(fromParam)
    const to = new Date(toParam)

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return NextResponse.json({ error: 'Invalid date format.' }, { status: 400 })
    }

    await connectDB()

    const user = await UserModel.findById(userId).lean() as LeanDoc | null
    const dailyCapacity = ((user?.calendarPreferences as Record<string, unknown>)?.dailyCapacityHours as number) || 8

    // Get all scheduled tasks in range
    const tasks = (await TaskModel.find({
      scheduledStart: { $gte: from, $lte: to },
      status: { $nin: ['dropped'] },
      isHabit: { $ne: true },
    }).lean()) as LeanDoc[]

    // Aggregate per day
    const result: Record<string, DayCapacity> = {}

    // Initialize all days in range
    const current = new Date(from)
    current.setHours(0, 0, 0, 0)
    const endDate = new Date(to)
    endDate.setHours(23, 59, 59, 999)

    while (current <= endDate) {
      const dateKey = current.toISOString().slice(0, 10)
      result[dateKey] = {
        scheduledHours: 0,
        capacity: dailyCapacity,
        fullness: 0,
      }
      current.setDate(current.getDate() + 1)
    }

    // Sum up hours per day
    for (const t of tasks) {
      const start = t.scheduledStart as Date
      const end = t.scheduledEnd as Date | null
      const dateKey = new Date(start).toISOString().slice(0, 10)

      if (!result[dateKey]) continue

      let hours: number
      if (end) {
        hours = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60)
      } else {
        hours = (t.estimatedEffort as number) || 1
      }

      result[dateKey].scheduledHours += hours
      result[dateKey].fullness = result[dateKey].scheduledHours / result[dateKey].capacity
    }

    return NextResponse.json(result)
  } catch (err) {
    return handleApiError(err)
  }
}
