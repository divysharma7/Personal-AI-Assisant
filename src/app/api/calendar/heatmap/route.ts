import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'
import { handleApiError } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

/**
 * GET /api/calendar/heatmap?year=2026
 * Returns { [dateString: YYYY-MM-DD]: completedCount } for the given year.
 */
export async function GET(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const yearParam = searchParams.get('year')

    if (!yearParam) {
      return NextResponse.json({ error: '"year" query parameter is required' }, { status: 400 })
    }

    const year = parseInt(yearParam, 10)
    if (isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
    }

    const from = new Date(year, 0, 1)
    const to = new Date(year, 11, 31, 23, 59, 59, 999)

    await connectDB()

    const tasks = (await TaskModel.find({
      status: 'done',
      completedAt: { $gte: from, $lte: to },
    })
      .select('completedAt')
      .lean()) as LeanDoc[]

    // Group by date string, count per date
    const heatmap: Record<string, number> = {}

    for (const t of tasks) {
      const completedAt = t.completedAt as Date
      if (!completedAt) continue
      const dateStr = new Date(completedAt).toISOString().slice(0, 10)
      heatmap[dateStr] = (heatmap[dateStr] || 0) + 1
    }

    return NextResponse.json(heatmap)
  } catch (err) {
    return handleApiError(err)
  }
}
