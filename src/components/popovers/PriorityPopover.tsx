'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { snappy } from '@/shared/design-system'

export type Priority = 'high' | 'medium' | 'low' | null

interface PriorityPopoverProps {
  open: boolean
  onClose: () => void
  onSelect: (priority: Priority) => void
  currentPriority: Priority
  anchorRect?: DOMRect | null
}

const PRIORITIES: { value: Priority; label: string; color: string; key: string }[] = [
  { value: 'high', label: 'High', color: 'var(--priority-high)', key: '1' },
  { value: 'medium', label: 'Medium', color: 'var(--priority-medium)', key: '2' },
  { value: 'low', label: 'Low', color: 'var(--priority-low)', key: '3' },
]

export default function PriorityPopover({
  open,
  onClose,
  onSelect,
  currentPriority,
  anchorRect,
}: PriorityPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)

  const handleSelect = useCallback((priority: Priority) => {
    onSelect(priority === currentPriority ? null : priority)
    onClose()
  }, [onSelect, onClose, currentPriority])

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') { e.preventDefault(); handleSelect('high') }
      else if (e.key === '2') { e.preventDefault(); handleSelect('medium') }
      else if (e.key === '3') { e.preventDefault(); handleSelect('low') }
      else if (e.key === 'Escape') { e.preventDefault(); onClose() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleSelect, onClose])

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
            width: 160,
            zIndex: 'var(--z-popover)' as unknown as number,
            padding: 4,
          }}
        >
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              className={`popover-item ${currentPriority === p.value ? 'selected' : ''}`}
              onClick={() => handleSelect(p.value)}
              style={{ width: '100%', border: 'none', background: 'transparent', borderRadius: 8 }}
            >
              <BarChart3 size={14} style={{ color: p.color }} />
              <span style={{ flex: 1 }}>{p.label}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.key}</span>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
