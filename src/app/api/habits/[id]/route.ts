import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import HabitModel from '@/lib/models/Habit'
import { handleApiError } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const habit = await HabitModel.findById(params.id).lean() as LeanDoc | null
    if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ...habit, _id: String(habit._id) })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const body = await req.json()
    const habit = await HabitModel.findByIdAndUpdate(params.id, body, { new: true }).lean() as LeanDoc | null
    if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ...habit, _id: String(habit._id) })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    await HabitModel.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
