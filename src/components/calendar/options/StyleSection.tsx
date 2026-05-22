'use client'

import { Check } from 'lucide-react'
import { cssTransition } from '@/lib/motion'
import type { ViewOptions } from '../ViewOptionsModal'
import type { UpdateFn } from './shared'

interface StyleSectionProps {
  options: ViewOptions
  update: UpdateFn
}

export default function StyleSection({ options, update }: StyleSectionProps) {
  const styles: { key: ViewOptions['itemStyle']; label: string }[] = [
    { key: 'modern', label: 'Modern' },
    { key: 'classic', label: 'Classic' },
  ]

  return (
    <div style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', gap: 12 }}>
        {styles.map((style) => {
          const isActive = options.itemStyle === style.key
          return (
            <button
              key={style.key}
              onClick={() => update({ itemStyle: style.key })}
              style={{
                flex: 1,
                borderRadius: 12,
                padding: 16,
                textAlign: 'center',
                cursor: 'pointer',
                border: isActive
                  ? '2px solid var(--accent)'
                  : '2px solid var(--overlay-2, var(--border))',
                backgroundColor: isActive
                  ? 'color-mix(in srgb, var(--accent) 6%, transparent)'
                  : 'transparent',
                transition: cssTransition.fast,
                position: 'relative',
              }}
            >
              {/* Style preview */}
              <div
                style={{
                  marginBottom: 10,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor:
                    style.key === 'modern' ? 'var(--accent)' : 'transparent',
                  border:
                    style.key === 'classic'
                      ? '1px solid var(--overlay-2, var(--border))'
                      : 'none',
                  borderLeft:
                    style.key === 'classic'
                      ? '3px solid var(--accent)'
                      : undefined,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {isActive && (
                  <Check size={14} strokeWidth={2.5} style={{ color: 'var(--accent)' }} />
                )}
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                    textTransform: 'capitalize',
                  }}
                >
                  {style.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Heatmap toggle */}
      <div style={{ margin: '20px 0 12px', height: 1, backgroundColor: 'var(--border)' }} />

      <p
        style={{
          marginBottom: 12,
          fontSize: 13,
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}
      >
        Heatmap (Year View)
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        {([false, true] as const).map((show) => {
          const isActive = options.showHeatmap === show
          return (
            <button
              key={String(show)}
              onClick={() => update({ showHeatmap: show })}
              style={{
                flex: 1,
                borderRadius: 10,
                padding: '8px 12px',
                textAlign: 'center',
                cursor: 'pointer',
                border: isActive
                  ? '2px solid var(--accent)'
                  : '2px solid var(--overlay-2, var(--border))',
                backgroundColor: 'transparent',
                transition: cssTransition.fast,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                }}
              >
                {show ? 'Show' : 'Hide'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
