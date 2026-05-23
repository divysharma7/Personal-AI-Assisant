import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import HabitModel from '@/lib/models/Habit'
import { handleApiError } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET() {
  try {
    await connectDB()
    const habits = await HabitModel.find({ archived: { $ne: true } }).sort({ order: 1, createdAt: -1 }).lean() as LeanDoc[]
    return NextResponse.json(habits.map(h => ({ ...h, _id: String(h._id) })))
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()
    const habit = await HabitModel.create(body)
    const plain = habit.toObject() as LeanDoc
    return NextResponse.json({ ...plain, _id: String(plain._id) }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
