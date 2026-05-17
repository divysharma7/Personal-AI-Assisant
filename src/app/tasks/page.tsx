'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List, Columns3, Grid2x2 } from 'lucide-react'
import TaskTree, { type TreeTask } from '@/components/tasks/TaskTree'
import KanbanView from '@/components/tasks/KanbanView'
import EisenhowerView from '@/components/tasks/EisenhowerView'
import QuickAddBar from '@/components/tasks/QuickAddBar'
import TaskDetailPage from '@/components/tasks/TaskDetailPage'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { quickFade } from '@/shared/design-system'

type ViewMode = 'list' | 'board' | 'matrix'

export default function TasksPage() {
  const [tasks, setTasks] = useState<TreeTask[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('list')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tasks')
      if (res.ok) {
        const data = await res.json()
        // Normalize tasks: ensure they have tree fields (parentId, depth, path, order)
        const normalized: TreeTask[] = data.map((t: Record<string, unknown>, idx: number) => ({
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
        setTasks(normalized)
      }
    } catch (e) {
      console.error('Failed to fetch tasks', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const handleStatusChange = useCallback(async (taskId: string, status: TreeTask['status']) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status } : t))
    )
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    } catch (e) {
      console.error('Failed to update task status', e)
      fetchTasks() // rollback
    }
  }, [fetchTasks])

  const handleTaskClick = useCallback((task: TreeTask) => {
    setSelectedTaskId(task._id)
  }, [])

  const handleTaskUpdate = useCallback(async (id: string, data: Partial<any>) => {
    // Optimistic update for title/status/priority in the list
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, ...data } : t))
    )
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } catch (e) {
      console.error('Failed to update task', e)
      fetchTasks()
    }
  }, [fetchTasks])

  const handleDetailClose = useCallback(() => {
    setSelectedTaskId(null)
  }, [])

  return (
    <main className="flex-1 flex flex-col overflow-hidden relative">
      <div className="flex-1 flex overflow-hidden">
        {/* Task list panel */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <h1 className="text-base font-bold" style={{ color: 'var(--text-1)' }}>
              Tasks
            </h1>

            <div className="flex items-center gap-1">
              {loading && (
                <div
                  className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin mr-2"
                  style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
                />
              )}

              {/* View switcher */}
              <div
                className="flex items-center rounded-xl p-0.5 gap-0.5"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}
              >
                <button
                  onClick={() => setView('list')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                    view !== 'list' && 'hover:opacity-80'
                  )}
                  style={
                    view === 'list'
                      ? { background: 'var(--accent)', color: '#fff' }
                      : { color: 'var(--text-2)' }
                  }
                >
                  <List size={13} />
                  List
                </button>
                <button
                  onClick={() => setView('board')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                    view !== 'board' && 'hover:opacity-80'
                  )}
                  style={
                    view === 'board'
                      ? { background: 'var(--accent)', color: '#fff' }
                      : { color: 'var(--text-2)' }
                  }
                >
                  <Columns3 size={13} />
                  Board
                </button>
                <button
                  onClick={() => setView('matrix')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                    view !== 'matrix' && 'hover:opacity-80'
                  )}
                  style={
                    view === 'matrix'
                      ? { background: 'var(--accent)', color: '#fff' }
                      : { color: 'var(--text-2)' }
                  }
                >
                  <Grid2x2 size={13} />
                  Matrix
                </button>
              </div>
            </div>
          </div>

          {/* Quick Add */}
          <div className="px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <QuickAddBar />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={quickFade}
              className="h-full"
            >
              {view === 'list' ? (
                <TaskTree
                  tasks={tasks}
                  onTaskClick={handleTaskClick}
                  onStatusChange={handleStatusChange}
                />
              ) : view === 'board' ? (
                <KanbanView
                  tasks={tasks}
                  onStatusChange={handleStatusChange}
                />
              ) : (
                <EisenhowerView
                  tasks={tasks}
                  onStatusChange={handleStatusChange}
                  onTaskClick={handleTaskClick}
                  onTaskUpdate={handleTaskUpdate}
                />
              )}
            </motion.div>
          </div>
        </div>

        {/* Task detail panel (desktop: side panel, mobile: full screen overlay) */}
        <AnimatePresence>
          {selectedTaskId && (
            <TaskDetailPage
              key={selectedTaskId}
              taskId={selectedTaskId}
              onClose={handleDetailClose}
              onUpdate={handleTaskUpdate}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
