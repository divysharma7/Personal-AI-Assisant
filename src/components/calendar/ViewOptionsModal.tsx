'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { X, ChevronRight, HelpCircle } from 'lucide-react'
import { scaleIn, ease } from '@/lib/motion'

interface ViewOptionsModalProps {
  open: boolean
  onClose: () => void
  options: ViewOptions
  onOptionsChange: (options: ViewOptions) => void
}

export interface ViewOptions {
  showWeekends: boolean
  showCompleted: boolean
  showCheckItem: boolean
  showAllRepeatCycle: boolean
  showHabit: boolean
  showFocusRecords: boolean
  showCountdown: boolean
  additionalTimeZone: boolean
  colorBy: 'list' | 'tag' | 'priority'
  itemStyle: 'modern' | 'classic'
  showHeatmap: boolean
}

export const DEFAULT_VIEW_OPTIONS: ViewOptions = {
  showWeekends: true,
  showCompleted: false,
  showCheckItem: false,
  showAllRepeatCycle: false,
  showHabit: true,
  showFocusRecords: false,
  showCountdown: false,
  additionalTimeZone: false,
  colorBy: 'list',
  itemStyle: 'classic',
  showHeatmap: true,
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative h-5 w-9 flex-shrink-0 rounded-full cursor-pointer transition-colors"
      style={{
        backgroundColor: value ? 'var(--accent)' : 'var(--overlay-3, var(--text-faint))',
        transitionDuration: 'var(--dur, 150ms)',
      }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
        style={{
          transform: value ? 'translateX(18px)' : 'translateX(2px)',
          transitionDuration: 'var(--dur, 150ms)',
        }}
      />
    </button>
  )
}

function OptionRow({ label, children, info }: { label: string; children: React.ReactNode; info?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-2.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
        {info && <HelpCircle size={13} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />}
      </div>
      {children}
    </div>
  )
}

