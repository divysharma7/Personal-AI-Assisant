import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { COOKIE_NAME } from '@/lib/auth'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? '')

/**
 * Paths that don't require authentication.
 * Phase 4 routes: /updates (replaces /messages), /lists (directory view)
 * are authenticated routes — they work during dev because auth is bypassed.
 */
const PUBLIC_PREFIXES = [
  '/login',
  '/signup',
  '/onboarding',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/logout',
  '/api/posthook_listener',
  '/api/devices/register',
  '/api/alexa',
  '/_next',
  '/favicon',
]

function isPublic(pathname: string) {
  return PUBLIC_PREFIXES.some(p => pathname.startsWith(p))
}

/**
 * Resolve a JWT token from the request using priority order:
 * 1. Cookie (pim_token)
 * 2. Authorization: Bearer <token> header
 * 3. x-api-key header (treated as a JWT)
 */
function resolveToken(request: NextRequest): string | undefined {
  // 1. Cookie-based auth (highest priority)
  const cookieToken = request.cookies.get(COOKIE_NAME)?.value
  if (cookieToken) return cookieToken

  // 2. Bearer token from Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice(7).trim()
    if (bearerToken) return bearerToken
  }

  // 3. x-api-key header (lowest priority)
  const apiKey = request.headers.get('x-api-key')
  if (apiKey) return apiKey

  return undefined
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublic(pathname)) return NextResponse.next()

  const token = resolveToken(request)

  if (!token) {
    if (process.env.NODE_ENV === 'development') return NextResponse.next()
    return pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    await jwtVerify(token, SECRET)
    return NextResponse.next()
  } catch {
    if (process.env.NODE_ENV === 'development') return NextResponse.next()
    const res = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url))
    res.cookies.delete(COOKIE_NAME)
    return res
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico|.*\\.webp).*)'],
}
