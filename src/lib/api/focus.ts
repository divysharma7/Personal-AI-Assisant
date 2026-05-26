import { http } from './client'

export const focus = {
  sessions: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return http.get<any[]>(`/api/focus/sessions${qs}`)
  },
  createSession: (data: any) => http.post<any>('/api/focus/sessions', data),
  active: () => http.get<any>('/api/focus/sessions/active'),
  updateSession: (id: string, data: any) => http.patch<any>(`/api/focus/sessions/${id}`, data),
  stats: () => http.get<any>('/api/focus/stats'),
}
