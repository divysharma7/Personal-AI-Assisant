import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'
import { apiError, api500 } from '@/lib/apiHelpers'

type LeanDoc = Record<string, unknown> & { _id: unknown }

/**
 * GET /api/users/me/mcp — Get MCP settings (enabled state + api key)
 */
export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) return apiError('Unauthorized', 401)

    await connectDB()
    const user = (await UserModel.findById(userId).lean()) as LeanDoc | null
    if (!user) return apiError('User not found', 404)

    return NextResponse.json({
      mcpEnabled: user.mcpEnabled ?? false,
      mcpApiKey: user.mcpApiKey ?? null,
    })
  } catch (err) {
    return api500(err)
  }
}

/**
 * PATCH /api/users/me/mcp — Toggle MCP on/off
 * Body: { enabled: boolean }
 * When enabling for the first time, generates an API key.
 */
export async function PATCH(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return apiError('Unauthorized', 401)

    const body = (await req.json()) as { enabled?: boolean }
    if (typeof body.enabled !== 'boolean') {
      return apiError('enabled (boolean) is required')
    }

    await connectDB()
    const user = await UserModel.findById(userId)
    if (!user) return apiError('User not found', 404)

    user.mcpEnabled = body.enabled

    // Generate API key on first enable if not already set
    if (body.enabled && !user.mcpApiKey) {
      user.mcpApiKey = `laif_mcp_${randomUUID().replace(/-/g, '')}`
    }

    await user.save()

    return NextResponse.json({
      mcpEnabled: user.mcpEnabled,
      mcpApiKey: user.mcpApiKey,
    })
  } catch (err) {
    return api500(err)
  }
}
