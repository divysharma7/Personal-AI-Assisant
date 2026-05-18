'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ease } from '@/lib/motion'
import CalendarHeader from '@/components/calendar/CalendarHeader'
import DayView from '@/components/calendar/DayView'
import WeekView from '@/components/calendar/WeekView'
import MonthView from '@/components/calendar/MonthView'
import OverdueLane from '@/components/calendar/OverdueLane'
import UnscheduledPanel from '@/components/calendar/UnscheduledPanel'
import type { CalendarViewMode } from '@/components/calendar/types'
import {
  MOCK_EVENTS,
  MOCK_OVERDUE,
  MOCK_UNSCHEDULED,
} from '@/components/calendar/mockData'

/** Cross-fade animation for view switching: 200ms, scale 0.98->1.0 */
const viewTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
}

/**
 * Calendar page — main route shell.
 *
 * Layout:
 * - CalendarHeader (navigation + view switcher)
 * - OverdueLane (only when overdue tasks exist)
 * - Active view (Day | Week | Month) + UnscheduledPanel side-by-side
 *
 * Keyboard shortcuts:
 * T = today, 1 = Day, 2 = Week, 3 = Month, ArrowLeft/Right = navigate
 *
 * Default: Day view, today.
 */
export default function CalendarPage() {
  const [view, setView] = useState<CalendarViewMode>('day')
  const [currentDate, setCurrentDate] = useState(() => new Date())

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
        }
        return next
      })
    },
    [view]
  )

  // Switch to day view for a specific date (from MonthView cell click)
  const handleDayClick = useCallback((date: Date) => {
    setCurrentDate(date)
    setView('day')
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input/textarea
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
        case '1':
          e.preventDefault()
          setView('day')
          break
        case '2':
          e.preventDefault()
          setView('week')
          break
        case '3':
          e.preventDefault()
          setView('month')
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
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--bg-pane)' }}
    >
      {/* Header */}
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onNavigate={handleNavigate}
      />

      {/* Overdue lane */}
      <OverdueLane events={MOCK_OVERDUE} />

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
                <DayView date={currentDate} events={MOCK_EVENTS} />
              )}
              {view === 'week' && (
                <WeekView date={currentDate} events={MOCK_EVENTS} />
              )}
              {view === 'month' && (
                <MonthView
                  date={currentDate}
                  events={MOCK_EVENTS}
                  onDayClick={handleDayClick}
                  showHabitDots
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Unscheduled panel */}
        <UnscheduledPanel events={MOCK_UNSCHEDULED} />
      </div>
    </div>
  )
}
