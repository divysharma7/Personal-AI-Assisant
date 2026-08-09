'use client'

import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Focus,
  Grid3X3,
  Inbox,
  ListTodo,
  MessageCircle,
  Moon,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sunrise,
  Trash2,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useLists } from '@/hooks/useLists'
import { useTasks } from '@/hooks/useTasks'
import { useWorkflows } from '@/hooks/useWorkflows'
import { CreateWorkflowDialog } from '@/components/tasks/kanban/CreateWorkflowDialog'
import LifeOSMark from '@/components/brand/LifeOSMark'
import '@/components/today/task-workspace.css'

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
  const { workflows } = useWorkflows()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [createWorkflowOpen, setCreateWorkflowOpen] = useState(false)
  const [onboardingPriorities] = useState<Array<'plan' | 'focus' | 'habits'>>(() => {
    try {
      const value = JSON.parse(localStorage.getItem('life-os-onboarding-priorities') ?? '[]') as Array<'plan' | 'focus' | 'habits'>
      return value.length > 0 ? value : ['plan', 'focus', 'habits']
    } catch { return ['plan', 'focus', 'habits'] }
  })

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
      tasks: activeTasks.length,
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
  const activeWorkflows = useMemo(
    () => workflows.filter((workflow) => !workflow.archived),
    [workflows],
  )
  const pinnedRailLinks = useMemo(() => {
    const links: Array<{ to: string; label: string; icon: ReactNode }> = [
      { to: '/tasks', label: 'Tasks', icon: <ListTodo size={18} /> },
    ]
    if (onboardingPriorities.includes('plan')) {
      links.push(
        { to: '/calendar', label: 'Calendar', icon: <CalendarDays size={18} /> },
        { to: '/plan', label: 'Plan', icon: <Sunrise size={18} /> },
        { to: '/shutdown', label: 'Shutdown', icon: <Moon size={18} /> },
      )
    }
    if (onboardingPriorities.includes('habits')) links.push({ to: '/habits', label: 'Habits', icon: <Sparkles size={18} /> })
    if (onboardingPriorities.includes('focus')) links.push({ to: '/statistics', label: 'Statistics', icon: <BarChart3 size={18} /> })
    return links.slice(0, 4)
  }, [onboardingPriorities])

  return (
    <>
    <aside className="today-sidebar" aria-label="Workspace navigation">
      <div className="today-icon-rail">
        <button className="today-avatar" type="button" onClick={() => navigate('/profile')} aria-label="Open profile">
          <LifeOSMark compact size="sm" />
        </button>

        <div className="today-rail-primary">
          <RailLink to="/today" label="Today"><CheckCircle2 size={18} /></RailLink>
          <RailLink to="/" label="Inbox"><Inbox size={18} /></RailLink>
          <RailLink to="/agenda" label="Agenda"><Clock3 size={18} /></RailLink>
          <RailLink to="/focus" label="Focus"><Focus size={18} /></RailLink>
          {pinnedRailLinks.map((link) => <RailLink key={link.to} to={link.to} label={link.label}>{link.icon}</RailLink>)}
        </div>

        <div className="today-rail-bottom">
          <button className="today-rail-link" type="button" onClick={() => window.dispatchEvent(new CustomEvent('laif:open-command-palette'))} aria-label="Search and commands" title="Search and commands (Ctrl+K)">
            <Search size={18} />
          </button>
          <button
            className="today-rail-link"
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('laif:open-task-composer'))}
            aria-label="Create new task"
            title="Create new task"
          >
            <Plus size={18} />
          </button>
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
            <NavLink to="/agenda" className={({ isActive }) => `today-sidebar-row${isActive ? ' is-active' : ''}`}>
              <Clock3 size={15} /><span>Agenda</span><small />
            </NavLink>
            <NavLink to="/tasks" className={({ isActive }) => `today-sidebar-row${isActive ? ' is-active' : ''}`}>
              <ListTodo size={15} /><span>All Tasks</span><small>{counts.tasks || ''}</small>
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
            <div className="today-sidebar-section-heading">
              <p className="today-sidebar-label">Workflows</p>
              <button type="button" onClick={() => setCreateWorkflowOpen(true)} aria-label="Create workflow" title="Create workflow"><Plus size={13} /></button>
            </div>
            <div className="today-sidebar-list">
              {activeWorkflows.slice(0, 7).map((workflow) => (
                <NavLink key={workflow._id} to={`/workflows/${workflow._id}`} className="today-sidebar-row">
                  <span className="today-list-emoji">{workflow.icon || '▦'}</span>
                  <span>{workflow.name}</span>
                  <small />
                </NavLink>
              ))}
              {activeWorkflows.length === 0 ? (
                <button className="today-sidebar-empty" type="button" onClick={() => setCreateWorkflowOpen(true)}>
                  Create your first workflow
                </button>
              ) : null}
            </div>
          </section>

          <section className="today-sidebar-section">
            <p className="today-sidebar-label">Features</p>
            <div className="today-sidebar-list">
              <NavLink to="/calendar" className="today-sidebar-row"><CalendarDays size={15} /><span>Calendar</span><small /></NavLink>
              <NavLink to="/habits" className="today-sidebar-row"><Sparkles size={15} /><span>Habits</span><small /></NavLink>
              <NavLink to="/focus" className="today-sidebar-row"><Focus size={15} /><span>Focus</span><small /></NavLink>
              <NavLink to="/plan" className="today-sidebar-row"><Sunrise size={15} /><span>Plan</span><small /></NavLink>
              <NavLink to="/shutdown" className="today-sidebar-row"><Moon size={15} /><span>Shutdown</span><small /></NavLink>
              <NavLink to="/statistics" className="today-sidebar-row"><BarChart3 size={15} /><span>Statistics</span><small /></NavLink>
              <NavLink to="/chat" className="today-sidebar-row"><MessageCircle size={15} /><span>Chatbot</span><small /></NavLink>
              <NavLink to="/matrix" className="today-sidebar-row"><Grid3X3 size={15} /><span>Priority Matrix</span><small /></NavLink>
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
    <CreateWorkflowDialog open={createWorkflowOpen} onClose={() => setCreateWorkflowOpen(false)} />
    </>
  )
}
