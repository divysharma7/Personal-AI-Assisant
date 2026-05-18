'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Flame, Check, X } from 'lucide-react'
import { useHabits, type Habit } from '@/hooks/useHabits'
import { snappy, smooth } from '@/shared/design-system'
import FloatingChat from '@/components/chat/FloatingChat'
import { useItems } from '@/hooks/useItems'

const HABIT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316']
const ICON_OPTIONS = [
  'Activity', 'Book', 'Brain', 'Coffee', 'Dumbbell', 'Heart', 'Leaf', 'Moon',
  'Music', 'Pen', 'Phone', 'Pill', 'Sunrise', 'Sparkles', 'Sun', 'Target',
  'Timer', 'Droplet', 'Wind', 'Zap', 'Circle',
]
const FREQ_LABELS: Record<string, string> = {
  daily: 'Every day', weekdays: 'Weekdays', weekly: 'Once a week', custom: 'Custom days',
}
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function HabitsPage() {
  const { habits, isLoading, createHabit, updateHabit, deleteHabit, toggleToday, weekCompletions, todayStr } = useHabits()
  const { silentRefresh } = useItems()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newFreq, setNewFreq] = useState<Habit['frequency']>('daily')
  const [newColor, setNewColor] = useState(HABIT_COLORS[0])
  const [newIcon, setNewIcon] = useState('Circle')
  const [newDays, setNewDays] = useState<number[]>([])

  async function handleCreate() {
    if (!newName.trim()) return
    await createHabit({
      name: newName.trim(),
      frequency: newFreq,
      color: newColor,
      icon: newIcon,
      customDays: newFreq === 'custom' ? newDays : undefined,
    })
    setNewName('')
    setShowAdd(false)
  }

  const today = todayStr()

  return (
    <>
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Habits</h1>
          <button onClick={() => setShowAdd(s => !s)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            <Plus size={13} /> Add Habit
          </button>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={smooth}
              className="overflow-hidden" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="px-8 py-4 space-y-3">
                <input className="input-field" placeholder="Habit name..." value={newName} onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()} autoFocus />
                <div className="flex items-center gap-2 flex-wrap">
                  <select className="input-field w-auto text-sm" value={newFreq} onChange={e => setNewFreq(e.target.value as Habit['frequency'])}>
                    {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  {newFreq === 'custom' && (
                    <div className="flex gap-1">
                      {DAY_LABELS.map((d, i) => (
                        <button key={i} onClick={() => setNewDays(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                          className="w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center"
                          style={newDays.includes(i) ? { background: newColor, color: '#fff' } : { background: 'var(--input-bg)', color: 'var(--text-3)' }}>
                          {d[0]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {HABIT_COLORS.map(c => (
                    <button key={c} onClick={() => setNewColor(c)} className="w-6 h-6 rounded-full transition-transform"
                      style={{ background: c, transform: newColor === c ? 'scale(1.3)' : 'scale(1)', border: newColor === c ? '2px solid #fff' : 'none' }} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCreate} className="btn-primary text-sm px-4 py-1.5">Create</button>
                  <button onClick={() => setShowAdd(false)} className="btn-ghost text-sm px-3 py-1.5">Cancel</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Habit list */}
        <div className="flex-1 overflow-auto px-8 py-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            </div>
          ) : habits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-sm" style={{ color: 'var(--text-3)' }}>No habits yet. Start building your routine.</p>
            </div>
          ) : (
            <AnimatePresence>
              {habits.map(habit => {
                const week = weekCompletions(habit)
                const doneToday = habit.completions.includes(today)
                return (
                  <motion.div key={habit._id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={snappy}
                    className="rounded-2xl p-4" style={{ background: 'var(--surface)' }}>
                    <div className="flex items-center gap-3">
                      {/* Toggle today */}
                      <button onClick={() => toggleToday(habit)} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ background: doneToday ? habit.color : 'transparent', border: `2px solid ${habit.color}` }}>
                        {doneToday && <Check size={14} color="#fff" strokeWidth={3} />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)' }}>{habit.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                          {FREQ_LABELS[habit.frequency]}
                          {habit.currentStreak > 0 && (
                            <span className="ml-2 inline-flex items-center gap-0.5">
                              <Flame size={10} style={{ color: '#f59e0b' }} /> {habit.currentStreak}d
                            </span>
                          )}
                        </p>
                      </div>

                      <button onClick={() => deleteHabit(habit._id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--text-3)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Weekly heatmap */}
                    <div className="flex gap-1 mt-3">
                      {week.map(d => (
                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full aspect-square rounded-md transition-colors"
                            style={{ background: d.completed ? habit.color : 'var(--surface-1)', opacity: d.completed ? 1 : 0.4 }} />
                          <span className="text-[10px]" style={{ color: d.isToday ? 'var(--accent)' : 'var(--text-3)', fontWeight: d.isToday ? 600 : 400 }}>
                            {d.day[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </main>
      <FloatingChat onRefreshItems={silentRefresh} />
    </>
  )
}
