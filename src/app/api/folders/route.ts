import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { createFolder } from '@/lib/services/folderService'
import { CreateFolderSchema, parseBody } from '@/lib/validation'

export async function POST(req: Request) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = parseBody(CreateFolderSchema, body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  try {
    const result = await createFolder({
      title: parsed.data.title,
      ownerId: userId,
      icon: parsed.data.icon,
      groupId: parsed.data.groupId,
      groupTitle: parsed.data.groupTitle,
      coverImageUrl: parsed.data.coverImageUrl,
      isPrivate: parsed.data.isPrivate,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
