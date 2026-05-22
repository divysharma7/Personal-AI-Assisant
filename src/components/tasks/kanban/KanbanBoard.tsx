'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import KanbanColumn from './KanbanColumn'
import TaskCard from '../TaskCard'
import { useReducedMotion } from 'framer-motion'
import { cssTransition } from '@/lib/motion'
import type { TaskRecord } from '@/hooks/useTasks'

/* ── Types ── */

export interface ColumnDefinition {
  id: string
  title: string
  tasks: TaskRecord[]
  completedTasks?: TaskRecord[]
  /** Optional header action (e.g. "Postpone" on overdue column) */
  headerAction?: { label: string; onClick: () => void }
}

export interface KanbanBoardProps {
  columns: ColumnDefinition[]
  onMoveTask: (taskId: string, toColumnId: string, newOrder: number) => void
  onToggleTask: (id: string) => void
  onOpenDetail: (id: string) => void
  onAddTask: (columnId: string) => void
  labels: { _id: string; name: string; color?: string }[]
  getSubTaskCount: (id: string) => { completed: number; total: number } | undefined
  getLabelsForTask: (task: TaskRecord) => { _id: string; name: string; color?: string }[]
  showColumnMenus?: boolean
  onRenameColumn?: (id: string) => void
  onDeleteColumn?: (id: string) => void
  onAddSectionLeft?: (id: string) => void
  onAddSectionRight?: (id: string) => void
  showAddSection?: boolean
  onAddSection?: () => void
}

/* ── Helpers ── */

function findColumnForTask(
  columns: ColumnDefinition[],
  taskId: string
): string | null {
  for (const col of columns) {
    if (col.tasks.some((t) => t._id === taskId)) return col.id
    if (col.completedTasks?.some((t) => t._id === taskId)) return col.id
  }
  return null
}

/* ── Component ── */

export function KanbanBoard({
  columns,
  onMoveTask,
  onToggleTask,
  onOpenDetail,
  onAddTask,
  labels,
  getSubTaskCount,
  getLabelsForTask,
  showColumnMenus = false,
  onRenameColumn,
  onDeleteColumn,
  onAddSectionLeft,
  onAddSectionRight,
  showAddSection = false,
  onAddSection,
}: KanbanBoardProps) {
  const prefersReduced = useReducedMotion()
  const [activeTask, setActiveTask] = useState<TaskRecord | null>(null)
  const [overColumnId, setOverColumnId] = useState<string | null>(null)

  /* ── Sensors ── */
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  })
  const keyboardSensor = useSensor(KeyboardSensor)
  const sensors = useSensors(pointerSensor, keyboardSensor)

  /* ── Column IDs for horizontal SortableContext ── */
  const columnIds = useMemo(
    () => columns.map((c) => `column-${c.id}`),
    [columns]
  )

  /* ── Drag lifecycle ── */

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current as
        | { type: string; task: TaskRecord; columnId: string }
        | undefined
      if (data?.type === 'task' && data.task) {
        setActiveTask(data.task)
      }
    },
    []
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event
      if (!over) {
        setOverColumnId(null)
        return
      }

      // Determine which column we're over
      const overId = String(over.id)
      if (overId.startsWith('column-')) {
        setOverColumnId(overId.replace('column-', ''))
      } else {
        // Hovering over another task — resolve its column
        const overData = over.data.current as
          | { type: string; columnId: string }
          | undefined
        if (overData?.columnId) {
          setOverColumnId(overData.columnId)
        }
      }
    },
    []
  )

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

      // Determine target column and order
      let targetColumnId: string
      let newOrder: number

      if (overId.startsWith('column-')) {
        // Dropped on a column droppable (empty area)
        targetColumnId = overId.replace('column-', '')
        const targetCol = columns.find((c) => c.id === targetColumnId)
        newOrder = targetCol ? targetCol.tasks.length : 0
      } else {
        // Dropped on/near another task
        const overData = over.data.current as
          | { type: string; task: TaskRecord; columnId: string }
          | undefined
        if (!overData?.columnId) return

        targetColumnId = overData.columnId
        const targetCol = columns.find((c) => c.id === targetColumnId)
        if (!targetCol) return

        const overIndex = targetCol.tasks.findIndex(
          (t) => t._id === String(over.id)
        )
        newOrder = overIndex >= 0 ? overIndex : targetCol.tasks.length
      }

      // Only persist if something changed
      const sourceColumnId = activeData.columnId
      const sourceCol = columns.find((c) => c.id === sourceColumnId)
      const sourceIndex = sourceCol?.tasks.findIndex(
        (t) => t._id === taskId
      ) ?? -1

      if (sourceColumnId === targetColumnId && sourceIndex === newOrder) return

      onMoveTask(taskId, targetColumnId, newOrder)
    },
    [columns, onMoveTask]
  )

  const handleDragCancel = useCallback(() => {
    setActiveTask(null)
    setOverColumnId(null)
  }, [])

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
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          padding: 16,
          height: '100%',
          alignItems: 'flex-start',
        }}
      >
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={col.tasks}
              completedTasks={col.completedTasks ?? []}
              onToggleTask={onToggleTask}
              onOpenDetail={onOpenDetail}
              onAddTask={onAddTask}
              labels={labels}
              getSubTaskCount={getSubTaskCount}
              getLabelsForTask={getLabelsForTask}
              showColumnMenu={showColumnMenus}
              onRenameColumn={onRenameColumn}
              onDeleteColumn={onDeleteColumn}
              onAddSectionLeft={onAddSectionLeft}
              onAddSectionRight={onAddSectionRight}
              isOver={overColumnId === col.id}
            />
          ))}
        </SortableContext>

        {/* "+ New section" button */}
        {showAddSection && onAddSection && (
          <button
            onClick={onAddSection}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text-muted)',
              background: 'transparent',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-lg, 16px)',
              cursor: 'pointer',
              minWidth: 200,
              justifyContent: 'center',
              height: 'fit-content',
              transition: cssTransition.fast,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
              e.currentTarget.style.borderColor = 'var(--text-muted)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            <Plus size={16} strokeWidth={2} />
            New section
          </button>
        )}
      </div>

      {/* ── Drag overlay ── */}
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div
            style={{
              opacity: 0.85,
              transform: prefersReduced ? 'none' : 'rotate(2deg)',
              filter: prefersReduced ? 'none' : 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))',
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

export default KanbanBoard
