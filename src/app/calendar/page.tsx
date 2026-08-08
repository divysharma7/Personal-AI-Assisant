
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ease, motionTokens, getDirectionalVariants } from '@/lib/motion'
import { useNavigate } from 'react-router-dom'
import { useTasks } from '@/hooks/useTasks'
import type { TaskRecord } from '@/hooks/useTasks'
import CalendarHeader from '@/components/calendar/CalendarHeader'
import DayView from '@/components/calendar/DayView'
import ThreeDayView from '@/components/calendar/ThreeDayView'
import WeekView from '@/components/calendar/WeekView'
import MultiWeekView from '@/components/calendar/MultiWeekView'
import MonthView from '@/components/calendar/MonthView'
import YearView from '@/components/calendar/YearView'
import AgendaView from '@/components/calendar/AgendaView'
import ArrangeTasksPanel from '@/components/calendar/ArrangeTasksPanel'
import CalendarViewDock from '@/components/calendar/CalendarViewDock'
import ViewOptionsModal, { DEFAULT_VIEW_OPTIONS } from '@/components/calendar/ViewOptionsModal'
import type { ViewOptions } from '@/components/calendar/ViewOptionsModal'
import CalendarDndProvider from '@/components/calendar/CalendarDndProvider'
import DragOverlay from '@/components/calendar/DragOverlay'
import EventPopover from '@/components/calendar/EventPopover'
import TaskEditorSheet from '@/components/calendar/TaskEditorSheet'
import type { TaskEditorSeed } from '@/components/calendar/TaskEditorSheet'
import QuickAddPopover from '@/components/calendar/QuickAddPopover'
import type { QuickAddData } from '@/components/calendar/QuickAddPopover'
import BatchActionBar from '@/components/calendar/BatchActionBar'
import type { CalendarViewMode, CalendarEvent } from '@/components/calendar/types'
import './calendar.css'

// ── Priority colors (use CSS vars with fallback) ──
const EVENT_PALETTE = ['#4e57ad', '#69898f', '#8b6878', '#86894e', '#76648f', '#6d7f86', '#8f786d']

function calendarColorForTask(task: TaskRecord): string {
  const seed = task.listId || task.title || task._id
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0
  }
  return EVENT_PALETTE[Math.abs(hash) % EVENT_PALETTE.length]
}

function taskToEvent(t: TaskRecord): CalendarEvent | null {
  if (!t.scheduledStart || !t.scheduledEnd) return null
  return {
    id: t._id, title: t.title,
    start: t.scheduledStart, end: t.scheduledEnd,
    color: calendarColorForTask(t),
    priority: t.priority as 'high' | 'medium' | 'low' | undefined,
    listName: t.listId || undefined,
  }
}

