'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Plus,
  MoreHorizontal,
  Flame,
  Zap,
  Check,
  Grid3X3,
  List,
  X,
  Calendar,
  BarChart3,
  Target,
} from 'lucide-react'
import { fadeSlideUp, fadeSlideDown, collapse, buttonPress, checkBounce, ease, scaleIn } from '@/lib/motion'
import { useHabits } from '@/hooks/useHabits'
import type { Habit } from '@/hooks/useHabits'
import HabitGallery from '@/components/habits/HabitGallery'
import HabitCreationWizard from '@/components/habits/HabitCreationWizard'
import type { HabitFormData } from '@/components/habits/HabitCreationWizard'
import HabitAnalytics from '@/components/habits/HabitAnalytics'
import { playCompletionSound } from '@/lib/sounds'

// ── Section definitions ──
const SECTIONS = ['Morning', 'Afternoon', 'Night', 'Others'] as const
type Section = (typeof SECTIONS)[number]

// Assign section based on habit name heuristics or default to Others
function getHabitSection(habit: Habit): Section {
  const name = habit.name.toLowerCase()
  if (/morning|wake|meditat|journal|stretch|yoga|breakfast/.test(name)) return 'Morning'
  if (/lunch|afternoon|walk|read|study|work/.test(name)) return 'Afternoon'
  if (/night|sleep|evening|dinner|relax|wind/.test(name)) return 'Night'
  return 'Others'
}

// ── Day strip helpers ──
function getLast7Days(): Date[] {
  const days: Date[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    days.push(d)
  }
  return days
}

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ── Mood emojis ──
const MOODS = ['😢', '😟', '😐', '😊', '🤩'] as const

