'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, Minus, Plus } from 'lucide-react'
import { fadeSlideUp, stagger, buttonPress, ease, checkBounce } from '@/lib/motion'
import { useHabits } from '@/hooks/useHabits'
import type { Habit } from '@/hooks/useHabits'
import { format, subDays, addDays, isToday, isBefore, startOfDay } from 'date-fns'
import StreakCelebration from '@/components/habits/StreakCelebration'

// TODO: move to copy.ts
const COPY = {
  title: 'Daily Check-in',
  progress: (done: number, total: number) => `${done} of ${total} habits checked in`,
  allDone: 'See you tomorrow',
  markUnachieved: 'Mark as Unachieved',
  reasons: ['Tired', 'Forgot', 'No time', 'Sick', 'Traveling', 'Not feeling it', 'Custom'] as const,
} as const

function WeekMiniGrid({ habit, targetDate, weekCompletions }: {
  habit: Habit
  targetDate: Date
  weekCompletions: (h: Habit) => { date: string; day: string; completed: boolean; isToday: boolean }[]
}) {
  const days = weekCompletions(habit)
  return (
    <div className="flex items-center gap-0.5">
      {days.map((d) => (
        <div
          key={d.date}
          className="h-2.5 w-2.5 rounded-[2px]"
          style={{
            backgroundColor: d.completed
              ? '#34D399'
              : 'var(--bg-hover)',
            border: d.isToday ? '1px solid var(--text-faint)' : 'none',
          }}
        />
      ))}
    </div>
  )
}

