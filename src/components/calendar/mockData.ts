/**
 * Mock calendar events for development.
 * Will be replaced by API hooks from the data-layer agent.
 */
import type { CalendarEvent } from './types'

function todayAt(hours: number, minutes = 0): string {
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

function daysFromNow(offset: number, hours: number, minutes = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'Morning standup',
    start: todayAt(9, 0),
    end: todayAt(9, 30),
    color: '#5DA8FF',
    isExternal: true,
    isReadOnly: true,
  },
  {
    id: 'ev-2',
    title: 'Deep work: LAIF Calendar UI',
    start: todayAt(10, 0),
    end: todayAt(12, 0),
    color: '#FF4D3D',
  },
  {
    id: 'ev-3',
    title: 'Lunch break',
    start: todayAt(12, 30),
    end: todayAt(13, 0),
    color: '#34D399',
    isReadOnly: true,
  },
  {
    id: 'ev-4',
    title: 'API integration sprint',
    start: todayAt(14, 0),
    end: todayAt(16, 30),
    color: '#C084FC',
  },
  {
    id: 'ev-5',
    title: 'Focus: Read chapter 5',
    start: todayAt(17, 0),
    end: todayAt(17, 30),
    color: '#6B6B75',
    isFocusSession: true,
    isReadOnly: true,
  },
  {
    id: 'ev-6',
    title: 'Workout',
    start: todayAt(7, 0),
    end: todayAt(7, 0),
    color: '#34D399',
    isHabit: true,
  },
  // Tomorrow
  {
    id: 'ev-7',
    title: 'Design review',
    start: daysFromNow(1, 11, 0),
    end: daysFromNow(1, 12, 0),
    color: '#FFB23D',
  },
  {
    id: 'ev-8',
    title: 'Team sync',
    start: daysFromNow(1, 14, 0),
    end: daysFromNow(1, 14, 45),
    color: '#5DA8FF',
    isExternal: true,
    isReadOnly: true,
  },
  // Day after tomorrow
  {
    id: 'ev-9',
    title: 'Sprint planning',
    start: daysFromNow(2, 10, 0),
    end: daysFromNow(2, 11, 30),
    color: '#FF4D3D',
  },
  // A few more for week view
  {
    id: 'ev-10',
    title: 'Code review',
    start: daysFromNow(3, 9, 0),
    end: daysFromNow(3, 10, 0),
    color: '#C084FC',
  },
  {
    id: 'ev-11',
    title: '1:1 with mentor',
    start: daysFromNow(4, 15, 0),
    end: daysFromNow(4, 16, 0),
    color: '#FFB23D',
    isExternal: true,
    isReadOnly: true,
  },
]

export const MOCK_OVERDUE: CalendarEvent[] = [
  {
    id: 'ov-1',
    title: 'Submit expense report',
    start: daysFromNow(-3, 9, 0),
    end: daysFromNow(-3, 10, 0),
    color: '#FF4D3D',
    daysOverdue: 3,
    priority: 'high',
  },
  {
    id: 'ov-2',
    title: 'Reply to client email',
    start: daysFromNow(-1, 14, 0),
    end: daysFromNow(-1, 14, 30),
    color: '#FFB23D',
    daysOverdue: 1,
    priority: 'medium',
  },
]

export const MOCK_UNSCHEDULED: CalendarEvent[] = [
  {
    id: 'us-1',
    title: 'Research new animation library',
    start: '',
    end: '',
    color: '#5DA8FF',
  },
  {
    id: 'us-2',
    title: 'Write unit tests for auth flow',
    start: '',
    end: '',
    color: '#C084FC',
  },
  {
    id: 'us-3',
    title: 'Update project README',
    start: '',
    end: '',
    color: '#34D399',
  },
  {
    id: 'us-4',
    title: 'Fix sidebar scroll bug',
    start: '',
    end: '',
    color: '#FFB23D',
    priority: 'high',
  },
]

/** Mock capacity data */
export const MOCK_CAPACITY = {
  scheduledHours: 6.5,
  capacityHours: 8,
}
