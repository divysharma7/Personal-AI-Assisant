'use client'

import { useQuery } from '@tanstack/react-query'

const HEATMAP_KEY = ['calendar', 'heatmap'] as const

async function fetchHeatmap(year: number): Promise<Record<string, number>> {
  const res = await fetch(`/api/calendar/heatmap?year=${year}`)
  if (!res.ok) throw new Error('Failed to fetch heatmap data')
  return res.json()
}

/**
 * Fetches task completion heatmap data for a given year.
 * Returns { [YYYY-MM-DD]: completedCount }.
 */
export function useHeatmap(year: number) {
  return useQuery({
    queryKey: [...HEATMAP_KEY, year],
    queryFn: () => fetchHeatmap(year),
    enabled: !!year,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
