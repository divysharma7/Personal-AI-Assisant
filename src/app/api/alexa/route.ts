import { NextResponse } from 'next/server'

/**
 * DISABLED — Alexa endpoint lacks cryptographic signature verification.
 * Re-enable with proper ask-sdk signature validation when Alexa integration is ready.
 * See docs/SECURITY_AUDIT.md findings #1-#4.
 */

export async function POST() {
  return NextResponse.json({ error: 'Alexa integration is disabled' }, { status: 404 })
}

export async function GET() {
  return NextResponse.json({ error: 'Alexa integration is disabled' }, { status: 404 })
}
