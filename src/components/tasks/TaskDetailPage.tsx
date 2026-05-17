'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { X, ArrowLeft, Plus, Calendar, Circle, CheckCircle2, Clock } from 'lucide-react'
import { smooth, slideFromRight, quickFade } from '@/shared/design-system'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import TaskTree, { type TreeTask } from './TaskTree'
import { format } from 'date-fns'

const RichEditor = dynamic(() => import('@/shared/editor/RichEditor'), { ssr: false })

// ─── Types ───────────────────────────────────────────────────────────────────

interface TaskDetailPageProps {
  taskId: string
  onClose: () => void
  onUpdate: (id: string, data: Partial<any>) => void
}

type SaveStatus = 'idle' | 'saving' | 'saved'
type Priority = 'none' | 'low' | 'medium' | 'high'
type Status = 'todo' | 'in-progress' | 'done'

const PRIORITY_ORDER: Priority[] = ['none', 'low', 'medium', 'high']
const STATUS_ORDER: Status[] = ['todo', 'in-progress', 'done']

const PRIORITY_COLORS: Record<Priority, string> = {
  none: 'var(--text-3)',
  low: '#3b82f6',
  medium: '#f59e0b',
  high: '#ef4444',
}

const STATUS_LABELS: Record<Status, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
}

