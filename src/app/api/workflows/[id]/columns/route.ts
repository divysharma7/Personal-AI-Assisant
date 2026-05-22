import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { connectDB } from '@/lib/mongodb'
import Workflow from '@/lib/models/Workflow'
import { getAuthUserId } from '@/lib/auth'
import { WorkflowColumnSchema, parseBody } from '@/lib/validation'
import { apiError, api404, api500 } from '@/lib/apiHelpers'
import { z } from 'zod'

type LeanDoc = Record<string, unknown> & { _id: unknown }

const AddColumnSchema = z.object({
  title: z.string().min(1).max(100),
  color: z.string().nullable().optional(),
  wipLimit: z.number().int().min(1).nullable().optional(),
})

const ReplaceColumnsSchema = z.object({
  columns: z.array(WorkflowColumnSchema),
})

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = parseBody(AddColumnSchema, body)
    if (!parsed.success) return apiError(parsed.error)

    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return apiError('Unauthorized', 401)

    const existing = await Workflow.findOne({
      _id: params.id,
      ownerId: userId,
    }).lean() as LeanDoc | null

    if (!existing) return api404('Workflow')

    const columns = (existing.columns as Array<{ order: number }>) ?? []
    const maxOrder = columns.reduce((max, c) => Math.max(max, c.order), -1)

    const newColumn = {
      id: uuidv4(),
      title: parsed.data.title,
      order: maxOrder + 1,
      color: parsed.data.color ?? null,
      wipLimit: parsed.data.wipLimit ?? null,
    }

    const workflow = await Workflow.findOneAndUpdate(
      { _id: params.id, ownerId: userId },
      { $push: { columns: newColumn } },
      { new: true }
    ).lean() as LeanDoc | null

    if (!workflow) return api404('Workflow')
    return NextResponse.json(
      { ...workflow, _id: String(workflow._id) },
      { status: 201 }
    )
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
    const parsed = parseBody(ReplaceColumnsSchema, body)
    if (!parsed.success) return apiError(parsed.error)

    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) return apiError('Unauthorized', 401)

    const workflow = await Workflow.findOneAndUpdate(
      { _id: params.id, ownerId: userId },
      { $set: { columns: parsed.data.columns } },
      { new: true }
    ).lean() as LeanDoc | null

    if (!workflow) return api404('Workflow')
    return NextResponse.json({ ...workflow, _id: String(workflow._id) })
  } catch (err) {
    return api500(err)
  }
}
