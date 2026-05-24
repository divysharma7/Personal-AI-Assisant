import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'
import { getAuthUserId } from '@/lib/auth'
import { handleToolCall, MCP_TOOLS } from '@/mcp/server'
import { handleApiError } from '@/lib/apiHelpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tool, params, apiKey } = body as {
      tool?: string
      params?: Record<string, unknown>
      apiKey?: string
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'apiKey is required' }, { status: 401 })
    }
    if (!tool || typeof tool !== 'string') {
      return NextResponse.json({ error: 'tool is required' }, { status: 400 })
    }

    const validTools = MCP_TOOLS.map((t) => t.name) as string[]
    if (!validTools.includes(tool)) {
      return NextResponse.json({ error: `Unknown tool: ${tool}. Available: ${validTools.join(', ')}` }, { status: 400 })
    }

    await connectDB()
    type LeanUser = Record<string, unknown> & { _id: unknown }
    const user = await UserModel.findOne({ mcpApiKey: apiKey, mcpEnabled: true }).lean() as LeanUser | null
    if (!user) {
      return NextResponse.json({ error: 'Invalid or disabled API key' }, { status: 401 })
    }

    const userId = String(user._id)
    const result = await handleToolCall(tool, params || {}, userId)

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Tool execution failed' }, { status: 400 })
    }

    return NextResponse.json({ result: result.result })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    return NextResponse.json({
      tools: MCP_TOOLS.map((t) => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      })),
    })
  } catch (err) {
    return handleApiError(err)
  }
}
