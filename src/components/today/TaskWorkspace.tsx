'use client'

import {
  Check,
  ChevronDown,
  Circle,
  Ellipsis,
  Lightbulb,
  ListTodo,
  Plus,
  Repeat2,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { format, isSameDay } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useHabits, type Habit } from '@/hooks/useHabits'
import { useLists } from '@/hooks/useLists'
import { useTasks, type TaskRecord } from '@/hooks/useTasks'
import TaskViewMenu, { type WorkspaceView } from './TaskViewMenu'
import './task-workspace.css'

type WorkspaceRange = 'today' | 'next'

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
}: {
  task: TaskRecord
  showDetails: boolean
  compact: boolean
  listName?: string
  onToggle: () => void
  onOpen: () => void
}) {
  const completed = isDone(task.status)
  const due = parseTaskDate(task.dueDate)

  return (
    <article
      className={`workspace-card workspace-task-card${completed ? ' is-completed' : ''}${compact ? ' is-compact' : ''}`}
      onClick={onOpen}
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
    </article>
  )
}

function HabitCard({ habit, completed, compact, onToggle }: { habit: Habit; completed: boolean; compact: boolean; onToggle: () => void }) {
  return (
    <article className={`workspace-card workspace-habit-card${completed ? ' is-completed' : ''}${compact ? ' is-compact' : ''}`}>
      <button type="button" className="workspace-habit-icon" onClick={onToggle} aria-label={`${completed ? 'Undo' : 'Complete'} ${habit.name}`} style={{ color: habit.color || undefined }}>
        {completed ? <Check size={15} /> : <span>{habit.icon || '✦'}</span>}
      </button>
      <div className="workspace-card-copy">
        <h3>{habit.name}</h3>
        <div className="workspace-card-meta"><span>Today</span>{habit.currentStreak > 0 ? <span>{habit.currentStreak} day streak</span> : null}</div>
      </div>
    </article>
  )
}

export default function TaskWorkspace({ range }: TaskWorkspaceProps) {
  const { tasks, isLoading, createTask, toggleComplete } = useTasks()
  const { habits, isLoading: habitsLoading, toggleToday } = useHabits()
  const { lists } = useLists()
  const navigate = useNavigate()
  const [view, setView] = useState<WorkspaceView>('columns')
  const [showCompleted, setShowCompleted] = useState(true)
  const [showDetails, setShowDetails] = useState(true)
  const [compact, setCompact] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [composerOpen, setComposerOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [completedOpen, setCompletedOpen] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)

  const now = useMemo(() => new Date(), [])
  const start = useMemo(() => localStart(now), [now])
  const todayEnd = useMemo(() => localEnd(now), [now])
  const rangeEnd = useMemo(() => localEnd(plusDays(now, 6)), [now])

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const listNames = useMemo(() => new Map(lists.map((list) => [list._id, list.title])), [lists])

  const visibleTasks = useMemo(() => tasks
    .filter((task) => !task.isHabit)
    .filter((task) => {
      const due = parseTaskDate(task.dueDate)
      if (range === 'today') {
        if (isDone(task.status)) {
          const completedAt = parseTaskDate(task.completedAt)
          return (due ? due <= todayEnd : false) || (completedAt ? isSameDay(completedAt, now) : false)
        }
        return due ? due <= todayEnd : false
      }
      return due ? due >= start && due <= rangeEnd : false
    })
    .sort((a, b) => (parseTaskDate(a.dueDate)?.getTime() ?? 0) - (parseTaskDate(b.dueDate)?.getTime() ?? 0)),
  [now, range, rangeEnd, start, tasks, todayEnd])

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

  const submitTask = async (event: FormEvent) => {
    event.preventDefault()
    const title = newTaskTitle.trim()
    if (!title) return
    await createTask({ title, status: 'todo', priority: 'none', dueDate: now.toISOString() })
    setNewTaskTitle('')
    setComposerOpen(false)
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
    />
  ))

  const loading = isLoading || habitsLoading
  const title = range === 'today' ? 'Today' : 'Next 7 Days'
  const dateLabel = range === 'today' ? format(now, 'EEEE, MMMM d') : `${format(start, 'MMM d')} – ${format(rangeEnd, 'MMM d')}`

  return (
    <div className={`task-workspace view-${view}${compact ? ' is-compact' : ''}`}>
      <header className="task-workspace-header">
        <div className="task-workspace-title">
          <ListTodo size={18} />
          <h1>{title}</h1>
        </div>
        <div className="task-workspace-actions">
          <button type="button" title="Daily suggestions" aria-label="Daily suggestions"><Lightbulb size={17} /></button>
          <button type="button" title="Sort tasks" aria-label="Sort tasks"><SlidersHorizontal size={17} /></button>
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
        <section className="task-date-section">
          <div className="task-date-heading">
            <div><h2>{dateLabel}</h2><span>{activeTasks.length + completedTasks.length}</span></div>
            <button type="button" onClick={() => setComposerOpen(true)} aria-label="Add task"><Plus size={17} /></button>
          </div>

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
                    <div className="workspace-column-heading"><h3>Tasks</h3><span>{activeTasks.length}</span></div>
                    {renderTasks(activeTasks)}
                  </>
                )}

                {composerOpen && (
                  <form className="workspace-composer" onSubmit={submitTask}>
                    <Circle size={15} />
                    <input autoFocus value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} placeholder="What needs to be done?" onKeyDown={(event) => { if (event.key === 'Escape') setComposerOpen(false) }} />
                    <button type="submit">Add</button>
                  </form>
                )}

                {range === 'today' && activeTasks.length === 0 && !composerOpen ? (
                  <button type="button" className="workspace-empty-add" onClick={() => setComposerOpen(true)}><Plus size={15} /> Add a task</button>
                ) : null}

                {range === 'today' && showCompleted && completedTasks.length > 0 && (
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

              <aside className="workspace-habit-column">
                <div className="workspace-column-heading"><h3>Habit</h3><span>{todaysHabits.length}</span></div>
                {todaysHabits.map((habit) => (
                  <HabitCard key={habit._id} habit={habit} compact={compact} completed={habit.completions.includes(todayKey)} onToggle={() => void toggleToday(habit)} />
                ))}
                {todaysHabits.length === 0 ? (
                  <button className="workspace-empty-add" type="button" onClick={() => navigate('/habits')}><Sparkles size={15} /> Add a habit</button>
                ) : null}
              </aside>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function CalendarDaysIcon() {
  return <ListTodo size={23} />
}

