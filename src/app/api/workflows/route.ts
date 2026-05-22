import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Workflow from '@/lib/models/Workflow'
import { getAuthUserId } from '@/lib/auth'
import { CreateWorkflowSchema, parseBody } from '@/lib/validation'
import { getTemplateColumns } from '@/lib/workflowTemplates'
import { handleApiError } from '@/lib/apiHelpers'
import { UnauthorizedError, ValidationError } from '@/lib/errors'

type LeanDoc = Record<string, unknown> & { _id: unknown }

export async function GET() {
  try {
    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) throw new UnauthorizedError()

    const workflows = await Workflow.find({ ownerId: userId, archived: false })
      .sort({ order: 1 })
      .lean() as LeanDoc[]

    return NextResponse.json(
      workflows.map((w) => ({ ...w, _id: String(w._id) }))
    )
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = parseBody(CreateWorkflowSchema, body)
    if (!parsed.success) throw new ValidationError(parsed.error)

    await connectDB()
    const userId = await getAuthUserId()
    if (!userId) throw new UnauthorizedError()

    const { columns, order, ...rest } = parsed.data

    // Generate columns from template if none provided
    const finalColumns = columns ?? getTemplateColumns(rest.templateType)

    // Auto-assign order: max existing order + 1
    let finalOrder = order
    if (finalOrder === undefined) {
      const last = await Workflow.findOne({ ownerId: userId })
        .sort({ order: -1 })
        .lean() as LeanDoc | null
      finalOrder = last ? (last.order as number) + 1 : 0
    }

    const workflow = await Workflow.create({
      ...rest,
      columns: finalColumns,
      order: finalOrder,
      ownerId: userId,
    })

    const plain = workflow.toObject() as LeanDoc
    return NextResponse.json(
      { ...plain, _id: String(plain._id) },
      { status: 201 }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
