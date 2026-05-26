import { http } from './client'
export const events = {
  list: () => http.get<any[]>('/api/events'),
  create: (data: any) => http.post<any>('/api/events', data),
  update: (id: string, data: any) => http.put<any>(`/api/events/${id}`, data),
  delete: (id: string) => http.del<any>(`/api/events/${id}`),
  addComment: (id: string, text: string) => http.post<any>(`/api/events/${id}/comments`, { text }),
}
