'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List, Columns3, Grid2x2, Search, X, Sparkles, Plus, SlidersHorizontal, GripVertical } from 'lucide-react'
import TaskTree, { type TreeTask } from '@/components/tasks/TaskTree'
import KanbanView from '@/components/tasks/KanbanView'
import EisenhowerView from '@/components/tasks/EisenhowerView'
import TaskDetailPage from '@/components/tasks/TaskDetailPage'
import PullToRefresh from '@/components/shared/PullToRefresh'
import AddItemModal from '@/components/modals/AddItemModal'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { quickFade } from '@/shared/design-system'
import { format } from 'date-fns'
import type { AnyItem } from '@/types'

type ViewMode = 'list' | 'board' | 'matrix'
type Filter = 'me' | 'upcoming' | 'done'

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
  } catch {}
}

const PRIORITY_ICONS: Record<string, { color: string; bars: number }> = {
  high: { color: '#FF3B30', bars: 3 },
  medium: { color: '#FF9500', bars: 2 },
  low: { color: '#007AFF', bars: 1 },
}

function PriorityIcon({ priority }: { priority: string }) {
  const p = PRIORITY_ICONS[priority]
  if (!p) return null
  return (
    <div className="flex items-end gap-[1.5px] h-[14px]" title={priority}>
      {[1, 2, 3].map(i => (
        <div key={i} className="w-[3px] rounded-sm" style={{
          height: i === 1 ? 6 : i === 2 ? 9 : 13,
          background: i <= p.bars ? p.color : 'var(--border)',
        }} />
      ))}
    </div>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TreeTask[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('list')
  const [filter, setFilter] = useState<Filter>('me')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [showTip, setShowTip] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

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

  const handleTaskClick = useCallback((task: TreeTask) => { setSelectedTaskId(task._id) }, [])

  const handleTaskUpdate = useCallback(async (id: string, data: Partial<unknown>) => {
    setTasks(prev => prev.map(t => t._id === id ? { ...t, ...data } : t))
    try {
      await fetch(`/api/tasks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    } catch { fetchTasks() }
  }, [fetchTasks])

  const handleDelete = useCallback(async (taskId: string) => {
    setTasks(prev => prev.filter(t => t._id !== taskId))
    try { await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' }) } catch { fetchTasks() }
  }, [fetchTasks])

  async function handleAddItem(type: AnyItem['type'], data: Record<string, unknown>) {
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (res.ok) fetchTasks()
  }

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (filter === 'done') return t.status === 'done'
    if (filter === 'upcoming') return t.status !== 'done' && t.dueDate
    return t.status !== 'done'
  })

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'me', label: 'Tasks for me' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'done', label: 'Done' },
  ]

  return (
    <main className="flex-1 flex flex-col overflow-hidden relative">
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <PullToRefresh onRefresh={fetchTasks} className="flex-1 overflow-auto">
            <div className="px-8 md:px-10 py-8 md:py-10">

              {/* Top bar — Creation date + New task (like Superlist screenshot) */}
              <div className="flex items-center justify-end gap-2 mb-3">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium"
                  style={{ background: 'var(--surface)', color: 'var(--text-2)' }}>
                  <SlidersHorizontal size={12} /> Creation date
                </button>
                <button onClick={() => setModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium"
                  style={{ color: 'var(--text-2)' }}>
                  <Plus size={13} /> New task
                </button>
                {/* View switcher */}
                <div className="flex items-center gap-0.5 rounded-lg p-0.5 ml-1" style={{ background: 'var(--surface)' }}>
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

              {/* Title */}
              <h1 className="text-[36px] md:text-[42px] font-bold" style={{ color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Tasks
              </h1>

              {/* Tip banner */}
              <AnimatePresence>
                {showTip && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }} className="mt-4">
                    <div className="tip-banner">
                      <Sparkles size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      <span className="flex-1">View, sort, and access all of your tasks in one place</span>
                      <button className="p-1 flex-shrink-0" style={{ color: 'var(--text-3)' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M4 4L10 10M10 4L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                      <button onClick={() => setShowTip(false)} className="p-1 flex-shrink-0" style={{ color: 'var(--text-3)' }}>
                        <X size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Filter tabs — Superlist style */}
              <div className="flex items-center gap-2 mt-5">
                <button className="p-2 rounded-lg" style={{ color: 'var(--text-3)' }}><Search size={15} /></button>
                {FILTERS.map(f => (
                  <button key={f.id} onClick={() => setFilter(f.id)}
                    className={`pill-interactive ${filter === f.id ? 'active' : ''}`}>
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Task list */}
              <div className="mt-4">
                <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={quickFade}>
                  {view === 'list' ? (
                    filteredTasks.length > 0 ? (
                      <div className="space-y-px">
                        {filteredTasks.map(task => (
                          <SuperlistTaskRow key={task._id} task={task}
                            onToggle={() => handleStatusChange(task._id, task.status === 'done' ? 'todo' : 'done')}
                            onClick={() => handleTaskClick(task)} />
                        ))}
                      </div>
                    ) : (
                      <div className="py-16 text-center">
                        <p className="text-[14px]" style={{ color: 'var(--text-3)' }}>
                          {filter === 'done' ? 'No completed tasks yet.' : 'No tasks. Create one above.'}
                        </p>
                      </div>
                    )
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

        <AnimatePresence>
          {selectedTaskId && (
            <TaskDetailPage key={selectedTaskId} taskId={selectedTaskId}
              onClose={() => setSelectedTaskId(null)} onUpdate={handleTaskUpdate} />
          )}
        </AnimatePresence>
      </div>

      <AddItemModal open={modalOpen} onClose={() => setModalOpen(false)}
        onAdd={async (type, data) => { await handleAddItem(type, data as Record<string, unknown>); setModalOpen(false) }} defaultType="task" />
    </main>
  )
}

// ─── Superlist-style task row ────────────────────────────────────────────────
function SuperlistTaskRow({ task, onToggle, onClick }: { task: TreeTask; onToggle: () => void; onClick: () => void }) {
  const [justDone, setJustDone] = useState(false)
  const done = task.status === 'done'
  const showStrike = done || justDone

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!done) { setJustDone(true); playCompleteSound(); setTimeout(() => setJustDone(false), 600) }
    onToggle()
  }

  return (
    <div className="row-interactive flex items-start gap-2 py-3 px-1 group"
      style={{ minHeight: 48 }}
      onClick={onClick}>

      {/* Checkbox */}
      <button onClick={handleToggle}
        className={`checkbox-interactive mt-[3px] ${showStrike ? 'checked' : ''} ${justDone ? 'just-checked' : ''}`}
        style={{ '--checkbox-size': '20px', '--checkbox-complete-color': '#E85D40' } as React.CSSProperties}>
        {showStrike && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Priority icon */}
      {task.priority && task.priority !== 'medium' && (
        <div className="mt-[4px]"><PriorityIcon priority={task.priority} /></div>
      )}

      {/* Title + metadata */}
      <div className="flex-1 min-w-0">
        <span className={`text-[14px] ${showStrike ? 'strike-through' : ''}`} style={{
          color: showStrike ? undefined : 'var(--text-1)',
        }}>
          {task.title}
        </span>
        {/* Metadata below: due date + list name */}
        {!showStrike && (
          <div className="flex items-center gap-2 mt-0.5">
            {task.dueDate && (
              <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
                📅 {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="hover-reveal flex items-center gap-1 mt-[3px]">
        <button className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)', color: '#fff' }}
          onClick={e => { e.stopPropagation(); onClick() }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M3 5H7M7 5L5 3M7 5L5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
