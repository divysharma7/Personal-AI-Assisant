import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { updateFolder, deleteFolder } from '@/lib/services/folderService'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  // Auth check
  const token = cookies().get(COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let userId: string
  try {
    const payload = await verifyToken(token)
    userId = payload.userId
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))

  try {
    const result = await updateFolder(params.id, userId, {
      title: body.title,
      icon: body.icon,
      coverImageUrl: body.coverImageUrl,
      isPrivate: body.isPrivate,
      groupId: body.groupId,
      groupTitle: body.groupTitle,
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
  // Auth check
  const token = cookies().get(COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let userId: string
  try {
    const payload = await verifyToken(token)
    userId = payload.userId
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
