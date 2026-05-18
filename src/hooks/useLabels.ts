'use client'

import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { LabelItem } from '@/components/popovers/LabelPopover'

const LABELS_KEY = ['labels'] as const

async function fetchLabels(): Promise<LabelItem[]> {
  const res = await fetch('/api/labels')
  if (!res.ok) throw new Error('Failed to fetch labels')
  return res.json()
}

export function useLabels() {
  const queryClient = useQueryClient()

  const { data: labels = [], isLoading } = useQuery({
    queryKey: LABELS_KEY,
    queryFn: fetchLabels,
  })

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ownerId: 'default' }),
      })
      if (!res.ok) throw new Error('Failed to create label')
      return res.json() as Promise<LabelItem>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LABELS_KEY })
    },
  })

  const createLabel = useCallback(async (name: string) => {
    return createMutation.mutateAsync(name)
  }, [createMutation])

  return { labels, isLoading, createLabel }
}
