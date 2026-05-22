'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, PanelLeft, PanelRight, Trash2, Gauge } from 'lucide-react'
import { fadeSlideDown, ease } from '@/lib/motion'

interface KanbanColumnMenuProps {
  open: boolean
  onClose: () => void
  onRename: () => void
  onAddSectionLeft: () => void
  onAddSectionRight: () => void
  onDelete: () => void
  wipLimit?: number | null
  onSetWipLimit?: (limit: number | null) => void
}

export default function KanbanColumnMenu({
  open,
  onClose,
  onRename,
  onAddSectionLeft,
  onAddSectionRight,
  onDelete,
  wipLimit,
  onSetWipLimit,
}: KanbanColumnMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [showWipInput, setShowWipInput] = useState(false)
  const [wipValue, setWipValue] = useState(wipLimit != null ? String(wipLimit) : '')
  const wipInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open, onClose])

  useEffect(() => {
    if (showWipInput) wipInputRef.current?.focus()
  }, [showWipInput])

  // Reset state when menu closes
  useEffect(() => {
    if (!open) {
      setShowWipInput(false)
      setWipValue(wipLimit != null ? String(wipLimit) : '')
    }
  }, [open, wipLimit])

  const handleWipSubmit = () => {
    const parsed = parseInt(wipValue, 10)
    if (onSetWipLimit) {
      onSetWipLimit(isNaN(parsed) || parsed <= 0 ? null : parsed)
    }
    setShowWipInput(false)
    onClose()
  }

  const items = [
    {
      label: 'Rename',
      icon: <Pencil size={15} strokeWidth={1.5} />,
      onClick: () => { onRename(); onClose() },
    },
    {
      label: wipLimit != null ? `WIP Limit: ${wipLimit}` : 'Set WIP Limit',
      icon: <Gauge size={15} strokeWidth={1.5} />,
      onClick: () => { setShowWipInput(true) },
    },
    {
      label: 'Add section to left',
      icon: <PanelLeft size={15} strokeWidth={1.5} />,
      onClick: () => { onAddSectionLeft(); onClose() },
    },
    {
      label: 'Add section to right',
      icon: <PanelRight size={15} strokeWidth={1.5} />,
      onClick: () => { onAddSectionRight(); onClose() },
    },
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          {...fadeSlideDown}
          transition={ease.fast}
          ref={menuRef}
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            zIndex: 50,
            marginTop: 4,
            width: 220,
            borderRadius: 'var(--radius-lg, 16px)',
            padding: '6px 0',
            backgroundColor: 'var(--bg-pane-2, var(--bg-pane))',
            border: '1px solid var(--overlay-2, var(--border))',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                gap: 12,
                padding: '8px 16px',
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--text-primary)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* Inline WIP limit input */}
          {showWipInput && (
            <div style={{ padding: '4px 16px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                ref={wipInputRef}
                type="number"
                min={0}
                value={wipValue}
                onChange={(e) => setWipValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleWipSubmit()
                  if (e.key === 'Escape') { setShowWipInput(false); onClose() }
                }}
                placeholder="Limit (0 = none)"
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  fontSize: 13,
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-pane)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  width: '100%',
                }}
              />
              <button
                onClick={handleWipSubmit}
                style={{
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: 'none',
                  background: 'var(--accent)',
                  color: '#fff',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Set
              </button>
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              height: 1,
              margin: '6px 12px',
              backgroundColor: 'var(--border)',
            }}
          />

          {/* Delete — destructive */}
          <button
            onClick={() => { onDelete(); onClose() }}
            style={{
              display: 'flex',
              width: '100%',
              alignItems: 'center',
              gap: 12,
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 500,
              color: '#ef4444',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Trash2 size={15} strokeWidth={1.5} />
            Delete
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
