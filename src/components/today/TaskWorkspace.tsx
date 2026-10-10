'use client'

import {
  Check,
  ChevronRight,
  ChevronDown,
  Circle,
  CircleDot,
  Clock3,
  Ellipsis,
  Lightbulb,
  ListChecks,
  ListTodo,
  MinusSquare,
  Plus,
  Repeat2,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent as ReactMouseEvent } from 'react'
import { format, isSameDay } from 'date-fns'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useHabits, type Habit } from '@/hooks/useHabits'
import { useLists } from '@/hooks/useLists'
import { useTasks, type TaskRecord } from '@/hooks/useTasks'
import { useWorkflows } from '@/hooks/useWorkflows'
import TaskViewMenu, { type WorkspaceView } from './TaskViewMenu'
import TodayTaskContextMenu from './TodayTaskContextMenu'
import './task-workspace.css'

type WorkspaceRange = 'today' | 'next' | 'all'
type AllTasksFilter = 'all' | 'upcoming' | 'done'
type TaskSort = 'date' | 'priority' | 'title'

interface TaskWorkspaceProps {
  range: WorkspaceRange
}

const isDone = (status: string) => status === 'done' || status === 'completed'

function localStart(date = new Date()) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function localEnd(date = new Date()) {
  const copy = new Date(date)
  copy.setHours(23, 59, 59, 999)
  return copy
}

function plusDays(date: Date, days: number) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function parseTaskDate(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function habitRunsToday(habit: Habit, date: Date) {
  const day = date.getDay()
  if (habit.frequency === 'weekdays') return day >= 1 && day <= 5
  if (habit.frequency === 'custom') return habit.customDays?.includes(day) ?? false
  return true
}

function TaskCheck({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`workspace-check${checked ? ' is-checked' : ''}`}
      onClick={(event) => { event.stopPropagation(); onClick() }}
      aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
    >
      {checked ? <Check size={12} strokeWidth={3} /> : null}
    </button>
  )
}

function TaskCard({
  task,
  showDetails,
  compact,
  listName,
  onToggle,
  onOpen,
  onContextMenu,
}: {
  task: TaskRecord
  showDetails: boolean
  compact: boolean
  listName?: string
  onToggle: () => void
  onOpen: () => void
  onContextMenu: (event: ReactMouseEvent) => void
}) {
  const completed = isDone(task.status)
  const due = parseTaskDate(task.dueDate)

  return (
    <article
      className={`workspace-card workspace-task-card${completed ? ' is-completed' : ''}${compact ? ' is-compact' : ''}`}
      onClick={onOpen}
      onContextMenu={onContextMenu}
      tabIndex={0}
      onKeyDown={(event) => { if (event.key === 'Enter') onOpen() }}
    >
      <TaskCheck checked={completed} onClick={onToggle} />
      <div className="workspace-card-copy">
        <h3>{task.title}</h3>
        {showDetails && task.description ? <p>{task.description}</p> : null}
        {showDetails && (
          <div className="workspace-card-meta">
            {due ? <span className={due < localStart() && !completed ? 'is-overdue' : ''}>{isSameDay(due, new Date()) ? 'Today' : format(due, 'EEE, MMM d')}</span> : null}
            {task.repeat ? <Repeat2 size={11} /> : null}
            {listName ? <span className="workspace-list-name">{listName}</span> : null}
          </div>
        )}
      </div>
      <button
        type="button"
        className="workspace-card-more"
        aria-label={`More actions for ${task.title}`}
        aria-haspopup="menu"
        onClick={(event) => {
          event.stopPropagation()
          const rect = event.currentTarget.getBoundingClientRect()
          window.dispatchEvent(new CustomEvent('laif:task-command-menu', { detail: { taskId: task._id, x: rect.right, y: rect.bottom + 4 } }))
        }}
      >
        <Ellipsis size={16} />
      </button>
    </article>
  )
}

