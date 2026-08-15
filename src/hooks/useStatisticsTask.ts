import { useQuery } from '@tanstack/react-query'
import { env } from '@/config/env'

const API_BASE = env.VITE_API_URL

interface DailyCompletion { date: string; count: number }
interface ListItem { listId: string | null; listName: string; count: number }

export interface TaskStatistics {
  current: {
    completedTasks: number
    completionRate: number
    overdueTasks: number
    onTimeTasks: number
    undatedTasks: number
    uncompletedTasks: number
    totalApplicable: number
    dailyCompletions: DailyCompletion[]
    byList: ListItem[]
  }
  previous: {
    completedTasks: number
    completionRate: number
  }
  range: {
    type: string
    currentStart: string
    currentEnd: string
    previousStart: string
    previousEnd: string
    timezone: string
  }
}

async function fetchTaskStats(range: string, date: string): Promise<TaskStatistics> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const params = new URLSearchParams({ range, date, timezone })
  const res = await fetch(`${API_BASE}/api/statistics/task?${params}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch task statistics')
  return res.json()
}

export function useStatisticsTask(range: 'day' | 'week' | 'month', date: string) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return useQuery({
    queryKey: ['statisticsTask', range, date, timezone],
    queryFn: () => fetchTaskStats(range, date),
    staleTime: 60_000,
  })
}
