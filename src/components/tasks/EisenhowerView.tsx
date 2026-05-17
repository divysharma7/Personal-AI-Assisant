'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Calendar as CalIcon, ChevronRight, Inbox } from 'lucide-react'
import AnimatedTaskCheckbox from './AnimatedTaskCheckbox'
import AnimatedTaskTitle from './AnimatedTaskTitle'
import { snappy, smooth } from '@/shared/design-system'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import type { TreeTask } from './TaskTree'

// ─── Types ──────────────────────────────────────────────────────

type QuadrantId = 1 | 2 | 3 | 4

interface EisenhowerViewProps {
  tasks: TreeTask[]
  onStatusChange?: (taskId: string, status: TreeTask['status']) => void
  onTaskClick?: (task: TreeTask) => void
  onTaskUpdate?: (taskId: string, data: Partial<TreeTask>) => void
}

// ─── Quadrant Config ────────────────────────────────────────────

const QUADRANTS: {
  id: QuadrantId
  label: string
  subtitle: string
  color: string
  bgOpacity: string
}[] = [
  { id: 1, label: 'DO FIRST', subtitle: 'Urgent + Important', color: '#EF4444', bgOpacity: '1a' },
  { id: 2, label: 'SCHEDULE', subtitle: 'Important + Not Urgent', color: '#10B981', bgOpacity: '1a' },
  { id: 3, label: 'DELEGATE', subtitle: 'Urgent + Not Important', color: '#F59E0B', bgOpacity: '1a' },
  { id: 4, label: 'ELIMINATE', subtitle: 'Neither', color: 'var(--text-3)', bgOpacity: '0d' },
]

// ─── Classification Logic ───────────────────────────────────────

function isWithin24Hours(dueDate: string): boolean {
  const due = new Date(dueDate)
  const now = new Date()
  const diff = due.getTime() - now.getTime()
  // Overdue (diff < 0) or within 24 hours
  return diff < 24 * 60 * 60 * 1000
}

function classifyTask(task: TreeTask): QuadrantId {
  const isUrgent = !!(task.dueDate && isWithin24Hours(task.dueDate))
  const isHigh = task.priority === 'high'
  const isMedium = task.priority === 'medium'

  if (isHigh && isUrgent) return 1    // Do First
  if (isHigh && !isUrgent) return 2   // Schedule
  if (isMedium && !isUrgent) return 2 // Medium importance → Schedule
  if (isMedium && isUrgent) return 3  // Medium + urgent → Delegate
  if (!isHigh && !isMedium && isUrgent) return 3 // Low + urgent → Delegate
  return 4                             // Eliminate
}

// ─── Sortable Task Card ─────────────────────────────────────────

function SortableMatrixCard({
  task,
  onStatusChange,
  onTaskClick,
}: {
  task: TreeTask
  onStatusChange?: (taskId: string, status: TreeTask['status']) => void
  onTaskClick?: (task: TreeTask) => void
}) {
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
      <MatrixTaskCard
        task={task}
        isDragOverlay={false}
        onStatusChange={onStatusChange}
        onTaskClick={onTaskClick}
      />
    </div>
  )
}

// ─── Task Card ──────────────────────────────────────────────────

