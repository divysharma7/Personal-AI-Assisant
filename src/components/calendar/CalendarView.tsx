'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { quickFade } from '@/shared/design-system'
import TopBarActions from '@/components/layout/TopBarActions'
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns'
import MonthGrid from './MonthGrid'
import WeekView from './WeekView'
import DayView from './DayView'
import AgendaView from './AgendaView'
import { cn } from '@/lib/utils'
import type { AnyItem } from '@/types'

export type CalView = 'month' | 'week' | 'day' | 'agenda'

interface CalendarViewProps {
  view: CalView
  items: AnyItem[]
  loading: boolean
  onItemClick?: (item: AnyItem) => void
  onNewItem?: (start: Date, end: Date) => void
  onViewChange?: (v: CalView) => void
  onUpdateItem?: (type: AnyItem['type'], id: string, data: Partial<AnyItem>) => void
  onDeleteItem?: (type: AnyItem['type'], id: string) => void
}

const VIEW_PILLS: { id: CalView; label: string }[] = [
  { id: 'month',  label: 'Month'  },
  { id: 'week',   label: 'Week'   },
  { id: 'day',    label: 'Day'    },
  { id: 'agenda', label: 'Agenda' },
]

export default function CalendarView({ view, items, loading, onItemClick, onNewItem, onViewChange, onUpdateItem, onDeleteItem }: CalendarViewProps) {
  const [current, setCurrent] = useState(new Date())

  const goBack = () => {
    if (view === 'month')  setCurrent(d => subMonths(d, 1))
    else if (view === 'week') setCurrent(d => subWeeks(d, 1))
    else if (view === 'day')  setCurrent(d => subDays(d, 1))
  }

  const goForward = () => {
    if (view === 'month')  setCurrent(d => addMonths(d, 1))
    else if (view === 'week') setCurrent(d => addWeeks(d, 1))
    else if (view === 'day')  setCurrent(d => addDays(d, 1))
  }

  const goToday = () => setCurrent(new Date())

  const title = view === 'month'  ? format(current, 'MMMM yyyy')
              : view === 'week'   ? `Week of ${format(current, 'MMM d, yyyy')}`
              : view === 'day'    ? format(current, 'EEEE, MMM d, yyyy')
              : 'Upcoming'

  return (
    <div className="flex flex-col h-full">
      {/* Header — Superlist style: no border, generous padding */}
      <div
        className="flex flex-col md:flex-row md:relative md:items-center px-4 md:px-8 pt-6 md:pt-8 pb-3 md:pb-4 gap-2 md:gap-0 flex-shrink-0"
      >
        {/* Top row on mobile: title + nav */}
        <div className="flex items-center justify-between md:flex-1 md:min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {view !== 'agenda' && (
              <button onClick={goBack} className="btn-ghost p-1.5 md:hidden"><ChevronLeft size={15} /></button>
            )}
            <motion.h2
              key={title}
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="text-sm md:text-lg font-bold truncate"
              style={{ color: 'var(--text-1)', letterSpacing: '-0.02em' }}
            >
              {title}
            </motion.h2>
            {view !== 'agenda' && (
              <button onClick={goForward} className="btn-ghost p-1.5 md:hidden"><ChevronRight size={15} /></button>
            )}
            {loading && (
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            )}
          </div>
          <div className="flex items-center gap-1 md:hidden">
            {view !== 'agenda' && (
              <button onClick={goToday} className="btn-ghost text-xs px-2 py-1">Today</button>
            )}
            <TopBarActions />
          </div>
        </div>

        {/* Center: view switcher — scrollable on mobile */}
        <div className="md:absolute md:left-1/2 md:-translate-x-1/2 overflow-x-auto">
          <div
            className="flex items-center rounded-xl p-0.5 gap-0.5 w-max"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}
          >
            {VIEW_PILLS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => onViewChange?.(id)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150',
                  view !== id && 'hover:opacity-80'
                )}
                style={view === id
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { color: 'var(--text-2)' }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: nav + top bar actions — desktop only */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-end">
          {view !== 'agenda' && (
            <>
              <button onClick={goToday} className="btn-ghost text-xs px-3 py-1.5">Today</button>
              <button onClick={goBack} className="btn-ghost p-2"><ChevronLeft size={15} /></button>
              <button onClick={goForward} className="btn-ghost p-2"><ChevronRight size={15} /></button>
            </>
          )}
          <TopBarActions />
        </div>
      </div>

      {/* Calendar body */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          key={view + current.toISOString()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={quickFade}
          className="h-full"
        >
          {view === 'month' && (
            <MonthGrid
              year={current.getFullYear()}
              month={current.getMonth()}
              items={items}
              onItemClick={onItemClick}
            />
          )}
          {view === 'week' && (
            <WeekView
              date={current}
              items={items}
              onItemClick={onItemClick}
              onNewItem={onNewItem}
              onUpdateItem={onUpdateItem}
            />
          )}
          {view === 'day' && (
            <DayView
              date={current}
              items={items}
              onItemClick={onItemClick}
              onNewItem={onNewItem}
              onUpdateItem={onUpdateItem}
            />
          )}
          {view === 'agenda' && (
            <AgendaView items={items} onItemClick={onItemClick} onUpdateItem={onUpdateItem} onDeleteItem={onDeleteItem} />
          )}
        </motion.div>
      </div>
    </div>
  )
}
