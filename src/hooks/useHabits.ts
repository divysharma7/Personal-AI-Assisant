'use client'
import { env } from '@/config/env'
const API_BASE = env.VITE_API_URL

import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, subDays, eachDayOfInterval, isToday } from 'date-fns'

export interface Habit {
  _id: string
  name: string
  description?: string
  frequency: 'daily' | 'weekdays' | 'weekly' | 'custom'
  customDays?: number[]
  color: string
  icon: string
  completions: string[]
  completionStatuses?: Record<string, HabitCheckinStatus>
  currentStreak: number
  bestStreak: number
  archived: boolean
  order: number
}

export type HabitCheckinStatus = 'achieved' | 'unachieved' | 'skipped' | 'frozen'

interface HabitApiCompletion {
  date: string
  status: HabitCheckinStatus
}

interface HabitApiRecord {
  _id: string
  name?: string
  title?: string
  description?: string
  frequency?: Habit['frequency']
  habitFrequency?: { type?: Habit['frequency']; daysOfWeek?: number[] } | null
  customDays?: number[]
  color?: string
  habitColor?: string | null
  icon?: string
  habitIcon?: string | null
  completions?: Array<string | HabitApiCompletion>
  currentStreak?: number
  streakCurrent?: number
  bestStreak?: number
  streakBest?: number
  archived?: boolean
  status?: string
  order?: number
}

const HABITS_KEY = ['habits'] as const

function normalizeHabit(record: HabitApiRecord): Habit {
  const rawCompletions = record.completions ?? []
  const completionStatuses = Object.fromEntries(
    rawCompletions
      .filter((entry): entry is HabitApiCompletion => typeof entry !== 'string')
      .map((entry) => [entry.date.slice(0, 10), entry.status]),
  )
  const completions = rawCompletions
    .filter((entry) => typeof entry === 'string' || entry.status === 'achieved' || entry.status === 'frozen')
    .map((entry) => typeof entry === 'string' ? entry.slice(0, 10) : entry.date.slice(0, 10))

  return {
    _id: record._id,
    name: record.name ?? record.title ?? 'Untitled habit',
    description: record.description,
    frequency: record.frequency ?? record.habitFrequency?.type ?? 'daily',
    customDays: record.customDays ?? record.habitFrequency?.daysOfWeek,
    color: record.color ?? record.habitColor ?? '#7c83ff',
    icon: record.icon ?? record.habitIcon ?? '✦',
    completions,
    completionStatuses,
    currentStreak: record.currentStreak ?? record.streakCurrent ?? 0,
    bestStreak: record.bestStreak ?? record.streakBest ?? 0,
    archived: record.archived ?? record.status === 'dropped',
    order: record.order ?? 0,
  }
}

async function fetchHabits(): Promise<Habit[]> {
  const res = await fetch(`${API_BASE}/api/habits`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch habits')
  const records = await res.json() as HabitApiRecord[]
  return records.map(normalizeHabit)
}

function todayStr() {
  return format(new Date(), 'yyyy-MM-dd')
}

function calcStreak(completions: string[]): number {
  if (completions.length === 0) return 0
  const sorted = [...completions].sort().reverse()
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const day = format(subDays(today, i), 'yyyy-MM-dd')
    if (sorted.includes(day)) {
      streak++
    } else if (i > 0) {
      break
    }
    // Allow today to not be completed yet
  }
  return streak
}

