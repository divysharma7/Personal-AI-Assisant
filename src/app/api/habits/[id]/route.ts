import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getAuthUserId } from '@/lib/auth'
import HabitModel from '@/lib/models/Habit'
import { handleApiError } from '@/lib/apiHelpers'
import { UpdateHabitSchema, parseBody } from '@/lib/validation'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const habit = await HabitModel.findOne({ _id: params.id, userId }).lean() as LeanDoc | null
    if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ...habit, _id: String(habit._id) })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const body = await req.json()
    const parsed = parseBody(UpdateHabitSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
    const habit = await HabitModel.findOneAndUpdate({ _id: params.id, userId }, parsed.data, { new: true }).lean() as LeanDoc | null
    if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ...habit, _id: String(habit._id) })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    await HabitModel.findOneAndDelete({ _id: params.id, userId })
    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
