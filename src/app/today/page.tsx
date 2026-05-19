'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SlidersHorizontal,
  MoreVertical,
  Plus,
  ChevronDown,
  Clock,
  Calendar,
  Flame,
  Check,
  CalendarDays,
} from 'lucide-react'
import { copy } from '@/lib/copy'
import { useTasks } from '@/hooks/useTasks'
import type { TaskRecord } from '@/hooks/useTasks'
import { useLabels } from '@/hooks/useLabels'
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar'
import { useHabits } from '@/hooks/useHabits'
import type { Habit } from '@/hooks/useHabits'
import { playCompletionSound } from '@/lib/sounds'
import { fadeSlideUp, collapse, stagger, ease, buttonPress, checkBounce } from '@/lib/motion'
import { useFocusState } from '@/contexts/FocusContext'
import TaskRow from '@/components/tasks/TaskRow'
import InfoBanner from '@/components/shared/InfoBanner'
import TimeBlockPicker from '@/components/tasks/TimeBlockPicker'

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfToday(): Date {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

function startOfTomorrow(): Date {
  const d = startOfToday()
  d.setDate(d.getDate() + 1)
  return d
}

function endOfTomorrow(): Date {
  const d = startOfTomorrow()
  d.setHours(23, 59, 59, 999)
  return d
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < startOfToday()
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr)
  return d >= startOfToday() && d <= endOfToday()
}

function isTomorrow(dateStr: string): boolean {
  const d = new Date(dateStr)
  return d >= startOfTomorrow() && d <= endOfTomorrow()
}

