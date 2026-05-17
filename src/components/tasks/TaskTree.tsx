'use client'
import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown } from 'lucide-react'
import AnimatedTaskCheckbox from './AnimatedTaskCheckbox'
import AnimatedTaskTitle from './AnimatedTaskTitle'
import SwipeableTaskRow from './SwipeableTaskRow'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { snappy, smooth } from '@/shared/design-system'
import { cn } from '@/lib/utils'

export interface TreeTask {
  _id: string
  title: string
  parentId: string | null
  depth: number
  path: string
  order: number
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  dueDate: string | null
  description: string
}

interface TaskTreeProps {
  tasks: TreeTask[]
  onTaskClick?: (task: TreeTask) => void
  onStatusChange?: (taskId: string, status: TreeTask['status']) => void
  onDelete?: (taskId: string) => void
}

interface TreeNode {
  task: TreeTask
  children: TreeNode[]
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'var(--priority-high)',
  medium: 'var(--priority-medium)',
  low: 'var(--priority-low)',
}

function buildTree(tasks: TreeTask[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  const roots: TreeNode[] = []

  // Sort by order
  const sorted = [...tasks].sort((a, b) => a.order - b.order)

  // Create nodes
  for (const task of sorted) {
    map.set(task._id, { task, children: [] })
  }

  // Build tree
  for (const task of sorted) {
    const node = map.get(task._id)!
    if (task.parentId && map.has(task.parentId)) {
      map.get(task.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

function TaskRow({
  node,
  depth,
  expanded,
  onToggleExpand,
  onTaskClick,
  onStatusChange,
  onDelete,
  onIndent,
  onOutdent,
  isMobile,
}: {
  node: TreeNode
  depth: number
  expanded: boolean
  onToggleExpand: () => void
  onTaskClick?: (task: TreeTask) => void
  onStatusChange?: (taskId: string, status: TreeTask['status']) => void
  onDelete?: (taskId: string) => void
  onIndent: (taskId: string) => void
  onOutdent: (taskId: string) => void
  isMobile: boolean
}) {
  const { task } = node
  const hasChildren = node.children.length > 0
  const isCompleted = task.status === 'done'

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      if (e.shiftKey) {
        onOutdent(task._id)
      } else {
        onIndent(task._id)
      }
    }
  }

  const handleToggleStatus = () => {
    const newStatus = isCompleted ? 'todo' : 'done'
    onStatusChange?.(task._id, newStatus)
  }

  const rowContent = (
    <div
      tabIndex={0}
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      onKeyDown={handleKeyDown}
      onClick={() => onTaskClick?.(task)}
      className={cn(
        'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors',
        'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1',
      )}
      style={{
        paddingLeft: `${depth * 20 + 12}px`,
        background: 'transparent',
        minHeight: 44,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleExpand() }}
            className="p-0.5 rounded hover:bg-[var(--surface-2)] transition-colors"
          >
            <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={snappy}>
              <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
            </motion.div>
          </button>
        )}
      </div>
      <AnimatedTaskCheckbox checked={isCompleted} onToggle={handleToggleStatus} color={PRIORITY_COLORS[task.priority] || 'var(--color-task)'} />
      <div className="flex-1 min-w-0">
        <AnimatedTaskTitle title={task.title} completed={isCompleted} className="text-sm" />
      </div>
      <div className="w-2 h-2 rounded-full flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: PRIORITY_COLORS[task.priority] }} title={`Priority: ${task.priority}`} />
      {task.dueDate && (
        <span className="text-xs flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-3)' }}>
          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
      )}
    </div>
  )

  return (
    <motion.div layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} transition={snappy} className="group">
      {isMobile ? (
        <SwipeableTaskRow onSwipeRight={handleToggleStatus} onSwipeLeft={onDelete ? () => onDelete(task._id) : undefined} disabled={isCompleted}>
          {rowContent}
        </SwipeableTaskRow>
      ) : rowContent}
    </motion.div>
  )
}

function TaskBranch({
  nodes, depth, expandedIds, onToggleExpand, onTaskClick, onStatusChange, onDelete, onIndent, onOutdent, isMobile,
}: {
  nodes: TreeNode[]; depth: number; expandedIds: Set<string>; onToggleExpand: (id: string) => void
  onTaskClick?: (task: TreeTask) => void; onStatusChange?: (taskId: string, status: TreeTask['status']) => void
  onDelete?: (taskId: string) => void; onIndent: (taskId: string) => void; onOutdent: (taskId: string) => void; isMobile: boolean
}) {
  return (
    <AnimatePresence initial={false}>
      {nodes.map((node) => {
        const expanded = expandedIds.has(node.task._id)
        return (
          <div key={node.task._id}>
            <TaskRow node={node} depth={depth} expanded={expanded} onToggleExpand={() => onToggleExpand(node.task._id)}
              onTaskClick={onTaskClick} onStatusChange={onStatusChange} onDelete={onDelete} onIndent={onIndent} onOutdent={onOutdent} isMobile={isMobile} />
            <AnimatePresence initial={false}>
              {expanded && node.children.length > 0 && (
                <motion.div key={`children-${node.task._id}`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={smooth} style={{ overflow: 'hidden' }}>
                  <TaskBranch nodes={node.children} depth={depth + 1} expandedIds={expandedIds} onToggleExpand={onToggleExpand}
                    onTaskClick={onTaskClick} onStatusChange={onStatusChange} onDelete={onDelete} onIndent={onIndent} onOutdent={onOutdent} isMobile={isMobile} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </AnimatePresence>
  )
}

export default function TaskTree({ tasks, onTaskClick, onStatusChange, onDelete }: TaskTreeProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Default: expand all parent tasks
    const parents = new Set<string>()
    for (const t of tasks) {
      if (t.parentId) parents.add(t.parentId)
    }
    return parents
  })

  const tree = useMemo(() => buildTree(tasks), [tasks])

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleIndent = useCallback(async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}/indent`, { method: 'PATCH' })
    } catch (e) {
      console.error('Failed to indent task', e)
    }
  }, [])

  const handleOutdent = useCallback(async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}/outdent`, { method: 'PATCH' })
    } catch (e) {
      console.error('Failed to outdent task', e)
    }
  }, [])

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>
          No tasks yet. Add something to begin.
        </p>
      </div>
    )
  }

  return (
    <div role="tree" className="py-2">
      <TaskBranch nodes={tree} depth={0} expandedIds={expandedIds} onToggleExpand={toggleExpand}
        onTaskClick={onTaskClick} onStatusChange={onStatusChange} onDelete={onDelete}
        onIndent={handleIndent} onOutdent={handleOutdent} isMobile={isMobile} />
    </div>
  )
}