export default function HabitsPage() {
  const { habits, isLoading, createHabit, toggleToday, weekCompletions, todayStr: getTodayStr } = useHabits()

  // UI state
  const [filter, setFilter] = useState<'active' | 'archived'>('active')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardPrefill, setWizardPrefill] = useState<{ title?: string; icon?: string; frequency?: string } | undefined>()
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  // Detail panel
  const [detailHabitId, setDetailHabitId] = useState<string | null>(null)

  // Check-in journal modal
  const [journalHabit, setJournalHabit] = useState<Habit | null>(null)
  const [journalMood, setJournalMood] = useState<number | null>(null)
  const [journalNote, setJournalNote] = useState('')

  const todayDateStr = getTodayStr()
  const last7Days = useMemo(() => getLast7Days(), [])

  const activeHabits = useMemo(
    () => habits.filter((h) => (filter === 'active' ? !h.archived : h.archived)),
    [habits, filter]
  )

  // Group habits by section
  const sectionGroups = useMemo(() => {
    const groups = new Map<Section, Habit[]>()
    for (const s of SECTIONS) groups.set(s, [])
    for (const h of activeHabits) {
      const section = getHabitSection(h)
      groups.get(section)!.push(h)
    }
    return groups
  }, [activeHabits])

  // Day completion stats for the day strip
  const dayCompletionStats = useMemo(() => {
    return last7Days.map((day) => {
      const key = formatDateKey(day)
      const scheduled = activeHabits.length
      const completed = activeHabits.filter((h) => h.completions.includes(key)).length
      return { date: day, key, scheduled, completed }
    })
  }, [last7Days, activeHabits])

  // Detail habit
  const detailHabit = detailHabitId ? habits.find((h) => h._id === detailHabitId) : null

  const handleToggleHabit = useCallback(
    async (habit: Habit) => {
      const isChecked = habit.completions.includes(todayDateStr)
      if (!isChecked) {
        playCompletionSound()
        // Open journal popup
        setJournalHabit(habit)
        setJournalMood(null)
        setJournalNote('')
      }
      await toggleToday(habit)
    },
    [todayDateStr, toggleToday]
  )

  const handleGalleryAdd = useCallback((habit: { icon: string; title: string; frequency: string }) => {
    setGalleryOpen(false)
    setWizardPrefill({ title: habit.title, icon: habit.icon, frequency: habit.frequency })
    setWizardOpen(true)
  }, [])

  const handleCreate = useCallback(
    async (data: HabitFormData) => {
      await createHabit({
        name: data.name,
        icon: data.icon,
        color: data.color,
        frequency: data.frequency === 'daily' ? 'daily' : data.frequency === 'weekly' ? 'weekly' : 'custom',
        customDays: data.weekdays,
        completions: [],
        currentStreak: 0,
        bestStreak: 0,
        archived: false,
        order: habits.length,
      })
    },
    [createHabit, habits.length]
  )

  const toggleSection = useCallback((section: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }, [])

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex flex-1 flex-col px-6 py-5 overflow-y-auto">
        {/* Header bar */}
        <div className="mb-4 flex items-center justify-between">
          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              className="flex items-center gap-1 text-sm font-semibold cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
            >
              Habit
              <ChevronDown size={14} strokeWidth={1.5} />
            </button>
            <AnimatePresence>
              {filterMenuOpen && (
                <motion.div
                  {...fadeSlideDown}
                  transition={ease.normal}
                  className="absolute left-0 top-full z-50 mt-1 w-[140px] rounded-[var(--radius-lg,16px)] py-1"
                  style={{
                    backgroundColor: 'var(--bg-pane)',
                    border: '1px solid var(--overlay-2, var(--border))',
                    boxShadow: 'var(--shadow-elevated)',
                  }}
                >
                  {(['active', 'archived'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setFilter(opt); setFilterMenuOpen(false) }}
                      className="flex w-full items-center px-3 py-1.5 text-[13px] font-medium transition-sl cursor-pointer capitalize"
                      style={{ color: filter === opt ? 'var(--accent)' : 'var(--text-primary)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      {opt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <motion.button
              {...buttonPress}
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer transition-sl"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              {viewMode === 'list' ? <Grid3X3 size={16} strokeWidth={1.5} /> : <List size={16} strokeWidth={1.5} />}
            </motion.button>
            <motion.button
              {...buttonPress}
              onClick={() => { setWizardPrefill(undefined); setWizardOpen(true) }}
              className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer transition-sl"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <Plus size={18} strokeWidth={1.5} />
            </motion.button>
            <div className="relative">
              <motion.button
                {...buttonPress}
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer transition-sl"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <MoreHorizontal size={16} strokeWidth={1.5} />
              </motion.button>
              <AnimatePresence>
                {moreMenuOpen && (
                  <motion.div
                    {...fadeSlideDown}
                    transition={ease.normal}
                    className="absolute right-0 top-full z-50 mt-1 w-[140px] rounded-[var(--radius-lg,16px)] py-1"
                    style={{ backgroundColor: 'var(--bg-pane)', border: '1px solid var(--overlay-2, var(--border))', boxShadow: 'var(--shadow-elevated)' }}
                  >
                    <button
                      onClick={() => { setAnalyticsOpen(!analyticsOpen); setMoreMenuOpen(false) }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-[13px] font-medium transition-sl cursor-pointer"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      <BarChart3 size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                      Analytics
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Day strip — last 7 days */}
        <div className="mb-5 flex items-center gap-1 justify-center">
          {dayCompletionStats.map(({ date, key, scheduled, completed }) => {
            const isToday = key === todayDateStr
            const isSelected = selectedDay === key
            const ratio = scheduled > 0 ? completed / scheduled : 0
            const allDone = ratio >= 1
            return (
              <button
                key={key}
                onClick={() => setSelectedDay(isSelected ? null : key)}
                className="flex flex-col items-center gap-1 rounded-lg px-2.5 py-1.5 cursor-pointer transition-sl"
                style={{
                  backgroundColor: isSelected ? 'var(--overlay-2, var(--bg-hover))' : 'transparent',
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>
                  {WEEKDAY_SHORT[date.getDay()]} {date.getDate()}
                </span>
                {/* Completion arc/circle */}
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{
                    border: isToday ? '2px solid var(--accent)' : '2px solid var(--overlay-3, var(--border))',
                    backgroundColor: allDone ? 'var(--accent)' : 'transparent',
                    background: !allDone && ratio > 0
                      ? `conic-gradient(var(--accent) ${ratio * 360}deg, transparent ${ratio * 360}deg)`
                      : undefined,
                  }}
                >
                  {allDone && <Check size={14} strokeWidth={2.5} className="text-white" />}
                </div>
              </button>
            )
          })}
          {selectedDay && (
            <button
              onClick={() => setSelectedDay(null)}
              className="flex items-center gap-1 ml-2 rounded-full px-2.5 py-1 text-[11px] font-medium cursor-pointer transition-sl"
              style={{ backgroundColor: 'var(--overlay-2, var(--bg-hover))', color: 'var(--text-muted)' }}
            >
              {selectedDay} <X size={10} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Habit list grouped by section */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : activeHabits.length === 0 ? (
          <motion.div {...fadeSlideUp} transition={ease.normal} className="flex flex-col items-center justify-center py-20 text-center">
            <Flame size={48} strokeWidth={1} style={{ color: 'var(--text-faint)', opacity: 0.3 }} />
            <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>No habits yet</h3>
            <p className="mt-1 max-w-xs text-sm" style={{ color: 'var(--text-muted)' }}>Start building your routine.</p>
            <div className="mt-5 flex items-center gap-3">
              <motion.button {...buttonPress} onClick={() => setGalleryOpen(true)} className="rounded-full px-5 py-2.5 text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: 'var(--accent)' }}>
                Browse Gallery
              </motion.button>
              <motion.button {...buttonPress} onClick={() => { setWizardPrefill(undefined); setWizardOpen(true) }} className="rounded-full px-5 py-2.5 text-sm font-semibold cursor-pointer" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                Create Custom
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-1">
            {SECTIONS.map((section) => {
              const sectionHabits = sectionGroups.get(section) || []
              if (sectionHabits.length === 0) return null
              const isOpen = !collapsedSections.has(section)

              return (
                <div key={section} className="mb-3">
                  <button
                    onClick={() => toggleSection(section)}
                    className="mb-1 flex items-center gap-2 px-1 py-1 cursor-pointer"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={ease.fast}>
                      <ChevronDown size={14} strokeWidth={1.5} />
                    </motion.div>
                    <span className="text-[13px] font-semibold">{section}</span>
                    <span className="rounded-full px-1.5 py-0.5 text-[11px] font-medium" style={{ backgroundColor: 'var(--overlay-2, var(--bg-hover))', color: 'var(--text-faint)' }}>
                      {sectionHabits.length}
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div {...collapse} transition={ease.normal} className="flex flex-col gap-0.5 overflow-hidden">
                        {sectionHabits.map((habit) => {
                          const isChecked = habit.completions.includes(todayDateStr)
                          const totalCheckins = habit.completions.length
                          return (
                            <div
                              key={habit._id}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-sl"
                              style={{ backgroundColor: 'transparent' }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                              onClick={() => setDetailHabitId(habit._id)}
                            >
                              {/* Icon */}
                              <div
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-base"
                                style={{ backgroundColor: `${habit.color}20` }}
                              >
                                {habit.icon}
                              </div>

                              {/* Name + stats */}
                              <div className="flex-1 min-w-0">
                                <span
                                  className="text-[14px] font-semibold truncate block"
                                  style={{
                                    color: isChecked ? 'var(--text-faint)' : 'var(--text-primary)',
                                    textDecoration: isChecked ? 'line-through' : 'none',
                                    textDecorationColor: 'var(--accent)',
                                  }}
                                >
                                  {habit.name}
                                </span>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-faint)' }}>
                                    <Zap size={10} strokeWidth={1.5} />
                                    {totalCheckins} {totalCheckins === 1 ? 'Day' : 'Days'}
                                  </span>
                                  <span className="flex items-center gap-1 text-[11px]" style={{ color: habit.currentStreak > 0 ? '#FF4D3D' : 'var(--text-faint)' }}>
                                    <Flame size={10} strokeWidth={1.5} />
                                    {habit.currentStreak} {habit.currentStreak === 1 ? 'Day' : 'Days'}
                                  </span>
                                </div>
                              </div>

                              {/* Check button */}
                              <motion.button
                                {...buttonPress}
                                onClick={(e) => { e.stopPropagation(); handleToggleHabit(habit) }}
                                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full cursor-pointer"
                                style={{
                                  border: isChecked ? 'none' : '2px solid var(--overlay-3, var(--text-faint))',
                                  backgroundColor: isChecked ? 'var(--accent)' : 'transparent',
                                  transition: 'background-color 150ms, border-color 150ms',
                                }}
                              >
                                <AnimatePresence>
                                  {isChecked && (
                                    <motion.div initial={checkBounce.initial} animate={checkBounce.checked}>
                                      <Check size={14} strokeWidth={2.5} className="text-white" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.button>
                            </div>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}

        {/* Analytics */}
        <AnimatePresence>
          {analyticsOpen && activeHabits.length > 0 && (
            <motion.div {...collapse} transition={ease.normal} className="mt-6 overflow-hidden">
              <HabitAnalytics habits={activeHabits} weekCompletions={weekCompletions} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail panel (right side) */}
      <AnimatePresence>
        {detailHabit && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="flex-shrink-0 overflow-hidden"
            style={{ borderLeft: '1px solid var(--border)', backgroundColor: 'var(--bg-pane)' }}
          >
            <div className="flex flex-col h-full overflow-y-auto p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-base" style={{ backgroundColor: `${detailHabit.color}20` }}>
                    {detailHabit.icon}
                  </div>
                  <h3 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>{detailHabit.name}</h3>
                </div>
                <button onClick={() => setDetailHabitId(null)} className="flex h-6 w-6 items-center justify-center rounded-md cursor-pointer transition-sl" style={{ color: 'var(--text-muted)' }}>
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: 'Total Check-Ins', value: detailHabit.completions.length, icon: <Zap size={14} /> },
                  { label: 'Current Streak', value: detailHabit.currentStreak, icon: <Flame size={14} style={{ color: '#FF4D3D' }} /> },
                  { label: 'Best Streak', value: detailHabit.bestStreak, icon: <Target size={14} /> },
                  { label: 'Frequency', value: detailHabit.frequency, icon: <Calendar size={14} /> },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg p-3" style={{ backgroundColor: 'var(--overlay-1, var(--bg-pane-2))' }}>
                    <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--text-faint)' }}>
                      {stat.icon}
                      <span className="text-[11px] font-medium">{stat.label}</span>
                    </div>
                    <span className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>
                      {typeof stat.value === 'number' ? stat.value : stat.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mini calendar */}
              <div className="mb-4">
                <h4 className="text-[13px] font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>This Month</h4>
                <HabitMiniCalendar habit={detailHabit} />
              </div>

              {/* Recent logs */}
              <div>
                <h4 className="text-[13px] font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Recent Activity</h4>
                <div className="flex flex-col gap-1">
                  {detailHabit.completions.slice(-5).reverse().map((dateStr) => (
                    <div key={dateStr} className="flex items-center gap-2 rounded-md px-2 py-1.5" style={{ backgroundColor: 'var(--overlay-1, var(--bg-pane-2))' }}>
                      <Check size={12} strokeWidth={2} style={{ color: 'var(--accent)' }} />
                      <span className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>{dateStr}</span>
                    </div>
                  ))}
                  {detailHabit.completions.length === 0 && (
                    <p className="text-[12px] py-2" style={{ color: 'var(--text-faint)' }}>No check-ins yet</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Check-in journal modal */}
      <AnimatePresence>
        {journalHabit && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setJournalHabit(null)}
          >
            <motion.div
              {...scaleIn}
              transition={ease.slow}
              className="w-[340px] rounded-[var(--radius-xl,20px)] overflow-hidden"
              style={{ backgroundColor: 'var(--bg-pane)', border: '1px solid var(--overlay-2, var(--border))', boxShadow: 'var(--shadow-modal)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-base" style={{ backgroundColor: `${journalHabit.color}20` }}>
                    {journalHabit.icon}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{journalHabit.name}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>

                {/* Mood selector */}
                <p className="text-[13px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>How are you feeling?</p>
                <div className="flex items-center justify-center gap-3 mb-4">
                  {MOODS.map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => setJournalMood(i)}
                      className="text-2xl cursor-pointer transition-transform"
                      style={{
                        transform: journalMood === i ? 'scale(1.3)' : 'scale(1)',
                        opacity: journalMood === null || journalMood === i ? 1 : 0.4,
                        filter: journalMood === i ? 'none' : 'grayscale(0.5)',
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Note */}
                <textarea
                  value={journalNote}
                  onChange={(e) => setJournalNote(e.target.value)}
                  placeholder="Checked-in! What do you have in mind?"
                  className="w-full rounded-lg px-3 py-2 text-[13px] outline-none resize-none"
                  rows={3}
                  style={{
                    backgroundColor: 'var(--overlay-1, var(--bg-pane-2))',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mt-4">
                  <button onClick={() => setJournalHabit(null)} className="rounded-lg px-4 py-1.5 text-[13px] font-medium cursor-pointer transition-sl" style={{ color: 'var(--text-muted)' }}>
                    Cancel
                  </button>
                  <button
                    onClick={() => setJournalHabit(null)}
                    className="rounded-lg px-4 py-1.5 text-[13px] font-medium text-white cursor-pointer"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gallery + Wizard modals */}
      <HabitGallery open={galleryOpen} onClose={() => setGalleryOpen(false)} onAdd={handleGalleryAdd} />
      <HabitCreationWizard open={wizardOpen} onClose={() => setWizardOpen(false)} onCreate={handleCreate} prefill={wizardPrefill} />
    </div>
  )
}

/** Mini calendar for habit detail panel showing this month's completions */
function HabitMiniCalendar({ habit }: { habit: Habit }) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDow = new Date(year, month, 1).getDay()
  const todayDate = now.getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      <div className="grid grid-cols-7 gap-0 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className="text-center text-[10px] font-medium py-0.5" style={{ color: 'var(--text-faint)' }}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="h-7" />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const completed = habit.completions.includes(dateStr)
          const isToday = day === todayDate

          return (
            <div
              key={dateStr}
              className="flex h-7 w-full items-center justify-center"
            >
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-[11px]"
                style={{
                  backgroundColor: completed ? 'var(--accent)' : 'transparent',
                  color: completed ? '#fff' : isToday ? 'var(--accent)' : 'var(--text-primary)',
                  fontWeight: isToday ? 700 : 400,
                  border: isToday && !completed ? '1.5px solid var(--accent)' : 'none',
                }}
              >
                {completed ? <Check size={12} strokeWidth={2.5} /> : day}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
