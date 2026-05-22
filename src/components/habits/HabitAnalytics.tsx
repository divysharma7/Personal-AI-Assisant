'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { fadeSlideUp, stagger, ease } from '@/lib/motion'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import type { Habit } from '@/hooks/useHabits'
import { copy } from '@/lib/copy'

const COPY = copy.habitAnalytics

interface HabitAnalyticsProps {
  habits: Habit[]
  weekCompletions: (habit: Habit) => { date: string; day: string; completed: boolean; isToday: boolean }[]
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getCompletionRate(habits: Habit[], days: number): number {
  if (habits.length === 0) return 0
  const today = new Date()
  let total = 0
  let completed = 0
  for (let i = 0; i < days; i++) {
    const day = format(subDays(today, i), 'yyyy-MM-dd')
    for (const h of habits) {
      total++
      if (h.completions.includes(day)) completed++
    }
  }
  return total > 0 ? Math.round((completed / total) * 100) : 0
}

function getHeatmapData(habits: Habit[]): { date: string; intensity: number }[] {
  const today = new Date()
  const days = eachDayOfInterval({ start: subDays(today, 89), end: today })
  return days.map(d => {
    const dateStr = format(d, 'yyyy-MM-dd')
    if (habits.length === 0) return { date: dateStr, intensity: 0 }
    const count = habits.filter(h => h.completions.includes(dateStr)).length
    return { date: dateStr, intensity: count / habits.length }
  })
}

function getDayOfWeekBreakdown(habits: Habit[]): { day: string; pct: number }[] {
  const today = new Date()
  const counts = Array(7).fill(0)
  const totals = Array(7).fill(0)
  for (let i = 0; i < 90; i++) {
    const d = subDays(today, i)
    const dow = (d.getDay() + 6) % 7 // Mon=0
    const dateStr = format(d, 'yyyy-MM-dd')
    for (const h of habits) {
      totals[dow]++
      if (h.completions.includes(dateStr)) counts[dow]++
    }
  }
  return DAY_LABELS.map((day, i) => ({
    day,
    pct: totals[i] > 0 ? Math.round((counts[i] / totals[i]) * 100) : 0,
  }))
}

function generateInsights(habits: Habit[]): string[] {
  const insights: string[] = []
  if (habits.length === 0) return insights

  // Find strongest streak
  const strongest = habits.reduce((a, b) => (a.currentStreak > b.currentStreak ? a : b))
  if (strongest.currentStreak > 0) {
    insights.push(
      `Your ${strongest.name} streak is your strongest at ${strongest.currentStreak} days.`
    )
  }

  // Find stale habits
  for (const h of habits) {
    const sorted = [...h.completions].sort().reverse()
    if (sorted.length === 0) {
      insights.push(`${h.name} hasn't been logged yet -- start today!`)
    } else {
      const lastDate = new Date(sorted[0])
      const daysSince = Math.floor(
        (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSince > 7) {
        insights.push(
          `${h.name} hasn't been logged in ${daysSince} days -- archive or revive?`
        )
      }
    }
  }

  return insights.slice(0, 3)
}

// Placeholder unachieved reasons -- these would come from real data
const PLACEHOLDER_REASONS = [
  { reason: 'Tired', count: 5 },
  { reason: 'No time', count: 3 },
  { reason: 'Forgot', count: 2 },
]

export default function HabitAnalytics({ habits }: HabitAnalyticsProps) {
  const heatmap = useMemo(() => getHeatmapData(habits), [habits])
  const rate7 = useMemo(() => getCompletionRate(habits, 7), [habits])
  const rate30 = useMemo(() => getCompletionRate(habits, 30), [habits])
  const rate90 = useMemo(() => getCompletionRate(habits, 90), [habits])
  const dayBreakdown = useMemo(() => getDayOfWeekBreakdown(habits), [habits])
  const insights = useMemo(() => generateInsights(habits), [habits])

  // Build heatmap grid: 13 columns x 7 rows
  const heatmapGrid = useMemo(() => {
    const rows: { date: string; intensity: number }[][] = Array.from(
      { length: 7 },
      () => []
    )
    heatmap.forEach((cell, i) => {
      const row = i % 7
      rows[row].push(cell)
    })
    return rows
  }, [heatmap])

  const maxBarPct = useMemo(
    () => Math.max(...dayBreakdown.map((d) => d.pct), 1),
    [dayBreakdown]
  )

  return (
    <motion.div
      {...fadeSlideUp}
      transition={ease.normal}
      className="flex flex-col gap-6"
    >
      {/* 90-day heatmap */}
      <div>
        <h3
          className="mb-3 text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {COPY.heatmapTitle}
        </h3>
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: 'var(--bg-pane-2)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex gap-[2px]">
            {/* Transpose: columns are weeks */}
            {Array.from({ length: 13 }).map((_, col) => (
              <div key={col} className="flex flex-col gap-[2px]">
                {heatmapGrid.map((row, rowIdx) => {
                  const cell = row[col]
                  const intensity = cell?.intensity ?? 0
                  return (
                    <div
                      key={rowIdx}
                      className="h-3 w-3 rounded-[2px]"
                      title={cell?.date ?? ''}
                      style={{
                        backgroundColor:
                          intensity === 0
                            ? 'var(--bg-hover)'
                            : `color-mix(in srgb, var(--accent) ${Math.round(
                                intensity * 100
                              )}%, var(--bg-hover))`,
                        opacity: intensity === 0 ? 0.4 : 0.4 + intensity * 0.6,
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Completion rate cards */}
      <div>
        <h3
          className="mb-3 text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {COPY.completionRates}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: COPY.sevenDay, value: rate7 },
            { label: COPY.thirtyDay, value: rate30 },
            { label: COPY.ninetyDay, value: rate90 },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl p-4 text-center"
              style={{
                backgroundColor: 'var(--bg-pane-2)',
                border: '1px solid var(--border)',
              }}
            >
              <p
                className="text-2xl font-bold"
                style={{ color: 'var(--accent)' }}
              >
                {card.value}%
              </p>
              <p
                className="mt-1 text-xs"
                style={{ color: 'var(--text-faint)' }}
              >
                {card.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Day of week breakdown */}
      <div>
        <h3
          className="mb-3 text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {COPY.dayBreakdown}
        </h3>
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: 'var(--bg-pane-2)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-end gap-2" style={{ height: 120 }}>
            {dayBreakdown.map((d) => (
              <div
                key={d.day}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div className="relative w-full flex justify-center" style={{ height: 100 }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.pct / maxBarPct) * 100}%` }}
                    transition={ease.normal}
                    className="w-6 rounded-t-md"
                    style={{
                      backgroundColor: 'var(--accent)',
                      position: 'absolute',
                      bottom: 0,
                      opacity: 0.7 + (d.pct / 100) * 0.3,
                    }}
                  />
                </div>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: 'var(--text-faint)' }}
                >
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top unachieved reasons */}
      <div>
        <h3
          className="mb-3 text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {COPY.topReasons}
        </h3>
        <motion.div {...stagger(0.05)} className="flex flex-col gap-2">
          {PLACEHOLDER_REASONS.map((r) => (
            <motion.div
              key={r.reason}
              {...fadeSlideUp}
              transition={ease.normal}
              className="flex items-center justify-between rounded-lg px-4 py-2.5"
              style={{
                backgroundColor: 'var(--bg-pane-2)',
                border: '1px solid var(--border)',
              }}
            >
              <span
                className="text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                {r.reason}
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  color: 'var(--text-faint)',
                }}
              >
                {r.count}x
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Insights */}
      <div>
        <h3
          className="mb-3 text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {COPY.insights}
        </h3>
        {insights.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
            {COPY.noData}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="rounded-xl px-4 py-3"
                style={{
                  backgroundColor: 'var(--accent-soft)',
                  border: '1px solid var(--border)',
                }}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {insight}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
