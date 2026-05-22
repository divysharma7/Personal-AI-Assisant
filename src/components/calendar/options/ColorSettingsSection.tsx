'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { motionTokens, cssTransition } from '@/lib/motion'
import type { ViewOptions } from '../ViewOptionsModal'
import type { UpdateFn } from './shared'

const PRESET_COLORS = [
  '#5DA8FF', '#6b66da', '#34d399', '#f59e0b',
  '#ec4899', '#ef4444', '#8b5cf6', '#06b6d4',
  '#84cc16', '#f97316', '#14b8a6', '#a855f7',
]

type ColorTab = 'task' | 'habit' | 'countdown'

const COLOR_BY_OPTIONS: { key: ViewOptions['colorBy']; label: string }[] = [
  { key: 'list', label: 'List' },
  { key: 'tag', label: 'Tag' },
  { key: 'priority', label: 'Priority' },
]

const DESCRIPTION_MAP: Record<ViewOptions['colorBy'], string> = {
  list: 'Tasks are shown in their list color (to ensure readability, colors will be slightly toned down).',
  tag: 'Tasks are shown in their tag color (to ensure readability, colors will be slightly toned down).',
  priority: 'Tasks are shown by priority level color.',
}

/** Color circle button on each list row */
function ListColorCircle({
  list,
}: {
  list: { id: string; name: string; color: string }
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pickerOpen) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [pickerOpen])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setPickerOpen((v) => !v)}
        style={{
          width: 20,
          height: 20,
          borderRadius: 999,
          backgroundColor: list.color,
          border: '2px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
          flexShrink: 0,
          transition: `transform ${motionTokens.duration.instant * 1000}ms ease`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
      />

      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: motionTokens.duration.instant }}
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 4,
              zIndex: 60,
              padding: 8,
              borderRadius: 12,
              backgroundColor: 'var(--bg-pane)',
              border: '1px solid var(--overlay-2, var(--border))',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 6,
            }}
          >
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('laif:list-color-change', {
                      detail: { listId: list.id, color },
                    })
                  )
                  setPickerOpen(false)
                }}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  backgroundColor: color,
                  border:
                    list.color === color
                      ? '2px solid var(--text-primary)'
                      : '2px solid transparent',
                  cursor: 'pointer',
                  transition: `transform ${motionTokens.duration.instant * 1000}ms ease`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Single list row: icon + name + color circle */
function ListRow({ list }: { list: { id: string; name: string; color: string } }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        height: 48,
        padding: '0 20px',
      }}
    >
      {/* Default list icon (colored dot) */}
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          backgroundColor: list.color,
          flexShrink: 0,
          opacity: 0.8,
        }}
      />
      <span
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {list.name}
      </span>
      <ListColorCircle list={list} />
    </div>
  )
}

/** Color By dropdown styled as a button */
function ColorByDropdown({
  value,
  onChange,
}: {
  value: ViewOptions['colorBy']
  onChange: (v: ViewOptions['colorBy']) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const current = COLOR_BY_OPTIONS.find((o) => o.key === value)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 10px',
          borderRadius: 8,
          border: '1px solid var(--overlay-2, var(--border))',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-primary)',
          transition: cssTransition.bg,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <span>{current?.label}</span>
        <ChevronDown size={14} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: motionTokens.duration.instant }}
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 4,
              zIndex: 60,
              minWidth: 120,
              padding: 4,
              borderRadius: 10,
              backgroundColor: 'var(--bg-pane)',
              border: '1px solid var(--overlay-2, var(--border))',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}
          >
            {COLOR_BY_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => {
                  onChange(opt.key)
                  setOpen(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  transition: cssTransition.bg,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <span>{opt.label}</span>
                {value === opt.key && (
                  <Check size={14} strokeWidth={2.5} style={{ color: 'var(--accent)' }} />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface ColorSettingsSectionProps {
  options: ViewOptions
  update: UpdateFn
  lists: { id: string; name: string; color: string; visible: boolean }[]
}

export default function ColorSettingsSection({
  options,
  update,
  lists,
}: ColorSettingsSectionProps) {
  const [activeTab, setActiveTab] = useState<ColorTab>('task')

  const tabs: { key: ColorTab; label: string }[] = [
    { key: 'task', label: 'Task' },
    { key: 'habit', label: 'Habit' },
    { key: 'countdown', label: 'Countdown' },
  ]

  return (
    <div style={{ padding: '12px 0' }}>
      {/* Tabs: Task | Habit | Countdown */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: '0 20px 12px',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '6px 16px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              backgroundColor:
                activeTab === tab.key ? 'var(--accent)' : 'var(--overlay-1, #f0f0f0)',
              color: activeTab === tab.key ? '#fff' : 'var(--text-muted)',
              transition: cssTransition.fast,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Color By row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          height: 44,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
          Color By
        </span>
        <ColorByDropdown value={options.colorBy} onChange={(v) => update({ colorBy: v })} />
      </div>

      {/* Description text */}
      <div style={{ padding: '4px 20px 12px' }}>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            lineHeight: 1.5,
            color: 'var(--text-faint)',
          }}
        >
          {DESCRIPTION_MAP[options.colorBy]}
        </p>
      </div>

      {/* Separator */}
      <div style={{ margin: '0 20px 4px', height: 1, backgroundColor: 'var(--border)' }} />

      {/* List colors (scrollable) */}
      {lists.length > 0 ? (
        <div>
          {lists.map((list) => (
            <ListRow key={list.id} list={list} />
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: '24px 20px',
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--text-faint)',
          }}
        >
          No lists yet
        </div>
      )}
    </div>
  )
}
