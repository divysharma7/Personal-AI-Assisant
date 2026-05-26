import { http } from './client'
export const integrations = {
  googleAuth: () => http.get<{ url: string }>('/api/integrations/google/auth'),
  googleStatus: () => http.get<{ connected: boolean; calendarId: string }>('/api/integrations/google/status'),
  googleDisconnect: () => http.post<any>('/api/integrations/google/disconnect'),
  googleSync: (data?: any) => http.post<any>('/api/integrations/google/sync', data),
  googleUnsync: (data?: any) => http.post<any>('/api/integrations/google/unsync', data),
}