function MatrixTaskCard({
  task,
  isDragOverlay,
  onStatusChange,
  onTaskClick,
}: {
  task: TreeTask
  isDragOverlay: boolean
  onStatusChange?: (taskId: string, status: TreeTask['status']) => void
  onTaskClick?: (task: TreeTask) => void
}) {
  const isCompleted = task.status === 'done'

  const priorityColors: Record<string, string> = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: 'var(--text-3)',
  }

  return (
    <motion.div
      layout={!isDragOverlay}
      className="rounded-xl px-3 py-2.5 cursor-grab active:cursor-grabbing select-none"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: isDragOverlay
          ? '0 10px 30px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.1)'
          : '0 1px 3px rgba(0,0,0,0.04)',
        transform: isDragOverlay ? 'scale(1.03)' : undefined,
      }}
      whileHover={isDragOverlay ? undefined : { scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
      transition={snappy}
      onClick={() => onTaskClick?.(task)}
    >
      <div className="flex items-start gap-2">
        {/* Checkbox */}
        <div className="pt-0.5">
          <AnimatedTaskCheckbox
            checked={isCompleted}
            onToggle={() => {
              const newStatus = isCompleted ? 'todo' : 'done'
              onStatusChange?.(task._id, newStatus)
            }}
            size={16}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatedTaskTitle
            title={task.title}
            completed={isCompleted}
            className="text-sm font-medium leading-snug block truncate"
          />

          {/* Bottom row: priority dot + due date */}
          <div className="flex items-center gap-2 mt-1.5">
            {/* Priority dot */}
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: priorityColors[task.priority] }}
              title={`Priority: ${task.priority}`}
            />

            {task.dueDate && (
              <span
                className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md"
                style={{
                  color: 'var(--text-3)',
                  background: 'var(--surface-1, rgba(0,0,0,0.03))',
                }}
              >
                <CalIcon size={10} />
                {new Date(task.dueDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Droppable Quadrant ─────────────────────────────────────────

function Quadrant({
  quadrant,
  tasks,
  onStatusChange,
  onTaskClick,
  collapsed,
  onToggleCollapse,
  isMobile,
}: {
  quadrant: (typeof QUADRANTS)[number]
  tasks: TreeTask[]
  onStatusChange?: (taskId: string, status: TreeTask['status']) => void
  onTaskClick?: (task: TreeTask) => void
  collapsed: boolean
  onToggleCollapse: () => void
  isMobile: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `quadrant-${quadrant.id}` })

  // Compute background color with opacity
  const bgColor = quadrant.color.startsWith('#')
    ? `${quadrant.color}${quadrant.bgOpacity}`
    : `color-mix(in srgb, ${quadrant.color} 5%, transparent)`

  const borderColor = quadrant.color.startsWith('#')
    ? `${quadrant.color}40`
    : quadrant.color

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        minHeight: isMobile ? undefined : '280px',
      }}
    >
      {/* Header */}
      <button
        className="flex items-center justify-between px-4 py-3 w-full text-left"
        style={{ borderBottom: `1px solid ${borderColor}` }}
        onClick={isMobile ? onToggleCollapse : undefined}
        type="button"
      >
        <div className="flex items-center gap-2">
          {isMobile && (
            <motion.span
              animate={{ rotate: collapsed ? 0 : 90 }}
              transition={snappy}
              style={{ color: quadrant.color }}
            >
              <ChevronRight size={14} />
            </motion.span>
          )}
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: quadrant.color }}
          >
            Q{quadrant.id}: {quadrant.label}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>
            {quadrant.subtitle}
          </span>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-md"
          style={{
            background: quadrant.color.startsWith('#')
              ? `${quadrant.color}20`
              : 'var(--surface-1)',
            color: quadrant.color,
          }}
        >
          {tasks.length}
        </span>
      </button>

      {/* Body — scrollable cards */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={isMobile ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={isMobile ? { height: 0, opacity: 0 } : undefined}
            transition={smooth}
            className="overflow-hidden"
          >
            <div
              ref={setNodeRef}
              className="flex flex-col gap-2 p-3 overflow-y-auto"
              style={{
                maxHeight: isMobile ? '300px' : '400px',
                minHeight: '80px',
                background: isOver ? `${quadrant.color}15` : undefined,
                border: isOver ? `2px dashed ${quadrant.color}` : '2px dashed transparent',
                borderRadius: '12px',
                margin: '4px',
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
                {tasks.map((task) => (
                  <SortableMatrixCard
                    key={task._id}
                    task={task}
                    onStatusChange={onStatusChange}
                    onTaskClick={onTaskClick}
                  />
                ))}
              </SortableContext>

              {/* Empty state */}
              {tasks.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-6 gap-2">
                  <Inbox size={20} style={{ color: 'var(--text-3)', opacity: 0.5 }} />
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                    No tasks here
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main EisenhowerView ────────────────────────────────────────

export default function EisenhowerView({
  tasks,
  onStatusChange,
  onTaskClick,
  onTaskUpdate,
}: EisenhowerViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [collapsedQuadrants, setCollapsedQuadrants] = useState<Set<QuadrantId>>(new Set())
  const isMobile = useMediaQuery('(max-width: 768px)')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // Filter out completed tasks and classify into quadrants
  const quadrantTasks = useMemo(() => {
    const grouped: Record<QuadrantId, TreeTask[]> = { 1: [], 2: [], 3: [], 4: [] }
    for (const task of tasks) {
      if (task.status === 'done') continue
      const q = classifyTask(task)
      grouped[q].push(task)
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

    // Determine which quadrant it was dropped on
    let targetQuadrant: QuadrantId | null = null

    const overId = over.id as string
    if (overId.startsWith('quadrant-')) {
      targetQuadrant = parseInt(overId.replace('quadrant-', '')) as QuadrantId
    } else {
      // Dropped on another task — find which quadrant that task is in
      const overTask = tasks.find((t) => t._id === overId)
      if (overTask && overTask.status !== 'done') {
        targetQuadrant = classifyTask(overTask)
      }
    }

    if (!targetQuadrant) return

    // Check if task is already in that quadrant
    const currentQuadrant = classifyTask(task)
    if (targetQuadrant === currentQuadrant) return

    // Apply reclassification rules
    const updates: Partial<TreeTask> = {}

    switch (targetQuadrant) {
      case 1: // Do First: high priority + urgent
        updates.priority = 'high'
        if (!task.dueDate) {
          updates.dueDate = new Date().toISOString()
        }
        break
      case 2: // Schedule: high priority, not urgent
        updates.priority = 'high'
        // Leave dueDate as-is (or if it was making it urgent, clear to tomorrow)
        if (task.dueDate && isWithin24Hours(task.dueDate)) {
          // Move due date to 48 hours from now to make it not urgent
          const future = new Date()
          future.setDate(future.getDate() + 2)
          updates.dueDate = future.toISOString()
        }
        break
      case 3: // Delegate: medium priority + urgent
        updates.priority = 'medium'
        if (!task.dueDate) {
          updates.dueDate = new Date().toISOString()
        }
        break
      case 4: // Eliminate: low priority, no due date
        updates.priority = 'low'
        updates.dueDate = null
        break
    }

    // Call the update handler
    if (onTaskUpdate) {
      onTaskUpdate(taskId, updates)
    }
  }

  function toggleCollapse(quadrantId: QuadrantId) {
    setCollapsedQuadrants((prev) => {
      const next = new Set(prev)
      if (next.has(quadrantId)) {
        next.delete(quadrantId)
      } else {
        next.add(quadrantId)
      }
      return next
    })
  }

  return (
    <div className="h-full overflow-auto p-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className={
            isMobile
              ? 'flex flex-col gap-4'
              : 'grid grid-cols-2 grid-rows-2 gap-4 h-full'
          }
        >
          {QUADRANTS.map((q) => (
            <Quadrant
              key={q.id}
              quadrant={q}
              tasks={quadrantTasks[q.id]}
              onStatusChange={onStatusChange}
              onTaskClick={onTaskClick}
              collapsed={isMobile ? collapsedQuadrants.has(q.id) : false}
              onToggleCollapse={() => toggleCollapse(q.id)}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Drag overlay — floating card */}
        <DragOverlay>
          {activeTask ? (
            <MatrixTaskCard
              task={activeTask}
              isDragOverlay={true}
              onStatusChange={onStatusChange}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
