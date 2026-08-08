
import { useState, useCallback, useEffect } from 'react'
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
import './habits.css'

export default function HabitsPage() {
  const { habits, isLoading, createHabit, updateHabit, deleteHabit, toggleToday, setStatusForDate } = useHabits()
  const prefersReduced = useReducedMotion()

  const [filter, setFilter] = useState<'active' | 'archived'>('active')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Sync when navigating from sidebar with ?selected=id
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const preselected = params.get('selected')
      if (preselected) setSelectedId(preselected)
    } catch { /* ignore */ }
  }, [])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardPrefill, setWizardPrefill] = useState<{ title?: string; icon?: string; frequency?: string } | undefined>()
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null)

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

  const handleToggleDate = useCallback(
    async (habit: Habit, date: string) => {
      const completed = habit.completions.includes(date)
      await setStatusForDate(habit, date, completed ? 'unachieved' : 'achieved')
    },
    [setStatusForDate]
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
      if (editingHabitId) {
        await updateHabit(editingHabitId, {
          name: data.name,
          icon: data.icon,
          color: data.color,
          frequency: data.frequency === 'daily' ? 'daily' : data.frequency === 'weekly' ? 'weekly' : 'custom',
          customDays: data.weekdays,
        })
        setEditingHabitId(null)
      } else {
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
      }
    },
    [createHabit, updateHabit, editingHabitId, habits.length]
  )

  const handleGalleryAdd = useCallback((habit: { icon: string; title: string; frequency: string }) => {
    setGalleryOpen(false)
    setWizardPrefill({ title: habit.title, icon: habit.icon, frequency: habit.frequency })
    setWizardOpen(true)
  }, [])

  const handleEdit = useCallback((habit: Habit) => {
    setEditingHabitId(habit._id)
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

  const handleStartFocus = useCallback((habit: Habit, mode: 'POMO' | 'STOPWATCH') => {
    window.dispatchEvent(new CustomEvent('laif:start-focus', {
      detail: { taskId: habit._id, taskTitle: habit.name, mode, targetType: 'HABIT' },
    }))
  }, [])

  return (
    <div className="habits-workspace">
      <div className="habits-workspace-list">
        <HabitList
          habits={activeHabits}
          selectedId={selectedId}
          onSelect={setSelectedId}
          filter={filter}
          onFilterChange={setFilter}
          onCreateClick={() => setCreateDialogOpen(true)}
          onMoreClick={() => setGalleryOpen(true)}
          isLoading={isLoading}
          onToggleDate={(habit, date) => void handleToggleDate(habit, date)}
          onEdit={handleEdit}
          onArchive={(habit) => void handleArchive(habit)}
          onDelete={(habit) => void handleDelete(habit)}
          onStartFocus={handleStartFocus}
        />
      </div>

      <div className="habits-workspace-detail">
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
                onStartFocus={(habit) => handleStartFocus(habit, 'POMO')}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={prefersReduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={prefersReduced ? { duration: 0 } : ease.normal}
              className="habits-workspace-empty"
            >
              <span>{activeHabits.length > 0 ? '◌' : '✦'}</span>
              <p>
                {activeHabits.length > 0
                  ? 'Select a habit to see details'
                  : 'Create your first habit to get started'}
              </p>
              {activeHabits.length === 0 && !isLoading && (
                <button onClick={() => setCreateDialogOpen(true)}>
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
        onClose={() => { setWizardOpen(false); setEditingHabitId(null) }}
        onCreate={handleCreateFromWizard}
        prefill={wizardPrefill}
      />
    </div>
  )
}
