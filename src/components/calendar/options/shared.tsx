'use client'

import { HelpCircle } from 'lucide-react'
import { motionTokens, cssTransition } from '@/lib/motion'
import type { ViewOptions } from '../ViewOptionsModal'

/** TickTick-style pill toggle — 44 x 24 px */
export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        position: 'relative',
        height: 24,
        width: 44,
        flexShrink: 0,
        borderRadius: 999,
        cursor: 'pointer',
        border: 'none',
        backgroundColor: value ? 'var(--accent)' : 'var(--overlay-3, #ccc)',
        transition: `background-color ${motionTokens.duration.fast * 1000}ms ease`,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          height: 18,
          width: 18,
          borderRadius: 999,
          backgroundColor: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          transition: `transform ${motionTokens.duration.fast * 1000}ms ease`,
          transform: value ? 'translateX(22px)' : 'translateX(3px)',
        }}
      />
    </button>
  )
}

/** Standard toggle row — label left, control right, 44px row height */
export function OptionRow({
  label,
  children,
  info,
}: {
  label: string
  children: React.ReactNode
  info?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: 44,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
        {info && <HelpCircle size={13} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />}
      </div>
      {children}
    </div>
  )
}

export function RadioGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid var(--overlay-2, var(--border))',
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          style={{
            flex: 1,
            padding: '5px 10px',
            fontSize: 12,
            fontWeight: value === opt.key ? 600 : 500,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: value === opt.key ? 'var(--accent)' : 'transparent',
            color: value === opt.key ? '#fff' : 'var(--text-muted)',
            transition: cssTransition.fast,
          }}
          onMouseEnter={(e) => {
            if (value !== opt.key) e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
          }}
          onMouseLeave={(e) => {
            if (value !== opt.key) e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: '10px 20px 4px',
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--text-faint)',
      }}
    >
      {children}
    </div>
  )
}

export function HourSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  const formatHour = (h: number) => {
    if (h === 0 || h === 24) return '12 AM'
    if (h === 12) return '12 PM'
    if (h < 12) return `${h} AM`
    return `${h - 12} PM`
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 20px' }}>
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', minWidth: 80 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 180 }}>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            flex: 1,
            accentColor: 'var(--accent)',
            cursor: 'pointer',
          }}
        />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', minWidth: 44, textAlign: 'right' }}>
          {formatHour(value)}
        </span>
      </div>
    </div>
  )
}

/** Helper to produce a partial-update function for ViewOptions */
export type UpdateFn = (partial: Partial<ViewOptions>) => void