function HabitCard({
  habit,
  completed,
  status,
  compact,
  quickOpen,
  onOpen,
  onContextMenu,
  onComplete,
}: {
  habit: Habit
  completed: boolean
  status?: string
  compact: boolean
  quickOpen: boolean
  onOpen: () => void
  onContextMenu: (event: ReactMouseEvent) => void
  onComplete: () => void
}) {
  const statusLabel = status === 'skipped' ? 'Skipped' : status === 'unachieved' ? 'Uncompleted' : 'Today'

  return (
    <div className="workspace-habit-card-wrap">
      <article
        className={`workspace-card workspace-habit-card${completed ? ' is-completed' : ''}${quickOpen ? ' is-selected' : ''}${compact ? ' is-compact' : ''}`}
        onClick={onOpen}
        onContextMenu={onContextMenu}
        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen() } }}
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={quickOpen}
      >
        <span className="workspace-habit-icon" style={{ color: habit.color || undefined }}>
          {completed ? <Check size={15} /> : <span>{habit.icon || '✦'}</span>}
        </span>
        <div className="workspace-card-copy">
          <h3>{habit.name}</h3>
          <div className="workspace-card-meta">
            <span className={status === 'skipped' || status === 'unachieved' ? 'is-muted-status' : ''}>{statusLabel}</span>
            {habit.currentStreak > 0 ? <span>{habit.currentStreak} day streak</span> : null}
          </div>
        </div>
      </article>

      {quickOpen && (
        <div className="workspace-habit-quick-popover" role="dialog" aria-label={`${habit.name} quick check-in`} onClick={(event) => event.stopPropagation()}>
          <div className="workspace-habit-quick-title">
            <span className="workspace-habit-quick-icon" style={{ color: habit.color || undefined }}>{habit.icon || '✦'}</span>
            <strong>{habit.name}</strong>
          </div>
          <button type="button" onClick={onComplete}>{completed ? 'Undo' : 'I Did It'}</button>
        </div>
      )}
    </div>
  )
}

