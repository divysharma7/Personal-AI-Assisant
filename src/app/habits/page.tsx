'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, MoreVertical, Flame, ChevronDown } from 'lucide-react'
import { fadeSlideUp, stagger, hoverLift, collapse, buttonPress, ease } from '@/lib/motion'
import { copy } from '@/lib/copy'
import { useHabits } from '@/hooks/useHabits'
import type { Habit } from '@/hooks/useHabits'
import InfoBanner from '@/components/shared/InfoBanner'
import HabitGallery from '@/components/habits/HabitGallery'
import HabitCreationWizard from '@/components/habits/HabitCreationWizard'
import type { HabitFormData } from '@/components/habits/HabitCreationWizard'
import HabitAnalytics from '@/components/habits/HabitAnalytics'

// TODO: move to copy.ts
const HABITS_COPY = {
  title: 'Habits',
  tipBanner: 'Track your habits, build streaks, and stay consistent.',
  browseGallery: 'Browse Gallery',
  createCustom: 'Create Custom',
  emptyState: 'No habits yet. Start building your routine.',
  streakLabel: (n: number) => `${n} days`,
  goalDaily: 'Daily',
  analytics: 'Analytics',
} as const

function WeeklyGrid({ habit, weekCompletions }: {
  habit: Habit
  weekCompletions: (h: Habit) => { date: string; day: string; completed: boolean; isToday: boolean }[]
}) {
  const days = weekCompletions(habit)
  return (
    <div className="flex items-center gap-1">
      {days.map((d) => (
        <div
          key={d.date}
          className="h-3 w-3 rounded-full"
          title={`${d.day}: ${d.completed ? 'Done' : 'Not done'}`}
          style={{
            backgroundColor: d.completed
              ? '#34D399'
              : d.isToday
              ? 'transparent'
              : 'var(--bg-hover)',
            border: d.isToday
              ? '1.5px solid var(--text-faint)'
              : d.completed
              ? 'none'
              : '1.5px solid var(--border)',
          }}
        />
      ))}
    </div>
  )
}

