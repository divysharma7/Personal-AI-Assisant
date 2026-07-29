/**
 * useAnalytics — React hook for privacy-safe milestone tracking.
 *
 * Tracks the current day's milestones in localStorage so components
 * can check what's already been recorded and fire events idempotently.
 *
 * Privacy rules:
 *  - Only event names, boolean flags, and counts are tracked.
 *  - Never captures task titles, note contents, or any user content.
 *  - Analytics failures never block user actions.
 */

import { useCallback, useEffect, useState } from 'react'
import {
  type AnalyticsEvent,
  trackEvent,
  isAnalyticsDisabled,
  disableAnalytics,
  enableAnalytics,
} from '@/lib/analytics'

// ── Daily milestone state ──────────────────────────────────────

interface DailyMilestones {
  date: string
  has_planned: boolean
  has_focused: boolean
  has_completed_task: boolean
}

const MILESTONES_KEY = 'life-os-milestones'

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

function loadMilestones(): DailyMilestones {
  try {
    const raw = localStorage.getItem(MILESTONES_KEY)
    if (!raw) return defaultMilestones()
    const parsed = JSON.parse(raw) as DailyMilestones
    // Reset if the stored date is stale (new day).
    if (parsed.date !== getToday()) return defaultMilestones()
    return parsed
  } catch {
    return defaultMilestones()
  }
}

function defaultMilestones(): DailyMilestones {
  return {
    date: getToday(),
    has_planned: false,
    has_focused: false,
    has_completed_task: false,
  }
}

function saveMilestones(m: DailyMilestones): void {
  try {
    localStorage.setItem(MILESTONES_KEY, JSON.stringify(m))
  } catch {
    // Storage quota or SSR — silently ignore.
  }
}

// ── Hook ───────────────────────────────────────────────────────

export function useAnalytics() {
  const [milestones, setMilestones] = useState<DailyMilestones>(loadMilestones)

  // Persist milestones whenever they change.
  useEffect(() => {
    saveMilestones(milestones)
  }, [milestones])

  /**
   * Fire a tracked analytics event.
   * The underlying `trackEvent` handles idempotency and disabled state.
   */
  const track = useCallback(
    (event: AnalyticsEvent, metadata?: Record<string, boolean | string | number>) => {
      trackEvent(event, metadata)
    },
    [],
  )

  /**
   * Mark the "morning plan" milestone and fire the event.
   * If the user has also focused and completed a task today,
   * fires `daily_loop_completed` as well.
   */
  const markPlanCompleted = useCallback(() => {
    trackEvent('morning_plan_completed')
    setMilestones((prev) => {
      const next = { ...prev, has_planned: true }
      checkDailyLoop(next)
      return next
    })
  }, [])

  /**
   * Mark the "focus session" milestone and fire the event.
   */
  const markFocusCompleted = useCallback(() => {
    trackEvent('first_focus_session')
    setMilestones((prev) => {
      const next = { ...prev, has_focused: true }
      checkDailyLoop(next)
      return next
    })
  }, [])

  /**
   * Mark the "task completed" milestone and fire the event.
   */
  const markTaskCompleted = useCallback(() => {
    setMilestones((prev) => {
      const next = { ...prev, has_completed_task: true }
      checkDailyLoop(next)
      return next
    })
  }, [])

  /**
   * Mark the "evening shutdown" milestone and fire the event.
   */
  const markShutdownCompleted = useCallback(() => {
    trackEvent('evening_shutdown_completed')
  }, [])

  /**
   * Check if all three daily loop steps are done and fire
   * `daily_loop_completed` if so.
   */
  const checkDailyLoop = useCallback((m: DailyMilestones) => {
    if (m.has_planned && m.has_focused && m.has_completed_task) {
      trackEvent('daily_loop_completed')
    }
  }, [])

  return {
    track,
    milestones,
    markPlanCompleted,
    markFocusCompleted,
    markTaskCompleted,
    markShutdownCompleted,
    isDisabled: isAnalyticsDisabled(),
    disable: disableAnalytics,
    enable: enableAnalytics,
  }
}
