'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  SlidersHorizontal,
  ListChecks,
  Printer,
  Share2,
  Keyboard,
} from 'lucide-react'
import { buttonPress, fadeSlideDown, ease } from '@/lib/motion'
import { isToday as checkIsToday } from './calendarUtils'
import type { CalendarHeaderProps, CalendarViewMode } from './types'

const VIEW_OPTIONS: { key: CalendarViewMode; label: string; shortcut: string }[] = [
  { key: 'day', label: 'Day', shortcut: 'D / 1' },
  { key: '3day', label: '3 Day', shortcut: '3' },
  { key: 'week', label: 'Week', shortcut: 'W / 2' },
  { key: 'multiweek', label: '2 Week', shortcut: '' },
  { key: 'month', label: 'Month', shortcut: 'M / 4' },
  { key: 'year', label: 'Year', shortcut: 'Y / 5' },
  { key: 'agenda', label: 'Agenda', shortcut: 'A / 6' },
]

/** Format a TickTick-style month+year label: "January 2026" */
function formatMonthYear(date: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

export default function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onNavigate,
  onQuickAdd,
  onToggleSidebar,
  onOpenViewOptions,
  onOpenArrangeTasks,
}: CalendarHeaderProps & {
  onToggleSidebar?: () => void
  onOpenViewOptions?: () => void
  onOpenArrangeTasks?: () => void
}) {
  const todayActive = checkIsToday(currentDate)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)
  const viewDropdownRef = useRef<HTMLDivElement>(null)

  const activeViewLabel = VIEW_OPTIONS.find((o) => o.key === view)?.label ?? 'Week'

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreMenuOpen && moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false)
      }
      if (viewDropdownOpen && viewDropdownRef.current && !viewDropdownRef.current.contains(e.target as Node)) {
        setViewDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [moreMenuOpen, viewDropdownOpen])

  return (
    <div
      className="sticky top-0 z-20 flex items-center justify-between px-5"
      style={{
        height: 52,
        backgroundColor: 'var(--bg-pane)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* LEFT: Calendar icon + Month Year */}
      <div className="flex items-center gap-2.5">
        <CalendarDays
          size={20}
          strokeWidth={1.5}
          style={{ color: 'var(--accent)' }}
        />
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.2,
            userSelect: 'none',
          }}
        >
          {formatMonthYear(currentDate)}
        </h2>
      </div>

      {/* RIGHT: controls group */}
      <div className="flex items-center gap-2">
        {/* + Add button — accent circle */}
        <motion.button
          {...buttonPress}
          onClick={onQuickAdd}
          className="flex items-center justify-center rounded-full cursor-pointer"
          style={{
            width: 32,
            height: 32,
            backgroundColor: 'var(--accent)',
            color: '#fff',
            border: 'none',
            transition: 'opacity 150ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          aria-label="Quick add"
        >
          <Plus size={18} strokeWidth={2} />
        </motion.button>

        {/* View dropdown */}
        <div className="relative" ref={viewDropdownRef}>
          <button
            onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
            className="flex items-center gap-1 cursor-pointer"
            style={{
              height: 32,
              padding: '0 10px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              fontSize: 13,
              fontWeight: 500,
              transition: 'background-color 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            {activeViewLabel}
            <ChevronDown size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
          </button>
          <AnimatePresence>
            {viewDropdownOpen && (
              <motion.div
                {...fadeSlideDown}
                transition={ease.normal}
                className="absolute right-0 top-full z-50 mt-1 rounded-lg py-1"
                style={{
                  minWidth: 160,
                  backgroundColor: 'var(--bg-pane)',
                  border: '1px solid var(--overlay-2, var(--border))',
                  boxShadow: 'var(--shadow-elevated)',
                }}
              >
                {VIEW_OPTIONS.map((opt) => {
                  const isActive = view === opt.key
                  return (
                    <button
                      key={opt.key}
                      onClick={() => {
                        onViewChange(opt.key)
                        setViewDropdownOpen(false)
                      }}
                      className="flex w-full items-center justify-between px-3 py-1.5 text-[13px] font-medium cursor-pointer"
                      style={{
                        color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                        backgroundColor: isActive ? 'var(--overlay-1, rgba(108,108,158,0.06))' : 'transparent',
                        border: 'none',
                        transition: 'background-color 120ms ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <span>{opt.label}</span>
                      {opt.shortcut && (
                        <span
                          className="text-[11px]"
                          style={{
                            color: 'var(--text-faint)',
                            padding: '1px 5px',
                            borderRadius: 4,
                            backgroundColor: 'var(--overlay-1, rgba(108,108,158,0.06))',
                          }}
                        >
                          {opt.shortcut}
                        </span>
                      )}
                    </button>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation group: < Today > */}
        <div
          className="flex items-center"
          style={{
            borderRadius: 6,
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <motion.button
            {...buttonPress}
            onClick={() => onNavigate(-1)}
            className="flex items-center justify-center cursor-pointer"
            style={{
              width: 30,
              height: 30,
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              transition: 'background-color 120ms ease, color 120ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
            aria-label="Previous"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </motion.button>

          <motion.button
            {...buttonPress}
            onClick={() => onNavigate(0)}
            className="cursor-pointer"
            style={{
              position: 'relative',
              height: 30,
              padding: '0 10px',
              fontSize: 13,
              fontWeight: 500,
              backgroundColor: todayActive ? 'var(--accent)' : 'transparent',
              color: todayActive ? '#fff' : 'var(--text-primary)',
              border: 'none',
              borderLeft: '1px solid var(--border)',
              borderRight: '1px solid var(--border)',
              transition: 'background-color 120ms ease, color 120ms ease',
            }}
            onMouseEnter={(e) => {
              if (!todayActive) {
                e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
              }
            }}
            onMouseLeave={(e) => {
              if (!todayActive) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            Today
            {!todayActive && (
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  right: 3,
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  backgroundColor: '#ef4444',
                }}
              />
            )}
          </motion.button>

          <motion.button
            {...buttonPress}
            onClick={() => onNavigate(1)}
            className="flex items-center justify-center cursor-pointer"
            style={{
              width: 30,
              height: 30,
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              transition: 'background-color 120ms ease, color 120ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
            aria-label="Next"
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </motion.button>
        </div>

        {/* More menu (...) */}
        <div className="relative" ref={moreMenuRef}>
          <motion.button
            {...buttonPress}
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className="flex items-center justify-center rounded-md cursor-pointer"
            style={{
              width: 32,
              height: 32,
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-faint)',
              transition: 'background-color 120ms ease, color 120ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--text-faint)'
            }}
            aria-label="More options"
          >
            <MoreHorizontal size={18} strokeWidth={1.5} />
          </motion.button>
          <AnimatePresence>
            {moreMenuOpen && (
              <motion.div
                {...fadeSlideDown}
                transition={ease.normal}
                className="absolute right-0 top-full z-50 mt-1 w-[200px] rounded-lg py-1"
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
                  className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium cursor-pointer"
                  style={{ color: 'var(--text-primary)', backgroundColor: 'transparent', border: 'none', transition: 'background-color 120ms ease' }}
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
                  className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium cursor-pointer"
                  style={{ color: 'var(--text-primary)', backgroundColor: 'transparent', border: 'none', transition: 'background-color 120ms ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <ListChecks size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                  Arrange Tasks
                </button>
                <div className="mx-2 my-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                <button
                  onClick={() => {
                    window.print()
                    setMoreMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium cursor-pointer"
                  style={{ color: 'var(--text-primary)', backgroundColor: 'transparent', border: 'none', transition: 'background-color 120ms ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <Printer size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                  Print
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: 'Calendar', url: window.location.href })
                    }
                    setMoreMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium cursor-pointer"
                  style={{ color: 'var(--text-primary)', backgroundColor: 'transparent', border: 'none', transition: 'background-color 120ms ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <Share2 size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                  Share
                </button>
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('laif:show-keyboard-shortcuts'))
                    setMoreMenuOpen(false)
                  }}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-[13px] font-medium cursor-pointer"
                  style={{ color: 'var(--text-primary)', backgroundColor: 'transparent', border: 'none', transition: 'background-color 120ms ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <span className="flex items-center gap-2.5">
                    <Keyboard size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                    Keyboard Shortcuts
                  </span>
                  <span className="text-[11px]" style={{
                    color: 'var(--text-faint)',
                    padding: '1px 5px',
                    borderRadius: 4,
                    backgroundColor: 'var(--overlay-1, rgba(108,108,158,0.06))',
                  }}>?</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
