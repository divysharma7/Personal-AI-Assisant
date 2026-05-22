'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ChevronDown, ChevronRight, Plus, MoreHorizontal } from 'lucide-react'
import { SortableTaskCard } from './SortableTaskCard'
import KanbanColumnMenu from './KanbanColumnMenu'
import { cssTransition } from '@/lib/motion'
import { useSettingsStore } from '@/stores/settingsStore'
import type { TaskRecord } from '@/hooks/useTasks'

const KANBAN_SIZE_MAP = {
  small: { minWidth: 220, maxWidth: 260 },
  medium: { minWidth: 280, maxWidth: 320 },
  large: { minWidth: 340, maxWidth: 400 },
} as const

interface KanbanColumnProps {
  id: string
  title: string
  tasks: TaskRecord[]
  completedTasks?: TaskRecord[]
  onToggleTask: (id: string) => void
  onOpenDetail: (id: string) => void
  onAddTask: (columnId: string) => void
  labels: { _id: string; name: string; color?: string }[]
  getSubTaskCount: (id: string) => { completed: number; total: number } | undefined
  getLabelsForTask: (task: TaskRecord) => { _id: string; name: string; color?: string }[]
  showColumnMenu?: boolean
  onRenameColumn?: (id: string) => void
  onDeleteColumn?: (id: string) => void
  onAddSectionLeft?: (id: string) => void
  onAddSectionRight?: (id: string) => void
  isOver?: boolean
  wipLimit?: number | null
  onSetWipLimit?: (id: string, limit: number | null) => void
}

export default function KanbanColumn({
  id,
  title,
  tasks,
  completedTasks = [],
  onToggleTask,
  onOpenDetail,
  onAddTask,
  labels,
  getSubTaskCount,
  getLabelsForTask,
  showColumnMenu = false,
  onRenameColumn,
  onDeleteColumn,
  onAddSectionLeft,
  onAddSectionRight,
  isOver = false,
  wipLimit,
  onSetWipLimit,
}: KanbanColumnProps) {
  const [showCompleted, setShowCompleted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const kanbanSize = useSettingsStore((s) => s.kanbanSize)
  const showKanbanInputBox = useSettingsStore((s) => s.showKanbanInputBox)
  const sizeConfig = KANBAN_SIZE_MAP[kanbanSize]

  const { setNodeRef } = useDroppable({
    id: `column-${id}`,
    data: { type: 'column', columnId: id },
  })

  const taskIds = tasks.map((t) => t._id)
  const totalCount = tasks.length + completedTasks.length
  const isOverWipLimit = wipLimit != null && wipLimit > 0 && tasks.length >= wipLimit

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: sizeConfig.minWidth,
        maxWidth: sizeConfig.maxWidth,
        height: '100%',
        flexShrink: 0,
        borderRadius: 'var(--radius-lg, 16px)',
        backgroundColor: isOver
          ? 'var(--bg-hover, rgba(255,255,255,0.04))'
          : 'var(--bg-pane, transparent)',
        border: isOver
          ? '1px solid var(--accent, #6366f1)'
          : '1px solid transparent',
        transition: cssTransition.fast,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 12px 8px',
          position: 'relative',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-muted)',
            flex: 1,
          }}
        >
          {title}
        </span>

        {/* Count badge */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: isOverWipLimit ? '#ef4444' : 'var(--text-muted)',
            backgroundColor: isOverWipLimit
              ? 'rgba(239,68,68,0.12)'
              : 'var(--overlay-1, rgba(255,255,255,0.06))',
            borderRadius: 999,
            padding: '2px 7px',
            minWidth: 20,
            textAlign: 'center',
          }}
          title={isOverWipLimit ? `WIP limit: ${wipLimit}` : undefined}
        >
          {totalCount}
        </span>

        {/* Add button */}
        <button
          onClick={() => onAddTask(id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: 6,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: cssTransition.fast,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
          aria-label={`Add task to ${title}`}
        >
          <Plus size={16} strokeWidth={2} />
        </button>

        {/* Menu trigger */}
        {showColumnMenu && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                borderRadius: 6,
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: cssTransition.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              aria-label={`${title} column options`}
            >
              <MoreHorizontal size={16} strokeWidth={2} />
            </button>

            <KanbanColumnMenu
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              onRename={() => onRenameColumn?.(id)}
              onAddSectionLeft={() => onAddSectionLeft?.(id)}
              onAddSectionRight={() => onAddSectionRight?.(id)}
              onDelete={() => onDeleteColumn?.(id)}
              wipLimit={wipLimit}
              onSetWipLimit={(limit) => onSetWipLimit?.(id, limit)}
            />
          </div>
        )}
      </div>

      {/* ── Body: sortable task list ── */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 8px',
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

        {/* Empty column drop target hint */}
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
            Drop tasks here
          </div>
        )}
      </div>

      {/* ── Completed section (collapsible) ── */}
      {completedTasks.length > 0 && (
        <div style={{ padding: '4px 8px 8px' }}>
          <button
            onClick={() => setShowCompleted((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              width: '100%',
              padding: '6px 4px',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {showCompleted ? (
              <ChevronDown size={14} strokeWidth={2} />
            ) : (
              <ChevronRight size={14} strokeWidth={2} />
            )}
            Completed ({completedTasks.length})
          </button>

          {showCompleted && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                opacity: 0.55,
              }}
            >
              {completedTasks.map((task) => (
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
            </div>
          )}
        </div>
      )}

      {/* ── Footer: add task button ── */}
      {showKanbanInputBox && (
        <div style={{ padding: '4px 8px 12px' }}>
          <button
            onClick={() => onAddTask(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              width: '100%',
              padding: '8px 8px',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text-muted)',
              background: 'transparent',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              transition: cssTransition.fast,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Plus size={14} strokeWidth={2} />
            Add task
          </button>
        </div>
      )}
    </div>
  )
}
