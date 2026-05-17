import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import HabitModel from '@/lib/models/Habit'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET() {
  await connectDB()
  const habits = await HabitModel.find({ archived: { $ne: true } }).sort({ order: 1, createdAt: -1 }).lean() as LeanDoc[]
  return NextResponse.json(habits.map(h => ({ ...h, _id: String(h._id) })))
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const habit = await HabitModel.create(body)
  const plain = habit.toObject() as LeanDoc
  return NextResponse.json({ ...plain, _id: String(plain._id) }, { status: 201 })
}
