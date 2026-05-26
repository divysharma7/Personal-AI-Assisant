import { http } from './client'
export const workflows = {
  list: () => http.get<any[]>('/api/workflows'),
  create: (data: any) => http.post<any>('/api/workflows', data),
  get: (id: string) => http.get<any>(`/api/workflows/${id}`),
  update: (id: string, data: any) => http.put<any>(`/api/workflows/${id}`, data),
  delete: (id: string) => http.del<any>(`/api/workflows/${id}`),
  addColumn: (id: string, col: any) => http.post<any>(`/api/workflows/${id}/columns`, col),
  setColumns: (id: string, cols: any[]) => http.put<any>(`/api/workflows/${id}/columns`, cols),
}
