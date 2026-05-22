'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MoreHorizontal, Check, ChevronRight } from 'lucide-react'
import { buttonPress, ease, fadeSlideUp } from '@/lib/motion'
import type { Habit } from '@/hooks/useHabits'
import { format, subDays } from 'date-fns'
import { playCompletionSound } from '@/lib/sounds'

interface HabitListProps {
  habits: Habit[]
  selectedId: string | null
  onSelect: (id: string) => void
  filter: 'active' | 'archived'
  onFilterChange: (f: 'active' | 'archived') => void
  onCreateClick: () => void
  onMoreClick: () => void
  isLoading: boolean
  onToggleToday?: (habit: Habit) => void
}

function getLast7Days(): { dateStr: string; dayName: string; dateNum: number; isToday: boolean }[] {
  const today = new Date()
  const result: { dateStr: string; dayName: string; dateNum: number; isToday: boolean }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = subDays(today, i)
    result.push({
      dateStr: format(d, 'yyyy-MM-dd'),
      dayName: format(d, 'EEE'),
      dateNum: d.getDate(),
      isToday: i === 0,
    })
  }
  return result
}

/** Group habits by frequency as a proxy for "section" (model has no section field) */
function groupHabits(habits: Habit[]): Map<string, Habit[]> {
  const map = new Map<string, Habit[]>()
  for (const h of habits) {
    const key = h.frequency === 'daily' ? 'Daily' : h.frequency === 'weekdays' ? 'Weekdays' : h.frequency === 'weekly' ? 'Weekly' : 'Custom'
    const group = map.get(key) ?? []
    group.push(h)
    map.set(key, group)
  }
  return map
}

