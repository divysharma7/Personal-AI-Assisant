'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { buttonPress, ease } from '@/lib/motion'
import { isSameDay, isToday } from './calendarUtils'
import type { CalendarEvent } from './types'

interface MiniCalendarSidebarProps {
  currentDate: Date
  events: CalendarEvent[]
  onDateSelect: (date: Date) => void
  lists?: { id: string; name: string; color: string; visible: boolean }[]
  onToggleList?: (id: string) => void
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getMiniMonthGrid(year: number, month: number): (Date | null)[] {
  const firstOfMonth = new Date(year, month, 1)
  const startDow = firstOfMonth.getDay() // Sunday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (Date | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length < 42) cells.push(null)
  return cells
}

export default function MiniCalendarSidebar({
  currentDate,
  events,
  onDateSelect,
  lists = [],
  onToggleList,
}: MiniCalendarSidebarProps) {
  const [displayMonth, setDisplayMonth] = useState(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))

  const cells = useMemo(
    () => getMiniMonthGrid(displayMonth.getFullYear(), displayMonth.getMonth()),
    [displayMonth]
  )

  // Event dot lookup: which dates have events
  const eventDates = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const ev of events) {
      const d = new Date(ev.start)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!map.has(key)) map.set(key, new Set())
      map.get(key)!.add(ev.color)
    }
    return map
  }, [events])

  const monthLabel = displayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    setDisplayMonth((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1))
  }
  const nextMonth = () => {
    setDisplayMonth((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1))
  }
  const goToday = () => {
    const now = new Date()
    setDisplayMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    onDateSelect(now)
  }

  return (
    <div
      className="flex w-[240px] flex-shrink-0 flex-col overflow-y-auto rounded-[var(--outer-radius,20px)] p-3"
      style={{ backgroundColor: 'var(--bg-pane)' }}
    >
      {/* Mini month header */}
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {monthLabel}
        </span>
        <div className="flex items-center gap-0.5">
          <motion.button
            {...buttonPress}
            onClick={prevMonth}
            className="flex h-6 w-6 items-center justify-center rounded-md cursor-pointer transition-sl"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
          </motion.button>
          <motion.button
            {...buttonPress}
            onClick={goToday}
            className="flex h-6 w-6 items-center justify-center rounded-full cursor-pointer transition-sl"
            style={{
              backgroundColor: 'var(--overlay-1, transparent)',
              color: 'var(--accent)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2, var(--bg-hover))' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, transparent)' }}
          >
            <span className="text-[10px] font-bold">&bull;</span>
          </motion.button>
          <motion.button
            {...buttonPress}
            onClick={nextMonth}
            className="flex h-6 w-6 items-center justify-center rounded-md cursor-pointer transition-sl"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <ChevronRight size={14} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 mb-0.5">
        {WEEKDAYS.map((day, i) => (
          <span
            key={i}
            className="text-center text-[10px] font-medium py-0.5"
            style={{ color: 'var(--text-faint)' }}
          >
            {day}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0">
        {cells.map((cell, i) => {
          if (!cell) {
            return <div key={`empty-${i}`} className="h-7" />
          }

          const isSelected = isSameDay(cell, currentDate)
          const isTodayDate = isToday(cell)
          const key = `${cell.getFullYear()}-${cell.getMonth()}-${cell.getDate()}`
          const dotColors = eventDates.get(key)

          return (
            <button
              key={key}
              onClick={() => onDateSelect(cell)}
              className="relative flex h-7 w-full items-center justify-center rounded-full text-[11px] cursor-pointer transition-sl"
              style={{
                color: isSelected || isTodayDate ? '#fff' : 'var(--text-primary)',
                backgroundColor: isSelected
                  ? 'var(--accent)'
                  : isTodayDate
                  ? 'var(--accent-soft, rgba(248,79,57,0.2))'
                  : 'transparent',
                fontWeight: isTodayDate ? 700 : 400,
              }}
              onMouseEnter={(e) => {
                if (!isSelected && !isTodayDate) e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !isTodayDate) e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {cell.getDate()}
              {/* Event dots */}
              {dotColors && dotColors.size > 0 && (
                <span className="absolute bottom-0.5 flex gap-px">
                  {Array.from(dotColors).slice(0, 3).map((color, j) => (
                    <span
                      key={j}
                      className="h-1 w-1 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Separator */}
      <div className="my-3 h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* List filter panel */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md">
          <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            All
          </span>
          <span className="flex h-4 w-4 items-center justify-center rounded" style={{ backgroundColor: 'var(--accent)' }}>
            <Check size={10} strokeWidth={2.5} className="text-white" />
          </span>
        </div>

        {lists.map((list) => (
          <button
            key={list.id}
            onClick={() => onToggleList?.(list.id)}
            className="flex w-full items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-sl"
            style={{ color: 'var(--text-primary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <span
              className="h-3 w-3 rounded flex-shrink-0"
              style={{ backgroundColor: list.color }}
            />
            <span className="flex-1 text-left text-[13px] truncate">{list.name}</span>
            <span
              className="flex h-4 w-4 items-center justify-center rounded flex-shrink-0"
              style={{
                backgroundColor: list.visible ? 'var(--accent)' : 'transparent',
                border: list.visible ? 'none' : '1.5px solid var(--overlay-3, var(--text-faint))',
              }}
            >
              {list.visible && <Check size={10} strokeWidth={2.5} className="text-white" />}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
