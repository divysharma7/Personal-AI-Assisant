import { http } from './client'
export const contacts = {
  list: () => http.get<any[]>('/api/contacts'),
  create: (data: any) => http.post<any>('/api/contacts', data),
  update: (id: string, data: any) => http.put<any>(`/api/contacts/${id}`, data),
  delete: (id: string) => http.del<any>(`/api/contacts/${id}`),
}
export const notes = {
  list: () => http.get<any[]>('/api/notes'),
  create: (data: any) => http.post<any>('/api/notes', data),
  update: (id: string, data: any) => http.put<any>(`/api/notes/${id}`, data),
  delete: (id: string) => http.del<any>(`/api/notes/${id}`),
}
export const memories = {
  list: () => http.get<any[]>('/api/memories'),
  create: (data: any) => http.post<any>('/api/memories', data),
  update: (id: string, data: any) => http.put<any>(`/api/memories/${id}`, data),
  delete: (id: string) => http.del<any>(`/api/memories/${id}`),
}
export const reminders = {
  list: () => http.get<any[]>('/api/reminders'),
  create: (data: any) => http.post<any>('/api/reminders', data),
  update: (id: string, data: any) => http.put<any>(`/api/reminders/${id}`, data),
  delete: (id: string) => http.del<any>(`/api/reminders/${id}`),
  snooze: (id: string, minutes: number) => http.post<any>(`/api/reminders/${id}/snooze`, { snoozeMinutes: minutes }),
}
export const kanbanSections = {
  list: () => http.get<any[]>('/api/kanban-sections'),
  create: (data: any) => http.post<any>('/api/kanban-sections', data),
  update: (id: string, data: any) => http.put<any>(`/api/kanban-sections/${id}`, data),
  delete: (id: string) => http.del<any>(`/api/kanban-sections/${id}`),
}
export const listGroups = {
  list: () => http.get<any[]>('/api/list-groups'),
  create: (data: any) => http.post<any>('/api/list-groups', data),
  update: (id: string, data: any) => http.patch<any>(`/api/list-groups/${id}`, data),
  delete: (id: string) => http.del<any>(`/api/list-groups/${id}`),
}
export const pomodoro = {
  list: () => http.get<any[]>('/api/pomodoro'),
  create: (data: any) => http.post<any>('/api/pomodoro', data),
  update: (id: string, data: any) => http.patch<any>(`/api/pomodoro/${id}`, data),
}
export const journal = {
  get: (date: string) => http.get<any>(`/api/journal?date=${date}`),
  list: () => http.get<any[]>('/api/journal'),
  save: (data: { date: string; content: string }) => http.put<any>('/api/journal', data),
}
export const chatSessions = {
  list: () => http.get<any[]>('/api/chat/sessions'),
  create: (data?: any) => http.post<any>('/api/chat/sessions', data),
  get: (id: string) => http.get<any>(`/api/chat/sessions/${id}`),
  update: (id: string, data: any) => http.put<any>(`/api/chat/sessions/${id}`, data),
  delete: (id: string) => http.del<any>(`/api/chat/sessions/${id}`),
}
export const push = {
  subscribe: (data: any) => http.post<any>('/api/push/subscribe', data),
  unsubscribe: (endpoint: string) => http.del<any>('/api/push/subscribe'),
}
export const devices = {
  register: (data: any) => http.post<any>('/api/devices/register', data),
}