export default function HabitList({
  habits,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  onCreateClick,
  onMoreClick,
  isLoading,
  onToggleToday,
}: HabitListProps) {
  const last7 = useMemo(() => getLast7Days(), [])
  const last7DateStrs = useMemo(() => last7.map((d) => d.dateStr), [last7])
  const grouped = useMemo(() => groupHabits(habits), [habits])
  const hasMultipleGroups = grouped.size > 1
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  const toggleSection = useCallback((section: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }, [])

  // Count how many habits are completed today across all habits (for the weekly strip)
  const todayStr = last7[last7.length - 1]?.dateStr ?? ''
  const todayCompletedCount = useMemo(
    () => habits.filter((h) => h.completions.includes(todayStr)).length,
    [habits, todayStr]
  )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRight: '1px solid var(--border)',
        backgroundColor: 'var(--bg-pane)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px 12px',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Habit
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.button
            {...buttonPress}
            onClick={onCreateClick}
            aria-label="Create habit"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '1.5px solid var(--border)', backgroundColor: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
            }}
          >
            <Plus size={16} strokeWidth={1.5} />
          </motion.button>
          <motion.button
            {...buttonPress}
            onClick={onMoreClick}
            aria-label="More options"
            style={{
              width: 36, height: 36, borderRadius: 6,
              border: 'none', backgroundColor: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
            }}
          >
            <MoreHorizontal size={16} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>

      {/* Tab pills */}
      <div style={{ display: 'flex', gap: 4, padding: '0 20px 12px' }}>
        {(['active', 'archived'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onFilterChange(tab)}
            style={{
              padding: '4px 14px', borderRadius: 20, border: 'none',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              backgroundColor: filter === tab ? 'var(--accent)' : 'var(--overlay-1, var(--bg-hover))',
              color: filter === tab ? '#fff' : 'var(--text-muted)',
              textTransform: 'capitalize', transition: 'background-color 150ms ease, color 150ms ease',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Weekly overview strip */}
      {habits.length > 0 && (
        <WeeklyStrip last7={last7} habits={habits} todayCompletedCount={todayCompletedCount} />
      )}

      {/* Habit rows */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
            <div style={{
              width: 24, height: 24,
              border: '2px solid var(--accent)', borderTopColor: 'transparent',
              borderRadius: '50%', animation: 'spin 1s linear infinite',
            }} />
          </div>
        ) : habits.length === 0 ? (
          <motion.div
            {...fadeSlideUp}
            transition={ease.normal}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 60, textAlign: 'center' }}
          >
            <p style={{ fontSize: 14, color: 'var(--text-faint)' }}>No habits yet</p>
            <motion.button
              {...buttonPress}
              onClick={onCreateClick}
              style={{
                marginTop: 12, padding: '8px 20px', borderRadius: 20, border: 'none',
                backgroundColor: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Create Habit
            </motion.button>
          </motion.div>
        ) : hasMultipleGroups ? (
          // Grouped view
          <div>
            {Array.from(grouped.entries()).map(([section, sectionHabits]) => {
              const collapsed = collapsedSections.has(section)
              return (
                <div key={section} style={{ marginBottom: 4 }}>
                  <button
                    onClick={() => toggleSection(section)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', width: '100%',
                      border: 'none', backgroundColor: 'transparent',
                      cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      color: 'var(--text-faint)', textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    <ChevronRight
                      size={12}
                      strokeWidth={2}
                      style={{
                        transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                        transition: 'transform 150ms ease',
                        color: 'var(--text-faint)',
                      }}
                    />
                    {section} {sectionHabits.length}
                  </button>
                  {!collapsed && (
                    <AnimatePresence>
                      {sectionHabits.map((habit) => (
                        <HabitRow
                          key={habit._id}
                          habit={habit}
                          isSelected={selectedId === habit._id}
                          last7={last7DateStrs}
                          onSelect={onSelect}
                          onToggleToday={onToggleToday}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <AnimatePresence>
            {habits.map((habit) => (
              <HabitRow
                key={habit._id}
                habit={habit}
                isSelected={selectedId === habit._id}
                last7={last7DateStrs}
                onSelect={onSelect}
                onToggleToday={onToggleToday}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

function WeeklyStrip({
  last7,
  habits,
  todayCompletedCount,
}: {
  last7: { dateStr: string; dayName: string; dateNum: number; isToday: boolean }[]
  habits: Habit[]
  todayCompletedCount: number
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        padding: '8px 16px 12px',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {last7.map((day) => {
        const completedCount = habits.filter((h) => h.completions.includes(day.dateStr)).length
        const allDone = habits.length > 0 && completedCount === habits.length
        const someDone = completedCount > 0
        return (
          <div
            key={day.dateStr}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: day.isToday ? 'var(--accent)' : 'var(--text-faint)',
                textTransform: 'uppercase',
              }}
            >
              {day.dayName}
            </span>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: day.isToday ? 700 : 500,
                backgroundColor: day.isToday ? 'var(--accent)' : 'transparent',
                color: day.isToday ? '#fff' : 'var(--text-primary)',
              }}
            >
              {day.dateNum}
            </div>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: allDone ? 'var(--accent)' : 'transparent',
                border: allDone ? 'none' : someDone ? '1.5px solid var(--accent)' : '1.5px solid var(--overlay-3, var(--border))',
              }}
            >
              {allDone && <Check size={10} strokeWidth={3} color="#fff" />}
              {someDone && !allDone && (
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--accent)' }} />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HabitRow({
  habit,
  isSelected,
  last7,
  onSelect,
  onToggleToday,
}: {
  habit: Habit
  isSelected: boolean
  last7: string[]
  onSelect: (id: string) => void
  onToggleToday?: (habit: Habit) => void
}) {
  const todayStr = last7[last7.length - 1]
  const isCheckedToday = habit.completions.includes(todayStr)
  const totalDays = habit.completions.length

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!isCheckedToday) playCompletionSound()
      onToggleToday?.(habit)
    },
    [habit, isCheckedToday, onToggleToday]
  )

  return (
    <motion.div
      layout
      onClick={() => onSelect(habit._id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 10,
        cursor: 'pointer',
        backgroundColor: isSelected ? 'var(--accent-soft)' : 'transparent',
        transition: 'background-color 120ms ease',
        marginBottom: 2,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      {/* Icon */}
      <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>
        {habit.icon}
      </span>

      {/* Name + stats */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: 14, fontWeight: 500, color: 'var(--text-primary)',
            display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {habit.name}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
          {totalDays > 0 && <>{'\u26A1'} {totalDays} {totalDays === 1 ? 'Day' : 'Days'}</>}
          {totalDays > 0 && habit.currentStreak > 0 && ' \u00B7 '}
          {habit.currentStreak > 0 && <>{'\uD83D\uDD25'} {habit.currentStreak} {habit.currentStreak === 1 ? 'Day' : 'Days'}</>}
        </span>
      </div>

      {/* Today check-in toggle */}
      <motion.button
        {...buttonPress}
        onClick={handleToggle}
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: isCheckedToday ? 'none' : `2px solid ${habit.color || 'var(--accent)'}`,
          backgroundColor: isCheckedToday ? (habit.color || 'var(--accent)') : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background-color 150ms ease, border-color 150ms ease',
          padding: 0,
        }}
      >
        {isCheckedToday && <Check size={13} strokeWidth={2.5} color="#fff" />}
      </motion.button>
    </motion.div>
  )
}
