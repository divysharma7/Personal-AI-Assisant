'use client'
import { motion } from 'framer-motion'
import { Check, Flame } from 'lucide-react'
import { useHabits } from '@/hooks/useHabits'
import { snappy } from '@/shared/design-system'
import Link from 'next/link'

export default function HabitsWidget() {
  const { habits, isLoading, toggleToday, todayStr } = useHabits()
  const today = todayStr()

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 px-4">
        <p className="text-xs text-center" style={{ color: 'var(--text-3)' }}>No habits yet</p>
        <Link href="/habits" className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
          Create your first habit
        </Link>
      </div>
    )
  }

  const completed = habits.filter(h => h.completions.includes(today)).length
  const total = habits.length

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Link href="/habits" className="text-sm font-semibold hover:underline" style={{ color: 'var(--text-1)' }}>
          Habits
        </Link>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: completed === total ? 'rgba(34,197,94,0.15)' : 'var(--surface-1)', color: completed === total ? '#22c55e' : 'var(--text-3)' }}>
          {completed}/{total}
        </span>
      </div>

      {/* Habit toggles */}
      <div className="flex-1 space-y-2 overflow-auto">
        {habits.slice(0, 6).map(habit => {
          const done = habit.completions.includes(today)
          return (
            <motion.div key={habit._id} className="flex items-center gap-2.5" transition={snappy}>
              <button onClick={() => toggleToday(habit)}
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: done ? habit.color : 'transparent', border: `2px solid ${habit.color}` }}>
                {done && <Check size={11} color="#fff" strokeWidth={3} />}
              </button>
              <span className="text-xs font-medium truncate" style={{ color: done ? 'var(--text-3)' : 'var(--text-1)', textDecoration: done ? 'line-through' : undefined }}>
                {habit.name}
              </span>
              {habit.currentStreak > 0 && (
                <span className="text-[10px] ml-auto flex items-center gap-0.5 flex-shrink-0" style={{ color: '#f59e0b' }}>
                  <Flame size={9} /> {habit.currentStreak}
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
