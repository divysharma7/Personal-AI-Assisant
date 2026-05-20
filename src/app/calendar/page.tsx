'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ease } from '@/lib/motion'
import { useTasks } from '@/hooks/useTasks'
import type { TaskRecord } from '@/hooks/useTasks'
import CalendarHeader from '@/components/calendar/CalendarHeader'
import DayView from '@/components/calendar/DayView'
import WeekView from '@/components/calendar/WeekView'
import MonthView from '@/components/calendar/MonthView'
import YearView from '@/components/calendar/YearView'
import AgendaView from '@/components/calendar/AgendaView'
import OverdueLane from '@/components/calendar/OverdueLane'
import UnscheduledPanel from '@/components/calendar/UnscheduledPanel'
import MiniCalendarSidebar from '@/components/calendar/MiniCalendarSidebar'
import ViewOptionsModal, { DEFAULT_VIEW_OPTIONS } from '@/components/calendar/ViewOptionsModal'
import CalendarDndProvider from '@/components/calendar/CalendarDndProvider'
import DragOverlay from '@/components/calendar/DragOverlay'
import type { ViewOptions } from '@/components/calendar/ViewOptionsModal'
import type { CalendarViewMode, CalendarEvent } from '@/components/calendar/types'

const viewTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
}

const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6b66da',
}

function taskToCalendarEvent(task: TaskRecord): CalendarEvent | null {
  if (!task.scheduledStart || !task.scheduledEnd) return null
  return {
    id: task._id,
    title: task.title,
    start: task.scheduledStart,
    end: task.scheduledEnd,
    color: PRIORITY_COLORS[task.priority] || '#5DA8FF',
    isReadOnly: false,
    priority: task.priority as 'high' | 'medium' | 'low' | undefined,
    listName: task.listId || undefined,
  }
}

const MOCK_LISTS = [
  { id: 'inbox', name: 'Inbox', color: '#5DA8FF', visible: true },
  { id: 'work', name: 'Work', color: '#f59e0b', visible: true },
  { id: 'personal', name: 'Personal', color: '#34d399', visible: true },
  { id: 'shopping', name: 'Shopping', color: '#ec4899', visible: true },
]

