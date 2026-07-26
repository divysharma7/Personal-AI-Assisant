'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, subDays, isAfter } from 'date-fns'
import type { JSONContent } from '@tiptap/react'
import BlockEditor from '@/components/editor/BlockEditor'
import { journal } from '@/lib/api/misc'
import { useTasks } from '@/hooks/useTasks'
import { fadeSlideUp, ease } from '@/lib/motion'

function extractCheckedItems(content: JSONContent | null): Map<string, string> {
  const checked = new Map<string, string>()
  if (!content?.content) return checked
  const walk = (nodes: JSONContent[]) => {
    for (const node of nodes) {
      if (node.type === 'taskItem' && node.attrs?.checked && node.content) {
        const text = node.content
          .filter((n: JSONContent) => n.type === 'text')
          .map((n: JSONContent) => n.text || '')
          .join('')
          .trim()
        if (text) checked.set(text, node.attrs?.['data-task-id'] || '')
      }
      if (node.content) walk(node.content as JSONContent[])
    }
  }
  walk(content.content as JSONContent[])
  return checked
}

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [entry, setEntry] = useState<{ content: JSONContent | null; savedAt: string | null }>({ content: null, savedAt: null })
  const [allEntries, setAllEntries] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const prevCheckedRef = useRef<Map<string, string>>(new Map())
  const { createTask } = useTasks()

  const dateKey = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate])

  // Fetch all entries for calendar dots
  useEffect(() => {
    journal.list().then((entries) => {
      const dates = new Set<string>()
      for (const e of entries) {
        if (e.date) dates.add(e.date.split('T')[0])
      }
      setAllEntries(dates)
    }).catch(() => {})
  }, [])

  // Fetch entry for selected date
  useEffect(() => {
    setLoading(true)
    journal.get(dateKey).then((data) => {
      if (data?.content) {
        const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content
        setEntry({ content: parsed, savedAt: data.updatedAt || null })
        prevCheckedRef.current = extractCheckedItems(parsed)
      } else {
        setEntry({ content: null, savedAt: null })
        prevCheckedRef.current = new Map()
      }
    }).catch(() => {
      setEntry({ content: null, savedAt: null })
      prevCheckedRef.current = new Map()
    }).finally(() => setLoading(false))
  }, [dateKey])

  // Save handler with checkbox→task detection
  const handleSave = useCallback(async (json: JSONContent) => {
    try {
      // Detect newly checked items and create tasks
      const currentChecked = extractCheckedItems(json)
      const prevChecked = prevCheckedRef.current
      for (const entry of Array.from(currentChecked.entries())) {
        const [text, taskId] = entry
        if (!taskId && !prevChecked.has(text)) {
          try {
            const task = await createTask({
              title: text,
              priority: 'medium',
              status: 'backlog',
            })
            if (task?._id) {
              currentChecked.set(text, task._id)
            }
          } catch { /* ignore task creation errors */ }
        }
      }
      prevCheckedRef.current = currentChecked

      await journal.save({ date: dateKey, content: JSON.stringify(json) })
      setLastSavedAt(new Date())
      setAllEntries((prev) => new Set(prev).add(dateKey))
    } catch { /* ignore save errors */ }
  }, [dateKey, createTask])

  // Calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth)
    const monthEnd = endOfMonth(calendarMonth)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [calendarMonth])

  // Recent entries (last 7 that exist)
  const recentEntries = useMemo(() => {
    const entries: string[] = []
    for (let i = 1; i <= 30; i++) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd')
      if (allEntries.has(d)) {
        entries.push(d)
        if (entries.length >= 7) break
      }
    }
    return entries
  }, [allEntries])

  const relativeTime = useMemo(() => {
    if (!lastSavedAt) return null
    const diff = Date.now() - lastSavedAt.getTime()
    if (diff < 5000) return 'Just now'
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    return format(lastSavedAt, 'h:mm a')
  }, [lastSavedAt])

  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar — date picker */}
      <div
        className="flex flex-col flex-shrink-0 overflow-y-auto"
        style={{
          width: 240,
          borderRight: '1px solid var(--border)',
          padding: '24px 16px',
        }}
      >
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
            className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            {format(calendarMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
            className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Mini calendar */}
        <div className="grid grid-cols-7 gap-0 mb-4">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-[11px] font-medium py-1" style={{ color: 'var(--text-faint)' }}>
              {d}
            </div>
          ))}
          {calendarDays.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd')
            const isSelected = isSameDay(day, selectedDate)
            const isToday = isSameDay(day, new Date())
            const inMonth = isSameMonth(day, calendarMonth)
            const hasEntry = allEntries.has(dayKey)
            const isFuture = isAfter(day, new Date()) && !isToday

            return (
              <button
                key={dayKey}
                onClick={() => !isFuture && setSelectedDate(day)}
                disabled={isFuture}
                className="relative flex items-center justify-center text-[12px] cursor-pointer"
                style={{
                  height: 30,
                  borderRadius: 6,
                  color: !inMonth ? 'var(--text-faint)' : isSelected ? 'white' : isToday ? 'var(--accent)' : 'var(--text-primary)',
                  backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                  opacity: !inMonth ? 0.4 : 1,
                  fontWeight: isToday || isSelected ? 600 : 400,
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={(e) => { if (!isSelected && !isFuture) e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {format(day, 'd')}
                {hasEntry && (
                  <span
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      width: 4,
                      height: 4,
                      backgroundColor: isSelected ? 'white' : 'var(--accent)',
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Today button */}
        <button
          onClick={() => { setSelectedDate(new Date()); setCalendarMonth(new Date()) }}
          className="w-full py-1.5 rounded-lg text-[13px] font-medium cursor-pointer mb-4"
          style={{
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            backgroundColor: 'transparent',
            transition: 'background-color 150ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          Today
        </button>

        {/* Recent entries */}
        {recentEntries.length > 0 && (
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
              Recent
            </span>
            <div className="mt-2 flex flex-col gap-0.5">
              {recentEntries.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDate(new Date(d + 'T12:00:00'))}
                  className="flex items-center gap-2 px-2 py-1 rounded-md text-[13px] cursor-pointer"
                  style={{
                    color: format(selectedDate, 'yyyy-MM-dd') === d ? 'var(--accent)' : 'var(--text-muted)',
                    backgroundColor: format(selectedDate, 'yyyy-MM-dd') === d ? 'var(--overlay-1)' : 'transparent',
                    fontWeight: format(selectedDate, 'yyyy-MM-dd') === d ? 600 : 400,
                    transition: 'background-color 150ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
                  onMouseLeave={(e) => { if (format(selectedDate, 'yyyy-MM-dd') !== d) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <BookOpen size={12} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  {format(new Date(d + 'T12:00:00'), 'MMM d, EEE')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right — editor */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-[720px] px-8 py-8">
          {/* Date header */}
          <div className="mb-6">
            <h1 style={{
              color: 'var(--text-primary)',
              fontSize: 28,
              fontWeight: 700,
              fontFamily: 'Inter, system-ui, sans-serif',
              letterSpacing: '-0.02em',
              marginBottom: 4,
            }}>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h1>
            {isSameDay(selectedDate, new Date()) && (
              <span className="text-[13px]" style={{ color: 'var(--text-faint)' }}>Today</span>
            )}
          </div>

          {/* Editor */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-pulse text-[14px]" style={{ color: 'var(--text-faint)' }}>Loading...</div>
            </div>
          ) : entry.content ? (
            <motion.div {...fadeSlideUp} transition={ease.normal}>
              <BlockEditor content={entry.content} onSave={handleSave} />
            </motion.div>
          ) : (
            <motion.div {...fadeSlideUp} transition={ease.normal}>
              <div
                className="flex flex-col items-center justify-center py-16 text-center cursor-pointer rounded-2xl"
                style={{
                  border: '2px dashed var(--border)',
                  transition: 'border-color 150ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
                onClick={() => {
                  setEntry({ content: { type: 'doc', content: [{ type: 'paragraph' }] }, savedAt: null })
                }}
              >
                <BookOpen size={40} strokeWidth={1} style={{ color: 'var(--text-faint)', opacity: 0.3, marginBottom: 12 }} />
                <p className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  No entry for this date
                </p>
                <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  Click to start writing
                </p>
              </div>
            </motion.div>
          )}

          {/* Save indicator */}
          {lastSavedAt && (
            <div className="mt-4 text-[12px]" style={{ color: 'var(--text-faint)' }}>
              Auto-saved · {relativeTime}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
