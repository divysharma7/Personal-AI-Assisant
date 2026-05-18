'use client'

/**
 * CalendarEmpty — shown when a day has no scheduled tasks.
 * Subtle fading calendar lines illustration with breathing pulse.
 */
export default function CalendarEmpty() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-16"
      style={{ animation: 'cal-empty-breathe 4s ease-in-out infinite' }}
    >
      {/* Illustration: fading calendar lines */}
      <div className="flex flex-col gap-2 w-32 opacity-30">
        <div
          className="h-px w-full"
          style={{ backgroundColor: 'var(--border)' }}
        />
        <div
          className="h-px w-3/4"
          style={{ backgroundColor: 'var(--border)' }}
        />
        <div
          className="h-px w-full"
          style={{ backgroundColor: 'var(--border)' }}
        />
        <div
          className="h-px w-1/2"
          style={{ backgroundColor: 'var(--border)' }}
        />
        <div
          className="h-px w-full"
          style={{ backgroundColor: 'var(--border)' }}
        />
      </div>
      <p
        className="text-sm text-center max-w-[240px]"
        style={{ color: 'var(--text-faint)' }}
      >
        This day is open. Drag a task from the right to plan it.
      </p>
    </div>
  )
}
