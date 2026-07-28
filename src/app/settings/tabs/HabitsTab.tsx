
import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fade, ease, buttonPress } from '@/lib/motion'
import { useHabits } from '@/hooks/useHabits'
import type { Habit } from '@/hooks/useHabits'
import CreateHabitDialog from '@/components/habits/CreateHabitDialog'
import type { CreateHabitData } from '@/components/habits/CreateHabitDialog'

/* ─── Frequency label helper ─── */
function frequencyLabel(freq: Habit['frequency'], customDays?: number[]): string {
  if (freq === 'daily') return 'Daily'
  if (freq === 'weekdays') return 'Weekdays'
  if (freq === 'weekly') return 'Weekly'
  if (freq === 'custom' && customDays) return `${customDays.length}d/week`
  return freq
}

/* ─── Delete confirmation row ─── */
function DeleteConfirm({
  habitName,
  onConfirm,
  onCancel,
}: {
  habitName: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={ease.fast}
      className="flex items-center justify-between rounded-lg px-4 py-3"
      style={{ backgroundColor: 'var(--overlay-1, var(--bg-hover))' }}
    >
      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Delete <strong style={{ color: 'var(--text-primary)' }}>{habitName}</strong>?
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          className="rounded-md px-3 py-1 text-xs font-medium cursor-pointer"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          Cancel
        </button>
        <motion.button
          {...buttonPress}
          onClick={onConfirm}
          className="rounded-md px-3 py-1 text-xs font-semibold cursor-pointer"
          style={{
            backgroundColor: '#ef4444',
            border: 'none',
            color: '#fff',
          }}
        >
          Delete
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ─── Habit row ─── */
function HabitRow({
  habit,
  onArchive,
  onDelete,
  onRename,
}: {
  habit: Habit
  onArchive: () => void
  onDelete: () => void
  onRename: (name: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(habit.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const commitRename = useCallback(() => {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== habit.name) {
      onRename(trimmed)
    } else {
      setEditName(habit.name)
    }
    setEditing(false)
  }, [editName, habit.name, onRename])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={ease.fast}
      className="flex items-center gap-3 rounded-lg px-4 py-3"
      style={{
        backgroundColor: 'var(--bg-pane-2)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-pane-2)'
      }}
    >
      {/* Icon */}
      <span className="flex-shrink-0 text-lg" style={{ width: 28, textAlign: 'center' }}>
        {habit.icon}
      </span>

      {/* Name + frequency */}
      <div className="flex min-w-0 flex-1 flex-col">
        {editing ? (
          <input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') {
                setEditName(habit.name)
                setEditing(false)
              }
            }}
            className="rounded px-1 py-0.5 text-sm font-medium outline-none"
            style={{
              backgroundColor: 'var(--bg-pane)',
              border: '1px solid var(--accent)',
              color: 'var(--text-primary)',
            }}
          />
        ) : (
          <span
            className="truncate text-sm font-medium cursor-text"
            style={{ color: 'var(--text-primary)' }}
            onClick={() => setEditing(true)}
            title="Click to rename"
          >
            {habit.name}
          </span>
        )}
        <div className="mt-0.5 flex items-center gap-2">
          <span
            className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: 'var(--overlay-1, var(--bg-hover))',
              color: 'var(--text-muted)',
            }}
          >
            {frequencyLabel(habit.frequency, habit.customDays)}
          </span>
          {habit.archived && (
            <span
              className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: 'var(--overlay-2, var(--bg-hover))',
                color: 'var(--text-faint)',
              }}
            >
              Archived
            </span>
          )}
        </div>
      </div>

      {/* Streak */}
      {habit.currentStreak > 0 && (
        <div className="flex flex-shrink-0 items-center gap-1" title={`Current streak: ${habit.currentStreak}`}>
          <span className="text-sm">🔥</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            {habit.currentStreak}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-shrink-0 items-center gap-1">
        <motion.button
          {...buttonPress}
          onClick={() => setEditing(true)}
          className="rounded-md px-2 py-1 text-[11px] font-medium cursor-pointer"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
          title="Rename"
        >
          Edit
        </motion.button>
        <motion.button
          {...buttonPress}
          onClick={onArchive}
          className="rounded-md px-2 py-1 text-[11px] font-medium cursor-pointer"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
          title={habit.archived ? 'Unarchive' : 'Archive'}
        >
          {habit.archived ? 'Unarchive' : 'Archive'}
        </motion.button>
        <motion.button
          {...buttonPress}
          onClick={onDelete}
          className="rounded-md px-2 py-1 text-[11px] font-medium cursor-pointer"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-faint)',
          }}
          title="Delete"
        >
          ✕
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ─── Main HabitsTab ─── */
export default function HabitsTab() {
  const { habits, isLoading, createHabit, updateHabit, deleteHabit } = useHabits()
  const [showArchived, setShowArchived] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const filtered = habits.filter((h) => (showArchived ? h.archived : !h.archived))
  const archivedCount = habits.filter((h) => h.archived).length

  const handleCreate = useCallback(
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
    [createHabit, habits.length],
  )

  const handleRename = useCallback(
    async (id: string, name: string) => {
      await updateHabit(id, { name })
    },
    [updateHabit],
  )

  const handleArchive = useCallback(
    async (habit: Habit) => {
      await updateHabit(habit._id, { archived: !habit.archived })
    },
    [updateHabit],
  )

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteHabit(id)
      setDeleteConfirmId(null)
    },
    [deleteHabit],
  )

  return (
    <motion.div key="habits" {...fade} transition={ease.normal} className="flex flex-col gap-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            Habits
          </h2>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
            Manage your habits and routines
          </p>
        </div>
        <motion.button
          {...buttonPress}
          onClick={() => setCreateOpen(true)}
          className="rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer"
          style={{
            backgroundColor: 'var(--accent)',
            border: 'none',
            color: '#fff',
          }}
        >
          + New Habit
        </motion.button>
      </div>

      {/* Archived toggle */}
      {archivedCount > 0 && (
        <button
          onClick={() => setShowArchived(!showArchived)}
          className="self-start text-xs font-medium cursor-pointer"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-faint)',
            padding: 0,
          }}
        >
          {showArchived ? '← Back to active' : `Show archived (${archivedCount})`}
        </button>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="py-12 text-center">
          <span className="text-sm" style={{ color: 'var(--text-faint)' }}>Loading habits…</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div
          className="flex flex-col items-center justify-center rounded-2xl py-16"
          style={{ backgroundColor: 'var(--bg-pane-2)', border: '1px solid var(--border)' }}
        >
          <span className="mb-3 text-4xl opacity-30">{showArchived ? '📦' : '🔥'}</span>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            {showArchived ? 'No archived habits' : 'No habits yet'}
          </p>
          {!showArchived && (
            <motion.button
              {...buttonPress}
              onClick={() => setCreateOpen(true)}
              className="mt-4 rounded-full px-5 py-2 text-xs font-semibold cursor-pointer"
              style={{
                backgroundColor: 'var(--accent)',
                border: 'none',
                color: '#fff',
              }}
            >
              Create your first habit
            </motion.button>
          )}
        </div>
      )}

      {/* Habit list */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex flex-col gap-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((habit) => (
              <div key={habit._id}>
                <HabitRow
                  habit={habit}
                  onArchive={() => handleArchive(habit)}
                  onDelete={() => setDeleteConfirmId(habit._id)}
                  onRename={(name) => handleRename(habit._id, name)}
                />
                <AnimatePresence>
                  {deleteConfirmId === habit._id && (
                    <div className="mt-1">
                      <DeleteConfirm
                        habitName={habit.name}
                        onConfirm={() => handleDelete(habit._id)}
                        onCancel={() => setDeleteConfirmId(null)}
                      />
                    </div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create dialog */}
      <CreateHabitDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
    </motion.div>
  )
}
