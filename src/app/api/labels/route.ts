import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import LabelModel from '@/lib/models/Label'
import { handleApiError } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET() {
  try {
    await connectDB()
    const labels = await LabelModel.find().sort({ name: 1 }).lean() as LeanDoc[]
    return NextResponse.json(labels.map(l => ({ ...l, _id: String(l._id) })))
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()
    const label = await LabelModel.create(body)
    const plain = label.toObject() as LeanDoc
    return NextResponse.json({ ...plain, _id: String(plain._id) }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
