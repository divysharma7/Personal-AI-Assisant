import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import LabelModel from '@/lib/models/Label'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET() {
  await connectDB()
  const labels = await LabelModel.find().sort({ name: 1 }).lean() as LeanDoc[]
  return NextResponse.json(labels.map(l => ({ ...l, _id: String(l._id) })))
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const label = await LabelModel.create(body)
  const plain = label.toObject() as LeanDoc
  return NextResponse.json({ ...plain, _id: String(plain._id) }, { status: 201 })
}
