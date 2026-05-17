'use client'
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
  currentStreak: number
  bestStreak: number
  archived: boolean
  order: number
}

const HABITS_KEY = ['habits'] as const

async function fetchHabits(): Promise<Habit[]> {
  const res = await fetch('/api/habits')
  if (!res.ok) throw new Error('Failed to fetch habits')
  return res.json()
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
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create habit')
      return res.json() as Promise<Habit>
    },
    onSettled: () => qc.invalidateQueries({ queryKey: HABITS_KEY }),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Habit> }) => {
      const res = await fetch(`/api/habits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update habit')
      return res.json() as Promise<Habit>
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
      await fetch(`/api/habits/${id}`, { method: 'DELETE' })
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

  const toggleToday = useCallback(async (habit: Habit) => {
    const today = todayStr()
    const completed = habit.completions.includes(today)
    const newCompletions = completed
      ? habit.completions.filter(d => d !== today)
      : [...habit.completions, today]
    const newStreak = calcStreak(newCompletions)
    const newBest = Math.max(habit.bestStreak, newStreak)

    await updateMutation.mutateAsync({
      id: habit._id,
      data: { completions: newCompletions, currentStreak: newStreak, bestStreak: newBest },
    })
  }, [updateMutation])

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
    habits, isLoading, createHabit, updateHabit, deleteHabit, toggleToday,
    todayCompletionRate, weekCompletions, todayStr,
  }
}