function formatTimeSlot(start: string, end: string): string {
  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${fmt(new Date(start))} - ${fmt(new Date(end))}`
}

function formatFocusTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function TodayPage() {
  const { tasks, createTask, toggleComplete, updateTask } = useTasks()
  const { labels } = useLabels()
  const { connected: googleConnected, syncTask } = useGoogleCalendar()
  const { habits, toggleToday, weekCompletions, todayStr: getTodayStr } = useHabits()
  const { focus } = useFocusState()
  const [tipDismissed, setTipDismissed] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskFocused, setNewTaskFocused] = useState(false)
  const [overdueOpen, setOverdueOpen] = useState(true)
  const [todayOpen, setTodayOpen] = useState(true)
  const [tomorrowOpen, setTomorrowOpen] = useState(true)
  const [unscheduledOpen, setUnscheduledOpen] = useState(true)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [timeBlockTaskId, setTimeBlockTaskId] = useState<string | null>(null)
  const [habitsOpen, setHabitsOpen] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  // Habit data for today section
  const activeHabits = habits.filter((h) => !h.archived)
  const todayDateStr = getTodayStr()
  const habitsCheckedCount = activeHabits.filter((h) => h.completions.includes(todayDateStr)).length
  const allHabitsDone = activeHabits.length > 0 && habitsCheckedCount === activeHabits.length

  const handleToggleHabit = useCallback(
    async (habit: Habit) => {
      await toggleToday(habit)
    },
    [toggleToday]
  )

  // Filter tasks into groups
  const incompleteTasks = tasks.filter((t) => t.status !== 'done' && t.status !== 'dropped' && t.dueDate)

  const overdueTasks = incompleteTasks
    .filter((t) => isOverdue(t.dueDate!))
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())

  const todayTasksAll = incompleteTasks.filter((t) => isToday(t.dueDate!))
  const scheduledToday = todayTasksAll
    .filter((t) => t.scheduledStart)
    .sort((a, b) => new Date(a.scheduledStart!).getTime() - new Date(b.scheduledStart!).getTime())
  const unscheduledToday = todayTasksAll.filter((t) => !t.scheduledStart)

  const tomorrowTasks = incompleteTasks
    .filter((t) => isTomorrow(t.dueDate!))
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())

  const hasAnyTasks = overdueTasks.length > 0 || todayTasksAll.length > 0 || tomorrowTasks.length > 0

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
      status: 'todo',
      dueDate: endOfToday().toISOString(),
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

  const handleOpenDetail = useCallback((taskId: string) => {
    setDetailTaskId(taskId)
  }, [])

  const handleTitleChange = useCallback(
    async (taskId: string, title: string) => {
      await updateTask(taskId, { title })
    },
    [updateTask]
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

  // Expose detailTaskId for AppShell
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('laif:detail-task', { detail: { taskId: detailTaskId } })
    )
  }, [detailTaskId])

  const renderTaskWithSchedule = (task: TaskRecord) => (
    <div key={task._id} className="relative">
      {/* Schedule info */}
      {task.scheduledStart && task.scheduledEnd && (
        <div className="mb-0.5 flex items-center gap-2 pl-12">
          <Clock size={10} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
          <span className="text-[11px] font-medium" style={{ color: 'var(--accent)' }}>
            {formatTimeSlot(task.scheduledStart, task.scheduledEnd)}
          </span>
          {task.estimatedEffort && (
            <span
              className="rounded px-1 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-faint)' }}
            >
              {copy.timeBlock.estimatedLabel}: {task.estimatedEffort}h
            </span>
          )}
          {task.calendarSynced && (
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: '#34d399' }}
              title={copy.calendar.connectedLabel}
            />
          )}
        </div>
      )}
      <div className="flex items-center">
        <div className="flex-1">
          <TaskRow
            task={task}
            onToggle={handleToggleTask}
            onOpenDetail={handleOpenDetail}
            isSelected={false}
            isDetailOpen={detailTaskId === task._id}
            subTaskCount={getSubTaskCount(task._id)}
            labels={getLabelsForTask(task)}
            onTitleChange={handleTitleChange}
            onSchedule={() => setTimeBlockTaskId(task._id)}
            showScheduleIcon
          />
        </div>
      </div>
    </div>
  )

  const renderGroup = (
    label: string,
    groupTasks: TaskRecord[],
    open: boolean,
    setOpen: (v: boolean) => void,
    accentColor?: string,
    withScheduleInfo = false
  ) => (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="mb-1 flex items-center gap-2 px-1 py-1 cursor-pointer"
        style={{ color: accentColor || 'var(--text-muted)' }}
      >
        <motion.div
          animate={{ rotate: open ? 0 : -90 }}
          transition={ease.fast}
        >
          <ChevronDown size={14} strokeWidth={1.5} />
        </motion.div>
        <span className="text-sm font-semibold">
          {label}
        </span>
        <span
          className="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
          style={{
            backgroundColor: accentColor ? `${accentColor}20` : 'var(--bg-hover)',
            color: accentColor || 'var(--text-faint)',
          }}
        >
          {groupTasks.length}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            {...collapse}
            transition={ease.normal}
            className="flex flex-col gap-0.5 overflow-hidden"
          >
            <motion.div {...stagger()}>
              {groupTasks.map((task) =>
                withScheduleInfo ? (
                  renderTaskWithSchedule(task)
                ) : (
                  <TaskRow
                    key={task._id}
                    task={task}
                    onToggle={handleToggleTask}
                    onOpenDetail={handleOpenDetail}
                    isSelected={false}
                    isDetailOpen={detailTaskId === task._id}
                    subTaskCount={getSubTaskCount(task._id)}
                    labels={getLabelsForTask(task)}
                    onTitleChange={handleTitleChange}
                    onSchedule={() => setTimeBlockTaskId(task._id)}
                    showScheduleIcon
                  />
                )
              )}
              {groupTasks.length === 0 && (
                <p className="px-4 py-2 text-xs" style={{ color: 'var(--text-faint)' }}>
                  No tasks
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <div className="flex flex-col px-6 py-5">
      {/* Header */}
      <div className="mb-1 flex items-start justify-between">
        <div />
        <div className="flex items-center gap-2">
          <motion.button
            {...buttonPress}
            aria-label="Filter"
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
            aria-label="More options"
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

      {/* Title + View on calendar link */}
      <div className="mb-5 flex items-baseline gap-3">
        <h1
          className="text-[32px]"
          style={{ color: 'var(--text-primary)' }}
        >
          {copy.today.title}
        </h1>
        <a
          href="/calendar?view=day&date=today"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium transition-colors duration-150 no-underline"
          style={{ color: 'var(--text-faint)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--accent)'
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-faint)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <CalendarDays size={12} strokeWidth={1.5} />
          <span>View on calendar</span>
        </a>
      </div>

      {/* Tip banner */}
      <div className="mb-5">
        <InfoBanner
          message={copy.today.tipBanner}
          onDismiss={() => setTipDismissed(true)}
          visible={!tipDismissed}
        />
      </div>

      {/* Active focus session banner */}
      <AnimatePresence>
        {focus.isActive && (
          <motion.a
            href="/focus"
            {...fadeSlideUp}
            transition={ease.normal}
            className="mb-4 flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer no-underline"
            style={{
              backgroundColor: 'var(--accent-soft)',
              border: '1px solid var(--accent)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          >
            <span className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              <span>Focusing on &ldquo;{focus.taskTitle}&rdquo;</span>
              <span style={{ color: 'var(--accent)' }}>
                &mdash; {formatFocusTime(focus.remainingSeconds)} remaining
              </span>
            </span>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#FFFFFF',
              }}
            >
              Return to focus
            </span>
          </motion.a>
        )}
      </AnimatePresence>

      {/* New task row */}
      <div
        className="mb-6 rounded-xl px-4 py-3 transition-colors duration-150"
        style={{
          backgroundColor: 'var(--bg-pane-2)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)',
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
            aria-label="New task title"
            className="flex-1 bg-transparent text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            style={{ color: 'var(--text-primary)' }}
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
      </div>

      {/* Habits section */}
      {activeHabits.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setHabitsOpen(!habitsOpen)}
            className="mb-1 flex items-center gap-2 px-1 py-1 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <motion.div
              animate={{ rotate: habitsOpen ? 0 : -90 }}
              transition={ease.fast}
            >
              <ChevronDown size={14} strokeWidth={1.5} />
            </motion.div>
            <Flame size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-semibold">Habits</span>
            <span
              className="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
              style={{
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-faint)',
              }}
            >
              {activeHabits.length}
            </span>
            {allHabitsDone && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  backgroundColor: 'rgba(52, 211, 153, 0.15)',
                  color: '#34d399',
                }}
              >
                All done
              </span>
            )}
          </button>
          <AnimatePresence>
            {habitsOpen && (
              <motion.div
                {...collapse}
                transition={ease.normal}
                className="flex flex-col gap-0.5 overflow-hidden"
              >
                {activeHabits.map((habit) => {
                  const isChecked = habit.completions.includes(todayDateStr)
                  const days = weekCompletions(habit)
                  return (
                    <div
                      key={habit._id}
                      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      {/* Icon */}
                      <div
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm"
                        style={{ backgroundColor: `${habit.color}20` }}
                      >
                        {habit.icon}
                      </div>

                      {/* Title */}
                      <span
                        className="flex-1 text-[15px] font-medium truncate"
                        style={{
                          color: isChecked ? 'var(--text-faint)' : 'var(--text-primary)',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          textDecorationColor: 'var(--accent)',
                        }}
                      >
                        {habit.name}
                      </span>

                      {/* Weekly mini-grid */}
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {days.map((d) => (
                          <div
                            key={d.date}
                            className="h-2.5 w-2.5 rounded-[2px]"
                            style={{
                              backgroundColor: d.completed ? '#34D399' : 'var(--bg-hover)',
                              border: d.isToday ? '1px solid var(--text-faint)' : 'none',
                            }}
                          />
                        ))}
                      </div>

                      {/* Streak chip */}
                      {habit.currentStreak > 0 && (
                        <span
                          className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium flex-shrink-0"
                          style={{
                            backgroundColor: 'rgba(255, 77, 61, 0.1)',
                            color: '#FF4D3D',
                          }}
                        >
                          <Flame size={10} strokeWidth={2} />
                          {habit.currentStreak}
                        </span>
                      )}

                      {/* Checkbox */}
                      <motion.button
                        {...buttonPress}
                        onClick={() => handleToggleHabit(habit)}
                        aria-label={`Toggle ${habit.name}`}
                        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-150 cursor-pointer"
                        style={{
                          border: isChecked ? 'none' : '1.5px solid var(--accent)',
                          backgroundColor: isChecked ? 'var(--accent)' : 'transparent',
                        }}
                      >
                        <AnimatePresence>
                          {isChecked && (
                            <motion.div
                              initial={checkBounce.initial}
                              animate={checkBounce.checked}
                            >
                              <Check size={12} strokeWidth={2.5} className="text-white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Task groups */}
      {!hasAnyTasks ? (
        <motion.div
          {...fadeSlideUp}
          transition={ease.normal}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <CalendarDays size={48} strokeWidth={1} style={{ color: 'var(--text-faint)', opacity: 0.3 }} />
          <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            Nothing scheduled for today
          </h3>
          <p className="mt-1 max-w-xs text-sm" style={{ color: 'var(--text-muted)' }}>
            Add tasks with due dates or drag them from your inbox.
          </p>
        </motion.div>
      ) : (
        <>
          {overdueTasks.length > 0 &&
            renderGroup(
              copy.today.groups.overdue,
              overdueTasks,
              overdueOpen,
              setOverdueOpen,
              'var(--priority-high)',
              true
            )}
          {scheduledToday.length > 0 &&
            renderGroup(
              copy.timeBlock.scheduledSection,
              scheduledToday,
              todayOpen,
              setTodayOpen,
              undefined,
              true
            )}
          {unscheduledToday.length > 0 &&
            renderGroup(
              copy.timeBlock.unscheduledSection,
              unscheduledToday,
              unscheduledOpen,
              setUnscheduledOpen
            )}
          {scheduledToday.length === 0 && unscheduledToday.length === 0 && (
            renderGroup(copy.today.groups.today, [], todayOpen, setTodayOpen)
          )}
          {scheduledToday.length === 0 && unscheduledToday.length === 0 ||
            (todayTasksAll.length > 0 && scheduledToday.length === 0 && unscheduledToday.length === 0 &&
              renderGroup(copy.today.groups.today, todayTasksAll, todayOpen, setTodayOpen, undefined, true)
            )}
          {tomorrowTasks.length > 0 &&
            renderGroup(
              copy.today.groups.tomorrow,
              tomorrowTasks,
              tomorrowOpen,
              setTomorrowOpen,
              undefined,
              true
            )}
        </>
      )}

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
  )
}
