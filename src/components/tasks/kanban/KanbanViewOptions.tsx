'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { scaleIn, ease, cssTransition } from '@/lib/motion'
import { useSettingsStore } from '@/stores/settingsStore'
import type { KanbanSize } from '@/stores/settingsStore'
import { copy } from '@/lib/copy'

interface KanbanViewOptionsProps {
  open: boolean
  onClose: () => void
}

const SIZE_OPTIONS: { value: KanbanSize; label: string }[] = [
  { value: 'small', label: copy.tasks.kanban.sizeSmall },
  { value: 'medium', label: copy.tasks.kanban.sizeMedium },
  { value: 'large', label: copy.tasks.kanban.sizeLarge },
]

export default function KanbanViewOptions({ open, onClose }: KanbanViewOptionsProps) {
  const kanbanSize = useSettingsStore((s) => s.kanbanSize)
  const showKanbanInputBox = useSettingsStore((s) => s.showKanbanInputBox)
  const setKanbanSize = useSettingsStore((s) => s.setKanbanSize)
  const setShowKanbanInputBox = useSettingsStore((s) => s.setShowKanbanInputBox)
  const modalRef = useRef<HTMLDivElement>(null)

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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <motion.div
        ref={modalRef}
        {...scaleIn}
        transition={ease.slow}
        style={{
          width: 360,
          borderRadius: 16,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-pane)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {copy.tasks.kanban.viewOptions}
          </h3>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 6,
              cursor: 'pointer',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              transition: cssTransition.bg,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Kanban Size */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              {copy.tasks.kanban.kanbanSize}
            </label>
            <select
              value={kanbanSize}
              onChange={(e) => setKanbanSize(e.target.value as KanbanSize)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-pane-2, var(--bg-hover))',
                color: 'var(--text-primary)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                outline: 'none',
                transition: cssTransition.fast,
              }}
            >
              {SIZE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Show Input Box toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              {copy.tasks.kanban.showInputBox}
            </label>
            <button
              onClick={() => setShowKanbanInputBox(!showKanbanInputBox)}
              style={{
                width: 40,
                height: 22,
                borderRadius: 11,
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                backgroundColor: showKanbanInputBox
                  ? 'var(--accent, #6366f1)'
                  : 'var(--overlay-2, rgba(255,255,255,0.12))',
                transition: cssTransition.fast,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  left: showKanbanInputBox ? 20 : 2,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  backgroundColor: '#fff',
                  transition: cssTransition.fast,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
