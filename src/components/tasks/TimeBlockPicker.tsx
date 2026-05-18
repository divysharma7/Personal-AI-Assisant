'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, X } from 'lucide-react'
import { copy } from '@/lib/copy'
import { fadeSlideDown, buttonPress, ease } from '@/lib/motion'

interface TimeBlockPickerProps {
  open: boolean
  onClose: () => void
  onSave: (data: {
    scheduledStart: string
    scheduledEnd: string
    estimatedEffort: number
    syncToGoogle: boolean
  }) => void
  googleConnected?: boolean
  anchorRef?: React.RefObject<HTMLElement>
}

const TIME_SLOTS: string[] = []
for (let h = 6; h <= 23; h++) {
  TIME_SLOTS.push(`${h}:00`)
  TIME_SLOTS.push(`${h}:30`)
}

const DURATION_MAP: Record<string, number> = {
  '15m': 0.25,
  '30m': 0.5,
  '45m': 0.75,
  '1h': 1,
  '1.5h': 1.5,
  '2h': 2,
  '3h': 3,
  '4h': 4,
}

function formatTimeLabel(slot: string): string {
  const [h, m] = slot.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`
}

function getDateString(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

export default function TimeBlockPicker({
  open,
  onClose,
  onSave,
  googleConnected = false,
}: TimeBlockPickerProps) {
  const [dateMode, setDateMode] = useState<'today' | 'tomorrow' | 'custom'>('today')
  const [customDate, setCustomDate] = useState(getDateString(0))
  const [startTime, setStartTime] = useState('9:00')
  const [duration, setDuration] = useState('1h')
  const [syncToGoogle, setSyncToGoogle] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  const handleSave = () => {
    let dateStr: string
    if (dateMode === 'today') dateStr = getDateString(0)
    else if (dateMode === 'tomorrow') dateStr = getDateString(1)
    else dateStr = customDate

    const [h, m] = startTime.split(':').map(Number)
    const start = new Date(dateStr)
    start.setHours(h, m, 0, 0)

    const durationHours = DURATION_MAP[duration] || 1
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000)

    onSave({
      scheduledStart: start.toISOString(),
      scheduledEnd: end.toISOString(),
      estimatedEffort: durationHours,
      syncToGoogle,
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popoverRef}
          {...fadeSlideDown}
          transition={ease.normal}
          className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl p-4"
          style={{
            backgroundColor: 'var(--bg-pane)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-modal)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {copy.timeBlock.title}
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
              style={{ color: 'var(--text-faint)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>

          {/* Date selection */}
          <div className="mb-3">
            <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {copy.timeBlock.dateLabel}
            </label>
            <div className="flex gap-1">
              {(['today', 'tomorrow', 'custom'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDateMode(mode)}
                  className="flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
                  style={{
                    backgroundColor: dateMode === mode ? 'var(--accent)' : 'var(--bg-hover)',
                    color: dateMode === mode ? '#FFFFFF' : 'var(--text-muted)',
                  }}
                >
                  {mode === 'today'
                    ? copy.timeBlock.today
                    : mode === 'tomorrow'
                    ? copy.timeBlock.tomorrow
                    : copy.timeBlock.pickDate}
                </button>
              ))}
            </div>
            {dateMode === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="mt-2 w-full rounded-lg px-3 py-1.5 text-xs"
                style={{
                  backgroundColor: 'var(--bg-pane-2)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}
              />
            )}
          </div>

          {/* Start time */}
          <div className="mb-3">
            <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {copy.timeBlock.startTimeLabel}
            </label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-lg px-3 py-1.5 text-xs cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-pane-2)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {formatTimeLabel(slot)}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="mb-3">
            <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {copy.timeBlock.durationLabel}
            </label>
            <div className="grid grid-cols-4 gap-1">
              {copy.timeBlock.durations.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className="rounded-lg px-2 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
                  style={{
                    backgroundColor: duration === d ? 'var(--accent)' : 'var(--bg-hover)',
                    color: duration === d ? '#FFFFFF' : 'var(--text-muted)',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Sync to Google Calendar checkbox */}
          {googleConnected && (
            <label className="mb-3 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={syncToGoogle}
                onChange={(e) => setSyncToGoogle(e.target.checked)}
                className="h-3.5 w-3.5 rounded"
                style={{ accentColor: 'var(--accent)' }}
              />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {copy.timeBlock.syncCheckbox}
              </span>
            </label>
          )}

          {/* Save */}
          <motion.button
            {...buttonPress}
            onClick={handleSave}
            className="w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity duration-150 cursor-pointer"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            {copy.timeBlock.saveCta}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
