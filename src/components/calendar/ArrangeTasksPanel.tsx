'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Filter, ChevronDown, ChevronRight, Search, Calendar, XCircle } from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import type { TaskRecord } from '@/hooks/useTasks'
import { collapse, ease, buttonPress } from '@/lib/motion'

type Tab = 'lists' | 'tags' | 'priority'
type FilterMode = 'all' | 'high' | 'overdue'

interface ArrangeTasksPanelProps {
  open: boolean
  onClose: () => void
  onScheduleTask?: (taskId: string) => void
}

const PRIORITY_ORDER = ['high', 'medium', 'low'] as const
const PRIORITY_LABELS: Record<string, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}
const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6b66da',
}

interface TaskGroup {
  key: string
  label: string
  color: string
  tasks: TaskRecord[]
}

function groupByList(tasks: TaskRecord[]): TaskGroup[] {
  const map = new Map<string, TaskRecord[]>()
  for (const t of tasks) {
    const key = t.listId || 'inbox'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(t)
  }
  return Array.from(map.entries()).map(([key, items]) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    color: '#5DA8FF',
    tasks: items,
  }))
}

function groupByPriority(tasks: TaskRecord[]): TaskGroup[] {
  const map = new Map<string, TaskRecord[]>()
  for (const p of PRIORITY_ORDER) map.set(p, [])
  map.set('none', [])
  for (const t of tasks) {
    const key = PRIORITY_ORDER.includes(t.priority as typeof PRIORITY_ORDER[number])
      ? t.priority
      : 'none'
    map.get(key)!.push(t)
  }
  return Array.from(map.entries())
    .filter(([, items]) => items.length > 0)
    .map(([key, items]) => ({
      key,
      label: PRIORITY_LABELS[key] || 'No Priority',
      color: PRIORITY_COLORS[key] || '#6b7280',
      tasks: items,
    }))
}

function groupByTags(tasks: TaskRecord[]): TaskGroup[] {
  const map = new Map<string, TaskRecord[]>()
  for (const t of tasks) {
    const labels = t.labelIds && t.labelIds.length > 0 ? t.labelIds : ['untagged']
    for (const label of labels) {
      if (!map.has(label)) map.set(label, [])
      map.get(label)!.push(t)
    }
  }
  return Array.from(map.entries()).map(([key, items]) => ({
    key,
    label: key === 'untagged' ? 'Untagged' : key.charAt(0).toUpperCase() + key.slice(1),
    color: '#8b5cf6',
    tasks: items,
  }))
}

