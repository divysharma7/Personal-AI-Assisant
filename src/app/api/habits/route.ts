import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getAuthUserId } from '@/lib/auth'
import HabitModel from '@/lib/models/Habit'
import { handleApiError } from '@/lib/apiHelpers'
import { CreateHabitSchema, parseBody } from '@/lib/validation'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const habits = await HabitModel.find({ userId, archived: { $ne: true } }).sort({ order: 1, createdAt: -1 }).lean() as LeanDoc[]
    return NextResponse.json(habits.map(h => ({ ...h, _id: String(h._id) })))
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const body = await req.json()
    const parsed = parseBody(CreateHabitSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
    const habit = await HabitModel.create({ ...parsed.data, userId })
    const plain = habit.toObject() as LeanDoc
    return NextResponse.json({ ...plain, _id: String(plain._id) }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
