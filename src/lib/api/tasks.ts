import { http } from './client'

export const tasks = {
  list: () => http.get<any[]>('/api/tasks'),
  create: (data: any) => http.post<any>('/api/tasks', data),
  get: (id: string) => http.get<any>(`/api/tasks/${id}`),
  update: (id: string, data: any) => http.put<any>(`/api/tasks/${id}`, data),
  patch: (id: string, data: any) => http.patch<any>(`/api/tasks/${id}`, data),
  delete: (id: string) => http.del<any>(`/api/tasks/${id}`),
  schedule: (id: string, data: any) => http.patch<any>(`/api/tasks/${id}/schedule`, data),
  unschedule: (id: string) => http.patch<any>(`/api/tasks/${id}/unschedule`, {}),
  addComment: (id: string, text: string) => http.post<any>(`/api/tasks/${id}/comments`, { text }),
  reorder: (data: any) => http.post<any>('/api/tasks/reorder', data),
  indent: (id: string) => http.patch<any>(`/api/tasks/${id}/indent`, {}),
  outdent: (id: string) => http.patch<any>(`/api/tasks/${id}/outdent`, {}),
  reparent: (id: string, parentId: string | null) => http.patch<any>(`/api/tasks/${id}/reparent`, { parentId }),
}
