import { useQuery } from '@tanstack/react-query'
import { env } from '@/config/env'

const API_BASE = env.VITE_API_URL

interface OverviewDaily {
  date: string
  tasks: number
  focusMinutes: number
  habits: number
  pomoCount: number
}

export interface StatisticsOverview {
  range: { days: number; timezone: string; from: string; to: string }
  tasks: { completed: number; completedInRange: number; open: number }
  focus: { sessions: number; totalMinutes: number; minutesInRange: number }
  habits: { active: number; achievedInRange: number; bestStreak: number; currentBestStreak: number }
  today: { completed: number; pomo: number; focusSeconds: number }
  total: { completed: number; pomo: number; focusSeconds: number; lists: number }
  statsDays: number
  daily: OverviewDaily[]
}

async function fetchOverview(days: number = 7): Promise<StatisticsOverview> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const params = new URLSearchParams({ days: String(days), timezone })
  const res = await fetch(`${API_BASE}/api/statistics/overview?${params}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch statistics overview')
  return res.json()
}

export function useStatisticsOverview(days: number = 7) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return useQuery({
    queryKey: ['statisticsOverview', days, timezone],
    queryFn: () => fetchOverview(days),
    staleTime: 60_000,
  })
}
