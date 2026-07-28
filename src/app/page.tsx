
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SlidersHorizontal,
  MoreVertical,
  X,
  Plus,
  Calendar,
  ChevronDown,
  ChevronRight,
  Inbox,
  Flame,
} from 'lucide-react'
import { format, isToday as checkIsToday } from 'date-fns'
import { copy } from '@/lib/copy'
import { useTasks } from '@/hooks/useTasks'
import type { TaskRecord } from '@/hooks/useTasks'
import { useHabits } from '@/hooks/useHabits'
import { useTaskKeyboard } from '@/hooks/useTaskKeyboard'
import { playCompletionSound } from '@/lib/sounds'
import { fadeSlideUp, taskComplete, collapse, buttonPress, stagger, ease } from '@/lib/motion'
import TaskRow from '@/components/tasks/TaskRow'
import VoiceCapture from '@/components/tasks/VoiceCapture'
import TimeBlockPicker from '@/components/tasks/TimeBlockPicker'
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar'
import { useFocusState } from '@/contexts/FocusContext'
import { Link } from 'react-router-dom'
import ClockWeatherWidget from '@/components/dashboard/ClockWeatherWidget'
import AIBriefWidget from '@/components/dashboard/AIBriefWidget'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function InboxPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const { tasks, isLoading, createTask, updateTask, deleteTask, toggleComplete } = useTasks()
  const { habits, toggleToday: toggleHabitToday } = useHabits()
  const { connected: googleConnected, syncTask } = useGoogleCalendar()
  const { focus } = useFocusState()
  const [tipDismissed, setTipDismissed] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskFocused, setNewTaskFocused] = useState(false)
  const [doneOpen, setDoneOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [timeBlockTaskId, setTimeBlockTaskId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Listen for global shortcut to focus new task
  useEffect(() => {
    const handler = () => {
      setNewTaskFocused(true)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    window.addEventListener('laif:focus-new-task', handler)
    return () => window.removeEventListener('laif:focus-new-task', handler)
  }, [])

  // Dashboard computed values
  const greeting = useMemo(() => getGreeting(), [])
  const todayDate = useMemo(() => format(new Date(), 'EEEE, MMMM d'), [])
  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])

  const activeHabits = useMemo(() => habits.filter((h) => !h.archived), [habits])
  const habitsDoneToday = useMemo(
    () => activeHabits.filter((h) => h.completions.includes(todayStr)).length,
    [activeHabits, todayStr]
  )

  const todayTasks = useMemo(() => {
    const now = new Date()
    return tasks.filter((t) => {
      if (t.status === 'done' || t.status === 'dropped') return false
      if (t.dueDate) {
        const d = new Date(t.dueDate)
        if (checkIsToday(d)) return true
      }
      if (t.scheduledStart) {
        const d = new Date(t.scheduledStart)
        if (checkIsToday(d)) return true
      }
      return false
    })
  }, [tasks])

  const glanceLine = useMemo(() => {
    const parts: string[] = []
    if (todayTasks.length > 0) parts.push(`${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} today`)
    if (habitsDoneToday > 0) parts.push(`${habitsDoneToday}/${activeHabits.length} habits`)
    if (focus.isActive) parts.push('focus active')
    return parts.length > 0 ? parts.join(' · ') : 'Nothing scheduled'
  }, [todayTasks.length, habitsDoneToday, activeHabits.length, focus.isActive])

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

  const handleNewTask = useCallback(async () => {
    const title = newTaskTitle.trim()
    if (!title) return
    setNewTaskTitle('')
    try {
      await createTask({
        title,
        priority: 'medium',
        status: 'backlog',
      })
    } catch {
      setNewTaskTitle(title)
    }
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
    <div className="flex flex-col h-full overflow-y-auto">
    <div className="mx-auto w-full max-w-[720px] px-6 py-8">
      {/* ── Dashboard Header ── */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-2">
          <h1 style={{
            color: 'var(--text-primary)',
            fontSize: 36,
            fontWeight: 700,
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '-0.02em',
          }}>
            {greeting}
          </h1>
          <ClockWeatherWidget />
        </div>
        <p className="text-[15px] mb-1" style={{ color: 'var(--text-muted)' }}>
          {todayDate}
        </p>
        <p className="text-[13px]" style={{ color: 'var(--text-faint)' }}>
          {glanceLine}
        </p>
      </div>

      {/* ── AI Brief ── */}
      <div className="mb-8">
        <AIBriefWidget />
      </div>

          {/* ── Habits Strip ── */}
          {activeHabits.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Flame size={14} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />
                <span className="text-[12px] font-medium" style={{ color: 'var(--text-faint)' }}>
                  Today's Habits
                </span>
                <span className="text-[12px]" style={{ color: 'var(--text-faint)' }}>
                  {habitsDoneToday}/{activeHabits.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeHabits.map((habit) => {
                  const checked = habit.completions.includes(todayStr)
                  return (
                    <motion.button
                      key={habit._id}
                      {...buttonPress}
                      onClick={() => toggleHabitToday(habit)}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium cursor-pointer"
                      style={{
                        border: `1.5px solid ${checked ? habit.color : 'var(--border)'}`,
                        backgroundColor: checked ? `${habit.color}18` : 'transparent',
                        color: checked ? habit.color : 'var(--text-muted)',
                        transition: 'all 150ms ease',
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{habit.icon || '🔥'}</span>
                      <span className="truncate max-w-[100px]">{habit.name}</span>
                      {checked && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6.5L5 9L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </motion.button>
                  )
                })}
                <Link
                  to="/habits"
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-medium no-underline"
                  style={{
                    border: '1.5px dashed var(--border)',
                    color: 'var(--text-faint)',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-faint)' }}
                >
                  View all
                </Link>
              </div>
            </div>
          )}

          {/* ── Today's Tasks ── */}
          {todayTasks.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={14} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />
                <span className="text-[12px] font-medium" style={{ color: 'var(--text-faint)' }}>
                  Today's Tasks
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                {todayTasks.map((task) => (
                  <TaskRow
                    key={task._id}
                    task={task}
                    onToggle={handleToggleTask}
                    onOpenDetail={(id) => setDetailTaskId(id)}
                    isSelected={false}
                    isDetailOpen={detailTaskId === task._id}
                    subTaskCount={getSubTaskCount(task._id)}
                    onTitleChange={handleTitleChange}
                    onSchedule={() => setTimeBlockTaskId(task._id)}
                    showScheduleIcon
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Inbox Section ── */}
          <div className="border-t" style={{ borderColor: 'var(--border)', paddingTop: 24 }}>
            <div className="flex items-center gap-2 mb-4">
              <Inbox size={14} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />
              <span className="text-[12px] font-medium" style={{ color: 'var(--text-faint)' }}>
                Inbox
              </span>
            </div>

            {/* ── New task row ── */}
            <div style={{ marginBottom: 20 }}>
              <div
                onClick={() => {
                  if (!newTaskFocused) {
                    setNewTaskFocused(true)
                    setTimeout(() => inputRef.current?.focus(), 10)
                  }
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, rgba(108,108,158,0.05))' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 8px',
                  borderRadius: 10,
                  cursor: 'text',
                  color: 'var(--text-faint)',
                  transition: 'background-color 150ms ease',
                }}
              >
                <Plus size={18} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                {newTaskFocused || newTaskTitle ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onFocus={() => setNewTaskFocused(true)}
                    onBlur={() => setTimeout(() => { if (!newTaskTitle.trim()) setNewTaskFocused(false) }, 150)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNewTask()
                      if (e.key === 'Escape') { setNewTaskTitle(''); setNewTaskFocused(false) }
                    }}
                    placeholder={copy.newTask.placeholder}
                    aria-label="New task title"
                    style={{
                      flex: 1, background: 'transparent', outline: 'none', border: 'none',
                      fontSize: 15, fontWeight: 500, color: 'var(--text-primary)',
                      fontFamily: 'Inter, system-ui, sans-serif', padding: 0,
                    }}
                    autoFocus
                  />
                ) : (
                  <>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 500, fontFamily: 'Inter, system-ui, sans-serif' }}>New task</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-faint)' }}>{copy.newTask.shortcutHint}</span>
                  </>
                )}
              </div>
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
                    onTitleChange={handleTitleChange}
                    onSchedule={() => setTimeBlockTaskId(task._id)}
                    showScheduleIcon
                    draggable
                  />
                ))}
              </AnimatePresence>
              {activeTasks.length === 0 && !isLoading && (
                <motion.div
                  {...fadeSlideUp}
                  transition={ease.normal}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <Inbox size={48} strokeWidth={1} style={{ color: 'var(--text-faint)', opacity: 0.3 }} />
                  <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                    Your inbox is empty
                  </h3>
                  <p className="mt-1 max-w-xs text-sm" style={{ color: 'var(--text-muted)' }}>
                    Tasks you create will appear here. Press {copy.newTask.shortcutHint} to add your first task.
                  </p>
                </motion.div>
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
                          onTitleChange={handleTitleChange}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Time Block Picker */}
          {timeBlockTaskId && (
            <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={() => setTimeBlockTaskId(null)} onKeyDown={(e) => { if (e.key === 'Escape') setTimeBlockTaskId(null) }}>
              <div role="dialog" aria-modal="true" aria-label="Schedule time block" className="relative" onClick={(e) => e.stopPropagation()}>
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
    </div>
  )
}
