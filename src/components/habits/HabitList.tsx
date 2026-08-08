'use client'

import {
  Archive,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock3,
  Crosshair,
  Grid2X2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { addDays, format, isSameDay, startOfWeek } from 'date-fns'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Habit } from '@/hooks/useHabits'
import { playCompletionSound } from '@/lib/sounds'
import './habit-list.css'

interface HabitListProps {
  habits: Habit[]
  selectedId: string | null
  onSelect: (id: string) => void
  filter: 'active' | 'archived'
  onFilterChange: (filter: 'active' | 'archived') => void
  onCreateClick: () => void
  onMoreClick: () => void
  isLoading: boolean
  onToggleDate: (habit: Habit, date: string) => void
  onEdit: (habit: Habit) => void
  onArchive: (habit: Habit) => void
  onDelete: (habit: Habit) => void
  onStartFocus: (habit: Habit, mode: 'POMO' | 'STOPWATCH') => void
}

type HabitSection = 'Morning' | 'Night' | 'Others'

function sectionForHabit(habit: Habit): HabitSection {
  const value = `${habit.name} ${habit.description ?? ''}`.toLowerCase()
  if (/morning|meditat|journal|wake|sunrise/.test(value)) return 'Morning'
  if (/night|sleep|bed|daily check|reflect|wind down/.test(value)) return 'Night'
  return 'Others'
}

function weekDays(reference: Date) {
  const monday = startOfWeek(reference, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(monday, index)
    return { date, key: format(date, 'yyyy-MM-dd') }
  })
}

