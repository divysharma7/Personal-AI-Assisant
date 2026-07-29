import type { ReactNode } from 'react'
import RitualCard from './RitualCard'

interface RitualStepProps {
  /** Step number (1-indexed) */
  step: number
  /** Step title */
  title: string
  /** Optional subtitle */
  subtitle?: string
  /** Card body content */
  children: ReactNode
  /** Whether this step is currently active / expanded */
  active?: boolean
  /** Optional accent color */
  accent?: string
}

/**
 * A numbered step container for ritual flows.
 * Combines a step number badge with a RitualCard.
 */
export default function RitualStep({
  step,
  title,
  subtitle,
  children,
  active = true,
  accent,
}: RitualStepProps) {
  return (
    <div className="flex flex-col gap-3" role="group" aria-label={`Step ${step}: ${title}`}>
      {/* Step header */}
      <div className="flex items-center gap-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
          style={{
            backgroundColor: active ? 'var(--accent)' : 'var(--overlay-2)',
            color: active ? 'white' : 'var(--text-faint)',
            transition: 'background-color 150ms ease, color 150ms ease',
          }}
        >
          {step}
        </span>
        <div className="flex flex-col">
          <h2
            className="text-[15px] font-semibold"
            style={{ color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-[12px]" style={{ color: 'var(--text-faint)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Card body */}
      {active && (
        <RitualCard accent={accent}>
          {children}
        </RitualCard>
      )}
    </div>
  )
}
