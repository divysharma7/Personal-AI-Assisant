'use client'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { Calendar as CalIcon } from 'lucide-react'
import { snappy } from '@/shared/design-system'
import type { TreeTask } from './TaskTree'

interface KanbanViewProps {
  tasks: TreeTask[]
  onStatusChange?: (taskId: string, status: TreeTask['status']) => void
  onTaskClick?: (task: TreeTask) => void
}

type ColumnId = 'todo' | 'in-progress' | 'done'

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
]

const PRIORITY_COLORS: Record<string, string> = {
  high: 'var(--priority-high)',
  medium: 'var(--priority-medium)',
  low: 'var(--priority-low)',
}

// ─── Sortable Task Card ─────────────────────────────────────────

function SortableTaskCard({ task, onTaskClick }: { task: TreeTask; onTaskClick?: (task: TreeTask) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} isDragOverlay={false} onTaskClick={onTaskClick} />
    </div>
  )
}

// ─── Task Card (used both inline and as overlay) ─────────────────

function TaskCard({
  task,
  isDragOverlay,
  onTaskClick,
}: {
  task: TreeTask
  isDragOverlay: boolean
  onTaskClick?: (task: TreeTask) => void
}) {
  const isCompleted = task.status === 'done'

  return (
    <motion.div
      layout={!isDragOverlay}
      className="rounded-xl px-3.5 py-3 cursor-grab active:cursor-grabbing select-none"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: isDragOverlay
          ? '0 10px 30px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.1)'
          : '0 1px 3px rgba(0,0,0,0.04)',
        transform: isDragOverlay ? 'scale(1.03)' : undefined,
      }}
      whileHover={isDragOverlay ? undefined : { y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
      transition={snappy}
      onClick={() => onTaskClick?.(task)}
    >
      {/* Title */}
      <p
        className="text-sm font-medium leading-snug"
        style={{
          color: isCompleted ? 'var(--text-3)' : 'var(--text-1)',
          textDecoration: isCompleted ? 'line-through' : undefined,
        }}
      >
        {task.title}
      </p>

      {/* Bottom row: priority + due date */}
      <div className="flex items-center gap-2 mt-2">
        {/* Priority dot */}
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: PRIORITY_COLORS[task.priority] }}
          title={`Priority: ${task.priority}`}
        />

        {task.dueDate && (
          <span
            className="flex items-center gap-1 text-xs"
            style={{ color: 'var(--text-3)' }}
          >
            <CalIcon size={10} />
            {new Date(task.dueDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
      </div>
    </motion.div>
  )
}

// ─── Droppable Column ────────────────────────────────────────────

function KanbanColumn({
  column,
  tasks,
  onTaskClick,
}: {
  column: { id: ColumnId; title: string }
  tasks: TreeTask[]
  onTaskClick?: (task: TreeTask) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className="flex flex-col w-[85vw] md:w-auto min-w-[280px] flex-1 snap-center md:snap-align-none flex-shrink-0 md:flex-shrink">
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
          {column.title}
        </h3>
        <span
          className="text-xs font-medium px-1.5 py-0.5 rounded-md"
          style={{ background: 'var(--surface-1)', color: 'var(--text-3)' }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Cards area */}
      <div
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-2 px-2 py-2 rounded-xl transition-colors min-h-[200px]"
        style={{
          background: isOver ? 'var(--accent-soft)' : 'var(--surface-1)',
          border: isOver ? '2px dashed var(--accent)' : '2px dashed transparent',
        }}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task._id} task={task} onTaskClick={onTaskClick} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>
              Drop tasks here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main KanbanView ─────────────────────────────────────────────

export default function KanbanView({ tasks, onStatusChange, onTaskClick }: KanbanViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const columns = useMemo(() => {
    const grouped: Record<ColumnId, TreeTask[]> = {
      'todo': [],
      'in-progress': [],
      'done': [],
    }
    for (const task of tasks) {
      const col = task.status as ColumnId
      if (grouped[col]) {
        grouped[col].push(task)
      } else {
        grouped['todo'].push(task)
      }
    }
    return grouped
  }, [tasks])

  const activeTask = useMemo(
    () => (activeId ? tasks.find((t) => t._id === activeId) : null),
    [activeId, tasks]
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const task = tasks.find((t) => t._id === taskId)
    if (!task) return

    // Determine which column it was dropped on
    let targetColumn: ColumnId | null = null

    // Check if dropped on a column directly
    if (COLUMNS.some((c) => c.id === over.id)) {
      targetColumn = over.id as ColumnId
    } else {
      // Dropped on another task — find which column that task is in
      const overTask = tasks.find((t) => t._id === over.id)
      if (overTask) {
        targetColumn = overTask.status as ColumnId
      }
    }

    if (targetColumn && targetColumn !== task.status) {
      onStatusChange?.(taskId, targetColumn)
      // Also call the API
      fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetColumn }),
      }).catch((e) => console.error('Failed to update task status', e))
    }
  }

  return (
    <div className="h-full overflow-x-auto p-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full min-w-max md:min-w-0 snap-x snap-mandatory md:snap-none overflow-x-auto md:overflow-x-visible">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={columns[col.id]}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>

        {/* Drag overlay — floating card */}
        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} isDragOverlay={true} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
