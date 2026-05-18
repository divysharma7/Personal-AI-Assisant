'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Bell,
  Repeat,
} from 'lucide-react'
import { copy } from '@/lib/copy'
import { fadeSlideDown, ease } from '@/lib/motion'
import TimeSubPopover from './TimeSubPopover'

interface DatePopoverProps {
  selected: Date | null
  onSelect: (date: Date | null) => void
  onClose: () => void
  repeat?: string | null
  onRepeatChange?: (repeat: string | null) => void
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const REPEAT_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  // Monday-based: (0=Mon, 6=Sun)
  const startDow = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (Date | null)[] = []
  // Leading blanks
  for (let i = 0; i < startDow; i++) cells.push(null)
  // Days
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  // Trailing blanks to fill 6 rows
  while (cells.length < 42) cells.push(null)
  return cells
}

export default function DatePopover({
  selected,
  onSelect,
  onClose,
  repeat,
  onRepeatChange,
}: DatePopoverProps) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth())
  const [pendingDate, setPendingDate] = useState<Date | null>(selected)
  const [showTime, setShowTime] = useState(false)
  const [showRepeat, setShowRepeat] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const days = getCalendarDays(viewYear, viewMonth)
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

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

  const selectQuickDate = useCallback(
    (d: Date) => {
      setPendingDate(d)
      setHasChanges(true)
    },
    []
  )

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + (7 - today.getDay() + 1))

  const handleDone = useCallback(() => {
    onSelect(pendingDate)
    onClose()
  }, [pendingDate, onSelect, onClose])

  const handleClear = useCallback(() => {
    setPendingDate(null)
    setHasChanges(true)
  }, [])

  const handleTimeSelect = useCallback(
    (hour: number, minute: number) => {
      const d = pendingDate ? new Date(pendingDate) : new Date()
      d.setHours(hour, minute, 0, 0)
      setPendingDate(d)
      setHasChanges(true)
      setShowTime(false)
    },
    [pendingDate]
  )

  if (showTime) {
    return (
      <TimeSubPopover
        selected={pendingDate}
        onSelect={handleTimeSelect}
        onClear={() => {
          // Clear time, keep date
          if (pendingDate) {
            const d = new Date(pendingDate)
            d.setHours(0, 0, 0, 0)
            setPendingDate(d)
          }
          setShowTime(false)
        }}
        onClose={() => setShowTime(false)}
      />
    )
  }

  return (
    <motion.div
      {...fadeSlideDown}
      transition={ease.fast}
      ref={popoverRef}
      className="w-[280px] rounded-xl p-3"
      style={{
        backgroundColor: 'var(--bg-pane-2)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-elevated)',
      }}
    >
      {/* Quick options */}
      <div className="mb-3 flex flex-col gap-0.5">
        {[
          { label: copy.popovers.date.today, date: today },
          { label: copy.popovers.date.tomorrow, date: tomorrow },
          { label: copy.popovers.date.nextWeek, date: nextWeek },
        ].map(({ label, date }) => (
          <button
            key={label}
            onClick={() => selectQuickDate(date)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-100 cursor-pointer"
            style={{
              backgroundColor:
                pendingDate && isSameDay(pendingDate, date)
                  ? 'var(--bg-hover)'
                  : 'transparent',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                pendingDate && isSameDay(pendingDate, date)
                  ? 'var(--bg-hover)'
                  : 'transparent'
            }}
          >
            <Calendar size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
            {label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="mb-3 h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* Month header */}
      <div className="mb-2 flex items-center justify-between px-1">
        <button
          onClick={() => {
            if (viewMonth === 0) {
              setViewMonth(11)
              setViewYear(viewYear - 1)
            } else {
              setViewMonth(viewMonth - 1)
            }
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md cursor-pointer transition-colors duration-100"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
        </button>
        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
          {monthLabel}
        </span>
        <button
          onClick={() => {
            if (viewMonth === 11) {
              setViewMonth(0)
              setViewYear(viewYear + 1)
            } else {
              setViewMonth(viewMonth + 1)
            }
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md cursor-pointer transition-colors duration-100"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <ChevronRight size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* Weekday row */}
      <div className="mb-1 grid grid-cols-7 gap-0">
        {WEEKDAYS.map((day, i) => (
          <div
            key={i}
            className="flex h-7 items-center justify-center text-[10px] font-medium"
            style={{ color: 'var(--text-faint)' }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="mb-3 grid grid-cols-7 gap-0">
        {days.map((day, i) => {
          if (!day) {
            return <div key={`blank-${i}`} className="h-7" />
          }
          const isToday = isSameDay(day, today)
          const isSelected = pendingDate ? isSameDay(day, pendingDate) : false
          return (
            <button
              key={i}
              onClick={() => {
                setPendingDate(day)
                setHasChanges(true)
              }}
              className="flex h-7 w-full items-center justify-center rounded-full text-[11px] transition-colors duration-100 cursor-pointer"
              style={{
                backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                color: isSelected
                  ? '#fff'
                  : isToday
                  ? 'var(--accent)'
                  : 'var(--text-primary)',
                border: isToday && !isSelected ? '1px solid var(--accent)' : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>

      {/* Time row */}
      <button
        onClick={() => setShowTime(true)}
        className="mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-100 cursor-pointer"
        style={{ color: 'var(--text-primary)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <Clock size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
        {copy.popovers.date.time}
        {pendingDate && pendingDate.getHours() !== 0 && (
          <span className="ml-auto text-xs" style={{ color: 'var(--text-faint)' }}>
            {pendingDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
        )}
      </button>

      {/* Remind me (disabled) */}
      <button
        disabled
        className="mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm opacity-40"
        style={{ color: 'var(--text-faint)' }}
      >
        <Bell size={14} strokeWidth={1.5} />
        {copy.popovers.date.remindMe}
      </button>

      {/* Repeat */}
      <div>
        <button
          onClick={() => setShowRepeat(!showRepeat)}
          className="mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-100 cursor-pointer"
          style={{ color: 'var(--text-primary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Repeat size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
          {copy.popovers.date.repeat}
          {repeat && (
            <span className="ml-auto text-xs" style={{ color: 'var(--accent)' }}>
              {repeat.charAt(0).toUpperCase() + repeat.slice(1)}
            </span>
          )}
        </button>
        {showRepeat && (
          <div className="mb-2 flex flex-wrap gap-1 px-3">
            {REPEAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  if (onRepeatChange) {
                    onRepeatChange(repeat === opt.value ? null : opt.value)
                  }
                  setHasChanges(true)
                }}
                className="rounded-md px-2 py-1 text-[11px] font-medium transition-colors duration-100 cursor-pointer"
                style={{
                  backgroundColor:
                    repeat === opt.value ? 'var(--accent)' : 'var(--bg-hover)',
                  color: repeat === opt.value ? '#fff' : 'var(--text-muted)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="my-2 h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleClear}
          className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-100 cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          {copy.popovers.date.clear}
        </button>
        {hasChanges && (
          <button
            onClick={handleDone}
            className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-100 cursor-pointer"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#fff',
            }}
          >
            {copy.popovers.date.done}
          </button>
        )}
      </div>
    </motion.div>
  )
}
