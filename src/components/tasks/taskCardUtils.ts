/**
 * Shared utilities for TaskRow and TaskCard.
 *
 * Extracted from TaskRow.tsx so both list-row and kanban-card
 * components can share the same logic and icons.
 */

import React from 'react'

// ── Priority colour map ──────────────────────────────────────

export const PRIORITY_COLORS: Record<string, string> = {
  high: 'var(--priority-high, #ef4444)',
  medium: 'var(--priority-medium, #f59e0b)',
  low: 'var(--priority-low, #6b66da)',
}

// ── PriorityBarsIcon ─────────────────────────────────────────

/** Filled priority bars — 3 solid rectangles with varying heights */
export function PriorityBarsIcon({ color, size = 20 }: { color: string; size?: number }) {
  return React.createElement(
    'svg',
    { width: size, height: size, viewBox: '0 0 20 20', fill: 'none' },
    React.createElement('rect', { x: 3, y: 12, width: 3.5, height: 6, rx: 1, fill: color }),
    React.createElement('rect', { x: 8.25, y: 8, width: 3.5, height: 10, rx: 1, fill: color }),
    React.createElement('rect', { x: 13.5, y: 4, width: 3.5, height: 14, rx: 1, fill: color }),
  )
}

// ── SubtaskRing ──────────────────────────────────────────────

/** Circular progress ring showing subtask completion */
export function SubtaskRing({
  completed,
  total,
  size = 16,
}: {
  completed: number
  total: number
  size?: number
}) {
  const r = 6
  const circumference = 2 * Math.PI * r
  const progress = total > 0 ? completed / total : 0
  const dashOffset = circumference * (1 - progress)

  return React.createElement(
    'svg',
    { width: size, height: size, viewBox: '0 0 16 16' },
    React.createElement('circle', {
      cx: 8,
      cy: 8,
      r,
      fill: 'none',
      stroke: 'var(--overlay-3, #605f6a)',
      strokeWidth: 2,
    }),
    React.createElement('circle', {
      cx: 8,
      cy: 8,
      r,
      fill: 'none',
      stroke: 'var(--text-muted)',
      strokeWidth: 2,
      strokeDasharray: circumference,
      strokeDashoffset: dashOffset,
      strokeLinecap: 'round',
      transform: 'rotate(-90 8 8)',
      style: { transition: 'stroke-dashoffset 300ms ease' },
    }),
  )
}

// ── Date formatting ──────────────────────────────────────────

/** Returns a human-friendly relative date string, or null for empty input */
export function formatRelativeDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)
  const days = Math.round((target.getTime() - now.getTime()) / 86400000)

  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days > 1 && days <= 7) return `in ${days} days`
  if (days < -1) return `${Math.abs(days)} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
