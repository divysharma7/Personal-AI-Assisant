/**
 * Privacy-safe analytics module (LOS-602).
 *
 * Tracks product milestones — never captures task titles, note contents,
 * calendar event details, tokens, or any other personal material.
 *
 * Only event names, counts, and anonymous boolean flags are sent.
 * Analytics failures never block user actions.
 */

import { env } from '@/config/env'

const API_BASE = env.VITE_API_URL

// ── Event catalogue ────────────────────────────────────────────

export type AnalyticsEvent =
  | 'onboarding_completed'
  | 'google_connected'
  | 'first_task_scheduled'
  | 'first_focus_session'
  | 'morning_plan_completed'
  | 'evening_shutdown_completed'
  | 'daily_loop_completed'

// ── Privacy-safe metadata ──────────────────────────────────────
// Only boolean flags and counts — never strings that contain user content.

interface EventMetadata {
  /** ISO date string (YYYY-MM-DD) — day the event fired. */
  date?: string
  /** Anonymous boolean flags derived from app state. */
  [key: string]: boolean | string | number | undefined
}

// ── State ──────────────────────────────────────────────────────

let analyticsDisabled = false

/**
 * Disable analytics for the rest of the session.
 * Call from a settings toggle or a privacy preference.
 */
export function disableAnalytics(): void {
  analyticsDisabled = true
}

/**
 * Re-enable analytics (e.g. when re-hydrating settings).
 */
export function enableAnalytics(): void {
  analyticsDisabled = false
}

export function isAnalyticsDisabled(): boolean {
  return analyticsDisabled
}

// ── Idempotency guard ──────────────────────────────────────────
// Tracks which events have already been sent today so repeated
// calls don't double-count. Resets at midnight (localStorage key).

interface SentRecord {
  [date: string]: string[] // date → event names
}

const STORAGE_KEY = 'life-os-analytics-sent'

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

function loadSent(): SentRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as SentRecord
  } catch {
    return {}
  }
}

function saveSent(record: SentRecord): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  } catch {
    // Storage quota or SSR — silently ignore.
  }
}

function wasAlreadySent(event: AnalyticsEvent, date: string): boolean {
  const record = loadSent()
  return record[date]?.includes(event) ?? false
}

function markSent(event: AnalyticsEvent, date: string): void {
  const record = loadSent()
  if (!record[date]) record[date] = []
  if (!record[date].includes(event)) record[date].push(event)

  // Prune old dates — keep only the last 7 days.
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  const cutoffStr = cutoff.toISOString().slice(0, 10)
  for (const key of Object.keys(record)) {
    if (key < cutoffStr) delete record[key]
  }

  saveSent(record)
}

// ── Core tracking function ─────────────────────────────────────

/**
 * Fire a privacy-safe analytics event.
 *
 * - In development: logs to console only.
 * - In production: POSTs to /api/analytics (fire-and-forget).
 * - Idempotent within a calendar day.
 * - Never throws — analytics failure must never block a user action.
 */
export function trackEvent(
  event: AnalyticsEvent,
  metadata?: EventMetadata,
): void {
  if (analyticsDisabled) return

  const date = getToday()
  if (wasAlreadySent(event, date)) return

  // Mark immediately so concurrent calls are deduplicated.
  markSent(event, date)

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    metadata: {
      ...metadata,
      date,
    },
  }

  if (import.meta.env.DEV) {
    console.log('[analytics]', event, payload.metadata)
    return
  }

  // Production: fire-and-forget POST.
  fetch(`${API_BASE}/api/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  }).catch(() => {
    // Intentionally swallowed — analytics must never block the user.
  })
}
