
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
  { value: 'high', label: 'High', color: 'var(--priority-high)', key: '1' },
  { value: 'medium', label: 'Medium', color: 'var(--priority-medium)', key: '2' },
  { value: 'low', label: 'Low', color: 'var(--priority-low)', key: '3' },
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
      className="popover-shell w-[160px]"
    >
      {PRIORITIES.map((p) => (
        <button
          key={p.value}
          onClick={() => {
            onSelect(selected === p.value ? null : p.value)
          }}
          className="menu-item cursor-pointer"
          style={{
            backgroundColor: selected === p.value ? 'var(--bg-hover)' : 'transparent',
            color: p.color,
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