export default function TaskWorkspace({ range }: TaskWorkspaceProps) {
  const { tasks, isLoading, createTask, updateTask, deleteTask, toggleComplete } = useTasks()
  const { habits, isLoading: habitsLoading, setTodayStatus } = useHabits()
  const { lists } = useLists()
  const { workflows } = useWorkflows()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const welcomePriority = searchParams.get('welcome') as 'plan' | 'focus' | 'habits' | null
  const [allTasksFilter, setAllTasksFilter] = useState<AllTasksFilter>(() => {
    if (searchParams.get('status') === 'done') return 'done'
    if (searchParams.get('filter') === 'upcoming') return 'upcoming'
    return 'all'
  })
  const [view, setView] = useState<WorkspaceView>(() => range === 'all' ? 'list' : 'columns')
  const [sortMode, setSortMode] = useState<TaskSort>('date')
  const [showCompleted, setShowCompleted] = useState(true)
  const [showDetails, setShowDetails] = useState(true)
  const [compact, setCompact] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [composerOpen, setComposerOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [completedOpen, setCompletedOpen] = useState(true)
  const [quickHabitId, setQuickHabitId] = useState<string | null>(null)
  const [habitMenu, setHabitMenu] = useState<{ habitId: string; x: number; y: number } | null>(null)
  const [taskMenu, setTaskMenu] = useState<{ taskId: string; x: number; y: number } | null>(null)
  const [focusMenuOpen, setFocusMenuOpen] = useState(false)
  const [pinnedTaskIds, setPinnedTaskIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('laif-pinned-task-ids')
      return stored ? JSON.parse(stored) as string[] : []
    } catch {
      return []
    }
  })
  const menuRef = useRef<HTMLDivElement>(null)

  const now = useMemo(() => new Date(), [])
  const start = useMemo(() => localStart(now), [now])
  const todayEnd = useMemo(() => localEnd(now), [now])
  const rangeEnd = useMemo(() => localEnd(plusDays(now, 6)), [now])

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false)
      const target = event.target as Element
      if (!target.closest('.workspace-habit-card-wrap') && !target.closest('.workspace-habit-context-menu')) {
        setQuickHabitId(null)
        setHabitMenu(null)
        setFocusMenuOpen(false)
      }
      if (!target.closest('.workspace-task-card') && !target.closest('.workspace-task-context-menu')) setTaskMenu(null)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setQuickHabitId(null)
        setHabitMenu(null)
        setFocusMenuOpen(false)
        setTaskMenu(null)
      }
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  useEffect(() => {
    try { localStorage.setItem('laif-pinned-task-ids', JSON.stringify(pinnedTaskIds)) } catch { /* ignore */ }
  }, [pinnedTaskIds])

  useEffect(() => {
    if (range !== 'all') return
    const status = searchParams.get('status')
    const filter = searchParams.get('filter')
    setAllTasksFilter(status === 'done' ? 'done' : filter === 'upcoming' ? 'upcoming' : 'all')
  }, [range, searchParams])

  const changeAllTasksFilter = (filter: AllTasksFilter) => {
    setAllTasksFilter(filter)
    if (filter === 'done') setSearchParams({ status: 'done' }, { replace: true })
    else if (filter === 'upcoming') setSearchParams({ filter: 'upcoming' }, { replace: true })
    else setSearchParams({}, { replace: true })
  }

  const listNames = useMemo(() => new Map(lists.map((list) => [list._id, list.title])), [lists])

  const visibleTasks = useMemo(() => tasks
    .filter((task) => !task.isHabit)
    .filter((task) => task.status !== 'dropped')
    .filter((task) => {
      const due = parseTaskDate(task.dueDate)
      if (range === 'all') {
        if (allTasksFilter === 'done') return isDone(task.status)
        if (allTasksFilter === 'upcoming') return !isDone(task.status) && Boolean(due && due >= start)
        return true
      }
      if (range === 'today') {
        if (isDone(task.status)) {
          const completedAt = parseTaskDate(task.completedAt)
          return (due ? due <= todayEnd : false) || (completedAt ? isSameDay(completedAt, now) : false)
        }
        return due ? due <= todayEnd : false
      }
      return due ? due >= start && due <= rangeEnd : false
    })
    .sort((a, b) => {
      const pinDifference = Number(pinnedTaskIds.includes(b._id)) - Number(pinnedTaskIds.includes(a._id))
      if (pinDifference !== 0) return pinDifference
      if (sortMode === 'priority') {
        const weight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 }
        const priorityDifference = (weight[b.priority ?? 'none'] ?? 0) - (weight[a.priority ?? 'none'] ?? 0)
        if (priorityDifference !== 0) return priorityDifference
      }
      if (sortMode === 'title') return (a.title || '').localeCompare(b.title || '')
      const aDate = parseTaskDate(a.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER
      const bDate = parseTaskDate(b.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER
      if (aDate !== bDate) return aDate - bDate
      return (a.title || '').localeCompare(b.title || '')
    }),
  [allTasksFilter, now, pinnedTaskIds, range, rangeEnd, sortMode, start, tasks, todayEnd])

  const activeTasks = useMemo(() => visibleTasks.filter((task) => !isDone(task.status)), [visibleTasks])
  const completedTasks = useMemo(() => visibleTasks.filter((task) => isDone(task.status)), [visibleTasks])
  const todaysHabits = useMemo(() => habits.filter((habit) => !habit.archived && habitRunsToday(habit, now)), [habits, now])
  const todayKey = format(now, 'yyyy-MM-dd')

  const groupedNextTasks = useMemo(() => {
    if (range !== 'next') return []
    return Array.from({ length: 7 }, (_, index) => {
      const date = plusDays(start, index)
      return {
        date,
        tasks: activeTasks.filter((task) => {
          const due = parseTaskDate(task.dueDate)
          return due ? isSameDay(due, date) : false
        }),
        completed: completedTasks.filter((task) => {
          const due = parseTaskDate(task.dueDate)
          return due ? isSameDay(due, date) : false
        }),
      }
    }).filter((group) => group.tasks.length > 0 || (showCompleted && group.completed.length > 0))
  }, [activeTasks, completedTasks, range, showCompleted, start])

  const openTask = (taskId: string) => window.dispatchEvent(new CustomEvent('laif:detail-task', { detail: { taskId } }))

  useEffect(() => {
    const linkedTaskId = new URLSearchParams(window.location.search).get('task')
    if (linkedTaskId) window.dispatchEvent(new CustomEvent('laif:detail-task', { detail: { taskId: linkedTaskId } }))
  }, [])

  const openTaskMenu = (task: TaskRecord, event: ReactMouseEvent) => {
    event.preventDefault()
    setHabitMenu(null)
    setQuickHabitId(null)
    setTaskMenu({
      taskId: task._id,
      x: Math.max(8, Math.min(event.clientX, window.innerWidth - 408)),
      y: Math.max(8, Math.min(event.clientY, window.innerHeight - 510)),
    })
  }

  const startTaskFocus = (task: TaskRecord, mode: 'POMO' | 'STOPWATCH') => {
    window.dispatchEvent(new CustomEvent('laif:start-focus', {
      detail: { taskId: task._id, taskTitle: task.title, mode, targetType: 'TASK' },
    }))
  }

  const addSubtask = async (task: TaskRecord) => {
    const subtask = await createTask({
      title: 'New subtask',
      parentId: task._id,
      status: 'todo',
      priority: task.priority,
      dueDate: task.dueDate,
      listId: task.listId,
      workflowId: task.workflowId,
      sectionId: task.sectionId,
    })
    openTask(subtask._id)
  }

  const duplicateTask = async (task: TaskRecord) => {
    await createTask({
      title: `${task.title} copy`,
      description: task.description,
      status: 'todo',
      priority: task.priority,
      dueDate: task.dueDate,
      listId: task.listId,
      workflowId: task.workflowId,
      sectionId: task.sectionId,
      tags: task.tags,
      estimatedEffort: task.estimatedEffort,
      repeat: task.repeat,
    })
  }

  const openHabitMenu = (habit: Habit, event: ReactMouseEvent) => {
    event.preventDefault()
    setQuickHabitId(null)
    setFocusMenuOpen(false)
    setHabitMenu({
      habitId: habit._id,
      x: Math.min(event.clientX, window.innerWidth - 184),
      y: Math.min(event.clientY, window.innerHeight - 186),
    })
  }

  const startHabitFocus = (habit: Habit, mode: 'POMO' | 'STOPWATCH') => {
    window.dispatchEvent(new CustomEvent('laif:start-focus', {
      detail: { taskId: habit._id, taskTitle: habit.name, mode, targetType: 'HABIT' },
    }))
    setHabitMenu(null)
    setFocusMenuOpen(false)
  }

  const setHabitStatus = async (habit: Habit, status: 'achieved' | 'unachieved' | 'skipped') => {
    await setTodayStatus(habit, status)
    setHabitMenu(null)
    setFocusMenuOpen(false)
    if (status === 'achieved' || status === 'unachieved') setQuickHabitId(null)
  }

  const submitTask = async (event: FormEvent) => {
    event.preventDefault()
    const title = newTaskTitle.trim()
    if (!title) return
    try {
      await createTask({
        title,
        status: 'todo',
        priority: 'none',
        dueDate: range === 'all' ? null : now.toISOString(),
      })
      setNewTaskTitle('')
      setComposerOpen(false)
    } catch (err) {
      console.error('Failed to create task:', err)
    }
  }

  const renderTasks = (taskList: TaskRecord[]) => taskList.map((task) => (
    <TaskCard
      key={task._id}
      task={task}
      showDetails={showDetails}
      compact={compact}
      listName={task.listId ? listNames.get(task.listId) : undefined}
      onToggle={() => void toggleComplete(task._id)}
      onOpen={() => openTask(task._id)}
      onContextMenu={(event) => openTaskMenu(task, event)}
    />
  ))

  const loading = isLoading || (range !== 'all' && habitsLoading)
  const title = range === 'today' ? 'Today' : range === 'next' ? 'Next 7 Days' : 'Tasks'
  const dateLabel = range === 'today'
    ? format(now, 'EEEE, MMMM d')
      : range === 'next'
      ? `${format(start, 'MMM d')} – ${format(rangeEnd, 'MMM d')}`
      : allTasksFilter === 'done' ? 'Completed work' : allTasksFilter === 'upcoming' ? 'Upcoming work' : 'All active work'

  return (
    <div className={`task-workspace range-${range} view-${view}${compact ? ' is-compact' : ''}`}>
      <header className="task-workspace-header">
        <div className="task-workspace-title">
          <ListTodo size={18} />
          <h1>{title}</h1>
        </div>
        <div className="task-workspace-actions">
          <button type="button" title="Open morning plan" aria-label="Open morning plan" onClick={() => navigate('/plan')}><Lightbulb size={17} /></button>
          <button
            type="button"
            title={`Sorted by ${sortMode}. Change sort order`}
            aria-label={`Sorted by ${sortMode}. Change sort order`}
            onClick={() => setSortMode((current) => current === 'date' ? 'priority' : current === 'priority' ? 'title' : 'date')}
          >
            <SlidersHorizontal size={17} />
          </button>
          <div className="task-view-menu-anchor" ref={menuRef}>
            <button type="button" title="More options" aria-label="More options" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen}><Ellipsis size={18} /></button>
            {menuOpen && (
              <TaskViewMenu
                view={view}
                showCompleted={showCompleted}
                showDetails={showDetails}
                compact={compact}
                optionsOpen={optionsOpen}
                onViewChange={setView}
                onToggleCompleted={() => setShowCompleted((value) => !value)}
                onToggleDetails={() => setShowDetails((value) => !value)}
                onToggleOptions={() => setOptionsOpen((value) => !value)}
                onToggleCompact={() => setCompact((value) => !value)}
                onPrint={() => window.print()}
              />
            )}
          </div>
        </div>
      </header>

      <main className="task-workspace-content">
        {range === 'today' && welcomePriority && (
          <section className="workspace-welcome" aria-labelledby="workspace-welcome-title">
            <div>
              <p>YOUR FIRST WIN</p>
              <h2 id="workspace-welcome-title">
                {welcomePriority === 'focus' ? 'Protect one focused block.' : welcomePriority === 'habits' ? 'Check in with one steady rhythm.' : 'Shape a calmer day.'}
              </h2>
              <span>
                {welcomePriority === 'focus' ? 'Choose one task and start a short session.' : welcomePriority === 'habits' ? 'Create or complete one habit to establish your rhythm.' : 'Review commitments and protect the work that matters.'}
              </span>
            </div>
            <div className="workspace-welcome-actions">
              <button type="button" onClick={() => navigate(welcomePriority === 'focus' ? '/focus' : welcomePriority === 'habits' ? '/habits' : '/plan')}>
                {welcomePriority === 'focus' ? 'Open Focus' : welcomePriority === 'habits' ? 'Open Habits' : 'Start Planning'}
              </button>
              <button type="button" className="is-secondary" onClick={() => {
                setSearchParams((current) => {
                  const next = new URLSearchParams(current)
                  next.delete('welcome')
                  return next
                }, { replace: true })
              }}>Dismiss</button>
            </div>
          </section>
        )}
        <section className="task-date-section">
          <div className="task-date-heading">
            <div><h2>{dateLabel}</h2><span>{activeTasks.length + completedTasks.length}</span></div>
            {range !== 'all' || allTasksFilter !== 'done' ? (
              <button type="button" onClick={() => setComposerOpen(true)} aria-label="Add task"><Plus size={17} /></button>
            ) : null}
          </div>

          {range === 'all' ? (
            <div className="workspace-filter-bar" role="tablist" aria-label="Task filters">
              {([
                ['all', 'Open'],
                ['upcoming', 'Upcoming'],
                ['done', 'Completed'],
              ] as const).map(([filter, label]) => (
                <button
                  key={filter}
                  type="button"
                  role="tab"
                  aria-selected={allTasksFilter === filter}
                  className={allTasksFilter === filter ? 'is-active' : ''}
                  onClick={() => changeAllTasksFilter(filter)}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}

          {loading ? (
            <div className="workspace-loading"><span /><span /><span /></div>
          ) : (
            <div className="workspace-columns">
              <div className="workspace-task-column">
                {range === 'next' ? groupedNextTasks.map((group) => (
                  <section className="workspace-day-group" key={group.date.toISOString()}>
                    <div className="workspace-column-heading">
                      <h3>{isSameDay(group.date, now) ? 'Today' : format(group.date, 'EEEE')}</h3>
                      <span>{format(group.date, 'MMM d')}</span>
                    </div>
                    {renderTasks(group.tasks)}
                    {showCompleted ? renderTasks(group.completed) : null}
                  </section>
                )) : (
                  <>
                    <div className="workspace-column-heading"><h3>{range === 'all' ? 'Open tasks' : 'Tasks'}</h3><span>{activeTasks.length}</span></div>
                    {renderTasks(activeTasks)}
                  </>
                )}

                {composerOpen && allTasksFilter !== 'done' && (
                  <form className="workspace-composer" onSubmit={submitTask}>
                    <Circle size={15} />
                    <input autoFocus value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} placeholder="What needs to be done?" onKeyDown={(event) => { if (event.key === 'Escape') setComposerOpen(false) }} />
                    <button type="submit">Add</button>
                  </form>
                )}

                {(range === 'today' || (range === 'all' && allTasksFilter !== 'done')) && activeTasks.length === 0 && !composerOpen ? (
                  <button type="button" className="workspace-empty-add" onClick={() => setComposerOpen(true)}><Plus size={15} /> Add a task</button>
                ) : null}

                {(range === 'today' || range === 'all') && showCompleted && completedTasks.length > 0 && (
                  <section className="workspace-completed-group">
                    <button type="button" className="workspace-completed-toggle" onClick={() => setCompletedOpen((open) => !open)}>
                      <ChevronDown size={13} className={completedOpen ? '' : 'is-closed'} /> Completed <span>{completedTasks.length}</span>
                    </button>
                    {completedOpen ? renderTasks(completedTasks) : null}
                  </section>
                )}

                {range === 'next' && groupedNextTasks.length === 0 && !composerOpen ? (
                  <div className="workspace-empty"><CalendarDaysIcon /><h3>Your week is clear</h3><p>Add a task and give the next seven days some shape.</p></div>
                ) : null}
              </div>

              {range !== 'all' ? <aside className="workspace-habit-column">
                <div className="workspace-column-heading"><h3>Habit</h3><span>{todaysHabits.length}</span></div>
                {todaysHabits.map((habit) => (
                  <HabitCard
                    key={habit._id}
                    habit={habit}
                    compact={compact}
                    completed={habit.completions.includes(todayKey)}
                    status={habit.completionStatuses?.[todayKey]}
                    quickOpen={quickHabitId === habit._id}
                    onOpen={() => {
                      setHabitMenu(null)
                      setFocusMenuOpen(false)
                      setQuickHabitId((current) => current === habit._id ? null : habit._id)
                    }}
                    onContextMenu={(event) => openHabitMenu(habit, event)}
                    onComplete={() => void setHabitStatus(habit, habit.completions.includes(todayKey) ? 'unachieved' : 'achieved')}
                  />
                ))}
                {todaysHabits.length === 0 ? (
                  <button className="workspace-empty-add" type="button" onClick={() => navigate('/habits')}><Sparkles size={15} /> Add a habit</button>
                ) : null}
              </aside> : null}
            </div>
          )}
        </section>
      </main>

      {habitMenu && (() => {
        const habit = habits.find((item) => item._id === habitMenu.habitId)
        if (!habit) return null
        return (
          <div
            className="workspace-habit-context-menu"
            style={{ left: habitMenu.x, top: habitMenu.y }}
            role="menu"
            aria-label={`${habit.name} actions`}
            onContextMenu={(event) => event.preventDefault()}
          >
            <div className="workspace-habit-focus-menu" onMouseLeave={() => setFocusMenuOpen(false)}>
              <button type="button" role="menuitem" onMouseEnter={() => setFocusMenuOpen(true)} onClick={() => setFocusMenuOpen((open) => !open)}>
                <CircleDot size={16} /><span>Start Focus</span><ChevronRight size={14} className="workspace-menu-trailing" />
              </button>
              {focusMenuOpen && (
                <div className="workspace-habit-focus-submenu" role="menu" aria-label="Focus mode">
                  <button type="button" role="menuitem" onClick={() => startHabitFocus(habit, 'POMO')}><CircleDot size={15} /><span>Pomodoro</span></button>
                  <button type="button" role="menuitem" onClick={() => startHabitFocus(habit, 'STOPWATCH')}><Clock3 size={15} /><span>Stopwatch</span></button>
                </div>
              )}
            </div>
            <button type="button" role="menuitem" onClick={() => navigate(`/habits?selected=${habit._id}`)}><ListChecks size={16} /><span>Habit Log</span></button>
            <button type="button" role="menuitem" onClick={() => void setHabitStatus(habit, 'skipped')}><MinusSquare size={16} /><span>Skip</span></button>
            <button type="button" role="menuitem" onClick={() => void setHabitStatus(habit, 'unachieved')}><X size={16} /><span>Uncompleted</span></button>
          </div>
        )
      })()}

      {taskMenu && (() => {
        const task = tasks.find((item) => item._id === taskMenu.taskId)
        if (!task) return null
        const allTags = Array.from(new Set(tasks.flatMap((item) => item.tags ?? []))).sort((a, b) => a.localeCompare(b))
        return (
          <TodayTaskContextMenu
            task={task}
            position={{ x: taskMenu.x, y: taskMenu.y }}
            lists={lists}
            workflows={workflows}
            allTags={allTags}
            pinned={pinnedTaskIds.includes(task._id)}
            onClose={() => setTaskMenu(null)}
            onDateChange={(dueDate) => void updateTask(task._id, { dueDate })}
            onPriorityChange={(priority) => void updateTask(task._id, { priority: priority as TaskRecord['priority'] })}
            onAddSubtask={() => void addSubtask(task)}
            onTogglePin={() => setPinnedTaskIds((current) => current.includes(task._id) ? current.filter((id) => id !== task._id) : [...current, task._id])}
            onWontDo={() => void updateTask(task._id, { status: 'dropped' })}
            onMoveToList={(listId) => void updateTask(task._id, { listId, workflowId: null, sectionId: null })}
            onMoveToWorkflow={(workflowId, sectionId) => void updateTask(task._id, { workflowId, sectionId, listId: null })}
            onTagsChange={(tags) => void updateTask(task._id, { tags })}
            onStartFocus={(mode) => startTaskFocus(task, mode)}
            onDuplicate={() => void duplicateTask(task)}
            onCopyLink={() => {
              const url = new URL(window.location.href)
              url.searchParams.set('task', task._id)
              void navigator.clipboard?.writeText(url.toString())
            }}
            onConvertToNote={() => {
              void updateTask(task._id, {
                notes: task.notes ?? { type: 'doc', content: [{ type: 'paragraph' }] },
                tags: Array.from(new Set([...(task.tags ?? []), 'note'])),
              })
              openTask(task._id)
            }}
            onDelete={() => {
              if (window.confirm(`Delete “${task.title}”?`)) void deleteTask(task._id)
            }}
          />
        )
      })()}
    </div>
  )
}

function CalendarDaysIcon() {
  return <ListTodo size={23} />
}
