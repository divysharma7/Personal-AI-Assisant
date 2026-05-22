'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { slideFromRight, ease } from '@/lib/motion'
import { useHabits } from '@/hooks/useHabits'
import type { Habit } from '@/hooks/useHabits'
import HabitList from '@/components/habits/HabitList'
import HabitDetail from '@/components/habits/HabitDetail'
import CreateHabitDialog from '@/components/habits/CreateHabitDialog'
import type { CreateHabitData } from '@/components/habits/CreateHabitDialog'
import HabitGallery from '@/components/habits/HabitGallery'
import HabitCreationWizard from '@/components/habits/HabitCreationWizard'
import type { HabitFormData } from '@/components/habits/HabitCreationWizard'

export default function HabitsPage() {
  const { habits, isLoading, createHabit, updateHabit, deleteHabit, toggleToday } = useHabits()
  const prefersReduced = useReducedMotion()

  const [filter, setFilter] = useState<'active' | 'archived'>('active')
  const searchParams = useSearchParams()
  const preselected = searchParams.get('selected')
  const [selectedId, setSelectedId] = useState<string | null>(preselected)

  // Sync when navigating from sidebar with ?selected=id
  useEffect(() => {
    if (preselected) setSelectedId(preselected)
  }, [preselected])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardPrefill, setWizardPrefill] = useState<{ title?: string; icon?: string; frequency?: string } | undefined>()

  const activeHabits = habits.filter((h) => (filter === 'active' ? !h.archived : h.archived))

  const selectedHabit: Habit | null = selectedId
    ? habits.find((h) => h._id === selectedId) ?? null
    : null

  // Auto-select first habit if none selected
  if (!selectedId && activeHabits.length > 0 && !isLoading) {
    // Use effect-free initialization: this is fine in render since setSelectedId
    // will only cause one re-render
  }

  const handleToggleToday = useCallback(
    async (habit: Habit) => {
      await toggleToday(habit)
    },
    [toggleToday]
  )

  const handleCreateFromDialog = useCallback(
    async (data: CreateHabitData) => {
      await createHabit({
        name: data.name,
        icon: data.icon,
        color: '#34d399',
        frequency: data.frequency === 'daily' ? 'daily' : data.frequency === 'weekly' ? 'weekly' : 'custom',
        customDays: data.customDays,
        completions: [],
        currentStreak: 0,
        bestStreak: 0,
        archived: false,
        order: habits.length,
      })
    },
    [createHabit, habits.length]
  )

  const handleCreateFromWizard = useCallback(
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

  const handleGalleryAdd = useCallback((habit: { icon: string; title: string; frequency: string }) => {
    setGalleryOpen(false)
    setWizardPrefill({ title: habit.title, icon: habit.icon, frequency: habit.frequency })
    setWizardOpen(true)
  }, [])

  const handleEdit = useCallback((habit: Habit) => {
    // Open the create dialog in edit mode — for now, open the wizard with prefilled data
    setWizardPrefill({ title: habit.name, icon: habit.icon, frequency: habit.frequency })
    setWizardOpen(true)
  }, [])

  const handleArchive = useCallback(
    async (habit: Habit) => {
      await updateHabit(habit._id, { archived: !habit.archived })
    },
    [updateHabit]
  )

  const handleDelete = useCallback(
    async (habit: Habit) => {
      await deleteHabit(habit._id)
      if (selectedId === habit._id) {
        setSelectedId(null)
      }
    },
    [deleteHabit, selectedId]
  )

  const handleStartFocus = useCallback((habit: Habit) => {
    window.location.href = `/focus?habit=${encodeURIComponent(habit.name)}`
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Left panel - Habit list (~40%) */}
      <div
        style={{
          width: '38%',
          minWidth: 320,
          maxWidth: 440,
          flexShrink: 0,
          height: '100%',
        }}
      >
        <HabitList
          habits={activeHabits}
          selectedId={selectedId}
          onSelect={setSelectedId}
          filter={filter}
          onFilterChange={setFilter}
          onCreateClick={() => setCreateDialogOpen(true)}
          onMoreClick={() => setGalleryOpen(true)}
          isLoading={isLoading}
          onToggleToday={handleToggleToday}
        />
      </div>

      {/* Right panel - Habit detail (~60%) */}
      <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {selectedHabit ? (
            <motion.div
              key={selectedHabit._id}
              {...(prefersReduced ? {} : slideFromRight)}
              initial={prefersReduced ? false : slideFromRight.initial}
              transition={prefersReduced ? { duration: 0 } : ease.normal}
              style={{ height: '100%' }}
            >
              <HabitDetail
                habit={selectedHabit}
                onToggleToday={handleToggleToday}
                onEdit={handleEdit}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onStartFocus={handleStartFocus}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={prefersReduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={prefersReduced ? { duration: 0 } : ease.normal}
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-faint)',
              }}
            >
              <span style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>
                {activeHabits.length > 0 ? '\uD83D\uDC48' : '\uD83D\uDD25'}
              </span>
              <p style={{ fontSize: 15, fontWeight: 500 }}>
                {activeHabits.length > 0
                  ? 'Select a habit to see details'
                  : 'Create your first habit to get started'}
              </p>
              {activeHabits.length === 0 && !isLoading && (
                <button
                  onClick={() => setCreateDialogOpen(true)}
                  style={{
                    marginTop: 16,
                    padding: '10px 24px',
                    borderRadius: 20,
                    border: 'none',
                    backgroundColor: 'var(--accent)',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Create Habit
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Habit Dialog (TickTick style) */}
      <CreateHabitDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreateFromDialog}
      />

      {/* Gallery + legacy wizard */}
      <HabitGallery
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onAdd={handleGalleryAdd}
      />
      <HabitCreationWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreate={handleCreateFromWizard}
        prefill={wizardPrefill}
      />
    </div>
  )
}
