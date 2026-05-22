import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { AppError } from './errors'

// ── Legacy helpers (kept for backward compat) ────────────────────────────────

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function api404(resource = 'Resource') {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 })
}

export function api500(error: unknown) {
  console.error('[API Error]', error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

// ── Typed error handler ──────────────────────────────────────────────────────

export function handleApiError(error: unknown): NextResponse {
  // Typed application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      },
      { status: error.statusCode },
    )
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    const details = error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }))
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details,
        },
      },
      { status: 422 },
    )
  }

  // Generic / unexpected errors
  console.error('[API Error]', error)
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    },
    { status: 500 },
  )
}