export default function CheckinPage() {
  const { habits, toggleToday, weekCompletions, todayStr } = useHabits()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [contextHabitId, setContextHabitId] = useState<string | null>(null)
  const [celebrationHabit, setCelebrationHabit] = useState<{ streak: number; name: string } | null>(null)

  const dateStr = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate])
  const displayDate = useMemo(() => {
    if (isToday(selectedDate)) return 'Today'
    return format(selectedDate, 'EEEE, MMM d')
  }, [selectedDate])

  // Only allow going back 7 days max
  const canGoBack = useMemo(() => {
    const limit = subDays(new Date(), 7)
    return startOfDay(selectedDate) > startOfDay(limit)
  }, [selectedDate])

  const canGoForward = useMemo(() => {
    return !isToday(selectedDate) && isBefore(selectedDate, new Date())
  }, [selectedDate])

  const activeHabits = useMemo(() => habits.filter((h) => !h.archived), [habits])

  const checkedCount = useMemo(
    () => activeHabits.filter((h) => h.completions.includes(dateStr)).length,
    [activeHabits, dateStr]
  )

  const allDone = activeHabits.length > 0 && checkedCount === activeHabits.length

  const handleToggle = useCallback(
    async (habit: Habit) => {
      const wasCompleted = habit.completions.includes(todayStr())
      await toggleToday(habit)
      // Check for streak milestone after toggle
      if (!wasCompleted) {
        const newStreak = habit.currentStreak + 1
        const milestones = [7, 14, 30, 60, 100, 365]
        if (milestones.includes(newStreak)) {
          setCelebrationHabit({ streak: newStreak, name: habit.name })
        }
      }
    },
    [toggleToday, todayStr]
  )

  const handleNavigateBack = useCallback(() => {
    if (canGoBack) setSelectedDate((d) => subDays(d, 1))
  }, [canGoBack])

  const handleNavigateForward = useCallback(() => {
    if (canGoForward) setSelectedDate((d) => addDays(d, 1))
  }, [canGoForward])

  const handleGoToToday = useCallback(() => {
    setSelectedDate(new Date())
  }, [])

  // Progress fill animation width
  const progressPct = activeHabits.length > 0
    ? (checkedCount / activeHabits.length) * 100
    : 0

  return (
    <div className="flex flex-col px-6 py-5">
      {/* Title */}
      <h1
        className="mb-2 text-[32px] font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        {COPY.title}
      </h1>

      {/* Date navigation */}
      <div className="mb-5 flex items-center gap-3">
        <motion.button
          {...buttonPress}
          onClick={handleNavigateBack}
          disabled={!canGoBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { if (canGoBack) e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </motion.button>

        <button
          onClick={handleGoToToday}
          className="text-sm font-semibold cursor-pointer"
          style={{ color: 'var(--text-primary)' }}
        >
          {displayDate}
        </button>

        <motion.button
          {...buttonPress}
          onClick={handleNavigateForward}
          disabled={!canGoForward}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { if (canGoForward) e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </motion.button>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            {COPY.progress(checkedCount, activeHabits.length)}
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
            {Math.round(progressPct)}%
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: 'var(--bg-hover)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={ease.normal}
          />
        </div>
      </div>

      {/* Habit list */}
      {activeHabits.length === 0 ? (
        <motion.div
          {...fadeSlideUp}
          transition={ease.normal}
          className="flex flex-1 flex-col items-center justify-center py-20"
        >
          <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
            No habits to check in. Create some first.
          </p>
        </motion.div>
      ) : (
        <motion.div {...stagger(0.04)} className="flex flex-col gap-1">
          {activeHabits.map((habit) => {
            const isChecked = habit.completions.includes(dateStr)
            return (
              <motion.div
                key={habit._id}
                {...fadeSlideUp}
                transition={ease.normal}
                className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-colors duration-150"
                style={{
                  backgroundColor: 'var(--bg-pane-2)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Icon + title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg"
                    style={{ backgroundColor: `${habit.color}20` }}
                  >
                    {habit.icon}
                  </div>
                  <span
                    className="text-sm font-medium truncate"
                    style={{
                      color: isChecked ? 'var(--text-faint)' : 'var(--text-primary)',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      textDecorationColor: 'var(--accent)',
                    }}
                  >
                    {habit.name}
                  </span>
                </div>

                {/* Weekly mini grid */}
                <div className="flex-shrink-0 hidden sm:block">
                  <WeekMiniGrid habit={habit} targetDate={selectedDate} weekCompletions={weekCompletions} />
                </div>

                {/* Large checkbox */}
                <motion.button
                  {...buttonPress}
                  onClick={() => handleToggle(habit)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    if (!isChecked) setContextHabitId(habit._id)
                  }}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-colors duration-150 cursor-pointer"
                  style={{
                    border: isChecked ? 'none' : '2px solid var(--border)',
                    backgroundColor: isChecked ? 'var(--accent)' : 'transparent',
                  }}
                >
                  <AnimatePresence>
                    {isChecked && (
                      <motion.div
                        initial={checkBounce.initial}
                        animate={checkBounce.checked}
                      >
                        <Check size={20} strokeWidth={2.5} className="text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Context menu for unachieved */}
                <AnimatePresence>
                  {contextHabitId === habit._id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={ease.fast}
                      className="absolute right-12 z-50 w-52 rounded-xl p-2 shadow-lg"
                      style={{
                        backgroundColor: 'var(--bg-pane-2)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <p className="mb-2 px-2 text-xs font-semibold" style={{ color: 'var(--text-faint)' }}>
                        {COPY.markUnachieved}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {COPY.reasons.map((reason) => (
                          <button
                            key={reason}
                            onClick={() => setContextHabitId(null)}
                            className="rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 cursor-pointer"
                            style={{
                              backgroundColor: 'var(--bg-hover)',
                              color: 'var(--text-muted)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--accent)'
                              e.currentTarget.style.color = '#FFFFFF'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                              e.currentTarget.style.color = 'var(--text-muted)'
                            }}
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* All done celebration */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            {...fadeSlideUp}
            transition={ease.normal}
            className="mt-8 flex flex-col items-center gap-2 py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="mb-2 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
              style={{ backgroundColor: 'var(--accent-soft)' }}
            >
              {'\u2728'}
            </motion.div>
            <p
              className="text-lg font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              All habits done!
            </p>
            <p
              className="text-sm"
              style={{ color: 'var(--text-faint)' }}
            >
              {COPY.allDone}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak celebration */}
      {celebrationHabit && (
        <StreakCelebration
          streakCount={celebrationHabit.streak}
          habitName={celebrationHabit.name}
          onDismiss={() => setCelebrationHabit(null)}
        />
      )}
    </div>
  )
}
