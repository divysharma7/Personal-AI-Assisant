import { createContext, useContext } from 'react'

export interface CalendarDisplayPreferencesValue {
  timeFormat: '12h' | '24h'
  weekStartsOn: 0 | 1 | 6
}

export const CalendarDisplayPreferencesContext = createContext<CalendarDisplayPreferencesValue>({
  timeFormat: '24h',
  weekStartsOn: 1,
})

export function useCalendarDisplayPreferences() {
  return useContext(CalendarDisplayPreferencesContext)
}
