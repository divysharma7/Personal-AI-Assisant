'use client'

import { useMemo, useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableTaskCard } from './SortableTaskCard'
import TaskCard from '../TaskCard'
import { cssTransition } from '@/lib/motion'
import { copy } from '@/lib/copy'
import type { TaskRecord } from '@/hooks/useTasks'

/* ── Types ── */

interface WorkflowMatrixViewProps {
  columns: Array<{ id: string; title: string; color?: string }>
  tasks: TaskRecord[]
  onToggleTask: (id: string) => void
  onOpenDetail: (id: string) => void
  labels: { _id: string; name: string; color?: string }[]
  getSubTaskCount: (id: string) => { completed: number; total: number } | undefined
  getLabelsForTask: (task: TaskRecord) => { _id: string; name: string; color?: string }[]
  onMoveTask: (taskId: string, toColumnId: string, newOrder: number) => void
}

/* ── Quadrant wrapper ── */

function MatrixDropZone({
  id,
  title,
  color,
  tasks,
  isOver,
  onToggleTask,
  onOpenDetail,
  labels,
  getSubTaskCount,
  getLabelsForTask,
}: {
  id: string
  title: string
  color?: string
  tasks: TaskRecord[]
  isOver: boolean
  onToggleTask: (id: string) => void
  onOpenDetail: (id: string) => void
  labels: { _id: string; name: string; color?: string }[]
  getSubTaskCount: (id: string) => { completed: number; total: number } | undefined
  getLabelsForTask: (task: TaskRecord) => { _id: string; name: string; color?: string }[]
}) {
  const { setNodeRef } = useDroppable({
    id: `column-${id}`,
    data: { type: 'column', columnId: id },
  })

  const taskIds = useMemo(() => tasks.map((t) => t._id), [tasks])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 12,
        backgroundColor: 'var(--bg-pane-2)',
        border: isOver
          ? '1px solid var(--accent, #6366f1)'
          : '1px solid var(--border)',
        borderTop: `4px solid ${color ?? 'var(--border)'}`,
        overflow: 'hidden',
        minHeight: 0,
        transition: cssTransition.fast,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 22,
            height: 22,
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-muted)',
            backgroundColor: 'var(--overlay-1, rgba(108,108,158,0.08))',
            padding: '0 6px',
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Task list */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 8px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          minHeight: 40,
        }}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task._id}
              task={task}
              columnId={id}
              onToggle={onToggleTask}
              onOpenDetail={onOpenDetail}
              labels={getLabelsForTask(task)}
              subTaskCount={getSubTaskCount(task._id)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div
            style={{
              padding: '24px 12px',
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--text-muted)',
              opacity: 0.6,
            }}
          >
            {copy.tasks.workflow.noTasks}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main component ── */

export default function WorkflowMatrixView({
  columns,
  tasks,
  onToggleTask,
  onOpenDetail,
  labels,
  getSubTaskCount,
  getLabelsForTask,
  onMoveTask,
}: WorkflowMatrixViewProps) {
  const [activeTask, setActiveTask] = useState<TaskRecord | null>(null)
  const [overColumnId, setOverColumnId] = useState<string | null>(null)

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  })
  const keyboardSensor = useSensor(KeyboardSensor)
  const sensors = useSensors(pointerSensor, keyboardSensor)

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    const map = new Map<string, TaskRecord[]>()
    for (const col of columns) {
      map.set(col.id, [])
    }
    for (const task of tasks) {
      const colId = task.sectionId ?? columns[0]?.id
      if (colId && map.has(colId)) {
        map.get(colId)!.push(task)
      } else if (columns[0]) {
        map.get(columns[0].id)!.push(task)
      }
    }
    return map
  }, [columns, tasks])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as
      | { type: string; task: TaskRecord }
      | undefined
    if (data?.type === 'task' && data.task) {
      setActiveTask(data.task)
    }
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    if (!over) {
      setOverColumnId(null)
      return
    }
    const overId = String(over.id)
    if (overId.startsWith('column-')) {
      setOverColumnId(overId.replace('column-', ''))
    } else {
      const overData = over.data.current as
        | { type: string; columnId: string }
        | undefined
      if (overData?.columnId) {
        setOverColumnId(overData.columnId)
      }
    }
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveTask(null)
      setOverColumnId(null)

      if (!over) return
      const activeData = active.data.current as
        | { type: string; task: TaskRecord; columnId: string }
        | undefined
      if (!activeData || activeData.type !== 'task') return

      const taskId = String(active.id)
      const overId = String(over.id)

      let targetColumnId: string
      let newOrder: number

      if (overId.startsWith('column-')) {
        targetColumnId = overId.replace('column-', '')
        newOrder = tasksByColumn.get(targetColumnId)?.length ?? 0
      } else {
        const overData = over.data.current as
          | { type: string; columnId: string }
          | undefined
        if (!overData?.columnId) return
        targetColumnId = overData.columnId
        const colTasks = tasksByColumn.get(targetColumnId) ?? []
        const overIndex = colTasks.findIndex((t) => t._id === String(over.id))
        newOrder = overIndex >= 0 ? overIndex : colTasks.length
      }

      onMoveTask(taskId, targetColumnId, newOrder)
    },
    [tasksByColumn, onMoveTask]
  )

  const handleDragCancel = useCallback(() => {
    setActiveTask(null)
    setOverColumnId(null)
  }, [])

  // Ensure exactly 4 quadrants (pad if needed)
  const quadrants = columns.slice(0, 4)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 12,
          padding: 16,
          flex: 1,
          minHeight: 0,
          height: '100%',
        }}
      >
        {quadrants.map((col) => (
          <MatrixDropZone
            key={col.id}
            id={col.id}
            title={col.title}
            color={col.color}
            tasks={tasksByColumn.get(col.id) ?? []}
            isOver={overColumnId === col.id}
            onToggleTask={onToggleTask}
            onOpenDetail={onOpenDetail}
            labels={labels}
            getSubTaskCount={getSubTaskCount}
            getLabelsForTask={getLabelsForTask}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div
            style={{
              opacity: 0.85,
              transform: 'rotate(2deg)',
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))',
              pointerEvents: 'none',
              maxWidth: 320,
            }}
          >
            <TaskCard
              task={activeTask}
              isOverlay
              onToggle={onToggleTask}
              onOpenDetail={onOpenDetail}
              labels={getLabelsForTask(activeTask)}
              subTaskCount={getSubTaskCount(activeTask._id)}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