export default function ViewOptionsModal({ open, onClose, options, onOptionsChange }: ViewOptionsModalProps) {
  const [page, setPage] = useState<'main' | 'color' | 'style'>('main')
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) setPage('main')
  }, [open])

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [open, onClose])

  if (!open) return null

  const update = (partial: Partial<ViewOptions>) => {
    onOptionsChange({ ...options, ...partial })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        ref={modalRef}
        {...scaleIn}
        transition={ease.slow}
        className="w-[380px] rounded-[var(--radius-xl,20px)] overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-pane)',
          border: '1px solid var(--overlay-2, var(--border))',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            {page === 'main' ? 'View Options' : page === 'color' ? 'Color' : 'Style'}
          </h3>
          <button
            onClick={() => page === 'main' ? onClose() : setPage('main')}
            className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer transition-sl"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Main page */}
        {page === 'main' && (
          <div className="py-2">
            {/* Color / Style nav */}
            <button
              onClick={() => setPage('color')}
              className="flex w-full items-center justify-between px-5 py-2.5 cursor-pointer transition-sl"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <span className="text-[14px] font-medium">Color</span>
              <ChevronRight size={14} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />
            </button>
            <button
              onClick={() => setPage('style')}
              className="flex w-full items-center justify-between px-5 py-2.5 cursor-pointer transition-sl"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <span className="text-[14px] font-medium">Style</span>
              <ChevronRight size={14} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />
            </button>

            <div className="mx-5 my-2 h-px" style={{ backgroundColor: 'var(--border)' }} />

            <OptionRow label="Show Weekends">
              <Toggle value={options.showWeekends} onChange={(v) => update({ showWeekends: v })} />
            </OptionRow>

            <div className="mx-5 my-2 h-px" style={{ backgroundColor: 'var(--border)' }} />

            <OptionRow label="Show Completed">
              <Toggle value={options.showCompleted} onChange={(v) => update({ showCompleted: v })} />
            </OptionRow>
            <OptionRow label="Show Check Item">
              <Toggle value={options.showCheckItem} onChange={(v) => update({ showCheckItem: v })} />
            </OptionRow>
            <OptionRow label="Show All Repeat Cycle">
              <Toggle value={options.showAllRepeatCycle} onChange={(v) => update({ showAllRepeatCycle: v })} />
            </OptionRow>

            <div className="mx-5 my-2 h-px" style={{ backgroundColor: 'var(--border)' }} />

            <OptionRow label="Show Habit">
              <Toggle value={options.showHabit} onChange={(v) => update({ showHabit: v })} />
            </OptionRow>
            <OptionRow label="Show Focus Records" info>
              <Toggle value={options.showFocusRecords} onChange={(v) => update({ showFocusRecords: v })} />
            </OptionRow>
            <OptionRow label="Show Countdown">
              <Toggle value={options.showCountdown} onChange={(v) => update({ showCountdown: v })} />
            </OptionRow>

            <div className="mx-5 my-2 h-px" style={{ backgroundColor: 'var(--border)' }} />

            <OptionRow label="Additional Time Zone" info>
              <Toggle value={options.additionalTimeZone} onChange={(v) => update({ additionalTimeZone: v })} />
            </OptionRow>
          </div>
        )}

        {/* Color sub-page */}
        {page === 'color' && (
          <div className="py-3 px-5">
            <p className="mb-3 text-[13px]" style={{ color: 'var(--text-muted)' }}>
              Color By
            </p>
            {(['list', 'tag', 'priority'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => update({ colorBy: opt })}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] font-medium cursor-pointer transition-sl"
                style={{ color: options.colorBy === opt ? 'var(--accent)' : 'var(--text-primary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {options.colorBy === opt && (
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                )}
                <span className="capitalize">{opt}</span>
              </button>
            ))}
            <p className="mt-3 text-[12px]" style={{ color: 'var(--text-faint)' }}>
              Tasks are shown in their {options.colorBy} color. Colors may be slightly toned down for text clarity.
            </p>
          </div>
        )}

        {/* Style sub-page */}
        {page === 'style' && (
          <div className="py-3 px-5">
            <p className="mb-3 text-[13px]" style={{ color: 'var(--text-muted)' }}>
              Item Style
            </p>
            <div className="flex gap-3 mb-4">
              {(['modern', 'classic'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => update({ itemStyle: style })}
                  className="flex-1 rounded-lg p-3 text-center cursor-pointer transition-sl"
                  style={{
                    border: options.itemStyle === style
                      ? '2px solid var(--accent)'
                      : '2px solid var(--overlay-2, var(--border))',
                    backgroundColor: 'var(--overlay-1, var(--bg-pane-2))',
                  }}
                >
                  {/* Preview block */}
                  <div
                    className="mb-2 h-6 rounded"
                    style={{
                      backgroundColor: style === 'modern' ? 'var(--accent)' : 'transparent',
                      border: style === 'classic' ? '1px solid var(--overlay-2, var(--border))' : 'none',
                      borderLeft: style === 'classic' ? '3px solid var(--accent)' : undefined,
                    }}
                  />
                  <span className="text-[13px] font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                    {style}
                  </span>
                </button>
              ))}
            </div>

            <div className="my-3 h-px" style={{ backgroundColor: 'var(--border)' }} />

            <p className="mb-3 text-[13px]" style={{ color: 'var(--text-muted)' }}>
              Heatmap (Year View)
            </p>
            <div className="flex gap-3">
              {([false, true] as const).map((show) => (
                <button
                  key={String(show)}
                  onClick={() => update({ showHeatmap: show })}
                  className="flex-1 rounded-lg p-2 text-center cursor-pointer transition-sl"
                  style={{
                    border: options.showHeatmap === show
                      ? '2px solid var(--accent)'
                      : '2px solid var(--overlay-2, var(--border))',
                  }}
                >
                  <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {show ? 'Show' : 'Hide'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
