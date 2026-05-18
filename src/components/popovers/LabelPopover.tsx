'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Search, Check, Plus } from 'lucide-react'
import { snappy } from '@/shared/design-system'

export interface LabelItem {
  _id: string
  name: string
  color?: string | null
}

interface LabelPopoverProps {
  open: boolean
  onClose: () => void
  labels: LabelItem[]
  appliedIds: string[]
  onToggle: (labelId: string) => void
  onCreate: (name: string) => void
  anchorRect?: DOMRect | null
}

export default function LabelPopover({
  open,
  onClose,
  labels,
  appliedIds,
  onToggle,
  onCreate,
  anchorRect,
}: LabelPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(0)

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setHighlightIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const filtered = useMemo(() => {
    if (!query) return labels
    const lower = query.toLowerCase()
    return labels.filter(l => l.name.toLowerCase().includes(lower))
  }, [labels, query])

  const exactMatch = useMemo(() => {
    return labels.some(l => l.name.toLowerCase() === query.toLowerCase())
  }, [labels, query])

  const showCreate = query.trim().length > 0 && !exactMatch

  // Reset highlight on filter
  useEffect(() => {
    setHighlightIndex(0)
  }, [filtered.length, showCreate])

  // Click outside
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  // Keyboard nav
  useEffect(() => {
    if (!open) return
    const totalItems = filtered.length + (showCreate ? 1 : 0)
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightIndex(prev => (prev + 1) % totalItems)
      }
      else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightIndex(prev => (prev - 1 + totalItems) % totalItems)
      }
      else if (e.key === 'Enter') {
        e.preventDefault()
        if (showCreate && highlightIndex === 0) {
          onCreate(query.trim())
          setQuery('')
        } else {
          const idx = showCreate ? highlightIndex - 1 : highlightIndex
          const label = filtered[idx]
          if (label) onToggle(label._id)
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose, filtered, highlightIndex, showCreate, query, onCreate, onToggle])

  const top = anchorRect ? anchorRect.bottom + 4 : 0
  const left = anchorRect ? anchorRect.left : 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popoverRef}
          className="popover"
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={snappy}
          style={{
            position: 'fixed',
            top,
            left,
            width: 240,
            zIndex: 'var(--z-popover)' as unknown as number,
          }}
        >
          {/* Search input */}
          <div style={{ padding: '8px 8px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
              <Search size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search or create label"
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: 13,
                  color: 'var(--text-1)',
                }}
              />
            </div>
          </div>

          {/* Create row */}
          {showCreate && (
            <button
              className={`popover-item ${highlightIndex === 0 ? 'selected' : ''}`}
              onClick={() => { onCreate(query.trim()); setQuery('') }}
              style={{ width: '100%', border: 'none', background: 'transparent', borderRadius: 8, margin: '0 4px', maxWidth: 'calc(100% - 8px)' }}
            >
              <Plus size={14} style={{ color: 'var(--color-danger)' }} />
              <span>Create &ldquo;{query.trim()}&rdquo;</span>
            </button>
          )}

          {/* Label list */}
          <div style={{ maxHeight: 240, overflowY: 'auto', padding: '2px 4px 4px' }}>
            {filtered.map((label, idx) => {
              const listIdx = showCreate ? idx + 1 : idx
              const isApplied = appliedIds.includes(label._id)
              return (
                <button
                  key={label._id}
                  className={`popover-item ${listIdx === highlightIndex ? 'selected' : ''}`}
                  onClick={() => onToggle(label._id)}
                  style={{ width: '100%', border: 'none', background: 'transparent', borderRadius: 8, justifyContent: 'space-between' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag size={14} style={{ color: label.color || 'var(--text-2)' }} />
                    <span>{label.name}</span>
                  </span>
                  {isApplied && <Check size={14} style={{ color: 'var(--color-danger)' }} />}
                </button>
              )
            })}
            {filtered.length === 0 && !showCreate && (
              <p style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
                No labels found
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
