import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET env variable is not set')
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

const COOKIE_NAME = 'pim_token'
const TOKEN_EXPIRY = '24h'

export interface TokenPayload extends JWTPayload {
  userId: string
  username: string
  name?: string
}

export async function signToken(payload: { userId: string; username: string; name?: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, SECRET)
  return payload as TokenPayload
}

export { COOKIE_NAME }

// ─── Dev-mode auth helper ───────────────────────────────────────────────────
// Used by API routes to get userId. Falls back to DEV_USER_ID when no token
// is present and auth is bypassed in middleware (dev mode).

const DEV_USER_ID = '6a0ace89bbece9a4ac3e81c9' // Divy Sharma

/**
 * Resolve the current user ID from the request cookie.
 * In dev mode (when middleware bypasses auth), falls back to DEV_USER_ID.
 */
export async function getAuthUserId(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (token) {
      const payload = await verifyToken(token)
      return payload.userId
    }
  } catch {
    // Token invalid or missing
  }
  // Dev fallback — matches middleware bypass at line 57
  if (process.env.NODE_ENV === 'development') {
    return DEV_USER_ID
  }
  return null
}
