import { create } from 'zustand'
import type { CalendarViewMode } from '@/components/calendar/types'

interface CalendarState {
  viewMode: CalendarViewMode
  currentDate: Date
  hourHeight: number
  allDayBarHeight: number
  selectedTaskIds: string[]
  /** 1 = forward, -1 = backward, 0 = neutral (e.g. "today") */
  navigationDirection: number
  // Arrange Tasks panel
  arrangePanelOpen: boolean
  // Split View
  splitViewOpen: boolean
  splitViewListId: string | null
  // Hidden hours boundaries (hours 0-based)
  /** First visible hour — hours before this are hidden. Default 0 (nothing hidden). */
  hiddenHoursStart: number
  /** Last visible hour boundary — hours from this onward are hidden. Default 24 (nothing hidden). */
  hiddenHoursEnd: number

  setViewMode: (mode: CalendarViewMode) => void
  setCurrentDate: (date: Date) => void
  setHourHeight: (height: number) => void
  setAllDayBarHeight: (height: number) => void
  toggleTaskSelection: (id: string) => void
  clearSelection: () => void
  navigateBy: (direction: -1 | 0 | 1) => void
  setArrangePanelOpen: (open: boolean) => void
  setSplitViewOpen: (open: boolean) => void
  setSplitViewListId: (listId: string | null) => void
  setHiddenHoursStart: (hour: number) => void
  setHiddenHoursEnd: (hour: number) => void
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  viewMode: 'week',
  currentDate: new Date(),
  hourHeight: 48,
  allDayBarHeight: 60,
  selectedTaskIds: [],
  navigationDirection: 1,
  arrangePanelOpen: false,
  splitViewOpen: false,
  splitViewListId: null,
  hiddenHoursStart: 7,
  hiddenHoursEnd: 21,

  setViewMode: (mode) => set({ viewMode: mode }),
  setCurrentDate: (date) => set({ currentDate: date }),
  setHourHeight: (height) => set({ hourHeight: Math.max(24, Math.min(120, height)) }),
  setAllDayBarHeight: (height) => set({ allDayBarHeight: Math.max(40, Math.min(240, height)) }),
  toggleTaskSelection: (id) =>
    set((state) => {
      const ids = state.selectedTaskIds.includes(id)
        ? state.selectedTaskIds.filter((i) => i !== id)
        : [...state.selectedTaskIds, id]
      return { selectedTaskIds: ids }
    }),
  clearSelection: () => set({ selectedTaskIds: [] }),
  navigateBy: (direction) => {
    const { viewMode, currentDate } = get()
    if (direction === 0) {
      set({ currentDate: new Date(), navigationDirection: 1 })
      return
    }
    const d = new Date(currentDate)
    switch (viewMode) {
      case 'day':
        d.setDate(d.getDate() + direction)
        break
      case '3day':
        d.setDate(d.getDate() + direction * 3)
        break
      case 'week':
        d.setDate(d.getDate() + direction * 7)
        break
      case 'multiweek':
        d.setDate(d.getDate() + direction * 14)
        break
      case 'month':
        d.setMonth(d.getMonth() + direction)
        break
      case 'year':
        d.setFullYear(d.getFullYear() + direction)
        break
      case 'agenda':
        d.setDate(d.getDate() + direction * 14)
        break
    }
    set({ currentDate: d, navigationDirection: direction })
  },
  setArrangePanelOpen: (open) => set({ arrangePanelOpen: open }),
  setSplitViewOpen: (open) => set({ splitViewOpen: open }),
  setSplitViewListId: (listId) => set({ splitViewListId: listId }),
  setHiddenHoursStart: (hour) => set({ hiddenHoursStart: Math.max(0, Math.min(12, hour)) }),
  setHiddenHoursEnd: (hour) => set({ hiddenHoursEnd: Math.max(12, Math.min(24, hour)) }),
}))
