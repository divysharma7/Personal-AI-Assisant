import { useMutation, useQueryClient } from '@tanstack/react-query'
import { env } from '@/config/env'

const API_BASE = env.VITE_API_URL

interface AddFocusRecordInput {
  targetType: 'TASK' | 'HABIT' | 'NONE'
  targetId?: string | null
  targetTitleSnapshot?: string | null
  startTime: string
  endTime: string
  mode: 'POMO' | 'STOPWATCH'
  pomoCount?: number
  note?: string | null
  timezone?: string | null
}

async function addFocusRecord(data: AddFocusRecordInput) {
  const response = await fetch(`${API_BASE}/api/focus/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to add record' }))
    throw new Error(error.message || 'Failed to add focus record')
  }

  return response.json()
}

export function useAddFocusRecord() {
  const queryClient = useQueryClient()
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return useMutation({
    mutationFn: (input: AddFocusRecordInput) =>
      addFocusRecord({ ...input, timezone: input.timezone || timezone }),
    onSuccess: () => {
      // Invalidate and refetch dashboard and records
      queryClient.invalidateQueries({ queryKey: ['focusDashboard'] })
      queryClient.invalidateQueries({ queryKey: ['focusRecords'] })
      queryClient.invalidateQueries({ queryKey: ['focusStats'] })
    },
  })
}
