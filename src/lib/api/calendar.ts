import { http } from './client'

export const calendar = {
  unified: () => http.get<any[]>('/api/calendar'),
  events: (params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString()
    return http.get<any[]>(`/api/calendar/events?${qs}`)
  },
  unscheduled: () => http.get<any[]>('/api/calendar/unscheduled'),
  overdue: () => http.get<any[]>('/api/calendar/overdue'),
  capacity: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return http.get<any[]>(`/api/calendar/capacity${qs}`)
  },
  heatmap: () => http.get<any[]>('/api/calendar/heatmap'),
}
