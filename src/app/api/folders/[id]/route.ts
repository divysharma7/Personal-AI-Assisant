import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { updateFolder, deleteFolder } from '@/lib/services/folderService'
import { UpdateFolderSchema, parseBody } from '@/lib/validation'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const parsed = parseBody(UpdateFolderSchema, body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  try {
    const result = await updateFolder(params.id, userId, {
      title: parsed.data.title,
      icon: parsed.data.icon,
      coverImageUrl: parsed.data.coverImageUrl,
      isPrivate: parsed.data.isPrivate,
      groupId: parsed.data.groupId,
      groupTitle: parsed.data.groupTitle,
    })

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    if (message === 'NOT_FOUND') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await deleteFolder(params.id, userId)
    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    if (message === 'NOT_FOUND') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
