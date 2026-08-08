import { motion } from 'framer-motion'
import { buttonPress } from '@/lib/motion'
import type { CalendarViewMode } from './types'

interface CalendarViewDockProps {
  view: CalendarViewMode
  onViewChange: (view: CalendarViewMode) => void
}

const DOCK_VIEWS: Array<{ value: CalendarViewMode; label: string }> = [
  { value: 'year', label: 'Year' },
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
  { value: 'agenda', label: 'Agenda' },
  { value: '3day', label: 'Multi-Day' },
  { value: 'multiweek', label: 'Multi-Week' },
]

export default function CalendarViewDock({ view, onViewChange }: CalendarViewDockProps) {
  return (
    <nav className="calendar-view-dock" aria-label="Calendar views">
      {DOCK_VIEWS.map((item) => (
        <motion.button
          {...buttonPress}
          key={item.value}
          type="button"
          onClick={() => onViewChange(item.value)}
          aria-pressed={view === item.value}
          className={view === item.value ? 'is-active' : undefined}
        >
          {item.label}
        </motion.button>
      ))}
    </nav>
  )
}
