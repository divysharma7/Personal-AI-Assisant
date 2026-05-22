'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, MoreHorizontal, Pencil, Crosshair, Smile, Archive, Trash2 } from 'lucide-react'
import { buttonPress, ease, fadeSlideUp, fadeSlideDown } from '@/lib/motion'
import type { Habit } from '@/hooks/useHabits'
import { playCompletionSound } from '@/lib/sounds'
import { DropdownItem, HabitLog, StatBlock, CompletionStatRow, DeleteConfirmDialog, DailyGoalsBarChart } from './HabitDetailHelpers'

interface HabitDetailProps {
  habit: Habit
  onToggleToday: (habit: Habit) => void
  onEdit?: (habit: Habit) => void
  onArchive?: (habit: Habit) => void
  onDelete?: (habit: Habit) => void
  onStartFocus?: (habit: Habit) => void
}

const CHECKIN_EMOJIS = ['✅', '🔥', '⭐', '💪', '🎯', '💎', '🌟', '🏆']

const WEEKDAY_HEADERS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function HabitDetail({ habit, onToggleToday, onEdit, onArchive, onDelete, onStartFocus }: HabitDetailProps) {
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [emojiSubOpen, setEmojiSubOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [logExpanded, setLogExpanded] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreMenuOpen && moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false)
        setEmojiSubOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [moreMenuOpen])

  const goToPrevMonth = useCallback(() => {
    setCalMonth((m) => {
      if (m === 0) {
        setCalYear((y) => y - 1)
        return 11
      }
      return m - 1
    })
  }, [])

  const goToNextMonth = useCallback(() => {
    setCalMonth((m) => {
      if (m === 11) {
        setCalYear((y) => y + 1)
        return 0
      }
      return m + 1
    })
  }, [])

  // Calendar data
  const calendarData = useMemo(() => {
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
    // Monday-based: getDay() returns 0=Sun, we want Mon=0
    const firstDay = new Date(calYear, calMonth, 1).getDay()
    const startOffset = firstDay === 0 ? 6 : firstDay - 1

    const cells: (number | null)[] = []
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)

    return { daysInMonth, cells }
  }, [calYear, calMonth])

  // Monthly stats
  const monthlyStats = useMemo(() => {
    const { daysInMonth } = calendarData
    const completionSet = new Set(habit.completions)
    let achieved = 0

    const todayDate = new Date()
    const todayKey = formatDateKey(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())

    for (let d = 1; d <= daysInMonth; d++) {
      const key = formatDateKey(calYear, calMonth, d)
      if (key > todayKey) break
      if (completionSet.has(key)) achieved++
    }

    // Only count days up to today for current month
    let scheduledDays = daysInMonth
    if (calYear === todayDate.getFullYear() && calMonth === todayDate.getMonth()) {
      scheduledDays = todayDate.getDate()
    }

    const rate = scheduledDays > 0 ? Math.round((achieved / scheduledDays) * 100) : 0

    return { achieved, scheduledDays, rate, daysInMonth }
  }, [calYear, calMonth, calendarData, habit.completions])

  // Bar chart data for the month
  const barData = useMemo(() => {
    const { daysInMonth } = calendarData
    const completionSet = new Set(habit.completions)
    const todayDate = new Date()
    const todayKey = formatDateKey(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())

    const bars: { day: number; completed: boolean; isToday: boolean; isFuture: boolean }[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const key = formatDateKey(calYear, calMonth, d)
      bars.push({
        day: d,
        completed: completionSet.has(key),
        isToday: key === todayKey,
        isFuture: key > todayKey,
      })
    }
    return bars
  }, [calYear, calMonth, calendarData, habit.completions])

  const completionSet = useMemo(() => new Set(habit.completions), [habit.completions])

  const todayKey = useMemo(() => {
    const t = new Date()
    return formatDateKey(t.getFullYear(), t.getMonth(), t.getDate())
  }, [])

  const isCheckedToday = completionSet.has(todayKey)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        padding: '24px 28px',
        backgroundColor: 'var(--bg-base)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 32, lineHeight: 1 }}>{habit.icon}</span>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {habit.name}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.button
            {...buttonPress}
            onClick={() => {
              if (!isCheckedToday) playCompletionSound()
              onToggleToday(habit)
            }}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: 'none',
              backgroundColor: isCheckedToday ? 'var(--accent)' : 'var(--overlay-1, var(--bg-hover))',
              color: isCheckedToday ? '#fff' : 'var(--text-muted)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {isCheckedToday && <Check size={14} strokeWidth={2.5} />}
            {isCheckedToday ? 'Done' : 'Check In'}
          </motion.button>
          <div style={{ position: 'relative' }} ref={moreMenuRef}>
            <motion.button
              {...buttonPress}
              onClick={() => { setMoreMenuOpen(!moreMenuOpen); setEmojiSubOpen(false) }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: 'none',
                backgroundColor: moreMenuOpen ? 'var(--overlay-1, var(--bg-hover))' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              <MoreHorizontal size={16} strokeWidth={1.5} />
            </motion.button>
            <AnimatePresence>
              {moreMenuOpen && (
                <motion.div
                  {...fadeSlideDown}
                  transition={ease.normal}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: 4,
                    width: 200,
                    borderRadius: 10,
                    backgroundColor: 'var(--bg-pane)',
                    border: '1px solid var(--overlay-2, var(--border))',
                    boxShadow: 'var(--shadow-elevated)',
                    zIndex: 50,
                    padding: '4px 0',
                  }}
                >
                  <DropdownItem icon={<Pencil size={14} strokeWidth={1.5} />} label="Edit" onClick={() => { setMoreMenuOpen(false); onEdit?.(habit) }} />
                  <DropdownItem icon={<Crosshair size={14} strokeWidth={1.5} />} label="Start Focus" onClick={() => { setMoreMenuOpen(false); onStartFocus?.(habit) }} />
                  <div style={{ position: 'relative' }}>
                    <DropdownItem
                      icon={<Smile size={14} strokeWidth={1.5} />}
                      label="Checked-in Style"
                      trailing={<ChevronRight size={12} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />}
                      onClick={() => setEmojiSubOpen(!emojiSubOpen)}
                    />
                    <AnimatePresence>
                      {emojiSubOpen && (
                        <motion.div
                          {...fadeSlideDown}
                          transition={ease.fast}
                          style={{
                            position: 'absolute',
                            left: '100%',
                            top: 0,
                            marginLeft: 4,
                            width: 180,
                            borderRadius: 10,
                            backgroundColor: 'var(--bg-pane)',
                            border: '1px solid var(--overlay-2, var(--border))',
                            boxShadow: 'var(--shadow-elevated)',
                            padding: '8px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 4,
                          }}
                        >
                          {CHECKIN_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => { setMoreMenuOpen(false); setEmojiSubOpen(false) }}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                border: 'none',
                                backgroundColor: 'transparent',
                                fontSize: 18,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 120ms ease',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '4px 8px' }} />
                  <DropdownItem icon={<Archive size={14} strokeWidth={1.5} />} label="Archive" onClick={() => { setMoreMenuOpen(false); onArchive?.(habit) }} />
                  <DropdownItem icon={<Trash2 size={14} strokeWidth={1.5} />} label="Delete" danger onClick={() => { setMoreMenuOpen(false); setDeleteConfirmOpen(true) }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        habitName={habit.name}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => { setDeleteConfirmOpen(false); onDelete?.(habit) }}
      />

      {/* Stats row */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          marginBottom: 28,
          padding: '16px 20px',
          borderRadius: 12,
          backgroundColor: 'var(--bg-pane)',
          border: '1px solid var(--border)',
        }}
      >
        <StatBlock label="Best Streak" value={`${habit.bestStreak}`} unit="days" />
        <div style={{ width: 1, backgroundColor: 'var(--border)' }} />
        <StatBlock label="Current Streak" value={`${habit.currentStreak}`} unit="days" accent />
      </div>

      {/* Calendar heatmap */}
      <div
        style={{
          marginBottom: 28,
          padding: '16px 20px',
          borderRadius: 12,
          backgroundColor: 'var(--bg-pane)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Month navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <motion.button
            {...buttonPress}
            onClick={goToPrevMonth}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </motion.button>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            {monthNames[calMonth]} {calYear}
          </span>
          <motion.button
            {...buttonPress}
            onClick={goToNextMonth}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </motion.button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, marginBottom: 4 }}>
          {WEEKDAY_HEADERS.map((d, i) => {
            const isWeekend = i >= 5
            return (
              <span
                key={d}
                style={{
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 0',
                  color: isWeekend ? 'var(--accent)' : 'var(--text-faint)',
                }}
              >
                {d}
              </span>
            )
          })}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
          {calendarData.cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} style={{ height: 36 }} />
            }
            const dateKey = formatDateKey(calYear, calMonth, day)
            const completed = completionSet.has(dateKey)
            const isToday = dateKey === todayKey
            const isFuture = dateKey > todayKey

            // Check weekend (column index)
            const colIdx = i % 7
            const isWeekend = colIdx >= 5

            return (
              <div
                key={dateKey}
                style={{
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: isToday ? 700 : 400,
                    backgroundColor: completed ? 'var(--accent)' : 'transparent',
                    color: completed
                      ? '#fff'
                      : isFuture
                        ? 'var(--text-faint)'
                        : isWeekend
                          ? 'var(--accent)'
                          : isToday
                            ? 'var(--accent)'
                            : 'var(--text-primary)',
                    border: isToday && !completed ? '2px solid var(--accent)' : completed ? 'none' : '1.5px solid transparent',
                  }}
                >
                  {completed ? <Check size={13} strokeWidth={2.5} /> : day}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Monthly completion rate */}
      <motion.div
        {...fadeSlideUp}
        transition={ease.normal}
        style={{
          marginBottom: 28,
          padding: '20px',
          borderRadius: 12,
          backgroundColor: 'var(--bg-pane)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 40, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
            {monthlyStats.rate}%
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-faint)', fontWeight: 500 }}>
            completion rate
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <CompletionStatRow label="Goals Achieved" value={`${monthlyStats.achieved} days`} />
          <CompletionStatRow label="Scheduled Goals" value={`${monthlyStats.scheduledDays} days`} />
          <CompletionStatRow label="Best Streak" value={`${habit.bestStreak} days`} />
        </div>
      </motion.div>

      {/* Daily Goals bar chart */}
      <DailyGoalsBarChart barData={barData} />

      {/* Habit Log */}
      <HabitLog completions={habit.completions} expanded={logExpanded} onToggleExpanded={() => setLogExpanded(!logExpanded)} />
    </div>
  )
}

