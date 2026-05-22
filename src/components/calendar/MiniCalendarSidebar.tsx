'use client'

import { useState } from 'react'
import { PanelLeftClose } from 'lucide-react'
import type { CalendarEvent } from './types'
import TaskCountSummary from './sidebar/TaskCountSummary'
import MiniMonthCalendar from './sidebar/MiniMonthCalendar'
import ListFilterPanel from './sidebar/ListFilterPanel'

interface MiniCalendarSidebarProps {
  currentDate: Date
  events: CalendarEvent[]
  onDateSelect: (date: Date) => void
  lists?: { id: string; name: string; color: string; visible: boolean }[]
  onToggleList?: (id: string) => void
  onCollapse?: () => void
  taskCounts?: { today: number; tomorrow: number; week: number; overdue: number; completed: number; total: number }
  selectedView?: string
}

export default function MiniCalendarSidebar({
  currentDate,
  events,
  onDateSelect,
  lists = [],
  onToggleList,
  onCollapse,
  taskCounts = { today: 0, tomorrow: 0, week: 0, overdue: 0, completed: 0, total: 0 },
  selectedView,
}: MiniCalendarSidebarProps) {
  const [displayMonth, setDisplayMonth] = useState(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))

  const prevMonth = () => {
    setDisplayMonth((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1))
  }
  const nextMonth = () => {
    setDisplayMonth((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1))
  }
  const goToday = () => {
    const now = new Date()
    setDisplayMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    onDateSelect(now)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 240,
        flexShrink: 0,
        overflow: 'hidden',
        borderRadius: 'var(--outer-radius, 20px)',
        backgroundColor: 'var(--bg-pane)',
        height: '100%',
      }}
    >
      {/* Collapse button row */}
      {onCollapse && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '8px 10px 0',
            flexShrink: 0,
          }}
        >
          <button
            onClick={onCollapse}
            title="Collapse"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 6, cursor: 'pointer',
              backgroundColor: 'transparent', border: 'none',
              color: 'var(--text-faint)',
              transition: 'background-color 150ms ease, color 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, rgba(108,108,158,0.06))'; e.currentTarget.style.color = 'var(--text-muted)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)' }}
          >
            <PanelLeftClose size={16} strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '4px 12px 12px',
        }}
      >
        {/* Smart Lists / Task Counts */}
        <TaskCountSummary taskCounts={taskCounts} />

        {/* Separator */}
        <div style={{ margin: '8px 6px', height: 1, backgroundColor: 'var(--border)', opacity: 0.6 }} />

        {/* Mini Calendar(s) */}
        <MiniMonthCalendar
          currentDate={currentDate}
          events={events}
          onDateSelect={onDateSelect}
          displayMonth={displayMonth}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          onGoToday={goToday}
          selectedView={selectedView}
        />

        {/* Separator */}
        <div style={{ margin: '10px 6px 6px', height: 1, backgroundColor: 'var(--border)', opacity: 0.6 }} />

        {/* Calendars / Lists */}
        <ListFilterPanel lists={lists} onToggleList={onToggleList} />
      </div>
    </div>
  )
}
