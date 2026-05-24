import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ContactModel from '@/lib/models/Contact'
import { handleApiError } from '@/lib/apiHelpers'
import { getAuthUserId } from '@/lib/auth'
import { CreateContactSchema, parseBody } from '@/lib/validation'

export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const contacts = await ContactModel.find({ userId }).sort({ name: 1 }).lean()
    return NextResponse.json(contacts)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const parsed = parseBody(CreateContactSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

    await connectDB()
    const contact = await ContactModel.create({ ...parsed.data, userId })

    return NextResponse.json(contact, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
