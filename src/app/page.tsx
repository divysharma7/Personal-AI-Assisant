'use client'
import { useState, useMemo, useEffect } from 'react'
import { Plus, Sparkles, Calendar as CalIcon, AlertCircle, X, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import AddItemModal from '@/components/modals/AddItemModal'
import FloatingChat from '@/components/chat/FloatingChat'
import AIBriefWidget from '@/components/dashboard/AIBriefWidget'
import HabitsWidget from '@/components/dashboard/HabitsWidget'
import { useItems } from '@/hooks/useItems'
import { snappy } from '@/shared/design-system'
import { isToday as dfIsToday, isPast as dfIsPast, format } from 'date-fns'
import type { AnyItem, Task, CalendarEvent } from '@/types'

export default function InboxPage() {
  const { items, loading, silentRefresh, addItem, updateItem } = useItems()
  const [modalOpen, setModalOpen] = useState(false)
  const [showTip, setShowTip] = useState(true)

  const { overdue, todayTasks, todayEvents, inboxTasks } = useMemo(() => {
    const overdue: Task[] = []
    const todayTasks: Task[] = []
    const todayEvents: CalendarEvent[] = []
    const inboxTasks: Task[] = []

    for (const item of items) {
      if (item.type === 'task') {
        const t = item as Task
        if (t.status === 'done') continue
        if (t.dueDate && dfIsPast(new Date(t.dueDate)) && !dfIsToday(new Date(t.dueDate))) {
          overdue.push(t)
        } else if (t.dueDate && dfIsToday(new Date(t.dueDate))) {
          todayTasks.push(t)
        } else {
          inboxTasks.push(t)
        }
      } else if (item.type === 'event') {
        const e = item as CalendarEvent
        if (dfIsToday(new Date(e.startDate))) todayEvents.push(e)
      }
    }
    return { overdue, todayTasks, todayEvents, inboxTasks }
  }, [items])

  const handleToggle = async (task: Task) => {
    await updateItem('task', task._id!, { status: task.status === 'done' ? 'todo' : 'done' } as Partial<AnyItem>)
  }

  async function handleAddItem(type: AnyItem['type'], data: Record<string, unknown>) {
    await addItem(type, data as Parameters<typeof addItem>[1])
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Page content — scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="px-8 md:px-10 py-8 md:py-10">

          {/* Page title — Superlist style: huge, bold */}
          <h1 className="text-[32px] md:text-[36px] font-bold" style={{ color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Inbox
          </h1>

          {/* Tip banner — dismissable, like Superlist's blue info bars */}
          <AnimatePresence>
            {showTip && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="mt-4"
              >
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px]"
                  style={{ background: 'var(--accent-soft)', color: 'var(--text-2)' }}
                >
                  <Sparkles size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span className="flex-1">Your intelligent life manager — tasks, calendar, habits, focus, and AI all in one place.</span>
                  <button onClick={() => setShowTip(false)} className="p-1 flex-shrink-0" style={{ color: 'var(--text-3)' }}>
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Brief */}
          <div className="mt-6 rounded-2xl p-5" style={{ background: 'var(--surface, var(--bg))' }}>
            <AIBriefWidget items={items} />
          </div>

          {/* Inline new task — Superlist style */}
          <div className="mt-6">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[14px] transition-colors text-left"
              style={{ color: 'var(--text-3)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-overlay, rgba(0,0,0,0.02))')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="w-[20px] h-[20px] rounded-full flex-shrink-0" style={{ border: '2px solid var(--border)' }} />
              <span>Add a task, or press <kbd className="px-1.5 py-0.5 rounded text-[11px] font-mono" style={{ background: 'var(--surface)', color: 'var(--text-3)' }}>^N</kbd></span>
            </button>
          </div>

          {/* Overdue */}
          {overdue.length > 0 && (
            <section className="mt-6">
              <div className="flex items-center gap-2 mb-2 px-1">
                <AlertCircle size={13} style={{ color: '#FF3B30' }} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: '#FF3B30' }}>
                  Overdue
                </span>
              </div>
              {overdue.map(task => (
                <TaskRow key={task._id} task={task} onToggle={() => handleToggle(task)} />
              ))}
            </section>
          )}

          {/* Today's events */}
          {todayEvents.length > 0 && (
            <section className="mt-6">
              <div className="flex items-center gap-2 mb-2 px-1">
                <CalIcon size={13} style={{ color: 'var(--text-3)' }} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-3)' }}>
                  Schedule
                </span>
              </div>
              {todayEvents.map(event => (
                <div key={event._id} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-overlay, rgba(0,0,0,0.02))')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium truncate" style={{ color: 'var(--text-1)' }}>{event.title}</p>
                    <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
                      {format(new Date(event.startDate), 'h:mm a')}
                      {event.endDate && ` – ${format(new Date(event.endDate), 'h:mm a')}`}
                    </p>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Today's tasks */}
          {todayTasks.length > 0 && (
            <section className="mt-6">
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-3)' }}>
                  Due today
                </span>
              </div>
              {todayTasks.map(task => (
                <TaskRow key={task._id} task={task} onToggle={() => handleToggle(task)} />
              ))}
            </section>
          )}

          {/* Inbox tasks (no due date) */}
          {inboxTasks.length > 0 && (
            <section className="mt-4">
              {inboxTasks.map(task => (
                <TaskRow key={task._id} task={task} onToggle={() => handleToggle(task)} />
              ))}
            </section>
          )}

          {/* Empty state */}
          {!loading && overdue.length === 0 && todayTasks.length === 0 && inboxTasks.length === 0 && todayEvents.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-[14px]" style={{ color: 'var(--text-3)' }}>Nothing here yet. Add your first task above.</p>
            </div>
          )}

          {/* Habits strip */}
          <section className="mt-8">
            <div className="rounded-2xl p-5" style={{ background: 'var(--surface, var(--bg))' }}>
              <HabitsWidget />
            </div>
          </section>

        </div>
      </div>

      <AddItemModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAddItem} defaultType="task" />
      <FloatingChat onRefreshItems={silentRefresh} />
    </div>
  )
}

// ─── Completion sound — varies each time like Superlist ─────────────────────
const COMPLETION_TONES = [
  { freq: 880, freq2: 1320 },  // A5 + E6
  { freq: 784, freq2: 1175 },  // G5 + D6
  { freq: 660, freq2: 990 },   // E5 + B5
  { freq: 740, freq2: 1109 },  // F#5 + C#6
  { freq: 830, freq2: 1245 },  // Ab5 + Eb6
]

function playCompletionSound() {
  if (typeof window === 'undefined') return
  try {
    const ctx = new AudioContext()
    const tone = COMPLETION_TONES[Math.floor(Math.random() * COMPLETION_TONES.length)]
    const t = ctx.currentTime

    // Two-note chime with quick decay
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.value = tone.freq
    osc2.type = 'sine'
    osc2.frequency.value = tone.freq2

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    gain.gain.setValueAtTime(0.12, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)

    osc1.start(t)
    osc2.start(t + 0.05)
    osc1.stop(t + 0.4)
    osc2.stop(t + 0.45)
  } catch {}
}

// ─── Task Row — Superlist style ──────────────────────────────────────────────
function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const [justCompleted, setJustCompleted] = useState(false)
  const done = task.status === 'done'
  const isOverdue = task.dueDate && dfIsPast(new Date(task.dueDate)) && !dfIsToday(new Date(task.dueDate))

  const handleToggle = () => {
    if (!done) {
      setJustCompleted(true)
      playCompletionSound()
      setTimeout(() => setJustCompleted(false), 600)
    }
    onToggle()
  }

  const showStrike = done || justCompleted

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-xl transition-colors group"
      style={{ minHeight: 48 }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-overlay, rgba(0,0,0,0.02))')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Checkbox — Superlist style: round, fills red-orange on complete */}
      <button
        onClick={e => { e.stopPropagation(); handleToggle() }}
        className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 mt-[1px]"
        style={{
          border: showStrike ? 'none' : '2px solid var(--text-3)',
          background: showStrike ? '#E85D40' : 'transparent',
          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: justCompleted ? 'scale(1.15)' : 'scale(1)',
        }}
      >
        {showStrike && (
          <svg width="11" height="11" viewBox="0 0 10 10" fill="none"
            style={{ opacity: justCompleted ? 0 : 1, transition: 'opacity 0.15s', animationDelay: '0.1s' }}>
            <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        {/* Title with animated strikethrough */}
        <p
          className="text-[14px] leading-snug relative"
          style={{
            color: showStrike ? 'var(--text-3)' : 'var(--text-1)',
            transition: 'color 0.3s ease',
          }}
        >
          <span style={{
            textDecoration: showStrike ? 'line-through' : 'none',
            textDecorationColor: showStrike ? '#E85D40' : 'transparent',
            textDecorationThickness: '2px',
            transition: 'text-decoration-color 0.3s ease',
          }}>
            {task.title}
          </span>
        </p>
        {/* Metadata line */}
        {(task.dueDate || task.priority === 'high') && !showStrike && (
          <div className="flex items-center gap-2 mt-1">
            {task.dueDate && (
              <span className="text-[11px] flex items-center gap-1" style={{ color: isOverdue ? '#FF3B30' : 'var(--text-3)' }}>
                📅 {format(new Date(task.dueDate), 'MMM d, h:mm a')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right side actions — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ color: 'var(--text-3)' }}>
          ≡
        </div>
      </div>
    </div>
  )
}
