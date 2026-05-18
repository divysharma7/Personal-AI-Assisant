'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List, Columns3, Grid2x2, Search, X, Sparkles, ExternalLink } from 'lucide-react'
import TaskTree, { type TreeTask } from '@/components/tasks/TaskTree'
import KanbanView from '@/components/tasks/KanbanView'
import EisenhowerView from '@/components/tasks/EisenhowerView'
import QuickAddBar from '@/components/tasks/QuickAddBar'
import TaskDetailPage from '@/components/tasks/TaskDetailPage'
import PullToRefresh from '@/components/shared/PullToRefresh'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { quickFade } from '@/shared/design-system'

type ViewMode = 'list' | 'board' | 'matrix'
type Filter = 'all' | 'upcoming' | 'done'

export default function TasksPage() {
  const [tasks, setTasks] = useState<TreeTask[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('list')
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [showTip, setShowTip] = useState(true)
  const isMobile = useMediaQuery('(max-width: 768px)')

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
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status } : t))
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    } catch { fetchTasks() }
  }, [fetchTasks])

  const handleTaskClick = useCallback((task: TreeTask) => { setSelectedTaskId(task._id) }, [])

  const handleTaskUpdate = useCallback(async (id: string, data: Partial<any>) => {
    setTasks(prev => prev.map(t => t._id === id ? { ...t, ...data } : t))
    try {
      await fetch(`/api/tasks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    } catch { fetchTasks() }
  }, [fetchTasks])

  const handleDelete = useCallback(async (taskId: string) => {
    setTasks(prev => prev.filter(t => t._id !== taskId))
    try { await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' }) } catch { fetchTasks() }
  }, [fetchTasks])

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (filter === 'done') return t.status === 'done'
    if (filter === 'upcoming') return t.status !== 'done' && t.dueDate
    return t.status !== 'done' // 'all' hides completed
  })

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'done', label: 'Marked as done' },
  ]

  return (
    <main className="flex-1 flex flex-col overflow-hidden relative">
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Superlist-style page content */}
          <PullToRefresh onRefresh={fetchTasks} className="flex-1 overflow-auto">
            <div className="px-8 md:px-10 py-8 md:py-10">

              {/* Title — huge, Superlist style */}
              <div className="flex items-center justify-between">
                <h1 className="text-[32px] md:text-[36px] font-bold" style={{ color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                  Tasks
                </h1>
                {/* View switcher — small icons top right */}
                <div className="flex items-center gap-0.5 rounded-lg p-0.5" style={{ background: 'var(--surface)' }}>
                  {([
                    { id: 'list' as ViewMode, icon: List },
                    { id: 'board' as ViewMode, icon: Columns3 },
                    { id: 'matrix' as ViewMode, icon: Grid2x2 },
                  ]).map(v => (
                    <button key={v.id} onClick={() => setView(v.id)}
                      className="p-1.5 rounded-md transition-colors"
                      style={view === v.id ? { background: 'var(--card)', color: 'var(--text-1)' } : { color: 'var(--text-3)' }}>
                      <v.icon size={14} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tip banner */}
              <AnimatePresence>
                {showTip && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }} className="mt-4">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px]"
                      style={{ background: 'var(--accent-soft)', color: 'var(--text-2)' }}>
                      <Sparkles size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      <span className="flex-1">View, sort, and access all of your tasks in one place</span>
                      <button onClick={() => setShowTip(false)} className="p-1 flex-shrink-0" style={{ color: 'var(--text-3)' }}>
                        <X size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Filter tabs — Superlist style pill buttons */}
              <div className="flex items-center gap-2 mt-5">
                <button className="p-2 rounded-lg" style={{ color: 'var(--text-3)' }}><Search size={15} /></button>
                {FILTERS.map(f => (
                  <button key={f.id} onClick={() => setFilter(f.id)}
                    className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-all"
                    style={filter === f.id
                      ? { background: 'var(--text-1)', color: 'var(--card)' }
                      : { color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Task list */}
              <div className="mt-4">
                <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={quickFade}>
                  {view === 'list' ? (
                    <TaskTree tasks={filteredTasks} onTaskClick={handleTaskClick} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                  ) : view === 'board' ? (
                    <KanbanView tasks={filteredTasks} onStatusChange={handleStatusChange} onTaskClick={handleTaskClick} />
                  ) : (
                    <EisenhowerView tasks={filteredTasks} onStatusChange={handleStatusChange} onTaskClick={handleTaskClick} onTaskUpdate={handleTaskUpdate} />
                  )}
                </motion.div>
              </div>

            </div>
          </PullToRefresh>
        </div>

        {/* Task detail — right panel */}
        <AnimatePresence>
          {selectedTaskId && (
            <TaskDetailPage key={selectedTaskId} taskId={selectedTaskId}
              onClose={() => setSelectedTaskId(null)} onUpdate={handleTaskUpdate} />
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
