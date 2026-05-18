'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List, Columns3, Grid2x2, Search, X, Plus, SlidersHorizontal, GripVertical, BookOpen, BarChart3, ArrowRight, Calendar as CalIcon } from 'lucide-react'
import type { TreeTask } from '@/components/tasks/TaskTree'
import KanbanView from '@/components/tasks/KanbanView'
import EisenhowerView from '@/components/tasks/EisenhowerView'
import { quickFade } from '@/shared/design-system'
import { format, addDays, isPast, isToday as dfIsToday } from 'date-fns'
import type { AnyItem } from '@/types'

type ViewMode = 'list' | 'board' | 'matrix'
type Filter = 'me' | 'upcoming' | 'done'

const ACCENT_INDIGO = '#8B7DFF'

// Completion sounds
const TONES = [
  { f1: 880, f2: 1320 }, { f1: 784, f2: 1175 }, { f1: 660, f2: 990 },
  { f1: 740, f2: 1109 }, { f1: 830, f2: 1245 },
]
function playCompleteSound() {
  if (typeof window === 'undefined') return
  try {
    const ctx = new AudioContext()
    const tone = TONES[Math.floor(Math.random() * TONES.length)]
    const t = ctx.currentTime
    const o1 = ctx.createOscillator(); const o2 = ctx.createOscillator()
    const g = ctx.createGain()
    o1.type = 'sine'; o1.frequency.value = tone.f1
    o2.type = 'sine'; o2.frequency.value = tone.f2
    o1.connect(g); o2.connect(g); g.connect(ctx.destination)
    g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
    o1.start(t); o2.start(t + 0.05); o1.stop(t + 0.4); o2.stop(t + 0.45)
  } catch { /* silent */ }
}

const PRIORITY_COLORS: Record<string, string> = {
  high: '#FF4D3D', medium: '#FFB23D', low: '#5DA8FF',
}

