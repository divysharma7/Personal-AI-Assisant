import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { addTaskToFolder } from '@/lib/services/folderService'

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

  const body = await req.json().catch(() => null)
  if (!body?.taskId || typeof body.taskId !== 'string') {
    return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
  }

  try {
    const result = await addTaskToFolder(body.taskId, params.id, userId)
    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    if (message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
