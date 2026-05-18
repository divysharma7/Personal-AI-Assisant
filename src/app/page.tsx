'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SlidersHorizontal,
  MoreVertical,
  BookOpen,
  X,
  Plus,
  Calendar,
  BarChart3,
  Tag,
  ChevronDown,
  ChevronRight,
  Clock,
} from 'lucide-react'
import { copy } from '@/lib/copy'
import { useTasks } from '@/hooks/useTasks'
import type { TaskRecord } from '@/hooks/useTasks'
import { useLabels } from '@/hooks/useLabels'
import { useTaskKeyboard } from '@/hooks/useTaskKeyboard'
import { playCompletionSound } from '@/lib/sounds'
import { fadeSlideUp, taskComplete, collapse, buttonPress, stagger, ease } from '@/lib/motion'
import TaskRow from '@/components/tasks/TaskRow'
import VoiceCapture from '@/components/tasks/VoiceCapture'
import TimeBlockPicker from '@/components/tasks/TimeBlockPicker'
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar'

export default function InboxPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const { tasks, isLoading, createTask, updateTask, deleteTask, toggleComplete } = useTasks()
  const { labels, createLabel } = useLabels()
  const { connected: googleConnected, syncTask } = useGoogleCalendar()
  const [tipDismissed, setTipDismissed] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskFocused, setNewTaskFocused] = useState(false)
  const [doneOpen, setDoneOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [timeBlockTaskId, setTimeBlockTaskId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter tasks
  const activeTasks = tasks.filter((t) => t.status !== 'done')
  const doneTasks = tasks.filter((t) => t.status === 'done')

  // Sub-task counts
  const getSubTaskCount = useCallback(
    (taskId: string) => {
      const subTasks = tasks.filter((t) => t.parentId === taskId)
      if (subTasks.length === 0) return undefined
      return {
        completed: subTasks.filter((t) => t.status === 'done').length,
        total: subTasks.length,
      }
    },
    [tasks]
  )

  // Labels for a task
  const getLabelsForTask = useCallback(
    (task: TaskRecord) => {
      if (!task.labelIds || task.labelIds.length === 0) return []
      return labels.filter((l) => task.labelIds?.includes(l._id))
    },
    [labels]
  )

  const handleNewTask = useCallback(async () => {
    const title = newTaskTitle.trim()
    if (!title) return
    await createTask({
      title,
      priority: 'medium',
      status: 'backlog',
    })
    setNewTaskTitle('')
    inputRef.current?.blur()
  }, [newTaskTitle, createTask])

  const handleToggleTask = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t._id === taskId)
      if (!task) return
      if (task.status !== 'done') playCompletionSound()
      await toggleComplete(taskId)
    },
    [tasks, toggleComplete]
  )

  const handleSetPriority = useCallback(
    async (taskId: string, priority: 'high' | 'medium' | 'low') => {
      await updateTask(taskId, { priority })
    },
    [updateTask]
  )

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      await deleteTask(taskId)
      if (detailTaskId === taskId) setDetailTaskId(null)
    },
    [deleteTask, detailTaskId]
  )

  const handleTitleChange = useCallback(
    async (taskId: string, title: string) => {
      await updateTask(taskId, { title })
    },
    [updateTask]
  )

  const handleVoiceTranscript = useCallback(
    async (text: string) => {
      await createTask({
        title: text,
        priority: 'medium',
        status: 'backlog',
      })
    },
    [createTask]
  )

  const handleTimeBlockSave = useCallback(
    async (data: {
      scheduledStart: string
      scheduledEnd: string
      estimatedEffort: number
      syncToGoogle: boolean
    }) => {
      if (!timeBlockTaskId) return
      await updateTask(timeBlockTaskId, {
        scheduledStart: data.scheduledStart,
        scheduledEnd: data.scheduledEnd,
        estimatedEffort: data.estimatedEffort,
      })
      if (data.syncToGoogle && googleConnected) {
        await syncTask(timeBlockTaskId)
      }
      setTimeBlockTaskId(null)
    },
    [timeBlockTaskId, updateTask, googleConnected, syncTask]
  )

  // Keyboard shortcuts
  useTaskKeyboard({
    tasks: activeTasks,
    selectedIndex,
    onSelectIndex: setSelectedIndex,
    onToggleComplete: handleToggleTask,
    onOpenDetail: (id) => setDetailTaskId(id),
    onSetPriority: handleSetPriority,
    onDelete: handleDeleteTask,
    onFocusNewTask: () => inputRef.current?.focus(),
    onCloseDetail: () => setDetailTaskId(null),
    enabled: !newTaskFocused,
  })

  // Expose detailTaskId for AppShell to read
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('laif:detail-task', { detail: { taskId: detailTaskId } })
    )
  }, [detailTaskId])

  return (
    <div className="flex flex-col px-6 py-5">
      {/* ── Header ── */}
      <div className="mb-1 flex items-start justify-between">
        <div />
        <div className="flex items-center gap-2">
          <motion.button
            {...buttonPress}
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
      </div>

      {/* ── Title ── */}
      <h1
        className="mb-5 text-[32px] font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        {copy.inbox.title}
      </h1>

      {/* ── Tip banner ── */}
      <AnimatePresence>
        {!tipDismissed && (
          <motion.div
            {...fadeSlideUp}
            transition={ease.normal}
            className="mb-5 flex items-center gap-3 rounded-xl px-4 py-3"
            style={{
              backgroundColor: 'rgba(99, 91, 255, 0.08)',
              border: '1px solid rgba(99, 91, 255, 0.3)',
            }}
          >
            <BookOpen size={18} className="flex-shrink-0" style={{ color: '#635BFF' }} />
            <p className="flex-1 text-sm" style={{ color: '#635BFF' }}>
              {copy.inbox.tipBanner}
            </p>
            <button
              onClick={() => setTipDismissed(true)}
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
              style={{ color: '#635BFF' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.7'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── New task row ── */}
      <div
        className="mb-6 rounded-xl px-4 py-3 transition-colors duration-150"
        style={{
          backgroundColor: 'var(--bg-pane-2)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <Plus
            size={20}
            strokeWidth={1.5}
            className="flex-shrink-0 transition-colors duration-150"
            style={{ color: newTaskFocused ? 'var(--text-primary)' : 'var(--text-faint)' }}
          />
          <input
            ref={inputRef}
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onFocus={() => setNewTaskFocused(true)}
            onBlur={() => setNewTaskFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNewTask()
              if (e.key === 'Escape') {
                setNewTaskTitle('')
                inputRef.current?.blur()
              }
            }}
            placeholder={copy.newTask.placeholder}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{
              color: 'var(--text-primary)',
            }}
          />
          {!newTaskFocused && !newTaskTitle && (
            <span
              className="rounded px-1.5 py-0.5 text-[11px] font-medium"
              style={{
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-faint)',
              }}
            >
              {copy.newTask.shortcutHint}
            </span>
          )}
        </div>

        {/* Sub-icons row (visible when focused) */}
        {newTaskFocused && (
          <div className="mt-2 flex items-center gap-2 pl-8">
            <button
              className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
              style={{ color: 'var(--text-faint)' }}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Calendar size={15} strokeWidth={1.5} />
            </button>
            <button
              className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
              style={{ color: 'var(--text-faint)' }}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <BarChart3 size={15} strokeWidth={1.5} />
            </button>
            <button
              className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
              style={{ color: 'var(--text-faint)' }}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Tag size={15} strokeWidth={1.5} />
            </button>
            <VoiceCapture onTranscript={handleVoiceTranscript} inline />
          </div>
        )}
      </div>

      {/* ── Active tasks ── */}
      <motion.div className="flex flex-col gap-0.5" {...stagger()}>
        <AnimatePresence>
          {activeTasks.map((task, index) => (
            <TaskRow
              key={task._id}
              task={task}
              onToggle={handleToggleTask}
              onOpenDetail={(id) => setDetailTaskId(id)}
              isSelected={selectedIndex === index}
              isDetailOpen={detailTaskId === task._id}
              subTaskCount={getSubTaskCount(task._id)}
              labels={getLabelsForTask(task)}
              onTitleChange={handleTitleChange}
              onSchedule={() => setTimeBlockTaskId(task._id)}
              showScheduleIcon
            />
          ))}
        </AnimatePresence>
        {activeTasks.length === 0 && !isLoading && (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--text-faint)' }}>
            {copy.list.emptyBlockPlaceholder}
          </p>
        )}
      </motion.div>

      {/* ── Done section ── */}
      {doneTasks.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setDoneOpen(!doneOpen)}
            className="mb-2 flex items-center gap-2 px-4 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            {doneOpen ? (
              <ChevronDown size={14} strokeWidth={1.5} />
            ) : (
              <ChevronRight size={14} strokeWidth={1.5} />
            )}
            <span className="text-sm font-medium">
              {copy.task.completedCta} ({doneTasks.length})
            </span>
          </button>
          <AnimatePresence>
            {doneOpen && (
              <motion.div
                {...collapse}
                transition={ease.normal}
                className="flex flex-col gap-0.5 overflow-hidden"
              >
                {doneTasks.map((task) => (
                  <TaskRow
                    key={task._id}
                    task={task}
                    onToggle={handleToggleTask}
                    onOpenDetail={(id) => setDetailTaskId(id)}
                    isSelected={false}
                    isDetailOpen={detailTaskId === task._id}
                    subTaskCount={getSubTaskCount(task._id)}
                    labels={getLabelsForTask(task)}
                    onTitleChange={handleTitleChange}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Time Block Picker */}
      {timeBlockTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={() => setTimeBlockTaskId(null)}>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <TimeBlockPicker
              open={!!timeBlockTaskId}
              onClose={() => setTimeBlockTaskId(null)}
              onSave={handleTimeBlockSave}
              googleConnected={googleConnected}
            />
          </div>
        </div>
      )}
    </div>
  )
}