function CollapsibleGroup({
  group,
  onSchedule,
  onUnschedule,
}: {
  group: TaskGroup
  onSchedule?: (taskId: string) => void
  onUnschedule?: (taskId: string) => void
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="mb-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer"
        style={{ color: 'var(--text-secondary)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        {expanded ? (
          <ChevronDown size={12} strokeWidth={2} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
        ) : (
          <ChevronRight size={12} strokeWidth={2} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
        )}
        <span className="text-[11px] font-semibold uppercase tracking-wider truncate flex-1 text-left">
          {group.label}
        </span>
        <span
          className="text-[10px] font-medium flex-shrink-0"
          style={{ color: 'var(--text-faint)' }}
        >
          {group.tasks.length}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            {...collapse}
            transition={ease.fast}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1 px-2 pb-1.5 pt-0.5">
              {group.tasks.map((task) => (
                <TaskChip
                  key={task._id}
                  task={task}
                  groupColor={group.color}
                  onSchedule={onSchedule}
                  onUnschedule={onUnschedule}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TaskChip({
  task,
  groupColor,
  onSchedule,
  onUnschedule,
}: {
  task: TaskRecord
  groupColor: string
  onSchedule?: (taskId: string) => void
  onUnschedule?: (taskId: string) => void
}) {
  const chipColor = PRIORITY_COLORS[task.priority] || groupColor
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="flex items-center gap-1 rounded-md px-2 py-1 max-w-full cursor-grab"
      style={{
        backgroundColor: `${chipColor}18`,
        border: `1px solid ${chipColor}30`,
        position: 'relative',
      }}
      title={task.title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: chipColor }}
      />
      <span
        className="text-[11px] font-medium truncate"
        style={{ color: 'var(--text-primary)', maxWidth: 160, flex: 1 }}
      >
        {task.title}
      </span>
      {hovered && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          {task.scheduledStart ? (
            <button
              onClick={(e) => { e.stopPropagation(); onUnschedule?.(task._id) }}
              title="Unschedule"
              style={{
                width: 18, height: 18, borderRadius: 4, border: 'none',
                backgroundColor: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-faint)',
              }}
            >
              <XCircle size={12} strokeWidth={1.5} />
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onSchedule?.(task._id) }}
              title="Schedule"
              style={{
                width: 18, height: 18, borderRadius: 4, border: 'none',
                backgroundColor: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-faint)',
              }}
            >
              <Calendar size={12} strokeWidth={1.5} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'lists', label: 'Lists' },
  { key: 'tags', label: 'Tags' },
  { key: 'priority', label: 'Priority' },
]

const FILTER_OPTIONS: { key: FilterMode; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'high', label: 'High Priority' },
  { key: 'overdue', label: 'Overdue' },
]

export default function ArrangeTasksPanel({ open, onClose, onScheduleTask }: ArrangeTasksPanelProps) {
  const { tasks, updateTask } = useTasks()
  const [activeTab, setActiveTab] = useState<Tab>('lists')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [search, setSearch] = useState('')

  const unscheduledTasks = useMemo(
    () => tasks.filter((t) => !t.scheduledStart && t.status !== 'done' && t.status !== 'dropped'),
    [tasks]
  )

  // Apply filter + search
  const filteredTasks = useMemo(() => {
    let result = unscheduledTasks

    if (filterMode === 'high') {
      result = result.filter(t => t.priority === 'high')
    } else if (filterMode === 'overdue') {
      const now = new Date()
      result = result.filter(t => t.dueDate && new Date(t.dueDate) < now)
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(t => t.title.toLowerCase().includes(q))
    }

    return result
  }, [unscheduledTasks, filterMode, search])

  const groups = useMemo(() => {
    switch (activeTab) {
      case 'lists':
        return groupByList(filteredTasks)
      case 'priority':
        return groupByPriority(filteredTasks)
      case 'tags':
        return groupByTags(filteredTasks)
    }
  }, [activeTab, filteredTasks])

  const handleSchedule = useCallback((taskId: string) => {
    if (onScheduleTask) {
      onScheduleTask(taskId)
    } else {
      // Default: schedule for today at 9am
      const start = new Date()
      start.setHours(9, 0, 0, 0)
      const end = new Date(start)
      end.setHours(10, 0, 0, 0)
      updateTask(taskId, {
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString(),
        dueDate: start.toISOString(),
      })
    }
  }, [onScheduleTask, updateTask])

  const handleUnschedule = useCallback((taskId: string) => {
    updateTask(taskId, {
      scheduledStart: null,
      scheduledEnd: null,
    })
  }, [updateTask])

  if (!open) return null

  return (
    <div
      className="flex flex-col flex-shrink-0"
      style={{
        width: 260,
        borderLeft: '1px solid var(--border)',
        backgroundColor: 'var(--bg-pane)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span
          className="text-[13px] font-bold"
          style={{ color: 'var(--text-primary)', fontSize: 16 }}
        >
          Arrange tasks
        </span>
        <div className="flex items-center gap-1">
          <motion.button
            {...buttonPress}
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-md cursor-pointer"
            style={{ color: 'var(--text-faint)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            aria-label="Close arrange panel"
          >
            <X size={14} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>

      {/* Filter pills */}
      <div
        className="flex items-center gap-1 px-3 py-2"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilterMode(opt.key)}
            className="rounded-full px-2.5 py-1 text-[10px] font-semibold cursor-pointer"
            style={{
              color: filterMode === opt.key ? '#fff' : 'var(--text-secondary)',
              backgroundColor: filterMode === opt.key
                ? 'var(--accent, #5DA8FF)'
                : 'var(--overlay-2, var(--bg-pane-2))',
              border: 'none',
              transition: 'all 150ms ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (filterMode !== opt.key) {
                e.currentTarget.style.backgroundColor = 'var(--overlay-3, var(--bg-hover))'
              }
            }}
            onMouseLeave={(e) => {
              if (filterMode !== opt.key) {
                e.currentTarget.style.backgroundColor = 'var(--overlay-2, var(--bg-pane-2))'
              }
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={12}
            strokeWidth={1.5}
            style={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-faint)',
              pointerEvents: 'none',
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            style={{
              width: '100%',
              height: 28,
              paddingLeft: 26,
              paddingRight: 8,
              fontSize: 11,
              borderRadius: 6,
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-1 px-3 py-2"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold cursor-pointer transition-sl"
            style={{
              color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
              backgroundColor: activeTab === tab.key
                ? 'var(--accent, #5DA8FF)'
                : 'var(--overlay-2, var(--bg-pane-2))',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.backgroundColor = 'var(--overlay-3, var(--bg-hover))'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.backgroundColor = 'var(--overlay-2, var(--bg-pane-2))'
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto px-1 py-2">
        {unscheduledTasks.length === 0 ? (
          <p
            className="text-xs text-center py-8"
            style={{ color: 'var(--text-faint)' }}
          >
            No unscheduled tasks
          </p>
        ) : filteredTasks.length === 0 ? (
          <p
            className="text-xs text-center py-8"
            style={{ color: 'var(--text-faint)' }}
          >
            {search.trim() ? 'No tasks match your search' : 'No tasks match your filter'}
          </p>
        ) : groups.length === 0 ? (
          <p
            className="text-xs text-center py-8"
            style={{ color: 'var(--text-faint)' }}
          >
            No tasks in this category
          </p>
        ) : (
          groups.map((group) => (
            <CollapsibleGroup
              key={group.key}
              group={group}
              onSchedule={handleSchedule}
              onUnschedule={handleUnschedule}
            />
          ))
        )}
      </div>

      {/* Footer count */}
      <div
        className="px-3 py-2 text-center"
        style={{
          borderTop: '1px solid var(--border)',
          color: 'var(--text-faint)',
        }}
      >
        <span className="text-[10px] font-medium">
          {filteredTasks.length} of {unscheduledTasks.length} unscheduled task{unscheduledTasks.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