export default function CalendarPage() {
  const { tasks } = useTasks()
  const [view, setView] = useState<CalendarViewMode>('day')
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [viewOptionsOpen, setViewOptionsOpen] = useState(false)
  const [viewOptions, setViewOptions] = useState<ViewOptions>(DEFAULT_VIEW_OPTIONS)
  const [lists, setLists] = useState(MOCK_LISTS)

  // Map real tasks to CalendarEvent format
  const scheduledEvents = useMemo<CalendarEvent[]>(
    () => tasks.map(taskToCalendarEvent).filter(Boolean) as CalendarEvent[],
    [tasks]
  )

  const overdueEvents = useMemo<CalendarEvent[]>(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return tasks
      .filter((t) => t.scheduledStart && new Date(t.scheduledStart) < now && t.status !== 'done' && t.status !== 'dropped')
      .map((t) => {
        const ev = taskToCalendarEvent(t)
        if (!ev) return null
        const daysOverdue = Math.ceil((now.getTime() - new Date(t.scheduledStart!).getTime()) / (86400000))
        return { ...ev, daysOverdue }
      })
      .filter(Boolean) as CalendarEvent[]
  }, [tasks])

  const unscheduledEvents = useMemo<CalendarEvent[]>(
    () => tasks
      .filter((t) => !t.scheduledStart && t.status !== 'done' && t.status !== 'dropped')
      .map((t) => ({
        id: t._id,
        title: t.title,
        start: '',
        end: '',
        color: PRIORITY_COLORS[t.priority] || '#5DA8FF',
        priority: t.priority as 'high' | 'medium' | 'low' | undefined,
      })),
    [tasks]
  )

  // Navigation handler
  const handleNavigate = useCallback(
    (direction: -1 | 0 | 1) => {
      if (direction === 0) {
        setCurrentDate(new Date())
        return
      }

      setCurrentDate((prev) => {
        const next = new Date(prev)
        switch (view) {
          case 'day':
            next.setDate(next.getDate() + direction)
            break
          case 'week':
            next.setDate(next.getDate() + direction * 7)
            break
          case 'month':
            next.setMonth(next.getMonth() + direction)
            break
          case 'year':
            next.setFullYear(next.getFullYear() + direction)
            break
          case 'agenda':
            next.setDate(next.getDate() + direction * 14)
            break
        }
        return next
      })
    },
    [view]
  )

  // Switch to day view for a specific date
  const handleDayClick = useCallback((date: Date) => {
    setCurrentDate(date)
    setView('day')
  }, [])

  // Mini calendar date select
  const handleDateSelect = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])

  // Toggle list visibility
  const handleToggleList = useCallback((id: string) => {
    setLists((prev) => prev.map((l) => l.id === id ? { ...l, visible: !l.visible } : l))
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) {
        return
      }

      switch (e.key) {
        case 't':
        case 'T':
          e.preventDefault()
          handleNavigate(0)
          break
        case 'd':
        case 'D':
        case '1':
          e.preventDefault()
          setView('day')
          break
        case 'w':
        case 'W':
        case '2':
          e.preventDefault()
          setView('week')
          break
        case 'm':
        case 'M':
        case '3':
          e.preventDefault()
          setView('month')
          break
        case 'y':
        case 'Y':
        case '4':
          e.preventDefault()
          setView('year')
          break
        case 'a':
        case 'A':
        case '5':
          e.preventDefault()
          setView('agenda')
          break
        case 'ArrowLeft':
          e.preventDefault()
          handleNavigate(-1)
          break
        case 'ArrowRight':
          e.preventDefault()
          handleNavigate(1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNavigate])

  return (
    <div
      className="flex h-full"
      style={{ backgroundColor: 'var(--bg-pane)' }}
    >
      {/* Mini calendar sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="flex-shrink-0 overflow-hidden"
          >
            <MiniCalendarSidebar
              currentDate={currentDate}
              events={scheduledEvents}
              onDateSelect={handleDateSelect}
              lists={lists}
              onToggleList={handleToggleList}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main canvas — wrapped in DnD provider */}
      <CalendarDndProvider>
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <CalendarHeader
            currentDate={currentDate}
            view={view}
            onViewChange={setView}
            onNavigate={handleNavigate}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onOpenViewOptions={() => setViewOptionsOpen(true)}
          />

          {/* Overdue lane */}
          <OverdueLane events={overdueEvents} />

          {/* Main content: view + unscheduled panel */}
          <div className="flex flex-1 overflow-hidden">
            {/* Active view with cross-fade */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  {...viewTransition}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  {view === 'day' && (
                    <DayView date={currentDate} events={scheduledEvents} />
                  )}
                  {view === 'week' && (
                    <WeekView date={currentDate} events={scheduledEvents} />
                  )}
                  {view === 'month' && (
                    <MonthView
                      date={currentDate}
                      events={scheduledEvents}
                      onDayClick={handleDayClick}
                      showHabitDots
                    />
                  )}
                  {view === 'year' && (
                    <YearView
                      date={currentDate}
                      events={scheduledEvents}
                      onDayClick={handleDayClick}
                    />
                  )}
                  {view === 'agenda' && (
                    <AgendaView
                      date={currentDate}
                      events={scheduledEvents}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Unscheduled panel — hide for year/agenda views */}
            {view !== 'year' && view !== 'agenda' && (
              <UnscheduledPanel events={unscheduledEvents} />
            )}
          </div>

          {/* DnD drag overlay — must be inside provider */}
          <DragOverlay />
        </div>
      </CalendarDndProvider>

      {/* View Options Modal */}
      <ViewOptionsModal
        open={viewOptionsOpen}
        onClose={() => setViewOptionsOpen(false)}
        options={viewOptions}
        onOptionsChange={setViewOptions}
      />
    </div>
  )
}
