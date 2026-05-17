'use client'

import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

/**
 * Shimmer skeleton component.
 * Usage: <Skeleton className="h-4 w-32" /> renders a rounded shimmer rectangle.
 */
export function Skeleton({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={cn('rounded-lg skeleton-shimmer', className)}
      style={{
        background: 'var(--input-bg)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        className="skeleton-shine"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, var(--border) 50%, transparent 100%)',
          animation: 'shimmer 1.5s infinite',
        }}
      />
    </div>
  )
}

/**
 * SkeletonList: renders multiple task-list-shaped skeleton rows.
 */
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2.5 py-2">
          <Skeleton className="w-4 h-4 rounded-full flex-shrink-0" />
          <Skeleton className="h-3.5 flex-1" style={{ maxWidth: `${60 + Math.random() * 30}%` }} />
        </div>
      ))}
    </div>
  )
}

/**
 * SkeletonCard: card-shaped skeleton for widget placeholders.
 */
export function SkeletonCard() {
  return (
    <div className="space-y-3 p-1">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-10 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export default Skeleton
