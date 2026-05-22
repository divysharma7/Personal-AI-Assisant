import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { createFolder } from '@/lib/services/folderService'

export async function POST(req: Request) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Parse body
  const body = await req.json().catch(() => null)
  if (!body?.title || typeof body.title !== 'string' || !body.title.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  try {
    const result = await createFolder({
      title: body.title,
      ownerId: userId,
      icon: body.icon,
      groupId: body.groupId,
      groupTitle: body.groupTitle,
      coverImageUrl: body.coverImageUrl,
      isPrivate: body.isPrivate,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
