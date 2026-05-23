import TaskModel from '@/lib/models/Task'
import { addComment } from '@/lib/addComment'
import { handleApiError } from '@/lib/apiHelpers'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { text } = await req.json()
    return addComment(TaskModel, params.id, text)
  } catch (err) {
    return handleApiError(err)
  }
}
