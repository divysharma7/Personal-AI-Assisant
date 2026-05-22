import { create } from 'zustand'

export type KanbanSize = 'small' | 'medium' | 'large'
export type TaskColorMode = 'list' | 'tag' | 'priority'
export type CalendarStyle = 'modern' | 'classic'
export type TimeFormat = '12h' | '24h'
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
export type WeekStart = 0 | 1 | 6 // Sunday, Monday, Saturday

interface SettingsState {
  showCompleted: boolean
  showCheckItem: boolean
  showFutureCycles: boolean
  showHabits: boolean
  showFocusRecords: boolean
  showItemIcons: boolean
  calendarStyle: CalendarStyle
  taskColorMode: TaskColorMode
  weekStartsOn: WeekStart
  timeFormat: TimeFormat
  dateFormat: DateFormat
  // Kanban display settings
  kanbanSize: KanbanSize
  showKanbanInputBox: boolean
  // Session-scoped list filter (null = show all)
  visibleListIds: string[] | null
  // Actions
  toggleSetting: (
    key: keyof Pick<
      SettingsState,
      | 'showCompleted'
      | 'showCheckItem'
      | 'showFutureCycles'
      | 'showHabits'
      | 'showFocusRecords'
      | 'showItemIcons'
    >
  ) => void
  setTaskColorMode: (mode: TaskColorMode) => void
  setCalendarStyle: (style: CalendarStyle) => void
  setWeekStartsOn: (day: WeekStart) => void
  setTimeFormat: (format: TimeFormat) => void
  setDateFormat: (format: DateFormat) => void
  setKanbanSize: (size: KanbanSize) => void
  setShowKanbanInputBox: (show: boolean) => void
  setVisibleListIds: (ids: string[] | null) => void
  toggleListVisibility: (listId: string) => void
  hydrate: (data: Partial<SettingsState>) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  showCompleted: true,
  showCheckItem: false,
  showFutureCycles: true,
  showHabits: true,
  showFocusRecords: false,
  showItemIcons: true,
  calendarStyle: 'modern',
  taskColorMode: 'list',
  weekStartsOn: 1,
  timeFormat: '12h',
  dateFormat: 'MM/DD/YYYY',
  kanbanSize: 'medium',
  showKanbanInputBox: true,
  visibleListIds: null,

  setKanbanSize: (size) => set({ kanbanSize: size }),

  setShowKanbanInputBox: (show) => set({ showKanbanInputBox: show }),

  toggleSetting: (key) => set((state) => ({ [key]: !state[key] })),

  setTaskColorMode: (mode) => set({ taskColorMode: mode }),

  setCalendarStyle: (style) => set({ calendarStyle: style }),

  setWeekStartsOn: (day) => set({ weekStartsOn: day }),

  setTimeFormat: (format) => set({ timeFormat: format }),

  setDateFormat: (format) => set({ dateFormat: format }),

  setVisibleListIds: (ids) => set({ visibleListIds: ids }),

  toggleListVisibility: (listId) =>
    set((state) => {
      const current = state.visibleListIds
      if (current === null) {
        return state
      }
      const included = current.includes(listId)
      const next = included
        ? current.filter((id) => id !== listId)
        : [...current, listId]
      return { visibleListIds: next.length === 0 ? null : next }
    }),

  hydrate: (data) => set(data),
}))
