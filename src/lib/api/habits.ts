import { http } from './client'

export const habits = {
  list: () => http.get<any[]>('/api/habits'),
  create: (data: any) => http.post<any>('/api/habits', data),
  get: (id: string) => http.get<any>(`/api/habits/${id}`),
  update: (id: string, data: any) => http.put<any>(`/api/habits/${id}`, data),
  delete: (id: string) => http.del<any>(`/api/habits/${id}`),
  checkin: (id: string, data: any) => http.post<any>(`/api/habits/${id}/checkin`, data),
  completions: (id: string) => http.get<any[]>(`/api/habits/${id}/completions`),
  today: () => http.get<any[]>('/api/habits/today'),
  stats: () => http.get<any>('/api/habits/stats'),
}
