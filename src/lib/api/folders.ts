import { http } from './client'
export const folders = {
  create: (data: any) => http.post<any>('/api/folders', data),
  update: (id: string, data: any) => http.patch<any>(`/api/folders/${id}`, data),
  delete: (id: string) => http.del<any>(`/api/folders/${id}`),
  addTask: (id: string, taskId: string) => http.patch<any>(`/api/folders/${id}/tasks`, { taskId }),
}
