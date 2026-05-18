'use client'

import { Flame } from 'lucide-react'
import { useHabits, type Habit } from '@/hooks/useHabits'
import { format } from 'date-fns'

interface HabitOverlayProps {
  /** Whether the user has enabled habits on calendar */
  showHabitsOnCalendar: boolean
  /** The date for which to render habits (ISO date string, e.g. "2026-05-18") */
  dateStr: string
}

/**
 * Renders habits as small chips in a "Habits" row at the top of each day column.
 * Habits WITH a reminderTime appear in the time grid at that time (handled externally).
 * This component only renders the top-row chips for habits without specific times.
 * Toggle OFF by default.
 */
export default function HabitOverlay({
  showHabitsOnCalendar,
  dateStr,
}: HabitOverlayProps) {
  const { habits } = useHabits()

  if (!showHabitsOnCalendar) return null

  const activeHabits = habits.filter((h) => !h.archived)

  // Check which habits are due on this date based on frequency
  const dayOfWeek = new Date(dateStr).getDay() // 0 = Sunday
  const dueHabits = activeHabits.filter((h) => {
    if (h.frequency === 'daily') return true
    if (h.frequency === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5
    if (h.frequency === 'custom' && h.customDays) return h.customDays.includes(dayOfWeek)
    if (h.frequency === 'weekly') return dayOfWeek === 1 // default Monday
    return true
  })

  if (dueHabits.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1 px-1 py-1.5">
      {dueHabits.map((habit) => {
        const isCompleted = habit.completions.includes(dateStr)
        return (
          <HabitChip
            key={habit._id}
            habit={habit}
            isCompleted={isCompleted}
          />
        )
      })}
    </div>
  )
}

function HabitChip({ habit, isCompleted }: { habit: Habit; isCompleted: boolean }) {
  return (
    <div
      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-opacity duration-150"
      style={{
        backgroundColor: isCompleted
          ? `${habit.color}20`
          : 'var(--bg-hover)',
        color: isCompleted
          ? habit.color
          : 'var(--text-faint)',
        opacity: isCompleted ? 1 : 0.7,
        textDecoration: isCompleted ? 'line-through' : 'none',
      }}
    >
      <span className="text-[11px]">{habit.icon}</span>
      <span className="max-w-[60px] truncate">{habit.name}</span>
      {habit.currentStreak > 0 && (
        <span className="flex items-center gap-0.5">
          <Flame size={8} strokeWidth={2} />
          {habit.currentStreak}
        </span>
      )}
    </div>
  )
}
