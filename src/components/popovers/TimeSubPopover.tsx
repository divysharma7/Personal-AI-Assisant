'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { copy } from '@/lib/copy'
import { fadeSlideDown, ease } from '@/lib/motion'

interface TimeSubPopoverProps {
  selected: Date | null
  onSelect: (hour: number, minute: number) => void
  onClear: () => void
  onClose: () => void
}

function formatTimeSlot(hour: number, minute: number): string {
  const d = new Date(2000, 0, 1, hour, minute)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function TimeSubPopover({
  selected,
  onSelect,
  onClear,
  onClose,
}: TimeSubPopoverProps) {
  const [inputValue, setInputValue] = useState(
    selected && selected.getHours() !== 0
      ? formatTimeSlot(selected.getHours(), selected.getMinutes())
      : ''
  )
  const popoverRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)

  // Generate 30-min increments from 12:00 AM to 11:30 PM
  const timeSlots = useMemo(() => {
    const slots: { hour: number; minute: number; label: string }[] = []
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        slots.push({ hour: h, minute: m, label: formatTimeSlot(h, m) })
      }
    }
    return slots
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Scroll selected into view
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'center' })
  }, [])

  const isSlotSelected = (hour: number, minute: number) => {
    if (!selected) return false
    return selected.getHours() === hour && selected.getMinutes() === minute
  }

  const handleInputSubmit = () => {
    // Try to parse the input value
    const match = inputValue.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm)?$/i)
    if (match) {
      let hour = parseInt(match[1], 10)
      const minute = match[2] ? parseInt(match[2], 10) : 0
      const ampm = match[3]?.toLowerCase()
      if (ampm === 'pm' && hour < 12) hour += 12
      if (ampm === 'am' && hour === 12) hour = 0
      if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
        onSelect(hour, minute)
      }
    }
  }

  return (
    <motion.div
      {...fadeSlideDown}
      transition={ease.fast}
      ref={popoverRef}
      className="flex w-[220px] flex-col rounded-xl shadow-lg"
      style={{
        backgroundColor: 'var(--bg-pane-2)',
        border: '1px solid var(--border)',
      }}
    >
      {/* No due time */}
      <button
        onClick={() => {
          onClear()
        }}
        className="flex items-center px-3 py-2.5 text-sm transition-colors duration-100 cursor-pointer"
        style={{
          color: 'var(--text-muted)',
          borderBottom: '1px solid var(--border)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        {copy.popovers.time.noDueDate}
      </button>

      {/* Time input */}
      <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleInputSubmit()
            }
          }}
          placeholder="e.g. 9:30 AM"
          className="w-full rounded-md px-2.5 py-1.5 text-sm outline-none"
          style={{
            backgroundColor: 'var(--bg-hover)',
            color: 'var(--text-primary)',
          }}
          autoFocus
        />
      </div>

      {/* Scrollable time list */}
      <div className="max-h-[200px] overflow-y-auto py-1">
        {timeSlots.map(({ hour, minute, label }) => {
          const selected_ = isSlotSelected(hour, minute)
          return (
            <button
              key={`${hour}:${minute}`}
              ref={selected_ ? selectedRef : undefined}
              onClick={() => onSelect(hour, minute)}
              className="flex w-full items-center justify-between px-3 py-1.5 text-sm transition-colors duration-100 cursor-pointer"
              style={{
                backgroundColor: selected_ ? 'var(--bg-hover)' : 'transparent',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = selected_
                  ? 'var(--bg-hover)'
                  : 'transparent'
              }}
            >
              {label}
              {selected_ && (
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <button
          onClick={onClear}
          className="rounded-md px-2 py-1 text-xs font-medium transition-colors duration-100 cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          {copy.popovers.time.clear}
        </button>
        <button
          onClick={handleInputSubmit}
          className="rounded-md px-2 py-1 text-xs font-medium transition-colors duration-100 cursor-pointer"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#fff',
          }}
        >
          {copy.popovers.time.done}
        </button>
      </div>
    </motion.div>
  )
}
