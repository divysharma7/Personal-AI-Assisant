import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { addTaskToFolder } from '@/lib/services/folderService'
import { FolderTaskSchema, parseBody } from '@/lib/validation'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = parseBody(FolderTaskSchema, body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  try {
    const result = await addTaskToFolder(parsed.data.taskId, params.id, userId)
    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    if (message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
