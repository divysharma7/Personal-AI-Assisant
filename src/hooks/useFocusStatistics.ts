import { useQuery } from '@tanstack/react-query'
import { env } from '@/config/env'

const API_BASE = env.VITE_API_URL

interface DailyStat {
  period: string
  durationSeconds: number
  pomoCount: number
  count: number
}

interface TargetStat {
  targetId: string
  title: string
  durationSeconds: number
  pomoCount: number
  count: number
}

interface HourDistribution {
  hour: number
  totalSeconds: number
  sessionCount: number
}

export interface FocusStatistics {
  dailyStats: DailyStat[]
  topTasks: TargetStat[]
  topHabits: TargetStat[]
  hourDistribution: HourDistribution[]
}

type GroupBy = 'day' | 'week' | 'month'

async function fetchStatistics(groupBy: GroupBy = 'day', limit: number = 30): Promise<FocusStatistics> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const params = new URLSearchParams({
    groupBy,
    limit: String(limit),
    timezone,
  })

  const response = await fetch(`${API_BASE}/api/focus/statistics?${params}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch statistics')
  }

  return response.json()
}

export function useFocusStatistics(groupBy: GroupBy = 'day', limit: number = 30) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return useQuery({
    queryKey: ['focusStatistics', groupBy, limit, timezone],
    queryFn: () => fetchStatistics(groupBy, limit),
    staleTime: 60_000, // Cache for 1 minute
  })
}

// Helper functions for statistics display
export function formatDurationForChart(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  const hours = Math.floor(seconds / 3600)
  const mins = Math.round((seconds % 3600) / 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function getHourLabel(hour: number): string {
  if (hour === 0) return '12am'
  if (hour < 12) return `${hour}am`
  if (hour === 12) return '12pm'
  return `${hour - 12}pm`
}
