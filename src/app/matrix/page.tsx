'use client'

import { useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { SlidersHorizontal, MoreVertical, LayoutGrid } from 'lucide-react'
import { copy } from '@/lib/copy'
import { fadeSlideUp, ease, buttonPress } from '@/lib/motion'
import { useTasks } from '@/hooks/useTasks'
import type { TaskRecord } from '@/hooks/useTasks'
import { playCompletionSound } from '@/lib/sounds'
import MatrixQuadrant from '@/components/matrix/MatrixQuadrant'
import MatrixSummary from '@/components/matrix/MatrixSummary'

const QUADRANT_COLORS = {
  doFirst: '#FF4D3D',
  schedule: '#FFB23D',
  delegate: '#FF8C42',
  eliminate: '#5DA8FF',
} as const

function isTodayOrOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const now = new Date()
  // Compare at day level
  const taskDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return taskDay <= today
}

function classifyTask(
  task: TaskRecord
): 'doFirst' | 'schedule' | 'delegate' | 'eliminate' {
  const isHigh = task.priority === 'high'
  const urgent = isTodayOrOverdue(task.dueDate ?? null)

  if (isHigh && urgent) return 'doFirst'
  if (isHigh && !urgent) return 'schedule'
  if (!isHigh && urgent) return 'delegate'
  return 'eliminate'
}

export default function MatrixPage() {
  const { tasks, toggleComplete, createTask } = useTasks()

  // Filter: only tasks with priority AND estimatedEffort, exclude done/dropped
  const eligibleTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.priority != null &&
          t.priority !== '' &&
          t.estimatedEffort != null &&
          t.status !== 'done' &&
          t.status !== 'dropped'
      ),
    [tasks]
  )

  // Also keep all tasks with priority+effort for summary (including done today)
  const allMatrixTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.priority != null &&
          t.priority !== '' &&
          t.estimatedEffort != null
      ),
    [tasks]
  )

  // Classify into quadrants
  const quadrants = useMemo(() => {
    const result = {
      doFirst: [] as TaskRecord[],
      schedule: [] as TaskRecord[],
      delegate: [] as TaskRecord[],
      eliminate: [] as TaskRecord[],
    }
    for (const task of eligibleTasks) {
      const q = classifyTask(task)
      result[q].push(task)
    }
    return result
  }, [eligibleTasks])

  const handleToggle = useCallback(
    (id: string) => {
      toggleComplete(id)
      playCompletionSound()
    },
    [toggleComplete]
  )

  const handleOpenDetail = useCallback((id: string) => {
    window.dispatchEvent(
      new CustomEvent('laif:detail-task', { detail: { taskId: id } })
    )
  }, [])

  const handleAddDoFirst = useCallback(
    (effort: number) => {
      const today = new Date().toISOString().split('T')[0]
      createTask({
        title: '',
        priority: 'high',
        dueDate: today,
        status: 'todo',
        estimatedEffort: effort,
      })
    },
    [createTask]
  )

  const handleAddSchedule = useCallback(
    (effort: number) => {
      createTask({
        title: '',
        priority: 'high',
        dueDate: null,
        status: 'todo',
        estimatedEffort: effort,
      })
    },
    [createTask]
  )

  const handleAddDelegate = useCallback(
    (effort: number) => {
      const today = new Date().toISOString().split('T')[0]
      createTask({
        title: '',
        priority: 'medium',
        dueDate: today,
        status: 'todo',
        estimatedEffort: effort,
      })
    },
    [createTask]
  )

  const handleAddEliminate = useCallback(
    (effort: number) => {
      createTask({
        title: '',
        priority: 'low',
        dueDate: null,
        status: 'backlog',
        estimatedEffort: effort,
      })
    },
    [createTask]
  )

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      {/* Header */}
      <motion.div
        {...fadeSlideUp}
        transition={ease.normal}
        className="flex items-center justify-between"
      >
        <h1
          className="text-[32px] leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {copy.matrix.title}
        </h1>
        <div className="flex items-center gap-2">
          <motion.button
            {...buttonPress}
            aria-label="Filter"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <SlidersHorizontal size={18} strokeWidth={1.5} />
          </motion.button>
          <motion.button
            {...buttonPress}
            aria-label="More options"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <MoreVertical size={18} strokeWidth={1.5} />
          </motion.button>
        </div>
      </motion.div>

      {/* 2x2 Grid */}
      <div className="relative flex-1" style={{ minHeight: 0 }}>
        <motion.div
          {...fadeSlideUp}
          transition={{ ...ease.normal, delay: 0.05 }}
          className="grid h-full gap-3"
          style={{
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            minHeight: 0,
          }}
        >
          {/* Do First (top-left) */}
          <MatrixQuadrant
            title={copy.matrix.quadrants.doFirst.title}
            subtitle={copy.matrix.quadrants.doFirst.subtitle}
            color={QUADRANT_COLORS.doFirst}
            tasks={quadrants.doFirst}
            onToggleTask={handleToggle}
            onOpenDetail={handleOpenDetail}
            onAddTask={handleAddDoFirst}
          />

          {/* Schedule (top-right) */}
          <MatrixQuadrant
            title={copy.matrix.quadrants.schedule.title}
            subtitle={copy.matrix.quadrants.schedule.subtitle}
            color={QUADRANT_COLORS.schedule}
            tasks={quadrants.schedule}
            onToggleTask={handleToggle}
            onOpenDetail={handleOpenDetail}
            onAddTask={handleAddSchedule}
          />

          {/* Delegate (bottom-left) */}
          <MatrixQuadrant
            title={copy.matrix.quadrants.delegate.title}
            subtitle={copy.matrix.quadrants.delegate.subtitle}
            color={QUADRANT_COLORS.delegate}
            tasks={quadrants.delegate}
            onToggleTask={handleToggle}
            onOpenDetail={handleOpenDetail}
            onAddTask={handleAddDelegate}
          />

          {/* Eliminate (bottom-right) */}
          <MatrixQuadrant
            title={copy.matrix.quadrants.eliminate.title}
            subtitle={copy.matrix.quadrants.eliminate.subtitle}
            color={QUADRANT_COLORS.eliminate}
            tasks={quadrants.eliminate}
            onToggleTask={handleToggle}
            onOpenDetail={handleOpenDetail}
            onAddTask={handleAddEliminate}
          />
        </motion.div>

        {/* All-empty overlay */}
        {eligibleTasks.length === 0 && (
          <motion.div
            {...fadeSlideUp}
            transition={ease.normal}
            className="absolute inset-0 flex flex-col items-center justify-center text-center rounded-xl"
            style={{ backgroundColor: 'color-mix(in srgb, var(--bg-pane) 85%, transparent)' }}
          >
            <LayoutGrid size={48} strokeWidth={1} style={{ color: 'var(--text-faint)', opacity: 0.3 }} />
            <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              Add priority and effort to your tasks to see them here
            </h3>
            <p className="mt-1 max-w-sm text-sm" style={{ color: 'var(--text-muted)' }}>
              The matrix shows tasks that have both a priority level and estimated effort.
            </p>
            <a
              href="/"
              className="mt-4 inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium no-underline transition-opacity duration-150"
              style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              Go to Inbox
            </a>
          </motion.div>
        )}
      </div>

      {/* Summary Bar */}
      <MatrixSummary
        doFirstTasks={quadrants.doFirst}
        allTasks={allMatrixTasks}
      />
    </div>
  )
}