export default function HabitsPage() {
  const { habits, isLoading, createHabit, weekCompletions } = useHabits()
  const [tipDismissed, setTipDismissed] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardPrefill, setWizardPrefill] = useState<{ title?: string; icon?: string; frequency?: string } | undefined>()
  const [analyticsOpen, setAnalyticsOpen] = useState(false)

  const handleGalleryAdd = useCallback((habit: { icon: string; title: string; frequency: string }) => {
    setGalleryOpen(false)
    setWizardPrefill({ title: habit.title, icon: habit.icon, frequency: habit.frequency })
    setWizardOpen(true)
  }, [])

  const handleCreateCustom = useCallback(() => {
    setWizardPrefill(undefined)
    setWizardOpen(true)
  }, [])

  const handleCreate = useCallback(
    async (data: HabitFormData) => {
      await createHabit({
        name: data.name,
        icon: data.icon,
        color: data.color,
        frequency: data.frequency === 'daily' ? 'daily' : data.frequency === 'weekly' ? 'weekly' : 'custom',
        customDays: data.weekdays,
        completions: [],
        currentStreak: 0,
        bestStreak: 0,
        archived: false,
        order: habits.length,
      })
    },
    [createHabit, habits.length]
  )

  const activeHabits = habits.filter((h) => !h.archived)

  return (
    <div className="flex flex-col px-6 py-5">
      {/* Header */}
      <div className="mb-1 flex items-start justify-between">
        <div />
        <div className="flex items-center gap-2">
          <motion.button
            {...buttonPress}
            aria-label="Filter"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <SlidersHorizontal size={18} strokeWidth={1.5} />
          </motion.button>
          <motion.button
            {...buttonPress}
            aria-label="More options"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <MoreVertical size={18} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>

      {/* Title */}
      <h1
        className="mb-5 text-[32px]"
        style={{ color: 'var(--text-primary)' }}
      >
        {HABITS_COPY.title}
      </h1>

      {/* Info banner */}
      <div className="mb-5">
        <InfoBanner
          message={HABITS_COPY.tipBanner}
          onDismiss={() => setTipDismissed(true)}
          visible={!tipDismissed}
        />
      </div>

      {/* CTA buttons */}
      <div className="mb-6 flex items-center gap-3">
        <motion.button
          {...buttonPress}
          onClick={() => setGalleryOpen(true)}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity duration-150 cursor-pointer"
          style={{ backgroundColor: 'var(--accent)' }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          {HABITS_COPY.browseGallery}
        </motion.button>
        <motion.button
          {...buttonPress}
          onClick={handleCreateCustom}
          className="rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-150 cursor-pointer"
          style={{
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          {HABITS_COPY.createCustom}
        </motion.button>
      </div>

      {/* Habit grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        </div>
      ) : activeHabits.length === 0 ? (
        <motion.div
          {...fadeSlideUp}
          transition={ease.normal}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Flame size={48} strokeWidth={1} style={{ color: 'var(--text-faint)', opacity: 0.3 }} />
          <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            No habits yet
          </h3>
          <p className="mt-1 max-w-xs text-sm" style={{ color: 'var(--text-muted)' }}>
            Start building your routine. Browse the gallery or create a custom habit.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <motion.button
              {...buttonPress}
              onClick={() => setGalleryOpen(true)}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity duration-150 cursor-pointer"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              Browse Gallery
            </motion.button>
            <motion.button
              {...buttonPress}
              onClick={handleCreateCustom}
              className="rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-150 cursor-pointer"
              style={{
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              Create Custom
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          {...stagger(0.05)}
          className="grid grid-cols-2 gap-3 lg:grid-cols-3"
        >
          {activeHabits.map((habit) => (
            <motion.div
              key={habit._id}
              {...fadeSlideUp}
              {...hoverLift}
              transition={ease.normal}
              className="flex flex-col gap-3 rounded-xl p-4 cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-pane-2)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {/* Icon */}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
                  style={{
                    backgroundColor: `${habit.color}20`,
                  }}
                >
                  {habit.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {habit.name}
                  </p>
                </div>
              </div>

              {/* Weekly grid */}
              <WeeklyGrid habit={habit} weekCompletions={weekCompletions} />

              {/* Streak */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Flame size={14} strokeWidth={1.5} style={{ color: habit.currentStreak > 0 ? '#FF4D3D' : 'var(--text-faint)' }} />
                  <span
                    className="text-xs font-medium"
                    style={{ color: habit.currentStreak > 0 ? 'var(--text-primary)' : 'var(--text-faint)' }}
                  >
                    {HABITS_COPY.streakLabel(habit.currentStreak)}
                  </span>
                </div>
                <span
                  className="text-xs"
                  style={{ color: 'var(--text-faint)' }}
                >
                  {HABITS_COPY.goalDaily}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Analytics collapsible section */}
      {activeHabits.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setAnalyticsOpen(!analyticsOpen)}
            className="mb-3 flex items-center gap-2 cursor-pointer"
          >
            <motion.div
              animate={{ rotate: analyticsOpen ? 0 : -90 }}
              transition={ease.fast}
            >
              <ChevronDown size={14} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />
            </motion.div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
              {HABITS_COPY.analytics}
            </span>
          </button>
          <AnimatePresence>
            {analyticsOpen && (
              <motion.div {...collapse} transition={ease.normal} className="overflow-hidden">
                <HabitAnalytics habits={activeHabits} weekCompletions={weekCompletions} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Gallery modal */}
      <HabitGallery
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onAdd={handleGalleryAdd}
      />

      {/* Creation wizard */}
      <HabitCreationWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreate={handleCreate}
        prefill={wizardPrefill}
      />
    </div>
  )
}