export default function CalendarPage() {
  const navigateTo = useNavigate()
  const { tasks, createTask, updateTask } = useTasks()
  const prefersReduced = useReducedMotion()

  // ── Multi-select state ──
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set())
  const modifierHeldRef = useRef(false)
  const showBatchActions = selectedEventIds.size > 0

  // ── Core state ──
  const [view, setView] = useState<CalendarViewMode>('week')
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [navigationDirection, setNavigationDirection] = useState<-1 | 0 | 1>(0)
  const [arrangeOpen, setArrangeOpen] = useState(false)
  const [viewOptionsOpen, setViewOptionsOpen] = useState(false)
  const [viewOptions, setViewOptions] = useState<ViewOptions>(DEFAULT_VIEW_OPTIONS)

  // ── Event popover ──
  const [popoverEvent, setPopoverEvent] = useState<CalendarEvent | null>(null)
  const [popoverAnchor, setPopoverAnchor] = useState({ x: 0, y: 0 })

  // ── Task Editor Sheet ──
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorTask, setEditorTask] = useState<TaskRecord | null>(null)
  const [editorSeed, setEditorSeed] = useState<TaskEditorSeed | null>(null)

  // ── Quick Add Popover (slot-click) ──
  const [slotQuickAdd, setSlotQuickAdd] = useState<QuickAddData | null>(null)

  // ── Quick Add (header) ──
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickAddText, setQuickAddText] = useState('')
  const qaRef = useRef<HTMLDivElement>(null)
  const qaInputRef = useRef<HTMLInputElement>(null)

  // ── Filtering ──
  // ── Event computation ──
  const scheduled = useMemo<CalendarEvent[]>(
    () => tasks.map(taskToEvent).filter(Boolean) as CalendarEvent[],
    [tasks]
  )

  // Tasks with dueDate but no scheduledStart → all-day band
  const allDayEvents = useMemo<CalendarEvent[]>(
    () => tasks
      .filter(t => t.dueDate && !t.scheduledStart && t.status !== 'done' && t.status !== 'dropped')
      .map(t => ({
        id: t._id, title: t.title,
        start: new Date(new Date(t.dueDate!).setHours(0, 0, 0, 0)).toISOString(),
        end: new Date(new Date(t.dueDate!).setHours(23, 59, 59, 999)).toISOString(),
        color: calendarColorForTask(t),
        priority: t.priority as 'high' | 'medium' | 'low' | undefined,
        listName: t.listId || undefined,
        isAllDay: true,
      })),
    [tasks]
  )

  // Merge scheduled + all-day for views that support the all-day lane
  const calendarEvents = useMemo<CalendarEvent[]>(
    () => [...scheduled, ...allDayEvents],
    [scheduled, allDayEvents]
  )

  // ── Navigation ──
  const navigate = useCallback((dir: -1 | 0 | 1) => {
    setNavigationDirection(dir)
    if (dir === 0) { setCurrentDate(new Date()); return }
    setCurrentDate(prev => {
      const d = new Date(prev)
      if (view === 'day') d.setDate(d.getDate() + dir)
      else if (view === '3day') d.setDate(d.getDate() + dir * 3)
      else if (view === 'week') d.setDate(d.getDate() + dir * 7)
      else if (view === 'multiweek') d.setDate(d.getDate() + dir * 14)
      else if (view === 'month') d.setMonth(d.getMonth() + dir)
      else if (view === 'year') d.setFullYear(d.getFullYear() + dir)
      else if (view === 'agenda') d.setDate(d.getDate() + dir * 14)
      return d
    })
  }, [view])

  // ── Quick Add ──
  const handleQuickAdd = useCallback(async () => {
    const text = quickAddText.trim()
    if (!text) return
    const base = new Date(currentDate); base.setHours(9, 0, 0, 0)
    const end = new Date(base); end.setHours(10, 0, 0, 0)
    await createTask({
      title: text, dueDate: base.toISOString(),
      scheduledStart: base.toISOString(), scheduledEnd: end.toISOString(),
      priority: 'medium', status: 'todo',
    })
    setQuickAddText(''); setQuickAddOpen(false)
  }, [quickAddText, createTask, currentDate])

  // ── Slot click → open QuickAddPopover ──
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        scheduledStart: string
        scheduledEnd: string
        isAllDay: boolean
        anchor: { x: number; y: number }
      }
      setSlotQuickAdd(detail)
    }
    window.addEventListener('laif:slot-click', handler)
    return () => window.removeEventListener('laif:slot-click', handler)
  }, [])

  // ── Slot creation from DayView / WeekView (drag-to-create, etc.) ──
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      const { title, slotIndex, dayISO } = detail
      // Support drag-to-create with explicit startTime/endTime
      if (detail.startTime && detail.endTime) {
        createTask({
          title: title || 'New Task',
          dueDate: detail.startTime,
          scheduledStart: detail.startTime,
          scheduledEnd: detail.endTime,
          priority: 'medium', status: 'todo',
        })
      } else {
        const start = new Date(`${dayISO}T00:00:00`)
        start.setHours(Math.floor(slotIndex / 4), (slotIndex % 4) * 15, 0, 0)
        const end = new Date(start); end.setMinutes(end.getMinutes() + 60)
        createTask({
          title, dueDate: start.toISOString(),
          scheduledStart: start.toISOString(), scheduledEnd: end.toISOString(),
          priority: 'medium', status: 'todo',
        })
      }
    }
    window.addEventListener('laif:create-calendar-task', handler)
    return () => window.removeEventListener('laif:create-calendar-task', handler)
  }, [createTask])

  // ── Resize event handler from WeekView ──
  useEffect(() => {
    const handler = (e: Event) => {
      const { taskId, newEnd } = (e as CustomEvent).detail
      if (taskId && newEnd) {
        updateTask(taskId, { scheduledEnd: newEnd })
      }
    }
    window.addEventListener('laif:resize-calendar-task', handler)
    return () => window.removeEventListener('laif:resize-calendar-task', handler)
  }, [updateTask])

  // ── Quick Add outside click ──
  useEffect(() => {
    if (!quickAddOpen) return
    const handler = (e: MouseEvent) => {
      if (qaRef.current && !qaRef.current.contains(e.target as Node)) {
        setQuickAddOpen(false); setQuickAddText('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [quickAddOpen])

  useEffect(() => {
    if (quickAddOpen) setTimeout(() => qaInputRef.current?.focus(), 50)
  }, [quickAddOpen])

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const key = e.key.toLowerCase()
      if (key === 'd' || key === '1') { e.preventDefault(); setView('day') }
      else if (key === '3') { e.preventDefault(); setView('3day') }
      else if (key === 'w' || key === '2') { e.preventDefault(); setView('week') }
      else if (key === 'm' || key === '4') { e.preventDefault(); setView('month') }
      else if (key === 'y' || key === '5') { e.preventDefault(); setView('year') }
      else if (key === 'a' || key === '6') { e.preventDefault(); setView('agenda') }
      else if (key === 't') { e.preventDefault(); navigate(0) }
      else if (key === 'arrowleft') { e.preventDefault(); navigate(-1) }
      else if (key === 'arrowright') { e.preventDefault(); navigate(1) }
      else if (key === 'q') { e.preventDefault(); setQuickAddOpen(v => !v) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])

  // ── Multi-select: track modifier keys ──
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.shiftKey || e.metaKey || e.ctrlKey) modifierHeldRef.current = true
    }
    const up = (e: KeyboardEvent) => {
      if (!e.shiftKey && !e.metaKey && !e.ctrlKey) modifierHeldRef.current = false
    }
    const blur = () => { modifierHeldRef.current = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [])

  // ── Multi-select: intercept detail-task events when modifier held ──
  useEffect(() => {
    const handler = (e: Event) => {
      const taskId = (e as CustomEvent<{ taskId: string | null }>).detail?.taskId
      if (!taskId) return
      if (modifierHeldRef.current) {
        // Prevent the detail panel from opening
        e.stopImmediatePropagation()
        setSelectedEventIds(prev => {
          const next = new Set(prev)
          if (next.has(taskId)) next.delete(taskId)
          else next.add(taskId)
          return next
        })
      }
    }
    // Use capture phase to fire before AppShell's listener
    window.addEventListener('laif:detail-task', handler, true)
    return () => window.removeEventListener('laif:detail-task', handler, true)
  }, [])

  // ── Event popover: intercept detail-task clicks on calendar ──
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ taskId: string | null }>
      const taskId = ce.detail?.taskId
      if (!taskId || modifierHeldRef.current) return
      // Find the event in our calendar data
      const ev = calendarEvents.find(ev => ev.id === taskId)
      if (ev) {
        e.stopImmediatePropagation() // prevent AppShell from opening detail panel
        // Use mouse position for anchor
        const mouseEvent = window.event as MouseEvent | undefined
        setPopoverAnchor({
          x: mouseEvent?.clientX ?? window.innerWidth / 2,
          y: mouseEvent?.clientY ?? 200,
        })
        setPopoverEvent(ev)
      }
    }
    window.addEventListener('laif:detail-task', handler, true)
    return () => window.removeEventListener('laif:detail-task', handler, true)
  }, [calendarEvents])

  // ── Multi-select: Escape to clear selection ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedEventIds.size > 0) {
        e.preventDefault()
        e.stopPropagation()
        setSelectedEventIds(new Set())
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [selectedEventIds.size])

  const handleClearSelection = useCallback(() => {
    setSelectedEventIds(new Set())
  }, [])

  return (
    <div className="calendar-shell">
      {/* ── Left: Mini Calendar Sidebar ── */}
      {/* ── Center: Calendar Canvas ── */}
      <CalendarDndProvider>
        <div className="calendar-canvas">
          {/* Header */}
          <CalendarHeader
            currentDate={currentDate}
            view={view}
            onViewChange={setView}
            onNavigate={navigate}
            onQuickAdd={() => setQuickAddOpen(v => !v)}
            onOpenViewOptions={() => setViewOptionsOpen(true)}
            onOpenArrangeTasks={() => setArrangeOpen(v => !v)}
            onBackToApp={() => navigateTo('/')}
          />

          {/* Quick Add popover */}
          <AnimatePresence>
            {quickAddOpen && (
              <motion.div
                ref={qaRef}
                className="calendar-quick-add"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={ease.normal}
                style={{
                  position: 'absolute', top: 52, left: '50%', transform: 'translateX(-50%)',
                  width: 380, padding: 16, borderRadius: 10, zIndex: 70,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: 'var(--accent)',
                    backgroundColor: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                    padding: '3px 10px', borderRadius: 999,
                  }}>
                    {currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <input
                  ref={qaInputRef}
                  value={quickAddText}
                  onChange={e => setQuickAddText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); handleQuickAdd() }
                    if (e.key === 'Escape') { setQuickAddOpen(false); setQuickAddText('') }
                  }}
                  placeholder="What would you like to do?"
                  style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none',
                    fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', padding: 0,
                  }}
                />
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>↵ Enter to add to Inbox</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overdue lane */}
          {/* Views — with directional slide transitions */}
          <div className="calendar-view-stage">
              <AnimatePresence mode="wait">
                {(() => {
                  const dirVariants = getDirectionalVariants(navigationDirection)
                  const viewVariants = prefersReduced ? undefined : {
                    initial: dirVariants.initial,
                    animate: dirVariants.animate,
                    exit: { ...dirVariants.exit, transition: { duration: motionTokens.duration.instant, ease: motionTokens.easing.sharp } },
                  }
                  return (
                <motion.div
                  key={`${view}-${currentDate.toISOString().split('T')[0]}`}
                  variants={viewVariants}
                  initial={prefersReduced ? false : "initial"}
                  animate="animate"
                  exit="exit"
                  transition={prefersReduced
                    ? { duration: 0 }
                    : { duration: motionTokens.duration.fast, ease: motionTokens.easing.sharp }
                  }
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  {view === 'day' && <DayView date={currentDate} events={calendarEvents} />}
                  {view === '3day' && <ThreeDayView date={currentDate} events={calendarEvents} />}
                  {view === 'week' && <WeekView date={currentDate} events={calendarEvents} />}
                  {view === 'multiweek' && <MultiWeekView date={currentDate} events={calendarEvents} onDayClick={(d) => { setCurrentDate(d); setView('day') }} />}
                  {view === 'month' && <MonthView date={currentDate} events={calendarEvents} onDayClick={(d) => { setCurrentDate(d); setView('day') }} showHabitDots />}
                  {view === 'year' && (
                    <YearView
                      date={currentDate}
                      events={calendarEvents}
                      onDayClick={(d) => { setCurrentDate(d); setView('day') }}
                      onMonthClick={(d) => { setCurrentDate(d); setView('month') }}
                      onWeekClick={(d) => { setCurrentDate(d); setView('week') }}
                    />
                  )}
                  {view === 'agenda' && <AgendaView date={currentDate} events={calendarEvents} />}
                </motion.div>
                  )
                })()}
              </AnimatePresence>
          </div>

          <CalendarViewDock view={view} onViewChange={setView} />

          <AnimatePresence>
            {arrangeOpen && (
              <motion.aside
                className="calendar-arrange-overlay"
                initial={prefersReduced ? false : { opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
                transition={prefersReduced ? { duration: 0 } : ease.normal}
              >
                <ArrangeTasksPanel open onClose={() => setArrangeOpen(false)} />
              </motion.aside>
            )}
          </AnimatePresence>

          <DragOverlay />

          {/* ── Event Popover ── */}
          <AnimatePresence>
            {popoverEvent && (
              <EventPopover
                event={popoverEvent}
                anchor={popoverAnchor}
                onClose={() => setPopoverEvent(null)}
                onOpenDetail={(taskId) => {
                  setPopoverEvent(null)
                  const t = tasks.find(x => x._id === taskId)
                  if (t) {
                    setEditorTask(t)
                    setEditorSeed(null)
                    setEditorOpen(true)
                  }
                }}
              />
            )}
          </AnimatePresence>

          {/* ── Slot Quick Add Popover ── */}
          <QuickAddPopover
            data={slotQuickAdd}
            onClose={() => setSlotQuickAdd(null)}
            onOpenEditor={(seedData) => {
              setEditorTask(null)
              setEditorSeed(seedData)
              setEditorOpen(true)
            }}
          />

          {/* ── Floating Batch Action Bar ── */}
          <AnimatePresence>
            {showBatchActions && (
              <BatchActionBar
                selectedIds={selectedEventIds}
                clearSelection={handleClearSelection}
              />
            )}
          </AnimatePresence>
        </div>
      </CalendarDndProvider>

      {/* View Options */}
      <ViewOptionsModal
        open={viewOptionsOpen}
        onClose={() => setViewOptionsOpen(false)}
        options={viewOptions}
        onOptionsChange={setViewOptions}
      />

      {/* Task Editor Sheet */}
      <TaskEditorSheet
        task={editorTask}
        seed={editorSeed}
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setEditorTask(null); setEditorSeed(null) }}
      />
    </div>
  )
}
