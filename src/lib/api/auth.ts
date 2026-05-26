import { http } from './client'

export const auth = {
  login: (data: { username?: string; email?: string; password: string }) => http.post<any>('/api/auth/login', data),
  signup: (data: { email: string; password: string; name?: string }) => http.post<any>('/api/auth/signup', data),
  logout: () => http.post<any>('/api/auth/logout'),
  me: () => http.get<{ username: string; name: string }>('/api/auth/me'),
}
