'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { fadeSlideDown, ease } from '@/lib/motion'

interface PriorityPopoverProps {
  selected: string | null
  onSelect: (priority: string | null) => void
  onClose: () => void
}

const PRIORITIES = [
  { value: 'high', label: 'High', color: '#ef4444', key: '1' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', key: '2' },
  { value: 'low', label: 'Low', color: '#6b66da', key: '3' },
]

export default function PriorityPopover({
  selected,
  onSelect,
  onClose,
}: PriorityPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      const match = PRIORITIES.find((p) => p.key === e.key)
      if (match) {
        e.preventDefault()
        // Re-selecting clears
        onSelect(selected === match.value ? null : match.value)
      }
    },
    [onClose, onSelect, selected]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <motion.div
      {...fadeSlideDown}
      transition={ease.fast}
      ref={popoverRef}
      className="w-[160px] rounded-xl p-1.5"
      style={{
        backgroundColor: 'var(--bg-pane-2)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-elevated)',
      }}
    >
      {PRIORITIES.map((p) => (
        <button
          key={p.value}
          onClick={() => {
            onSelect(selected === p.value ? null : p.value)
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-100 cursor-pointer"
          style={{
            backgroundColor: selected === p.value ? 'var(--bg-hover)' : 'transparent',
            color: p.color,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              selected === p.value ? 'var(--bg-hover)' : 'transparent'
          }}
        >
          <BarChart3 size={14} strokeWidth={1.5} />
          <span className="flex-1 font-medium">{p.label}</span>
          <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
            {p.key}
          </span>
        </button>
      ))}
    </motion.div>
  )
}