const STATUS_COLORS: Record<Status, string> = {
  todo: 'var(--text-3)',
  'in-progress': 'var(--accent)',
  done: '#22c55e',
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TaskDetailPage({ taskId, onClose, onUpdate }: TaskDetailPageProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Task data
  const [task, setTask] = useState<any>(null)
  const [subtasks, setSubtasks] = useState<TreeTask[]>([])
  const [loading, setLoading] = useState(true)

  // Editable fields
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState<object | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  // Refs for debounce
  const saveTimeout = useRef<NodeJS.Timeout>()
  const panelRef = useRef<HTMLDivElement>(null)

  // ── Fetch task data ──────────────────────────────────────────────────────
  const fetchTask = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}`)
      if (res.ok) {
        const data = await res.json()
        setTask(data)
        setTitle(data.title || '')
        setNotes(data.notes || null)
      }
    } catch (e) {
      console.error('Failed to fetch task', e)
    } finally {
      setLoading(false)
    }
  }, [taskId])

  const fetchSubtasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks')
      if (res.ok) {
        const data = await res.json()
        const children: TreeTask[] = data
          .filter((t: any) => t.parentId === taskId)
          .map((t: any, idx: number) => ({
            _id: t._id as string,
            title: t.title as string,
            parentId: (t.parentId as string) || null,
            depth: (t.depth as number) ?? 0,
            path: (t.path as string) ?? '/',
            order: (t.order as number) ?? idx,
            status: (t.status as TreeTask['status']) ?? 'todo',
            priority: (t.priority as TreeTask['priority']) ?? 'medium',
            dueDate: (t.dueDate as string) || null,
            description: (t.description as string) ?? '',
          }))
        setSubtasks(children)
      }
    } catch (e) {
      console.error('Failed to fetch subtasks', e)
    }
  }, [taskId])

  useEffect(() => {
    fetchTask()
    fetchSubtasks()
  }, [fetchTask, fetchSubtasks])

  // ── Debounced save ───────────────────────────────────────────────────────
  function debouncedSave(field: string, value: any) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    setSaveStatus('saving')
    saveTimeout.current = setTimeout(() => {
      onUpdate(taskId, { [field]: value })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 1500)
    }, 500)
  }

  // ── Title save ───────────────────────────────────────────────────────────
  function handleTitleBlur() {
    const trimmed = title.trim()
    if (trimmed && trimmed !== task?.title) {
      onUpdate(taskId, { title: trimmed })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 1500)
    }
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      ;(e.target as HTMLElement).blur()
    }
  }

  // ── Notes save ───────────────────────────────────────────────────────────
  function handleNotesUpdate(json: object) {
    setNotes(json)
    debouncedSave('notes', json)
  }

  // ── Metadata changes ─────────────────────────────────────────────────────
  function cyclePriority() {
    if (!task) return
    const current = task.priority || 'none'
    const idx = PRIORITY_ORDER.indexOf(current as Priority)
    const next = PRIORITY_ORDER[(idx + 1) % PRIORITY_ORDER.length]
    setTask((prev: any) => ({ ...prev, priority: next }))
    onUpdate(taskId, { priority: next === 'none' ? undefined : next })
  }

  function cycleStatus() {
    if (!task) return
    const current = task.status || 'todo'
    const idx = STATUS_ORDER.indexOf(current as Status)
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length]
    setTask((prev: any) => ({ ...prev, status: next }))
    onUpdate(taskId, { status: next })
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    const iso = val ? new Date(val).toISOString() : undefined
    setTask((prev: any) => ({ ...prev, dueDate: iso }))
    onUpdate(taskId, { dueDate: iso })
  }

  // ── Add subtask ──────────────────────────────────────────────────────────
  async function addSubtask() {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New subtask',
          parentId: taskId,
          status: 'todo',
          priority: 'medium',
        }),
      })
      if (res.ok) {
        fetchSubtasks()
      }
    } catch (e) {
      console.error('Failed to add subtask', e)
    }
  }

  // ── Subtask status change ────────────────────────────────────────────────
  const handleSubtaskStatusChange = useCallback(async (subtaskId: string, status: TreeTask['status']) => {
    setSubtasks(prev => prev.map(t => t._id === subtaskId ? { ...t, status } : t))
    try {
      await fetch(`/api/tasks/${subtaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    } catch (e) {
      console.error('Failed to update subtask status', e)
      fetchSubtasks()
    }
  }, [fetchSubtasks])

  // ── Keyboard: Escape closes ──────────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // ── Click outside to close (desktop only) ────────────────────────────────
  useEffect(() => {
    if (isMobile) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Delay adding listener so the opening click doesn't immediately close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
    }, 100)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [isMobile, onClose])

  // ── Cleanup timeout on unmount ───────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
    }
  }, [])

  // ── Date helpers ─────────────────────────────────────────────────────────
  const formattedDate = useMemo(() => {
    if (!task?.dueDate) return 'No date'
    try {
      return format(new Date(task.dueDate), 'MMM d, yyyy')
    } catch {
      return 'No date'
    }
  }, [task?.dueDate])

  const dateInputValue = useMemo(() => {
    if (!task?.dueDate) return ''
    try {
      const d = new Date(task.dueDate)
      return d.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }, [task?.dueDate])

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PanelWrapper isMobile={isMobile} onClose={onClose} panelRef={panelRef}>
        <div className="flex items-center justify-center h-full">
          <div
            className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
        </div>
      </PanelWrapper>
    )
  }

  if (!task) {
    return (
      <PanelWrapper isMobile={isMobile} onClose={onClose} panelRef={panelRef}>
        <div className="flex items-center justify-center h-full">
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>Task not found</p>
        </div>
      </PanelWrapper>
    )
  }

  const priority = (task.priority || 'none') as Priority
  const status = (task.status || 'todo') as Status
  const tags: string[] = task.tags || []

  return (
    <PanelWrapper isMobile={isMobile} onClose={onClose} panelRef={panelRef}>
      {/* Close / back button */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          {isMobile ? (
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-2)' }}>
              <ArrowLeft size={18} />
            </button>
          ) : (
            <span className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>Task Detail</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Save status indicator */}
          <AnimatePresence>
            {saveStatus === 'saved' && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={quickFade}
                className="text-xs"
                style={{ color: '#22c55e' }}
              >
                Saved
              </motion.span>
            )}
            {saveStatus === 'saving' && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={quickFade}
                className="text-xs"
                style={{ color: 'var(--text-3)' }}
              >
                Saving...
              </motion.span>
            )}
          </AnimatePresence>
          {!isMobile && (
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-3)' }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Title */}
        <div className="px-5 pt-5 pb-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="w-full bg-transparent border-none outline-none font-bold"
            style={{
              fontSize: 24,
              lineHeight: 1.3,
              color: 'var(--text-1)',
            }}
            placeholder="Task title..."
          />
        </div>

        {/* Metadata row */}
        <div className="px-5 pb-4 flex flex-wrap items-center gap-2">
          {/* Due date pill */}
          <label
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
          >
            <Calendar size={12} />
            <span>{formattedDate}</span>
            <input
              type="date"
              value={dateInputValue}
              onChange={handleDateChange}
              className="absolute opacity-0 w-0 h-0"
              style={{ pointerEvents: 'none' }}
            />
          </label>

          {/* Priority dot + label */}
          <button
            onClick={cyclePriority}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
            title="Click to cycle priority"
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: PRIORITY_COLORS[priority] }}
            />
            {priority === 'none' ? 'No priority' : priority.charAt(0).toUpperCase() + priority.slice(1)}
          </button>

          {/* Status badge */}
          <button
            onClick={cycleStatus}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: STATUS_COLORS[status] }}
            title="Click to cycle status"
          >
            {status === 'done' ? <CheckCircle2 size={12} /> : status === 'in-progress' ? <Clock size={12} /> : <Circle size={12} />}
            {STATUS_LABELS[status]}
          </button>

          {/* Tag chips */}
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Rich text editor */}
        <div className="px-5 pb-5">
          <RichEditor
            content={notes}
            onUpdate={handleNotesUpdate}
            placeholder="Add notes, checklists, or details..."
            autofocus={false}
            editable={true}
            className=""
          />
        </div>

        {/* Subtasks section */}
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
              Subtasks
            </h3>
            <button
              onClick={addSubtask}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
            >
              <Plus size={12} />
              Add
            </button>
          </div>
          {subtasks.length > 0 ? (
            <TaskTree
              tasks={subtasks}
              onStatusChange={handleSubtaskStatusChange}
            />
          ) : (
            <p className="text-xs py-4 text-center" style={{ color: 'var(--text-3)' }}>
              No subtasks yet
            </p>
          )}
        </div>
      </div>
    </PanelWrapper>
  )
}

// ─── Panel Wrapper ─────────────────────────────────────────────────────────────
// Handles desktop vs mobile layout + animation

function PanelWrapper({
  isMobile,
  onClose,
  panelRef,
  children,
}: {
  isMobile: boolean
  onClose: () => void
  panelRef: React.RefObject<HTMLDivElement | null>
  children: React.ReactNode
}) {
  if (isMobile) {
    return (
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={smooth}
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: 'var(--bg)' }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={panelRef as React.RefObject<HTMLDivElement>}
      variants={slideFromRight}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={smooth}
      className="flex flex-col h-full overflow-hidden"
      style={{
        width: '60%',
        minWidth: 400,
        maxWidth: 700,
        background: 'var(--bg)',
        borderLeft: '1px solid var(--border)',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
      }}
    >
      {children}
    </motion.div>
  )
}
