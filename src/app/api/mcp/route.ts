import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'
import { handleToolCall, MCP_TOOLS } from '@/mcp/server'
import { apiError, api500 } from '@/lib/apiHelpers'

/**
 * POST /api/mcp
 * Body: { tool: string, params: object, apiKey: string }
 * Response: { result: ... } or { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tool, params, apiKey } = body as {
      tool?: string
      params?: Record<string, unknown>
      apiKey?: string
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return apiError('apiKey is required', 401)
    }
    if (!tool || typeof tool !== 'string') {
      return apiError('tool is required')
    }

    // Validate tool name exists
    const validTools = MCP_TOOLS.map((t) => t.name) as string[]
    if (!validTools.includes(tool)) {
      return apiError(`Unknown tool: ${tool}. Available: ${validTools.join(', ')}`)
    }

    // Look up user by MCP API key
    await connectDB()
    type LeanUser = Record<string, unknown> & { _id: unknown }
    const user = await UserModel.findOne({ mcpApiKey: apiKey, mcpEnabled: true }).lean() as LeanUser | null
    if (!user) {
      return apiError('Invalid or disabled API key', 401)
    }

    const userId = String(user._id)
    const result = await handleToolCall(tool, params || {}, userId)

    if (!result.success) {
      return apiError(result.error || 'Tool execution failed')
    }

    return NextResponse.json({ result: result.result })
  } catch (err) {
    return api500(err)
  }
}

/**
 * GET /api/mcp — list available tools (no auth required)
 */
export async function GET() {
  return NextResponse.json({
    tools: MCP_TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    })),
  })
}
