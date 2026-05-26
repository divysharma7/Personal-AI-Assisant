import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'pim_token'

const PUBLIC_PREFIXES = [
  '/login', '/signup', '/onboarding', '/getting-started',
  '/_next', '/favicon',
]

function isPublic(pathname: string) {
  return PUBLIC_PREFIXES.some(p => pathname.startsWith(p))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (isPublic(pathname)) return NextResponse.next()

  // Cookie-presence check only — backend verifies the token
  const hasCookie = request.cookies.has(COOKIE_NAME)
  if (!hasCookie) {
    if (process.env.NODE_ENV === 'development') return NextResponse.next()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico|.*\\.webp).*)'],
}
