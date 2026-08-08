'use client'

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Focus,
  Inbox,
  Search,
  Settings,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useLists } from '@/hooks/useLists'
import { useTasks } from '@/hooks/useTasks'

interface TodaySidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

const isDone = (status: string) => status === 'done' || status === 'completed'

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

function endOfDays(days: number) {
  const date = startOfToday()
  date.setDate(date.getDate() + days)
  date.setHours(23, 59, 59, 999)
  return date
}

function RailLink({ to, label, children }: { to: string; label: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      title={label}
      className={({ isActive }) => `today-rail-link${isActive ? ' is-active' : ''}`}
    >
      {children}
    </NavLink>
  )
}

export default function TodaySidebar({ collapsed, onToggleCollapse }: TodaySidebarProps) {
  const { tasks } = useTasks()
  const { lists } = useLists()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const counts = useMemo(() => {
    const start = startOfToday()
    const todayEnd = endOfDays(0)
    const nextEnd = endOfDays(6)
    const activeTasks = tasks.filter((task) => !task.isHabit && !isDone(task.status) && task.status !== 'dropped')
    const inRange = (value: string | null | undefined, end: Date) => {
      if (!value) return false
      const date = new Date(value)
      return !Number.isNaN(date.getTime()) && date >= start && date <= end
    }
    return {
      today: activeTasks.filter((task) => {
        if (!task.dueDate) return false
        const due = new Date(task.dueDate)
        return !Number.isNaN(due.getTime()) && due <= todayEnd
      }).length,
      next: activeTasks.filter((task) => inRange(task.dueDate, nextEnd)).length,
      inbox: activeTasks.filter((task) => !task.listId).length,
      completed: tasks.filter((task) => !task.isHabit && isDone(task.status)).length,
      list: new Map(lists.map((list) => [
        list._id,
        activeTasks.filter((task) => task.listId === list._id).length,
      ])),
    }
  }, [lists, tasks])

  const visibleLists = useMemo(
    () => lists.filter((list) => !list.deletedAt && !list.isInbox).slice(0, 9),
    [lists],
  )

  return (
    <aside className="today-sidebar" aria-label="Workspace navigation">
      <div className="today-icon-rail">
        <button className="today-avatar" type="button" onClick={() => navigate('/profile')} aria-label="Open profile">
          <span>LA</span>
        </button>

        <div className="today-rail-primary">
          <RailLink to="/today" label="Today"><CheckCircle2 size={18} /></RailLink>
          <RailLink to="/calendar" label="Calendar"><CalendarDays size={18} /></RailLink>
          <RailLink to="/habits" label="Habits"><Sparkles size={18} /></RailLink>
          <RailLink to="/agenda" label="Agenda"><Clock3 size={18} /></RailLink>
          <RailLink to="/focus" label="Focus"><Focus size={18} /></RailLink>
          <RailLink to="/tasks" label="Search tasks"><Search size={18} /></RailLink>
        </div>

        <div className="today-rail-bottom">
          <button className="today-rail-link" type="button" onClick={onToggleCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <RailLink to="/settings" label="Settings"><Settings size={18} /></RailLink>
          <button className="today-rail-link" type="button" onClick={() => navigate('/getting-started')} aria-label="Help"><CircleHelp size={18} /></button>
        </div>
      </div>

      {!collapsed && (
        <div className="today-sidebar-panel">
          <nav className="today-sidebar-nav" aria-label="Task navigation">
            <NavLink to="/today" className={({ isActive }) => `today-sidebar-row${isActive ? ' is-active' : ''}`}>
              <CheckCircle2 size={15} /><span>Today</span><small>{counts.today || ''}</small>
            </NavLink>
            <NavLink to="/next" className={({ isActive }) => `today-sidebar-row${isActive ? ' is-active' : ''}`}>
              <CalendarDays size={15} /><span>Next 7 Days</span><small>{counts.next || ''}</small>
            </NavLink>
            <NavLink to="/" className={({ isActive }) => `today-sidebar-row${isActive && pathname === '/' ? ' is-active' : ''}`}>
              <Inbox size={15} /><span>Inbox</span><small>{counts.inbox || ''}</small>
            </NavLink>
          </nav>

          <div className="today-sidebar-rule" />

          <section className="today-sidebar-section">
            <p className="today-sidebar-label">Lists</p>
            <div className="today-sidebar-list">
              {visibleLists.length > 0 ? visibleLists.map((list) => (
                <NavLink key={list._id} to={`/lists/${list._id}`} className="today-sidebar-row">
                  <span className="today-list-emoji">{list.icon || '•'}</span>
                  <span>{list.title}</span>
                  <small>{counts.list.get(list._id) || ''}</small>
                </NavLink>
              )) : (
                <button className="today-sidebar-empty" type="button" onClick={() => navigate('/lists')}>
                  Create your first list
                </button>
              )}
            </div>
          </section>

          <section className="today-sidebar-section">
            <p className="today-sidebar-label">Filters</p>
            <button className="today-sidebar-tip" type="button" onClick={() => navigate('/tasks')}>
              Display tasks filtered by list, date, priority, tag, and more
            </button>
          </section>

          <section className="today-sidebar-section">
            <p className="today-sidebar-label">Tags</p>
            <button className="today-sidebar-tip" type="button" onClick={() => navigate('/tasks')}>
              Categorize tasks with tags. Select a tag while adding a task.
            </button>
          </section>

          <div className="today-sidebar-spacer" />
          <div className="today-sidebar-rule" />
          <nav className="today-sidebar-nav today-sidebar-footer" aria-label="Task archive">
            <NavLink to="/tasks?status=done" className="today-sidebar-row">
              <CheckCircle2 size={15} /><span>Completed</span><small>{counts.completed || ''}</small>
            </NavLink>
            <NavLink to="/lists?trash=true" className="today-sidebar-row">
              <Trash2 size={15} /><span>Trash</span>
            </NavLink>
          </nav>
        </div>
      )}
    </aside>
  )
}
