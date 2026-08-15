import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { env } from '@/config/env'

const API_BASE = env.VITE_API_URL
const PRESETS_KEY = ['focusPresets'] as const

export interface CustomPreset {
  id: string
  name: string
  icon: string
  mode: 'pomo' | 'stopwatch'
  durationMinutes?: number
  createdAt: string
  updatedAt: string
}

interface CreatePresetInput {
  name: string
  icon?: string
  mode: 'pomo' | 'stopwatch'
  durationMinutes?: number
}

interface UpdatePresetInput {
  name?: string
  icon?: string
  mode?: 'pomo' | 'stopwatch'
  durationMinutes?: number | null
}

async function fetchPresets(): Promise<CustomPreset[]> {
  const response = await fetch(`${API_BASE}/api/focus/presets`, {
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch presets')
  return response.json()
}

async function createPreset(data: CreatePresetInput): Promise<CustomPreset> {
  const response = await fetch(`${API_BASE}/api/focus/presets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Failed to create preset' }))
    throw new Error(err.message || 'Failed to create preset')
  }
  return response.json()
}

async function updatePreset(id: string, data: UpdatePresetInput): Promise<CustomPreset> {
  const response = await fetch(`${API_BASE}/api/focus/presets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update preset')
  return response.json()
}

async function deletePreset(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/focus/presets/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to delete preset')
}

export function useFocusPresets() {
  return useQuery({
    queryKey: PRESETS_KEY,
    queryFn: fetchPresets,
    staleTime: 60_000,
  })
}

export function useCreatePreset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRESETS_KEY })
    },
  })
}

export function useUpdatePreset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePresetInput }) => updatePreset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRESETS_KEY })
    },
  })
}

export function useDeletePreset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRESETS_KEY })
    },
  })
}
