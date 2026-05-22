import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Workflow from '@/lib/models/Workflow'
import { getAuthUserId } from '@/lib/auth'
import { UpdateWorkflowSchema, parseBody } from '@/lib/validation'
import { apiError, api404, api500 } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return apiError('Unauthorized', 401)

    const workflow = await Workflow.findOne({
      _id: params.id,
      ownerId: userId,
    }).lean() as LeanDoc | null

    if (!workflow) return api404('Workflow')
    return NextResponse.json({ ...workflow, _id: String(workflow._id) })
  } catch (err) {
    return api500(err)
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = parseBody(UpdateWorkflowSchema, body)
    if (!parsed.success) return apiError(parsed.error)

    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return apiError('Unauthorized', 401)

    const workflow = await Workflow.findOneAndUpdate(
      { _id: params.id, ownerId: userId },
      { $set: parsed.data },
      { new: true }
    ).lean() as LeanDoc | null

    if (!workflow) return api404('Workflow')
    return NextResponse.json({ ...workflow, _id: String(workflow._id) })
  } catch (err) {
    return api500(err)
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return apiError('Unauthorized', 401)

    const workflow = await Workflow.findOneAndUpdate(
      { _id: params.id, ownerId: userId },
      { $set: { archived: true } },
      { new: true }
    ).lean() as LeanDoc | null

    if (!workflow) return api404('Workflow')
    return NextResponse.json({ ok: true })
  } catch (err) {
    return api500(err)
  }
}
