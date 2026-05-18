'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, Bell, Repeat,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import {
  addDays, addWeeks, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, format, setHours, setMinutes,
} from 'date-fns'
import { snappy } from '@/shared/design-system'
import TimeSubPopover from './TimeSubPopover'

type RepeatOption = 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly'

interface DatePopoverProps {
  open: boolean
  onClose: () => void
  onSelect: (date: Date | null, repeat?: RepeatOption | null) => void
  currentDate: Date | null
  currentRepeat?: RepeatOption | null
  anchorRect?: DOMRect | null
}

const REPEAT_OPTIONS: { value: RepeatOption; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

export default function DatePopover({
  open,
  onClose,
  onSelect,
  currentDate,
  currentRepeat,
  anchorRect,
}: DatePopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const today = useMemo(() => new Date(), [])
  const [viewMonth, setViewMonth] = useState(() => currentDate || today)
  const [selectedDate, setSelectedDate] = useState<Date | null>(currentDate)
  const [selectedRepeat, setSelectedRepeat] = useState<RepeatOption | null>(currentRepeat || null)
  const [showTime, setShowTime] = useState(false)
  const [showRepeat, setShowRepeat] = useState(false)
  const [timeAnchorRect, setTimeAnchorRect] = useState<DOMRect | null>(null)
  const timeRowRef = useRef<HTMLButtonElement>(null)

  // Sync state when props change
  useEffect(() => {
    if (open) {
      setSelectedDate(currentDate)
      setSelectedRepeat(currentRepeat || null)
      setViewMonth(currentDate || today)
      setShowTime(false)
      setShowRepeat(false)
    }
  }, [open, currentDate, currentRepeat, today])

  // Calendar grid
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [viewMonth])

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

  const handleQuickDate = useCallback((date: Date) => {
    setSelectedDate(date)
    setViewMonth(date)
  }, [])

  const handleDayClick = useCallback((day: Date) => {
    if (selectedDate) {
      // Preserve existing time
      const newDate = new Date(day)
      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes())
      setSelectedDate(newDate)
    } else {
      setSelectedDate(day)
    }
  }, [selectedDate])

  const handleTimeSelect = useCallback((time: string | null) => {
    if (!time) {
      // Clear time, keep just the date
      if (selectedDate) {
        const d = new Date(selectedDate)
        d.setHours(0, 0, 0, 0)
        setSelectedDate(d)
      }
      return
    }
    const [h, m] = time.split(':').map(Number)
    const base = selectedDate || today
    const d = setMinutes(setHours(new Date(base), h), m)
    setSelectedDate(d)
  }, [selectedDate, today])

  const handleDone = useCallback(() => {
    onSelect(selectedDate, selectedRepeat)
    onClose()
  }, [selectedDate, selectedRepeat, onSelect, onClose])

  const handleClear = useCallback(() => {
    onSelect(null, null)
    onClose()
  }, [onSelect, onClose])

  const openTimePopover = useCallback(() => {
    if (timeRowRef.current) {
      setTimeAnchorRect(timeRowRef.current.getBoundingClientRect())
    }
    setShowTime(true)
  }, [])

  const currentTimeStr = selectedDate
    ? `${selectedDate.getHours().toString().padStart(2, '0')}:${selectedDate.getMinutes().toString().padStart(2, '0')}`
    : null

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
            width: 280,
            zIndex: 'var(--z-popover)' as unknown as number,
          }}
        >
          {/* Quick options */}
          <div style={{ padding: '4px' }}>
            <button
              className="popover-item"
              onClick={() => handleQuickDate(today)}
              style={{ width: '100%', border: 'none', background: 'transparent', borderRadius: 8 }}
            >
              <Calendar size={14} style={{ color: 'var(--text-2)' }} />
              <span>Today</span>
            </button>
            <button
              className="popover-item"
              onClick={() => handleQuickDate(addDays(today, 1))}
              style={{ width: '100%', border: 'none', background: 'transparent', borderRadius: 8 }}
            >
              <Calendar size={14} style={{ color: 'var(--text-2)' }} />
              <span>Tomorrow</span>
            </button>
            <button
              className="popover-item"
              onClick={() => handleQuickDate(addWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1))}
              style={{ width: '100%', border: 'none', background: 'transparent', borderRadius: 8 }}
            >
              <Calendar size={14} style={{ color: 'var(--text-2)' }} />
              <span>Next week</span>
            </button>
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '2px 8px' }} />

          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px 4px' }}>
            <button
              className="btn-icon"
              onClick={() => setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              style={{ width: 28, height: 28 }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
              {format(viewMonth, 'MMMM yyyy')}
            </span>
            <button
              className="btn-icon"
              onClick={() => setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              style={{ width: 28, height: 28 }}
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 8px', gap: 0 }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--text-3)', padding: '4px 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 8px 4px', gap: 0 }}>
            {calendarDays.map((day) => {
              const isToday = isSameDay(day, today)
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
              const isCurrentMonth = isSameMonth(day, viewMonth)
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: isToday || isSelected ? 600 : 400,
                    color: isSelected
                      ? '#fff'
                      : isCurrentMonth
                        ? 'var(--text-1)'
                        : 'var(--text-3)',
                    background: isSelected
                      ? 'var(--color-danger)'
                      : 'transparent',
                    borderRadius: '50%',
                    border: isToday && !isSelected ? '1.5px solid var(--color-danger)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.1s, color 0.1s',
                  }}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '2px 8px' }} />

          {/* Time row */}
          <div style={{ padding: '2px 4px' }}>
            <button
              ref={timeRowRef}
              className="popover-item"
              onClick={openTimePopover}
              style={{ width: '100%', border: 'none', background: 'transparent', borderRadius: 8, justifyContent: 'space-between' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={14} style={{ color: 'var(--text-2)' }} />
                <span>Time</span>
              </span>
              {currentTimeStr && currentTimeStr !== '00:00' && (
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                  {currentTimeStr}
                </span>
              )}
            </button>
          </div>

          {/* Remind me (disabled) */}
          <div style={{ padding: '0 4px' }}>
            <div
              className="popover-item disabled"
              style={{ borderRadius: 8, opacity: 0.4, cursor: 'not-allowed' }}
            >
              <Bell size={14} style={{ color: 'var(--text-3)' }} />
              <span style={{ color: 'var(--text-3)' }}>Remind me</span>
            </div>
          </div>

          {/* Repeat */}
          <div style={{ padding: '0 4px' }}>
            <button
              className="popover-item"
              onClick={() => setShowRepeat(!showRepeat)}
              style={{ width: '100%', border: 'none', background: 'transparent', borderRadius: 8, justifyContent: 'space-between' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Repeat size={14} style={{ color: 'var(--text-2)' }} />
                <span>Repeat</span>
              </span>
              {selectedRepeat && (
                <span style={{ fontSize: 12, color: 'var(--text-2)', textTransform: 'capitalize' }}>
                  {selectedRepeat}
                </span>
              )}
            </button>
            <AnimatePresence>
              {showRepeat && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ overflow: 'hidden', paddingLeft: 28 }}
                >
                  {REPEAT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`popover-item ${selectedRepeat === opt.value ? 'selected' : ''}`}
                      onClick={() => setSelectedRepeat(selectedRepeat === opt.value ? null : opt.value)}
                      style={{ width: '100%', border: 'none', background: 'transparent', borderRadius: 8, fontSize: 13 }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderTop: '1px solid var(--border)', marginTop: 2 }}>
            <button
              onClick={handleClear}
              style={{ border: 'none', background: 'transparent', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
            >
              Clear
            </button>
            <button
              onClick={handleDone}
              style={{ border: 'none', background: 'transparent', fontSize: 12, fontWeight: 600, color: 'var(--text-1)', cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
            >
              Done
            </button>
          </div>

          {/* Time sub-popover */}
          <TimeSubPopover
            open={showTime}
            onClose={() => setShowTime(false)}
            onSelect={handleTimeSelect}
            currentTime={currentTimeStr}
            anchorRect={timeAnchorRect}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