// Empty state copy per filter
const EMPTY_STATES: Record<Filter, string> = {
  me: 'No tasks assigned to you. Pull a few from Inbox?',
  upcoming: 'Nothing on the horizon.',
  done: 'No completed tasks in the last 30 days.',
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TreeTask[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('list')
  const [filter, setFilter] = useState<Filter>('me')
  const [sortBy, setSortBy] = useState<'creation' | 'due' | 'priority'>('creation')

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tasks')
      if (res.ok) {
        const data = await res.json()
        const normalized: TreeTask[] = data.map((t: Record<string, unknown>, idx: number) => ({
          _id: t._id as string, title: t.title as string,
          parentId: (t.parentId as string) || null, depth: (t.depth as number) ?? 0,
          path: (t.path as string) ?? '/', order: (t.order as number) ?? idx,
          status: (t.status as TreeTask['status']) ?? 'todo',
          priority: (t.priority as TreeTask['priority']) ?? 'medium',
          dueDate: (t.dueDate as string) || null, description: (t.description as string) ?? '',
        }))
        setTasks(normalized)
      }
    } catch (e) { console.error('Failed to fetch tasks', e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const handleStatusChange = useCallback(async (taskId: string, status: TreeTask['status']) => {
    if (status === 'done') playCompleteSound()
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status } : t))
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    } catch { fetchTasks() }
  }, [fetchTasks])

  const handleTaskClick = useCallback((task: TreeTask) => {
    // placeholder - could open detail panel
  }, [])

  const handleTaskUpdate = useCallback(async (id: string, data: Partial<unknown>) => {
    setTasks(prev => prev.map(t => t._id === id ? { ...t, ...data } : t))
    try {
      await fetch(`/api/tasks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    } catch { fetchTasks() }
  }, [fetchTasks])

  const handleAddTask = useCallback(async () => {
    const title = prompt('New task title:')
    if (!title?.trim()) return
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), status: 'todo', priority: 'medium', color: '#34d399' }),
      })
      if (res.ok) fetchTasks()
    } catch { /* silent */ }
  }, [fetchTasks])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = addDays(now, -30)
    const thirtyDaysOut = addDays(now, 30)

    let result = tasks
    if (filter === 'done') {
      result = tasks.filter(t => t.status === 'done')
    } else if (filter === 'upcoming') {
      result = tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) > now && new Date(t.dueDate) <= thirtyDaysOut)
    } else {
      result = tasks.filter(t => t.status !== 'done')
    }

    // Sort
    if (sortBy === 'due') {
      result = [...result].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
    } else if (sortBy === 'priority') {
      const prio: Record<string, number> = { high: 0, medium: 1, low: 2 }
      result = [...result].sort((a, b) => (prio[a.priority] ?? 3) - (prio[b.priority] ?? 3))
    }
    return result
  }, [tasks, filter, sortBy])

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'me', label: 'Tasks for me' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'done', label: 'Done' },
  ]

  return (
    <main className="flex-1 flex flex-col overflow-hidden relative">
      <div className="flex-1 overflow-auto">
        <div className="px-8 md:px-10 py-8 md:py-10">

          {/* Header */}
          <div className="flex items-start justify-between">
            <h1 className="text-[32px] font-bold"
              style={{ color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Tasks
            </h1>
            <div className="flex items-center gap-2">
              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="pill-interactive text-[13px] bg-transparent cursor-pointer"
                style={{ paddingRight: 24 }}
              >
                <option value="creation">Creation date</option>
                <option value="due">Due date</option>
                <option value="priority">Priority</option>
              </select>

              {/* New task */}
              <button onClick={handleAddTask}
                className="pill-interactive text-[13px] flex items-center gap-1.5">
                <Plus size={14} /> New task
              </button>

              {/* View switcher */}
              <div className="flex items-center gap-0.5 rounded-lg p-0.5" style={{ background: 'var(--bg-overlay)' }}>
                {([
                  { id: 'list' as ViewMode, icon: List },
                  { id: 'board' as ViewMode, icon: Columns3 },
                  { id: 'matrix' as ViewMode, icon: Grid2x2 },
                ] as const).map(v => (
                  <button key={v.id} onClick={() => setView(v.id)}
                    className="p-1.5 rounded-md transition-colors"
                    style={view === v.id
                      ? { background: 'var(--card)', color: 'var(--text-1)' }
                      : { color: 'var(--text-3)' }}>
                    <v.icon size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 mt-5">
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`pill-interactive ${filter === f.id ? 'active' : ''}`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Task list */}
          <div className="mt-4">
            {loading && tasks.length === 0 && (
              <div className="py-12 text-center"><div className="spinner" /></div>
            )}
            <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={quickFade}>
              {view === 'list' ? (
                filteredTasks.length > 0 ? (
                  <div className="space-y-px">
                    {filteredTasks.map(task => (
                      <TaskListRow key={task._id} task={task}
                        onToggle={() => handleStatusChange(task._id, task.status === 'done' ? 'todo' : 'done')}
                        onClick={() => handleTaskClick(task)} />
                    ))}
                  </div>
                ) : !loading ? (
                  <div className="py-20 text-center">
                    <p className="text-[14px]" style={{ color: 'var(--text-3)' }}>
                      {EMPTY_STATES[filter]}
                    </p>
                  </div>
                ) : null
              ) : view === 'board' ? (
                <KanbanView tasks={filteredTasks} onStatusChange={handleStatusChange} onTaskClick={handleTaskClick} />
              ) : (
                <EisenhowerView tasks={filteredTasks} onStatusChange={handleStatusChange} onTaskClick={handleTaskClick} onTaskUpdate={handleTaskUpdate} />
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}

// ─── Task list row ────────────────────────────────────────────────
function TaskListRow({ task, onToggle, onClick }: { task: TreeTask; onToggle: () => void; onClick: () => void }) {
  const [justDone, setJustDone] = useState(false)
  const done = task.status === 'done'
  const showStrike = done || justDone

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!done) { setJustDone(true); playCompleteSound(); setTimeout(() => setJustDone(false), 600) }
    onToggle()
  }

  return (
    <div className="row-interactive flex items-center gap-2 py-3 px-4 group"
      style={{ minHeight: 48 }} onClick={onClick}>
      <div className="drag-handle w-4 flex items-center justify-center">
        <GripVertical size={14} />
      </div>
      <button onClick={handleToggle}
        className={`checkbox-interactive mt-[1px] ${showStrike ? 'checked' : ''} ${justDone ? 'just-checked' : ''}`}>
        {showStrike && (
          <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      {task.priority && (
        <BarChart3 size={13} style={{ color: PRIORITY_COLORS[task.priority], flexShrink: 0 }} />
      )}
      <div className="flex-1 min-w-0">
        <span className={`text-[15px] font-medium truncate ${showStrike ? 'strike-through' : ''}`}
          style={{ color: showStrike ? undefined : 'var(--text-1)' }}>
          {task.title}
        </span>
        {!showStrike && task.dueDate && (
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[12px] flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
              <CalIcon size={11} />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          </div>
        )}
      </div>
      <div className="hover-reveal flex items-center gap-1">
        <button className="btn-icon w-7 h-7 rounded-full flex-shrink-0"
          style={{ border: '1px solid var(--border)' }}
          onClick={e => { e.stopPropagation(); onClick() }}>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