export default function HabitList({
  habits,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  onCreateClick,
  onMoreClick,
  isLoading,
  onToggleDate,
  onEdit,
  onArchive,
  onDelete,
  onStartFocus,
}: HabitListProps) {
  const [today] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [collapsed, setCollapsed] = useState<Set<HabitSection>>(new Set())
  const [moreOpen, setMoreOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ habitId: string; x: number; y: number } | null>(null)
  const [focusOpen, setFocusOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  const days = useMemo(() => weekDays(today), [today])
  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd')

  const grouped = useMemo(() => {
    const result = new Map<HabitSection, Habit[]>([['Morning', []], ['Night', []], ['Others', []]])
    habits.forEach((habit) => result.get(sectionForHabit(habit))?.push(habit))
    return Array.from(result.entries()).filter(([, items]) => items.length > 0)
  }, [habits])

  useEffect(() => {
    const close = (event: MouseEvent) => {
      const target = event.target as Element
      if (moreRef.current && !moreRef.current.contains(target)) setMoreOpen(false)
      if (!target.closest('.habit-list-context-menu')) {
        setContextMenu(null)
        setFocusOpen(false)
      }
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setContextMenu(null)
        setFocusOpen(false)
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [])

  const toggleSection = (section: HabitSection) => {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  const openContextMenu = (habit: Habit, event: ReactMouseEvent) => {
    event.preventDefault()
    setFocusOpen(false)
    setContextMenu({
      habitId: habit._id,
      x: Math.max(8, Math.min(event.clientX, window.innerWidth - 340)),
      y: Math.max(8, Math.min(event.clientY, window.innerHeight - 170)),
    })
  }

  return (
    <section className="habit-list-shell" aria-label="Habits">
      <header className="habit-list-header">
        <button className="habit-list-title" type="button" onClick={() => setMoreOpen((open) => !open)}>
          Habit <ChevronDown size={13} />
        </button>
        <div className="habit-list-header-actions">
          <button type="button" onClick={onMoreClick} aria-label="Browse habit templates" title="Habit gallery"><Grid2X2 size={16} /></button>
          <button type="button" onClick={onCreateClick} aria-label="Create habit" title="Create habit"><Plus size={19} /></button>
          <div className="habit-list-more-anchor" ref={moreRef}>
            <button type="button" onClick={() => setMoreOpen((open) => !open)} aria-label="Habit options"><MoreHorizontal size={18} /></button>
            {moreOpen && (
              <div className="habit-list-filter-menu" role="menu">
                <button type="button" className={filter === 'active' ? 'is-active' : ''} onClick={() => { onFilterChange('active'); setMoreOpen(false) }}><span>Active habits</span>{filter === 'active' ? <Check size={14} /> : null}</button>
                <button type="button" className={filter === 'archived' ? 'is-active' : ''} onClick={() => { onFilterChange('archived'); setMoreOpen(false) }}><span>Archived habits</span>{filter === 'archived' ? <Check size={14} /> : null}</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="habit-week-strip" aria-label="Weekly completion overview">
        {days.map(({ date, key }) => {
          const completeCount = habits.filter((habit) => habit.completions.includes(key)).length
          const ratio = habits.length > 0 ? completeCount / habits.length : 0
          const selected = isSameDay(date, selectedDate)
          const isToday = isSameDay(date, today)
          return (
            <button key={key} type="button" className={`${selected ? 'is-selected' : ''}${isToday ? ' is-today' : ''}`} onClick={() => setSelectedDate(date)} aria-label={`Show ${format(date, 'EEEE, MMMM d')}`}>
              <span>{format(date, 'EEE')}</span>
              <strong>{format(date, 'd')}</strong>
              <span className={`habit-day-ring${ratio === 1 && habits.length > 0 ? ' is-complete' : ''}`} style={{ '--habit-progress': `${ratio * 360}deg` } as CSSProperties}>
                {ratio === 1 && habits.length > 0 ? <Check size={11} /> : null}
              </span>
            </button>
          )
        })}
      </div>

      <div className="habit-list-date-label">{format(selectedDate, 'MMM d')} <button type="button" onClick={() => setSelectedDate(today)} aria-label="Return to today">×</button></div>

      <div className="habit-list-scroll">
        {isLoading ? (
          <div className="habit-list-loading"><span /><span /><span /></div>
        ) : habits.length === 0 ? (
          <div className="habit-list-empty">
            <span>✦</span><h3>{filter === 'archived' ? 'No archived habits' : 'Build a rhythm'}</h3><p>{filter === 'archived' ? 'Archived habits will appear here.' : 'Start with one small habit you can repeat.'}</p>
            {filter === 'active' ? <button type="button" onClick={onCreateClick}>Create Habit</button> : null}
          </div>
        ) : (
          grouped.map(([section, sectionHabits]) => (
            <div className="habit-section" key={section}>
              <button type="button" className="habit-section-heading" onClick={() => toggleSection(section)} aria-expanded={!collapsed.has(section)}>
                <ChevronRight size={12} className={collapsed.has(section) ? '' : 'is-open'} /><strong>{section}</strong><span>{sectionHabits.length}</span>
              </button>
              <AnimatePresence initial={false}>
                {!collapsed.has(section) && sectionHabits.map((habit) => {
                  const completed = habit.completions.includes(selectedDateKey)
                  const status = habit.completionStatuses?.[selectedDateKey]
                  return (
                    <motion.article
                      layout
                      key={habit._id}
                      className={`habit-list-row${selectedId === habit._id ? ' is-selected' : ''}`}
                      onClick={() => onSelect(habit._id)}
                      onContextMenu={(event) => openContextMenu(habit, event)}
                      tabIndex={0}
                      onKeyDown={(event) => { if (event.key === 'Enter') onSelect(habit._id) }}
                    >
                      <span className="habit-list-row-icon" style={{ color: habit.color }}>{habit.icon || '✦'}</span>
                      <div className="habit-list-row-copy">
                        <h3>{habit.name}</h3>
                        <p>
                          <span className="habit-total-days">⚡ {habit.completions.length} {habit.completions.length === 1 ? 'Day' : 'Days'}</span>
                          {habit.currentStreak > 0 ? <span> 🔥 {habit.currentStreak} {habit.currentStreak === 1 ? 'Day' : 'Days'}</span> : null}
                          {status === 'skipped' ? <span> · Skipped</span> : null}
                        </p>
                      </div>
                      <button
                        type="button"
                        className={`habit-list-check${completed ? ' is-complete' : ''}`}
                        style={{ '--habit-color': habit.color } as CSSProperties}
                        onClick={(event) => {
                          event.stopPropagation()
                          if (!completed) playCompletionSound()
                          onToggleDate(habit, selectedDateKey)
                        }}
                        aria-label={`${completed ? 'Undo' : 'Complete'} ${habit.name} on ${format(selectedDate, 'MMM d')}`}
                      >
                        {completed ? <Check size={14} /> : null}
                      </button>
                    </motion.article>
                  )
                })}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {contextMenu && (() => {
        const habit = habits.find((item) => item._id === contextMenu.habitId)
        if (!habit) return null
        return (
          <div className="habit-list-context-menu" role="menu" aria-label={`${habit.name} actions`} style={{ left: contextMenu.x, top: contextMenu.y }} onContextMenu={(event) => event.preventDefault()}>
            <button type="button" role="menuitem" onClick={() => { onEdit(habit); setContextMenu(null) }}><Pencil size={15} /><span>Edit</span></button>
            <button type="button" role="menuitem" onClick={() => { onArchive(habit); setContextMenu(null) }}><Archive size={15} /><span>{habit.archived ? 'Restore' : 'Archive'}</span></button>
            <div className="habit-list-focus-cascade" onMouseLeave={() => setFocusOpen(false)}>
              <button type="button" role="menuitem" className={focusOpen ? 'is-active' : ''} onMouseEnter={() => setFocusOpen(true)} onClick={() => setFocusOpen((open) => !open)}><Crosshair size={15} /><span>Start Focus</span><ChevronRight size={14} /></button>
              {focusOpen && (
                <div className="habit-list-focus-submenu" role="menu">
                  <button type="button" role="menuitem" onClick={() => onStartFocus(habit, 'POMO')}><CircleDot size={14} /><span>Start Pomo</span></button>
                  <button type="button" role="menuitem" onClick={() => onStartFocus(habit, 'STOPWATCH')}><Clock3 size={14} /><span>Start Stopwatch</span></button>
                </div>
              )}
            </div>
            <button type="button" className="is-danger" role="menuitem" onClick={() => {
              if (window.confirm(`Delete “${habit.name}”?`)) onDelete(habit)
              setContextMenu(null)
            }}><Trash2 size={15} /><span>Delete</span></button>
          </div>
        )
      })()}
    </section>
  )
}
