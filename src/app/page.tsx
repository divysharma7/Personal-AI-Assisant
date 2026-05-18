'use client'
import { useState, useMemo, useEffect } from 'react'
import { Plus, Sparkles, Calendar as CalIcon, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import AddItemModal from '@/components/modals/AddItemModal'
import FloatingChat from '@/components/chat/FloatingChat'
import QuickAddBar from '@/components/tasks/QuickAddBar'
import AIBriefWidget from '@/components/dashboard/AIBriefWidget'
import HabitsWidget from '@/components/dashboard/HabitsWidget'
import { useItems } from '@/hooks/useItems'
import { isToday as dfIsToday, isPast as dfIsPast, format } from 'date-fns'
import type { AnyItem, Task, CalendarEvent, Reminder } from '@/types'

function useGreeting(): string {
  const h = new Date().getHours()
  if (h < 5)  return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

export default function DashboardPage() {
  const { items, loading, silentRefresh, addItem, updateItem } = useItems()
  const [modalOpen, setModalOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const greeting = useGreeting()

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.name) setUserName(data.name)
    }).catch(() => {})
  }, [])

  // Split items into sections
  const { overdue, todayTasks, todayEvents, upcoming } = useMemo(() => {
    const overdue: Task[] = []
    const todayTasks: Task[] = []
    const todayEvents: CalendarEvent[] = []
    const upcoming: AnyItem[] = []

    for (const item of items) {
      if (item.type === 'task') {
        const t = item as Task
        if (t.status === 'done') continue
        if (t.dueDate && dfIsPast(new Date(t.dueDate)) && !dfIsToday(new Date(t.dueDate))) {
          overdue.push(t)
        } else if (t.dueDate && dfIsToday(new Date(t.dueDate))) {
          todayTasks.push(t)
        } else if (!t.dueDate) {
          todayTasks.push(t) // no due date = inbox
        }
      } else if (item.type === 'event') {
        const e = item as CalendarEvent
        if (dfIsToday(new Date(e.startDate))) todayEvents.push(e)
      }
    }

    return { overdue, todayTasks, todayEvents, upcoming }
  }, [items])

  async function handleAddItem(type: AnyItem['type'], data: Record<string, unknown>) {
    await addItem(type, data as Parameters<typeof addItem>[1])
  }

  const handleToggleTask = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    await updateItem('task', task._id!, { status: newStatus } as Partial<AnyItem>)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      {/* Clean header */}
      <div className="px-8 pt-8 pb-2 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>
          {greeting}{userName ? `, ${userName}` : ''}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </div>

      {/* Quick Add */}
      <div className="px-8 py-3 flex-shrink-0">
        <QuickAddBar />
      </div>

      {/* Scrollable content — Today view */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        <div className="max-w-3xl space-y-6">

          {/* AI Brief */}
          <div className="rounded-xl p-4" style={{ background: 'var(--surface, var(--card))' }}>
            <AIBriefWidget items={items} />
          </div>

          {/* Overdue section */}
          {overdue.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={14} style={{ color: '#ef4444' }} />
                <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#ef4444' }}>
                  Overdue ({overdue.length})
                </h2>
              </div>
              <div className="space-y-px">
                {overdue.map(task => (
                  <TaskRow key={task._id} task={task} onToggle={() => handleToggleTask(task)} />
                ))}
              </div>
            </section>
          )}

          {/* Today's events */}
          {todayEvents.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <CalIcon size={14} style={{ color: 'var(--text-3)' }} />
                <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
                  Schedule
                </h2>
              </div>
              <div className="space-y-px">
                {todayEvents.map(event => (
                  <div
                    key={event._id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                    style={{ background: 'var(--surface, var(--card))' }}
                  >
                    <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>{event.title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                        {format(new Date(event.startDate), 'h:mm a')}
                        {event.endDate && ` – ${format(new Date(event.endDate), 'h:mm a')}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Today's tasks */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} style={{ color: 'var(--text-3)' }} />
                <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
                  Tasks ({todayTasks.length})
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md transition-colors"
                style={{ color: 'var(--accent)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-soft)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Plus size={12} /> Add
              </button>
            </div>
            {todayTasks.length > 0 ? (
              <div className="space-y-px">
                {todayTasks.map(task => (
                  <TaskRow key={task._id} task={task} onToggle={() => handleToggleTask(task)} />
                ))}
              </div>
            ) : (
              <p className="text-sm py-8 text-center" style={{ color: 'var(--text-3)' }}>
                Nothing for today. Enjoy the calm.
              </p>
            )}
          </section>

          {/* Habits strip */}
          <section>
            <div className="rounded-xl p-4" style={{ background: 'var(--surface, var(--card))' }}>
              <HabitsWidget />
            </div>
          </section>

          {/* Quick links */}
          <div className="flex gap-2 pb-4">
            {[
              { href: '/calendar', label: 'Calendar' },
              { href: '/journal', label: 'Journal' },
              { href: '/stats', label: 'Stats' },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{ background: 'var(--surface, var(--card))', color: 'var(--text-2)', border: '1px solid var(--border)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <AddItemModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAddItem} defaultType="task" />
      <FloatingChat onRefreshItems={silentRefresh} />
    </div>
  )
}

// Minimal task row — Superlist style
function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const done = task.status === 'done'
  const priorityColor = task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : 'var(--border)'

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group"
      style={{ minHeight: 44 }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface, var(--card))')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <button
        onClick={e => { e.stopPropagation(); onToggle() }}
        className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          border: `2px solid ${done ? 'var(--accent)' : priorityColor}`,
          background: done ? 'var(--accent)' : 'transparent',
        }}
      >
        {done && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span
        className="text-sm flex-1 min-w-0 truncate"
        style={{
          color: done ? 'var(--text-3)' : 'var(--text-1)',
          textDecoration: done ? 'line-through' : undefined,
        }}
      >
        {task.title}
      </span>
      {task.dueDate && (
        <span className="text-xs flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-3)' }}>
          {format(new Date(task.dueDate), 'MMM d')}
        </span>
      )}
    </div>
  )
}
