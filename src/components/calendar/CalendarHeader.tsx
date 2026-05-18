'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import { buttonPress } from '@/lib/motion'
import { formatHeaderLabel, isToday as checkIsToday } from './calendarUtils'
import type { CalendarHeaderProps, CalendarViewMode } from './types'

const VIEW_OPTIONS: { key: CalendarViewMode; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
]

/**
 * CalendarHeader — navigation + view switcher + settings.
 * 48px height, sticky at top.
 */
export default function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onNavigate,
}: CalendarHeaderProps) {
  const todayActive = checkIsToday(currentDate)
  const label = formatHeaderLabel(currentDate, view)

  return (
    <div
      className="sticky top-0 z-20 flex items-center justify-between px-4"
      style={{
        height: 48,
        backgroundColor: 'var(--bg-pane)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left: navigation */}
      <div className="flex items-center gap-1">
        <motion.button
          {...buttonPress}
          onClick={() => onNavigate(-1)}
          className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Previous"
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </motion.button>

        <motion.button
          {...buttonPress}
          onClick={() => onNavigate(0)}
          className="rounded-md px-3 py-1 text-sm font-medium cursor-pointer"
          style={{
            color: todayActive ? 'var(--accent)' : 'var(--text-primary)',
            backgroundColor: todayActive ? 'var(--accent-soft)' : 'transparent',
          }}
        >
          Today
        </motion.button>

        <motion.button
          {...buttonPress}
          onClick={() => onNavigate(1)}
          className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Next"
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </motion.button>
      </div>

      {/* Center: date label */}
      <h2
        className="text-sm font-semibold select-none"
        style={{ color: 'var(--text-primary)' }}
      >
        {label}
      </h2>

      {/* Right: view switcher + gear */}
      <div className="flex items-center gap-2">
        {/* View pills */}
        <div
          className="flex items-center rounded-lg p-0.5"
          style={{ backgroundColor: 'var(--bg-pane-2)' }}
        >
          {VIEW_OPTIONS.map((opt) => (
            <motion.button
              key={opt.key}
              {...buttonPress}
              onClick={() => onViewChange(opt.key)}
              className="rounded-md px-3 py-1 text-xs font-medium transition-colors duration-150 cursor-pointer"
              style={{
                backgroundColor:
                  view === opt.key ? 'var(--accent)' : 'transparent',
                color:
                  view === opt.key ? '#FFFFFF' : 'var(--text-muted)',
              }}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>

        {/* Settings gear */}
        <motion.button
          {...buttonPress}
          className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer"
          style={{ color: 'var(--text-faint)' }}
          aria-label="Calendar settings"
        >
          <Settings size={16} strokeWidth={1.5} />
        </motion.button>
      </div>
    </div>
  )
}
