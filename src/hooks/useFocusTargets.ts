import { useQuery } from '@tanstack/react-query'
import { env } from '@/config/env'

const API_BASE = env.VITE_API_URL

export type TargetType = 'TASK' | 'HABIT'

export interface FocusTarget {
  id: string
  title: string
}

export interface SelectedTarget {
  type: TargetType | 'NONE'
  id?: string
  title?: string
}

async function fetchTargets(type: TargetType, query: string, limit: number = 20): Promise<FocusTarget[]> {
  const params = new URLSearchParams({
    type,
    limit: String(limit),
  })
  if (query) params.set('q', query)

  const response = await fetch(`${API_BASE}/api/focus/targets?${params}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch targets')
  }

  return response.json()
}

export function useFocusTargets(type: TargetType, query: string) {
  return useQuery({
    queryKey: ['focusTargets', type, query],
    queryFn: () => fetchTargets(type, query),
    staleTime: 30_000, // Cache for 30 seconds
    placeholderData: (prev) => prev, // Keep previous data while fetching
  })
}

export function useAllFocusTargets(type: TargetType) {
  return useQuery({
    queryKey: ['focusTargets', type, ''],
    queryFn: () => fetchTargets(type, ''),
    staleTime: 60_000, // Cache for 1 minute
  })
}
