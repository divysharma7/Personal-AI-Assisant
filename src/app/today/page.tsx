'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, GripVertical, X, CalendarDays, Sparkles } from 'lucide-react'
import { useItems } from '@/hooks/useItems'
import { isToday as dfIsToday, isPast as dfIsPast, isTomorrow as dfIsTomorrow, format, addDays } from 'date-fns'
import { snappy } from '@/shared/design-system'
import FloatingChat from '@/components/chat/FloatingChat'
import AddItemModal from '@/components/modals/AddItemModal'
import type { AnyItem, Task, CalendarEvent } from '@/types'

// Completion sounds — random two-note chimes like Superlist
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
  high:   { color: '#FF3B30', bars: 3 },
  medium: { color: '#FF9500', bars: 2 },
  low:    { color: '#007AFF', bars: 1 },
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

interface TaskGroup {
  label: string
  tasks: Task[]
}

export default function TodayPage() {
  const { items, loading, silentRefresh, updateItem, addItem } = useItems()
  const [showTip, setShowTip] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label); else next.add(label)
      return next
    })
  }

  // Group tasks by date section
  const groups: TaskGroup[] = useMemo(() => {
    const overdue: Task[] = []
    const today: Task[] = []
    const tomorrow: Task[] = []

    for (const item of items) {
      if (item.type !== 'task') continue
      const t = item as Task
      if (t.status === 'done') continue
      if (!t.dueDate) continue
      const d = new Date(t.dueDate)
      if (dfIsPast(d) && !dfIsToday(d)) overdue.push(t)
      else if (dfIsToday(d)) today.push(t)
      else if (dfIsTomorrow(d)) tomorrow.push(t)
    }

    const result: TaskGroup[] = []
    if (overdue.length) result.push({ label: 'Overdue', tasks: overdue })
    if (today.length) result.push({ label: 'Today', tasks: today })
    if (tomorrow.length) result.push({ label: 'Tomorrow', tasks: tomorrow })
    return result
  }, [items])

  const handleToggle = useCallback(async (task: Task) => {
    if (task.status !== 'done') playCompleteSound()
    await updateItem('task', task._id!, { status: task.status === 'done' ? 'todo' : 'done' } as Partial<AnyItem>)
  }, [updateItem])

  async function handleAddItem(type: AnyItem['type'], data: Record<string, unknown>) {
    await addItem(type, data as Parameters<typeof addItem>[1])
  }

  const totalToday = groups.reduce((s, g) => s + g.tasks.length, 0)

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="px-8 md:px-10 py-8 md:py-10">

          {/* Top right: Due date filter + menu */}
          <div className="flex items-center justify-between mb-2">
            <div />
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium"
                style={{ background: 'var(--surface)', color: 'var(--text-2)' }}>
                <CalendarDays size={13} /> Due date
              </button>
              <button className="p-1.5 rounded-lg" style={{ color: 'var(--text-3)' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="8" cy="3" r="1.2" /><circle cx="8" cy="8" r="1.2" /><circle cx="8" cy="13" r="1.2" />
                </svg>
              </button>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-[36px] md:text-[42px] font-bold" style={{ color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Today
          </h1>

          {/* Tip banner */}
          <AnimatePresence>
            {showTip && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }} className="mt-5">
                <div className="rounded-xl px-4 py-3 text-[13px]" style={{ background: 'var(--surface)', color: 'var(--text-2)', border: '1px dashed var(--border)' }}>
                  <p>See your schedule, track habits, and focus on what matters today.</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium"
                      style={{ background: 'var(--card)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                      <CalendarDays size={12} /> Add my calendar
                    </button>
                    <button onClick={() => setShowTip(false)} className="px-3 py-1.5 rounded-full text-[12px] font-medium"
                      style={{ color: 'var(--text-3)' }}>
                      No thanks
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* New task inline */}
          <div className="mt-6">
            <button onClick={() => setModalOpen(true)}
              className="flex items-center gap-3 w-full px-1 py-2 text-[14px] text-left transition-colors"
              style={{ color: 'var(--text-3)' }}>
              <div className="w-[20px] h-[20px] rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border: '1.5px solid var(--text-3)' }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 2V8M2 5H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span>New task <kbd className="ml-1 px-1 py-0.5 rounded text-[10px] font-mono" style={{ background: 'var(--surface)', color: 'var(--text-3)' }}>^N</kbd></span>
            </button>
          </div>

          {/* Task groups */}
          <div className="mt-4 space-y-2">
            {groups.map(group => {
              const collapsed = collapsedGroups.has(group.label)
              return (
                <div key={group.label}>
                  {/* Group header — collapsible */}
                  <button onClick={() => toggleGroup(group.label)}
                    className="flex items-center gap-1.5 py-2 px-1 w-full text-left">
                    <motion.div animate={{ rotate: collapsed ? -90 : 0 }} transition={snappy}>
                      <ChevronDown size={14} style={{ color: 'var(--text-2)' }} />
                    </motion.div>
                    <span className="text-[14px] font-semibold" style={{ color: group.label === 'Overdue' ? '#FF3B30' : 'var(--text-1)' }}>
                      {group.label}
                    </span>
                  </button>

                  {/* Tasks */}
                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} style={{ overflow: 'hidden' }}>
                        {group.tasks.map(task => (
                          <TodayTaskRow key={task._id} task={task} onToggle={() => handleToggle(task)} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          {/* Empty state */}
          {!loading && groups.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-[14px]" style={{ color: 'var(--text-3)' }}>
                Nothing scheduled for today. Enjoy the calm.
              </p>
            </div>
          )}

        </div>
      </div>

      <AddItemModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAddItem} defaultType="task" />
      <FloatingChat onRefreshItems={silentRefresh} />
    </div>
  )
}

// ─── Today Task Row — matches Superlist's Today view exactly ─────────────────
function TodayTaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const [justDone, setJustDone] = useState(false)
  const done = task.status === 'done'
  const showStrike = done || justDone

  const handleClick = () => {
    if (!done) { setJustDone(true); setTimeout(() => setJustDone(false), 600) }
    onToggle()
  }

  return (
    <div className="row-interactive flex items-center gap-2 py-2.5 px-1 group"
      style={{ minHeight: 44 }}>

      {/* Drag handle — visible on hover */}
      <div className="drag-handle w-4 flex items-center justify-center">
        <GripVertical size={12} />
      </div>

      {/* Checkbox */}
      <button onClick={handleClick}
        className={`checkbox-interactive ${showStrike ? 'checked' : ''} ${justDone ? 'just-checked' : ''}`}
        style={{ '--checkbox-size': '20px', '--checkbox-complete-color': '#E85D40' } as React.CSSProperties}>
        {showStrike && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Priority icon */}
      {task.priority && task.priority !== 'medium' && (
        <PriorityIcon priority={task.priority} />
      )}

      {/* Title + metadata */}
      <div className="flex-1 min-w-0">
        <span className={`text-[14px] ${showStrike ? 'strike-through' : ''}`} style={{
          color: showStrike ? undefined : 'var(--text-1)',
        }}>
          {task.title}
        </span>
        {/* Metadata: due date + list name */}
        {!showStrike && (
          <div className="flex items-center gap-2 mt-0.5">
            {task.dueDate && (
              <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
                📅 {dfIsToday(new Date(task.dueDate)) ? 'Today' : format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right actions — arrow on hover */}
      <div className="hover-reveal flex items-center gap-1">
        <button className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)', color: '#fff' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M3 5H7M7 5L5 3M7 5L5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
