'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  SlidersHorizontal,
  ListChecks,
  Globe,
} from 'lucide-react'
import { buttonPress, fadeSlideDown, ease } from '@/lib/motion'
import { formatHeaderLabel, isToday as checkIsToday } from './calendarUtils'
import type { CalendarHeaderProps, CalendarViewMode } from './types'

const VIEW_OPTIONS: { key: CalendarViewMode; label: string; shortcut: string }[] = [
  { key: 'day', label: 'Day', shortcut: 'D / 1' },
  { key: 'week', label: 'Week', shortcut: 'W / 2' },
  { key: 'month', label: 'Month', shortcut: 'M / 3' },
  { key: 'year', label: 'Year', shortcut: 'Y / 4' },
  { key: 'agenda', label: 'Agenda', shortcut: 'A / 5' },
]

export default function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onNavigate,
  onToggleSidebar,
  onOpenViewOptions,
  onOpenArrangeTasks,
}: CalendarHeaderProps & {
  onToggleSidebar?: () => void
  onOpenViewOptions?: () => void
  onOpenArrangeTasks?: () => void
}) {
  const todayActive = checkIsToday(currentDate)
  const label = formatHeaderLabel(currentDate, view)
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const viewDropdownRef = useRef<HTMLDivElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  const currentViewLabel = VIEW_OPTIONS.find((o) => o.key === view)?.label || 'Day'

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (viewDropdownOpen && viewDropdownRef.current && !viewDropdownRef.current.contains(e.target as Node)) {
        setViewDropdownOpen(false)
      }
      if (moreMenuOpen && moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [viewDropdownOpen, moreMenuOpen])

  return (
    <div
      className="sticky top-0 z-20 flex items-center justify-between px-4"
      style={{
        height: 48,
        backgroundColor: 'var(--bg-pane)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left: sidebar toggle + title */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <motion.button
            {...buttonPress}
            onClick={onToggleSidebar}
            className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer transition-sl"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            aria-label="Toggle sidebar"
          >
            <SlidersHorizontal size={16} strokeWidth={1.5} />
          </motion.button>
        )}
        <h2
          className="text-sm font-semibold select-none"
          style={{ color: 'var(--text-primary)' }}
        >
          {label}
        </h2>
      </div>

      {/* Center: navigation + view selector */}
      <div className="flex items-center gap-2">
        {/* Add button */}
        <motion.button
          {...buttonPress}
          className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer transition-sl"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          aria-label="Quick add"
        >
          <Plus size={18} strokeWidth={1.5} />
        </motion.button>

        {/* View selector dropdown */}
        <div className="relative" ref={viewDropdownRef}>
          <motion.button
            {...buttonPress}
            onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
            className="flex items-center gap-1 rounded-md px-2.5 py-1 text-[13px] font-medium cursor-pointer transition-sl"
            style={{
              color: 'var(--text-primary)',
              backgroundColor: 'var(--overlay-2, var(--bg-pane-2))',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-3, var(--bg-hover))' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2, var(--bg-pane-2))' }}
          >
            {currentViewLabel}
            <ChevronDown size={14} strokeWidth={1.5} />
          </motion.button>
          <AnimatePresence>
            {viewDropdownOpen && (
              <motion.div
                {...fadeSlideDown}
                transition={ease.normal}
                className="absolute left-1/2 top-full z-50 mt-1 w-[180px] -translate-x-1/2 rounded-[var(--radius-lg,16px)] py-1"
                style={{
                  backgroundColor: 'var(--bg-pane)',
                  border: '1px solid var(--overlay-2, var(--border))',
                  boxShadow: 'var(--shadow-elevated)',
                }}
              >
                {VIEW_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      onViewChange(opt.key)
                      setViewDropdownOpen(false)
                    }}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-[13px] font-medium transition-sl cursor-pointer"
                    style={{
                      color: view === opt.key ? 'var(--accent)' : 'var(--text-primary)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                      {opt.shortcut}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav arrows */}
        <div className="flex items-center gap-0.5">
          <motion.button
            {...buttonPress}
            onClick={() => onNavigate(-1)}
            className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer transition-sl"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            aria-label="Previous"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </motion.button>

          <motion.button
            {...buttonPress}
            onClick={() => onNavigate(0)}
            className="rounded-md px-3 py-1 text-[13px] font-medium cursor-pointer transition-sl"
            style={{
              color: todayActive ? '#FFFFFF' : 'var(--text-primary)',
              backgroundColor: todayActive ? 'var(--accent)' : 'var(--overlay-2, var(--bg-pane-2))',
            }}
            onMouseEnter={(e) => {
              if (!todayActive) e.currentTarget.style.backgroundColor = 'var(--overlay-3, var(--bg-hover))'
            }}
            onMouseLeave={(e) => {
              if (!todayActive) e.currentTarget.style.backgroundColor = 'var(--overlay-2, var(--bg-pane-2))'
            }}
          >
            Today
          </motion.button>

          <motion.button
            {...buttonPress}
            onClick={() => onNavigate(1)}
            className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer transition-sl"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            aria-label="Next"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>

      {/* Right: more menu */}
      <div className="relative" ref={moreMenuRef}>
        <motion.button
          {...buttonPress}
          onClick={() => setMoreMenuOpen(!moreMenuOpen)}
          className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer transition-sl"
          style={{ color: 'var(--text-faint)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          aria-label="More options"
        >
          <MoreHorizontal size={16} strokeWidth={1.5} />
        </motion.button>
        <AnimatePresence>
          {moreMenuOpen && (
            <motion.div
              {...fadeSlideDown}
              transition={ease.normal}
              className="absolute right-0 top-full z-50 mt-1 w-[200px] rounded-[var(--radius-lg,16px)] py-1"
              style={{
                backgroundColor: 'var(--bg-pane)',
                border: '1px solid var(--overlay-2, var(--border))',
                boxShadow: 'var(--shadow-elevated)',
              }}
            >
              <button
                onClick={() => {
                  onOpenViewOptions?.()
                  setMoreMenuOpen(false)
                }}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium transition-sl cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <SlidersHorizontal size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                View Options
              </button>
              <button
                onClick={() => {
                  onOpenArrangeTasks?.()
                  setMoreMenuOpen(false)
                }}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium transition-sl cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <ListChecks size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                Arrange Tasks
              </button>
              <button
                onClick={() => {
                  window.location.href = '/settings'
                  setMoreMenuOpen(false)
                }}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium transition-sl cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <Globe size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                Subscribe Calendar
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
