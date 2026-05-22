'use client'

import { useCallback } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { useLists } from '@/hooks/useLists'
import type { TaskRecord } from '@/hooks/useTasks'
import type { ListDoc } from '@/hooks/useLists'

// ── Date helpers ──────────────────────────────────────────────────────────────

function addDaysToISO(isoStr: string, days: number): string {
  const d = new Date(isoStr)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function setToDateAtTime(isoStr: string | null | undefined, targetDate: Date): string {
  let hours = 9, minutes = 0
  if (isoStr) {
    const d = new Date(isoStr)
    hours = d.getHours()
    minutes = d.getMinutes()
  }
  const d = new Date(targetDate)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

export function getTomorrow(): Date {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getNextMonday(): Date {
  const d = new Date()
  const day = d.getDay()
  const daysUntilMonday = day === 0 ? 1 : 8 - day
  d.setDate(d.getDate() + daysUntilMonday)
  d.setHours(0, 0, 0, 0)
  return d
}

// ── Priority options (laif uses string priorities) ────────────────────────────

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#6b66da' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
] as const

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseBatchActionsProps {
  selectedIds: Set<string>
  clearSelection: () => void
}

export function useBatchActions({ selectedIds, clearSelection }: UseBatchActionsProps) {
  const { tasks, updateTask, deleteTask, createTask } = useTasks()
  const { lists } = useLists()

  const count = selectedIds.size
  const selectedTasks = tasks.filter(t => selectedIds.has(t._id))

  // Postpone by N days (shifts dates forward)
  const handlePostpone = useCallback(
    async (days: number) => {
      try {
        await Promise.all(
          selectedTasks.map(t => {
            const patch: Partial<TaskRecord> = {}
            if (t.scheduledStart) patch.scheduledStart = addDaysToISO(t.scheduledStart, days)
            if (t.scheduledEnd) patch.scheduledEnd = addDaysToISO(t.scheduledEnd, days)
            if (t.dueDate) patch.dueDate = addDaysToISO(t.dueDate, days)
            return updateTask(t._id, patch)
          })
        )
        clearSelection()
      } catch {
        // silently fail — optimistic updates will revert
      }
    },
    [selectedTasks, updateTask, clearSelection]
  )

  // Postpone to a specific date
  const handlePostponeTo = useCallback(
    async (targetDate: Date) => {
      try {
        await Promise.all(
          selectedTasks.map(t => {
            const newStart = setToDateAtTime(t.scheduledStart, targetDate)
            const patch: Partial<TaskRecord> = { scheduledStart: newStart }
            if (t.scheduledStart && t.scheduledEnd) {
              const durationMs = new Date(t.scheduledEnd).getTime() - new Date(t.scheduledStart).getTime()
              patch.scheduledEnd = new Date(new Date(newStart).getTime() + durationMs).toISOString()
            }
            if (t.dueDate) {
              patch.dueDate = targetDate.toISOString()
            }
            return updateTask(t._id, patch)
          })
        )
        clearSelection()
      } catch {
        // silently fail
      }
    },
    [selectedTasks, updateTask, clearSelection]
  )

  // Change list for all selected
  const handleChangeList = useCallback(
    async (listId: string | null) => {
      try {
        await Promise.all(
          selectedTasks.map(t => updateTask(t._id, { listId }))
        )
        clearSelection()
      } catch {
        // silently fail
      }
    },
    [selectedTasks, updateTask, clearSelection]
  )

  // Change priority for all selected
  const handleChangePriority = useCallback(
    async (priority: string) => {
      try {
        await Promise.all(
          selectedTasks.map(t => updateTask(t._id, { priority }))
        )
        clearSelection()
      } catch {
        // silently fail
      }
    },
    [selectedTasks, updateTask, clearSelection]
  )

  // Complete all selected
  const handleCompleteAll = useCallback(async () => {
    try {
      await Promise.all(
        selectedTasks.map(t =>
          updateTask(t._id, { status: 'done', completedAt: new Date().toISOString() })
        )
      )
      clearSelection()
    } catch {
      // silently fail
    }
  }, [selectedTasks, updateTask, clearSelection])

  // Delete all selected
  const handleDeleteAll = useCallback(async () => {
    try {
      await Promise.all(selectedTasks.map(t => deleteTask(t._id)))
      clearSelection()
    } catch {
      // silently fail
    }
  }, [selectedTasks, deleteTask, clearSelection])

  return {
    count,
    selectedTasks,
    lists: lists as ListDoc[],
    handlePostpone,
    handlePostponeTo,
    handleChangeList,
    handleChangePriority,
    handleCompleteAll,
    handleDeleteAll,
  }
}
