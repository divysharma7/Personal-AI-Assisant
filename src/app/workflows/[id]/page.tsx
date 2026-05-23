'use client'

import { useCallback, useMemo, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import { useTasks } from '@/hooks/useTasks'
import type { TaskRecord } from '@/hooks/useTasks'
import { useLabels } from '@/hooks/useLabels'
import { useWorkflow } from '@/hooks/useWorkflows'
import { useKanbanSections } from '@/hooks/useKanbanSections'
import { playCompletionSound } from '@/lib/sounds'
import { copy } from '@/lib/copy'
import WorkflowHeader from '@/components/tasks/kanban/WorkflowHeader'
import KanbanBoard from '@/components/tasks/kanban/KanbanBoard'
import type { ColumnDefinition } from '@/components/tasks/kanban/KanbanBoard'
import WorkflowMatrixView from '@/components/tasks/kanban/WorkflowMatrixView'
import KanbanViewOptions from '@/components/tasks/kanban/KanbanViewOptions'

/* ── Loading skeleton ── */

function WorkflowSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header skeleton */}
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 12,
          backgroundColor: 'var(--bg-pane)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 6,
            backgroundColor: 'var(--overlay-1, rgba(108,108,158,0.08))',
          }}
        />
        <div
          style={{
            width: 120,
            height: 16,
            borderRadius: 4,
            backgroundColor: 'var(--overlay-1, rgba(108,108,158,0.08))',
          }}
        />
      </div>

      {/* Body skeleton */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: 12,
          padding: 16,
          overflow: 'hidden',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              minWidth: 220,
              maxWidth: 320,
              borderRadius: 12,
              backgroundColor: 'var(--overlay-1, rgba(108,108,158,0.04))',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Not found state ── */

function WorkflowNotFound() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <span
        style={{
          fontSize: 48,
          lineHeight: 1,
        }}
      >
        404
      </span>
      <span
        style={{
          fontSize: 15,
          color: 'var(--text-muted)',
        }}
      >
        {copy.tasks.workflow.notFound}
      </span>
    </div>
  )
}

/* ── Main page ── */

export default function WorkflowPage() {
  const { id } = useParams<{ id: string }>()
  const { workflow, isLoading: workflowLoading } = useWorkflow(id)
  const { tasks, toggleComplete, updateTask, createTask } = useTasks()
  const { labels } = useLabels()
  const { reorderTask } = useKanbanSections()

  const [viewOptionsOpen, setViewOptionsOpen] = useState(false)

  // ── Filter tasks belonging to this workflow ──
  const workflowTasks = useMemo(() => {
    if (!workflow?._id) return []
    return tasks.filter((t) => t.workflowId === workflow._id)
  }, [tasks, workflow])

  // ── Build column definitions for KanbanBoard ──
  const columns: ColumnDefinition[] = useMemo(() => {
    if (!workflow?.columns) return []

    // Tasks not assigned to any workflow column go to first column
    const firstColId = workflow.columns[0]?.id

    return workflow.columns.map((col) => {
      const colTasks = workflowTasks.filter(
        (t) => t.sectionId === col.id && t.status !== 'done'
      )
      const completedTasks = workflowTasks.filter(
        (t) => t.sectionId === col.id && t.status === 'done'
      )

      // Add unassigned tasks to first column
      if (col.id === firstColId) {
        const unassigned = workflowTasks.filter(
          (t) =>
            t.status !== 'done' &&
            (!t.sectionId ||
              !workflow.columns.some((c) => c.id === t.sectionId))
        )
        colTasks.push(...unassigned)
      }

      return {
        id: col.id,
        title: col.title,
        tasks: colTasks,
        completedTasks,
      }
    })
  }, [workflow, workflowTasks])

  // ── Matrix columns (raw, for WorkflowMatrixView) ──
  const matrixColumns = useMemo(() => {
    if (!workflow?.columns) return []
    return workflow.columns.map((col) => ({
      id: col.id,
      title: col.title,
      color: col.color ?? undefined,
    }))
  }, [workflow])

  // ── Sub-task counts ──
  const getSubTaskCount = useCallback(
    (taskId: string) => {
      const subTasks = workflowTasks.filter((t) => t.parentId === taskId)
      if (subTasks.length === 0) return undefined
      return {
        completed: subTasks.filter((t) => t.status === 'done').length,
        total: subTasks.length,
      }
    },
    [workflowTasks]
  )

  // ── Labels for a task ──
  const getLabelsForTask = useCallback(
    (task: TaskRecord) => {
      if (!task.labelIds || task.labelIds.length === 0) return []
      return labels.filter((l) => task.labelIds?.includes(l._id))
    },
    [labels]
  )

  // ── Toggle handler ──
  const handleToggleTask = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t._id === taskId)
      if (!task) return
      if (task.status !== 'done') playCompletionSound()
      await toggleComplete(taskId)
    },
    [tasks, toggleComplete]
  )

  // ── Open detail handler ──
  const handleOpenDetail = useCallback((taskId: string) => {
    window.dispatchEvent(
      new CustomEvent('laif:detail-task', { detail: { taskId } })
    )
  }, [])

  // ── Add task handler ──
  const handleAddTask = useCallback(
    async (columnId: string) => {
      await createTask({
        title: 'New task',
        priority: 'medium',
        status: 'todo',
        sectionId: columnId,
        workflowId: workflow?._id ?? null,
      })
    },
    [createTask, workflow]
  )

  // ── Move task handler ──
  const handleMoveTask = useCallback(
    (taskId: string, toColumnId: string, newOrder: number) => {
      reorderTask({
        taskId,
        sectionId: toColumnId,
        kanbanOrder: newOrder,
      })
    },
    [reorderTask]
  )

  // ── Edit name handler ──
  const handleEditName = useCallback(
    async (name: string) => {
      if (!workflow) return
      // updateTask on workflow doc — delegate to useWorkflow
      // For now, dispatch event for parent to handle
      window.dispatchEvent(
        new CustomEvent('laif:rename-workflow', {
          detail: { workflowId: workflow._id, name },
        })
      )
    },
    [workflow]
  )

  // ── Loading ──
  if (workflowLoading) {
    return <WorkflowSkeleton />
  }

  // ── Not found ──
  if (!workflow) {
    return <WorkflowNotFound />
  }

  const isMatrix = workflow.templateType === 'matrix'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <WorkflowHeader
        workflow={workflow}
        onEditName={handleEditName}
        onOpenViewOptions={() => setViewOptionsOpen(true)}
      />

      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isMatrix ? (
          <WorkflowMatrixView
            columns={matrixColumns}
            tasks={workflowTasks}
            onToggleTask={handleToggleTask}
            onOpenDetail={handleOpenDetail}
            labels={labels}
            getSubTaskCount={getSubTaskCount}
            getLabelsForTask={getLabelsForTask}
            onMoveTask={handleMoveTask}
          />
        ) : (
          <KanbanBoard
            columns={columns}
            onMoveTask={handleMoveTask}
            onToggleTask={handleToggleTask}
            onOpenDetail={handleOpenDetail}
            onAddTask={handleAddTask}
            labels={labels}
            getSubTaskCount={getSubTaskCount}
            getLabelsForTask={getLabelsForTask}
            showColumnMenus
          />
        )}
      </div>

      <KanbanViewOptions
        open={viewOptionsOpen}
        onClose={() => setViewOptionsOpen(false)}
      />
    </div>
  )
}
