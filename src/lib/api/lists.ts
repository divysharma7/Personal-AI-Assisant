import { http } from './client'
export const lists = {
  list: () => http.get<any[]>('/api/lists'),
  create: (data: any) => http.post<any>('/api/lists', data),
  get: (id: string) => http.get<any>(`/api/lists/${id}`),
  update: (id: string, data: any) => http.patch<any>(`/api/lists/${id}`, data),
  delete: (id: string) => http.del<any>(`/api/lists/${id}`),
  updateBlocks: (id: string, blocks: any) => http.patch<any>(`/api/lists/${id}/blocks`, { blocks }),
}