export function useHabits() {
  const qc = useQueryClient()

  const { data: habits = [], isLoading } = useQuery({
    queryKey: HABITS_KEY,
    queryFn: fetchHabits,
  })

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Habit>) => {
      const res = await fetch(`${API_BASE}/api/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to create habit')
      return normalizeHabit(await res.json() as HabitApiRecord)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: HABITS_KEY }),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Habit> }) => {
      const res = await fetch(`${API_BASE}/api/habits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to update habit')
      return normalizeHabit(await res.json() as HabitApiRecord)
    },
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: HABITS_KEY })
      const prev = qc.getQueryData<Habit[]>(HABITS_KEY)
      qc.setQueryData<Habit[]>(HABITS_KEY, old => (old ?? []).map(h => h._id === id ? { ...h, ...data } as Habit : h))
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(HABITS_KEY, ctx.prev) },
    onSettled: () => qc.invalidateQueries({ queryKey: HABITS_KEY }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/api/habits/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error('Failed to delete habit')
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: HABITS_KEY })
      const prev = qc.getQueryData<Habit[]>(HABITS_KEY)
      qc.setQueryData<Habit[]>(HABITS_KEY, old => (old ?? []).filter(h => h._id !== id))
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(HABITS_KEY, ctx.prev) },
    onSettled: () => qc.invalidateQueries({ queryKey: HABITS_KEY }),
  })

  const checkinMutation = useMutation({
    mutationFn: async ({ id, status, date }: { id: string; status: HabitCheckinStatus; date: string }) => {
      const res = await fetch(`${API_BASE}/api/habits/${id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, status }),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to update habit check-in')
      return normalizeHabit(await res.json() as HabitApiRecord)
    },
    onMutate: async ({ id, status, date }) => {
      await qc.cancelQueries({ queryKey: HABITS_KEY })
      const prev = qc.getQueryData<Habit[]>(HABITS_KEY)
      qc.setQueryData<Habit[]>(HABITS_KEY, (old) => (old ?? []).map((habit) => {
        if (habit._id !== id) return habit
        const isComplete = status === 'achieved' || status === 'frozen'
        const completions = isComplete
          ? Array.from(new Set([...habit.completions, date]))
          : habit.completions.filter((completionDate) => completionDate !== date)
        return {
          ...habit,
          completions,
          completionStatuses: { ...habit.completionStatuses, [date]: status },
          currentStreak: calcStreak(completions),
          bestStreak: Math.max(habit.bestStreak, calcStreak(completions)),
        }
      }))
      return { prev }
    },
    onError: (_error, _variables, context) => {
      if (context?.prev) qc.setQueryData(HABITS_KEY, context.prev)
    },
    onSuccess: (updated) => {
      qc.setQueryData<Habit[]>(HABITS_KEY, (old) => (old ?? []).map((habit) => habit._id === updated._id ? updated : habit))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: HABITS_KEY }),
  })

  const toggleToday = useCallback(async (habit: Habit) => {
    const today = todayStr()
    const completed = habit.completions.includes(today)
    await checkinMutation.mutateAsync({
      id: habit._id,
      date: today,
      status: completed ? 'unachieved' : 'achieved',
    })
  }, [checkinMutation])

  const setStatusForDate = useCallback(async (habit: Habit, date: string, status: HabitCheckinStatus) => {
    await checkinMutation.mutateAsync({ id: habit._id, date, status })
  }, [checkinMutation])

  const setTodayStatus = useCallback(async (habit: Habit, status: HabitCheckinStatus) => {
    await setStatusForDate(habit, todayStr(), status)
  }, [setStatusForDate])

  const createHabit = useCallback(async (data: Partial<Habit>) => {
    return createMutation.mutateAsync(data)
  }, [createMutation])

  const updateHabit = useCallback(async (id: string, data: Partial<Habit>) => {
    return updateMutation.mutateAsync({ id, data })
  }, [updateMutation])

  const deleteHabit = useCallback(async (id: string) => {
    return deleteMutation.mutateAsync(id)
  }, [deleteMutation])

  // Stats
  const todayCompletionRate = habits.length > 0
    ? habits.filter(h => h.completions.includes(todayStr())).length / habits.length
    : 0

  const weekCompletions = useCallback((habit: Habit) => {
    const today = new Date()
    const days = eachDayOfInterval({ start: subDays(today, 6), end: today })
    return days.map(d => ({
      date: format(d, 'yyyy-MM-dd'),
      day: format(d, 'EEE'),
      completed: habit.completions.includes(format(d, 'yyyy-MM-dd')),
      isToday: isToday(d),
    }))
  }, [])

  return {
    habits, isLoading, createHabit, updateHabit, deleteHabit, toggleToday, setTodayStatus, setStatusForDate,
    todayCompletionRate, weekCompletions, todayStr,
  }
}
