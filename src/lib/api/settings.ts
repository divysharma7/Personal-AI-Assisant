import { http } from './client'
export const settings = {
  getFocusPrefs: () => http.get<any>('/api/users/me/focus-preferences'),
  updateFocusPrefs: (data: any) => http.patch<any>('/api/users/me/focus-preferences', data),
  getCalendarPrefs: () => http.get<any>('/api/users/me/calendar-preferences'),
  updateCalendarPrefs: (data: any) => http.patch<any>('/api/users/me/calendar-preferences', data),
  getMcp: () => http.get<any>('/api/users/me/mcp'),
  updateMcp: (data: any) => http.patch<any>('/api/users/me/mcp', data),
}
