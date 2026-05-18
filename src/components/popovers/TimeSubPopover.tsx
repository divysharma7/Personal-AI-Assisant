'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { snappy } from '@/shared/design-system'

interface TimeSubPopoverProps {
  open: boolean
  onClose: () => void
  onSelect: (time: string | null) => void
  currentTime: string | null // "HH:mm" format
  anchorRect?: DOMRect | null
}

function generate30MinSlots(): string[] {
  const slots: string[] = []
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const hh = h.toString().padStart(2, '0')
      const mm = m.toString().padStart(2, '0')
      slots.push(`${hh}:${mm}`)
    }
  }
  return slots
}

function formatTime12(time24: string): string {
  const [hStr, mStr] = time24.split(':')
  let h = parseInt(hStr, 10)
  const m = mStr
  const ampm = h >= 12 ? 'PM' : 'AM'
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  return `${h}:${m} ${ampm}`
}

export default function TimeSubPopover({
  open,
  onClose,
  onSelect,
  currentTime,
  anchorRect,
}: TimeSubPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState(currentTime || '')

  const slots = useMemo(() => generate30MinSlots(), [])

  // Sync input when currentTime changes
  useEffect(() => {
    setInputValue(currentTime || '')
  }, [currentTime])

  // Scroll to current time on open
  useEffect(() => {
    if (!open || !scrollRef.current || !currentTime) return
    const idx = slots.indexOf(currentTime)
    if (idx >= 0 && scrollRef.current) {
      const itemHeight = 36
      scrollRef.current.scrollTop = Math.max(0, idx * itemHeight - 72)
    }
  }, [open, currentTime, slots])

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

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const handleInputCommit = () => {
    // Validate HH:mm
    const match = inputValue.match(/^(\d{1,2}):(\d{2})$/)
    if (match) {
      const h = parseInt(match[1], 10)
      const m = parseInt(match[2], 10)
      if (h >= 0 && h < 24 && m >= 0 && m < 60) {
        const normalized = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        onSelect(normalized)
        onClose()
        return
      }
    }
  }

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
            width: 220,
            zIndex: 'var(--z-popover)' as unknown as number,
          }}
        >
          {/* No due date option */}
          <button
            className="popover-item"
            onClick={() => { onSelect(null); onClose() }}
            style={{ width: '100%', border: 'none', background: 'transparent', borderRadius: 8, color: 'var(--text-2)' }}
          >
            No due time
          </button>

          {/* Editable time input */}
          <div style={{ padding: '4px 8px' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleInputCommit() }}
              placeholder="HH:MM"
              className="input-interactive"
              style={{ padding: '6px 10px', fontSize: 13, textAlign: 'center' }}
            />
          </div>

          {/* 30-min increment list */}
          <div
            ref={scrollRef}
            style={{ maxHeight: 200, overflowY: 'auto', padding: '4px 0' }}
          >
            {slots.map((slot) => (
              <button
                key={slot}
                className={`popover-item ${slot === currentTime ? 'selected' : ''}`}
                onClick={() => { onSelect(slot); onClose() }}
                style={{ width: '100%', border: 'none', background: 'transparent', borderRadius: 8, fontSize: 13 }}
              >
                {formatTime12(slot)}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderTop: '1px solid var(--border)' }}>
            <button
              className="popover-item"
              onClick={() => { onSelect(null); onClose() }}
              style={{ border: 'none', background: 'transparent', fontSize: 12, color: 'var(--text-2)', borderRadius: 6, padding: '4px 8px' }}
            >
              Clear
            </button>
            <button
              className="popover-item"
              onClick={() => { handleInputCommit() }}
              style={{ border: 'none', background: 'transparent', fontSize: 12, fontWeight: 600, color: 'var(--text-1)', borderRadius: 6, padding: '4px 8px' }}
            >
              Done
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
