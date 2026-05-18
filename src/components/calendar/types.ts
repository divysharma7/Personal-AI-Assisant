/** Shared types for the Calendar view components. */

export type CalendarViewMode = 'day' | 'week' | 'month'

export interface CalendarEvent {
  id: string
  title: string
  /** ISO date-time string for the start */
  start: string
  /** ISO date-time string for the end */
  end: string
  /** Hex color for the block background */
  color: string
  /** Whether this is a Google Calendar external event */
  isExternal?: boolean
  /** Whether this is a focus session block */
  isFocusSession?: boolean
  /** Whether this is a habit chip */
  isHabit?: boolean
  /** Whether the event is read-only */
  isReadOnly?: boolean
  /** Number of days overdue (positive = overdue) */
  daysOverdue?: number
  /** Associated list/project name */
  listName?: string
  /** Priority */
  priority?: 'high' | 'medium' | 'low'
}

export interface CalendarHeaderProps {
  currentDate: Date
  view: CalendarViewMode
  onViewChange: (view: CalendarViewMode) => void
  onNavigate: (direction: -1 | 0 | 1) => void
}

export interface CapacityBarProps {
  scheduledHours: number
  capacityHours: number
}
