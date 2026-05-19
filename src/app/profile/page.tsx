'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fade, fadeSlideUp, stagger, ease } from '@/lib/motion'
import { CheckCircle2, BarChart3 as BarChart3Icon, Target } from 'lucide-react'
import { useHabits } from '@/hooks/useHabits'
import { useTasks } from '@/hooks/useTasks'
import { format, subDays, eachDayOfInterval, isToday, startOfWeek, endOfWeek } from 'date-fns'
import HabitAnalytics from '@/components/habits/HabitAnalytics'

// TODO: move to copy.ts
const COPY = {
  title: 'Statistics',
  tabs: ['Overview', 'Task', 'Focus'] as const,
  stats: {
    tasksCompleted: 'Tasks completed',
    activeHabits: 'Active habits',
    focusHours: 'Focus hours',
    currentStreaks: 'Current streaks',
    thisWeek: 'this week',
  },
  weeklyCompletion: 'Weekly Completion',
  habitsSummary: 'Habits Summary',
  completionRate: 'Completion rate',
  mostConsistent: 'Most consistent',
  leastConsistent: 'Least consistent',
  atRisk: 'At risk',
  atRiskDesc: 'streak < 3 days',
  // Task tab
  taskTab: {
    dailyCompleted: 'Tasks Completed (Last 7 Days)',
    byPriority: 'By Priority',
    byList: 'By List (Top 5)',
    completionTrend: 'Completion Rate Trend',
  },
  // Focus tab
  focusTab: {
    sessions: 'Focus Sessions (Last 7 Days)',
    totalHours: 'Total Focus Hours',
    avgSession: 'Average Session Length',
    focusStreak: 'Focus Streak',
    thisWeek: 'This week',
    thisMonth: 'This month',
    consecutiveDays: 'consecutive days',
  },
  noData: 'No data yet',
} as const

type Tab = (typeof COPY.tabs)[number]

// Placeholder data for focus -- will be wired to real data layer
const PLACEHOLDER_FOCUS = {
  weekSessions: [2, 3, 1, 4, 2, 0, 3],
  weekHours: 7.5,
  monthHours: 28,
  avgMinutes: 45,
  streak: 4,
}

const PLACEHOLDER_FOCUS_EXTENDED = {
  sessionsToday: 3,
  sessionsThisWeek: 15,
  totalSessions: 142,
  minutesToday: 75,
  minutesThisWeek: 375,
  totalMinutes: 3550,
  avgSessionMinutes: 25,
  longestSessionMinutes: 52,
  mostFocusedTask: { title: 'Write LinkedIn post', hours: 3.2 },
  // 24 cells representing focus minutes per hour of day
  hourlyHeatmap: [
    0, 0, 0, 0, 0, 0, 5, 15, 45, 60, 50, 30,
    10, 25, 40, 55, 45, 35, 20, 10, 5, 0, 0, 0,
  ],
  // 4 weeks x 7 days of session counts
  weeklyTrend: [
    [1, 2, 0, 3, 1, 0, 1],
    [2, 1, 3, 2, 2, 1, 0],
    [0, 3, 2, 4, 1, 1, 2],
    [2, 3, 1, 4, 2, 0, 3],
  ],
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const { habits, weekCompletions, todayCompletionRate } = useHabits()
  const { tasks } = useTasks()
  const activeHabits = useMemo(() => habits.filter((h) => !h.archived), [habits])

  // Check if all data is empty (all stats zero)
  const hasNoOverviewData = useMemo(() => {
    const doneTasks = tasks.filter((t) => t.status === 'done')
    return doneTasks.length === 0 && activeHabits.length === 0
  }, [tasks, activeHabits])

  const hasNoTaskData = useMemo(() => {
    return tasks.filter((t) => t.status === 'done').length === 0
  }, [tasks])

  // Tasks completed this week
  const tasksCompletedThisWeek = useMemo(() => {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    return tasks.filter(
      (t) =>
        t.status === 'done' &&
        t.completedAt &&
        new Date(t.completedAt) >= weekStart
    ).length
  }, [tasks])

  // Sum of current streaks
  const totalStreaks = useMemo(
    () => activeHabits.reduce((sum, h) => sum + h.currentStreak, 0),
    [activeHabits]
  )

  // Weekly completion chart data (tasks)
  const weeklyTaskCompletion = useMemo(() => {
    const today = new Date()
    const days = eachDayOfInterval({ start: subDays(today, 6), end: today })
    return days.map((d) => {
      const dateStr = format(d, 'yyyy-MM-dd')
      const completed = tasks.filter(
        (t) => t.completedAt && format(new Date(t.completedAt), 'yyyy-MM-dd') === dateStr
      ).length
      return { day: format(d, 'EEE'), count: completed, date: dateStr }
    })
  }, [tasks])

  const maxWeeklyCount = useMemo(
    () => Math.max(...weeklyTaskCompletion.map((d) => d.count), 1),
    [weeklyTaskCompletion]
  )

  // Habit summary stats
  const habitStats = useMemo(() => {
    if (activeHabits.length === 0) {
      return { rate: 0, mostConsistent: null, leastConsistent: null, atRisk: [] }
    }
    const sorted = [...activeHabits].sort((a, b) => b.currentStreak - a.currentStreak)
    const atRisk = activeHabits.filter((h) => h.currentStreak < 3)
    return {
      rate: Math.round(todayCompletionRate * 100),
      mostConsistent: sorted[0] ?? null,
      leastConsistent: sorted[sorted.length - 1] ?? null,
      atRisk,
    }
  }, [activeHabits, todayCompletionRate])

  // Task tab data
  const taskByPriority = useMemo(() => {
    const doneTasks = tasks.filter((t) => t.status === 'done')
    const high = doneTasks.filter((t) => t.priority === 'high').length
    const medium = doneTasks.filter((t) => t.priority === 'medium').length
    const low = doneTasks.filter((t) => t.priority === 'low').length
    const total = high + medium + low || 1
    return [
      { label: 'High', count: high, pct: Math.round((high / total) * 100), color: '#ef4444' },
      { label: 'Medium', count: medium, pct: Math.round((medium / total) * 100), color: '#f59e0b' },
      { label: 'Low', count: low, pct: Math.round((low / total) * 100), color: '#3b82f6' },
    ]
  }, [tasks])

  // Completion rate trend (weekly over 4 weeks)
  const completionTrend = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 4 }, (_, i) => {
      const weekEnd = subDays(today, i * 7)
      const weekStart = subDays(weekEnd, 6)
      const dueInWeek = tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) >= weekStart && new Date(t.dueDate) <= weekEnd
      )
      const completedInWeek = dueInWeek.filter((t) => t.status === 'done').length
      const rate = dueInWeek.length > 0 ? Math.round((completedInWeek / dueInWeek.length) * 100) : 0
      return { label: `W-${i}`, rate }
    }).reverse()
  }, [tasks])

  return (
    <div className="flex flex-col px-6 py-5">
      {/* Title */}
      <h1
        className="mb-6 text-[32px]"
        style={{ color: 'var(--text-primary)' }}
      >
        {COPY.title}
      </h1>

      {/* Tab pills */}
      <div className="mb-6 flex items-center gap-1">
        {COPY.tabs.map((tab) => {
          const active = activeTab === tab
          return (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab(tab)}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
              style={{
                backgroundColor: active ? 'var(--accent)' : 'transparent',
                color: active ? '#FFFFFF' : 'var(--text-muted)',
                border: active ? 'none' : '1px solid var(--border)',
              }}
            >
              {tab}
            </motion.button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="max-w-3xl">
        <AnimatePresence mode="wait">
          {/* ─── Overview ─── */}
          {activeTab === 'Overview' && (
            <motion.div key="overview" {...fade} transition={ease.normal} className="flex flex-col gap-6">
              {/* Empty state for overview */}
              {hasNoOverviewData && (
                <motion.div
                  {...fadeSlideUp}
                  transition={ease.normal}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <CheckCircle2 size={48} strokeWidth={1} style={{ color: 'var(--text-faint)', opacity: 0.3 }} />
                  <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                    No activity yet
                  </h3>
                  <p className="mt-1 max-w-xs text-sm" style={{ color: 'var(--text-muted)' }}>
                    Start completing tasks and habits to see your stats here.
                  </p>
                </motion.div>
              )}
              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: COPY.stats.tasksCompleted, value: tasksCompletedThisWeek, sub: COPY.stats.thisWeek },
                  { label: COPY.stats.activeHabits, value: activeHabits.length, sub: '' },
                  { label: COPY.stats.focusHours, value: PLACEHOLDER_FOCUS.weekHours, sub: COPY.stats.thisWeek },
                  { label: COPY.stats.currentStreaks, value: totalStreaks, sub: '' },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    {...fadeSlideUp}
                    transition={ease.normal}
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor: 'var(--bg-pane-2)',
                      border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    <p className="stat-number text-2xl font-bold" data-stat style={{ color: 'var(--accent)' }}>
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      {stat.label}
                    </p>
                    {stat.sub && (
                      <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                        {stat.sub}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Weekly completion chart */}
              <div>
                <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {COPY.weeklyCompletion}
                </h3>
                <div
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: 'var(--bg-pane-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-end gap-3" style={{ height: 120 }}>
                    {weeklyTaskCompletion.map((d) => (
                      <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                        <span className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>
                          {d.count}
                        </span>
                        <div className="relative w-full flex justify-center" style={{ height: 80 }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(d.count / maxWeeklyCount) * 100}%` }}
                            transition={ease.normal}
                            className="w-6 rounded-t-md"
                            style={{
                              backgroundColor: 'var(--accent)',
                              position: 'absolute',
                              bottom: 0,
                              minHeight: d.count > 0 ? 4 : 0,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>
                          {d.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Habits summary */}
              <div>
                <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {COPY.habitsSummary}
                </h3>
                <div
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: 'var(--bg-pane-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {COPY.completionRate}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                        {habitStats.rate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {COPY.mostConsistent}
                      </span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {habitStats.mostConsistent
                          ? `${habitStats.mostConsistent.icon} ${habitStats.mostConsistent.name}`
                          : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {COPY.leastConsistent}
                      </span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {habitStats.leastConsistent
                          ? `${habitStats.leastConsistent.icon} ${habitStats.leastConsistent.name}`
                          : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {COPY.atRisk}
                        <span className="ml-1 text-[10px]" style={{ color: 'var(--text-faint)' }}>
                          ({COPY.atRiskDesc})
                        </span>
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: habitStats.atRisk.length > 0 ? '#ef4444' : 'var(--text-primary)',
                        }}
                      >
                        {habitStats.atRisk.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Habit Analytics */}
              {activeHabits.length > 0 && (
                <HabitAnalytics habits={activeHabits} weekCompletions={weekCompletions} />
              )}
            </motion.div>
          )}

          {/* ─── Task tab ─── */}
          {activeTab === 'Task' && (
            <motion.div key="task" {...fade} transition={ease.normal} className="flex flex-col gap-6">
              {/* Empty state for task tab */}
              {hasNoTaskData && (
                <motion.div
                  {...fadeSlideUp}
                  transition={ease.normal}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <BarChart3Icon size={48} strokeWidth={1} style={{ color: 'var(--text-faint)', opacity: 0.3 }} />
                  <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                    No task data yet
                  </h3>
                  <p className="mt-1 max-w-xs text-sm" style={{ color: 'var(--text-muted)' }}>
                    Complete some tasks to see trends.
                  </p>
                </motion.div>
              )}
              {/* Daily bar chart */}
              <div>
                <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {COPY.taskTab.dailyCompleted}
                </h3>
                <div
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: 'var(--bg-pane-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-end gap-3" style={{ height: 120 }}>
                    {weeklyTaskCompletion.map((d) => (
                      <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                        <span className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>
                          {d.count}
                        </span>
                        <div className="relative w-full flex justify-center" style={{ height: 80 }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(d.count / maxWeeklyCount) * 100}%` }}
                            transition={ease.normal}
                            className="w-6 rounded-t-md"
                            style={{
                              backgroundColor: 'var(--accent)',
                              position: 'absolute',
                              bottom: 0,
                              minHeight: d.count > 0 ? 4 : 0,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>
                          {d.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* By priority */}
              <div>
                <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {COPY.taskTab.byPriority}
                </h3>
                <div
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: 'var(--bg-pane-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex flex-col gap-3">
                    {taskByPriority.map((p) => (
                      <div key={p.label} className="flex items-center gap-3">
                        <span className="w-16 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                          {p.label}
                        </span>
                        <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-hover)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${p.pct}%` }}
                            transition={ease.normal}
                            className="h-full rounded-full"
                            style={{ backgroundColor: p.color, minWidth: p.count > 0 ? 8 : 0 }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs font-medium" style={{ color: 'var(--text-faint)' }}>
                          {p.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Completion rate trend */}
              <div>
                <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {COPY.taskTab.completionTrend}
                </h3>
                <div
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: 'var(--bg-pane-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-end gap-6" style={{ height: 100 }}>
                    {completionTrend.map((w, i) => (
                      <div key={w.label} className="flex flex-1 flex-col items-center gap-1">
                        <span className="text-[10px] font-medium" style={{ color: 'var(--accent)' }}>
                          {w.rate}%
                        </span>
                        <div className="relative w-full flex justify-center" style={{ height: 60 }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${w.rate}%` }}
                            transition={ease.normal}
                            className="w-8 rounded-t-md"
                            style={{
                              backgroundColor: 'var(--accent)',
                              position: 'absolute',
                              bottom: 0,
                              minHeight: w.rate > 0 ? 4 : 0,
                              opacity: 0.5 + (i / completionTrend.length) * 0.5,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>
                          {w.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Focus tab ─── */}
          {activeTab === 'Focus' && (
            <motion.div key="focus" {...fade} transition={ease.normal} className="flex flex-col gap-6">
              {/* Empty state hint for focus tab */}
              {PLACEHOLDER_FOCUS_EXTENDED.totalSessions === 0 && (
                <motion.div
                  {...fadeSlideUp}
                  transition={ease.normal}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <Target size={48} strokeWidth={1} style={{ color: 'var(--text-faint)', opacity: 0.3 }} />
                  <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                    No focus sessions yet
                  </h3>
                  <p className="mt-1 max-w-xs text-sm" style={{ color: 'var(--text-muted)' }}>
                    Start one from any task.
                  </p>
                </motion.div>
              )}
              {/* Session count cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Sessions today', value: PLACEHOLDER_FOCUS_EXTENDED.sessionsToday },
                  { label: 'Sessions this week', value: PLACEHOLDER_FOCUS_EXTENDED.sessionsThisWeek },
                  { label: 'Total sessions', value: PLACEHOLDER_FOCUS_EXTENDED.totalSessions },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor: 'var(--bg-pane-2)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Focus minutes cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Minutes today', value: PLACEHOLDER_FOCUS_EXTENDED.minutesToday },
                  { label: 'Minutes this week', value: PLACEHOLDER_FOCUS_EXTENDED.minutesThisWeek },
                  { label: 'Total minutes', value: PLACEHOLDER_FOCUS_EXTENDED.totalMinutes },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor: 'var(--bg-pane-2)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Average + Longest + Most focused */}
              <div className="grid grid-cols-3 gap-3">
                <div
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: 'var(--bg-pane-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                    {PLACEHOLDER_FOCUS_EXTENDED.avgSessionMinutes}m
                  </p>
                  <p className="mt-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    Average session
                  </p>
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: 'var(--bg-pane-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                    {PLACEHOLDER_FOCUS_EXTENDED.longestSessionMinutes}m
                  </p>
                  <p className="mt-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    Longest session
                  </p>
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: 'var(--bg-pane-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                    {PLACEHOLDER_FOCUS_EXTENDED.mostFocusedTask.title}
                  </p>
                  <p className="mt-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    Most focused this week
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                    {PLACEHOLDER_FOCUS_EXTENDED.mostFocusedTask.hours}h
                  </p>
                </div>
              </div>

              {/* Hour-of-day heatmap */}
              <div>
                <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Focus by hour of day
                </h3>
                <div
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: 'var(--bg-pane-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="grid grid-cols-12 gap-1">
                    {PLACEHOLDER_FOCUS_EXTENDED.hourlyHeatmap.map((minutes, hour) => {
                      const maxH = Math.max(...PLACEHOLDER_FOCUS_EXTENDED.hourlyHeatmap, 1)
                      const intensity = minutes / maxH
                      return (
                        <div key={hour} className="flex flex-col items-center gap-1">
                          <div
                            className="h-6 w-full rounded-sm"
                            style={{
                              backgroundColor: 'var(--accent)',
                              opacity: minutes > 0 ? 0.15 + intensity * 0.85 : 0.05,
                            }}
                            title={`${hour}:00 - ${minutes}m`}
                          />
                          {hour % 3 === 0 && (
                            <span className="text-[8px]" style={{ color: 'var(--text-faint)' }}>
                              {hour}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Weekly trend: 4 weeks x 7 days */}
              <div>
                <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Weekly trend (sessions per day)
                </h3>
                <div
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: 'var(--bg-pane-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex flex-col gap-2">
                    {PLACEHOLDER_FOCUS_EXTENDED.weeklyTrend.map((week, weekIdx) => {
                      const maxW = Math.max(...week, 1)
                      return (
                        <div key={weekIdx} className="flex items-center gap-2">
                          <span className="w-12 text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>
                            W-{3 - weekIdx}
                          </span>
                          <div className="flex flex-1 items-end gap-1" style={{ height: 24 }}>
                            {week.map((count, dayIdx) => (
                              <div
                                key={dayIdx}
                                className="flex-1 rounded-t-sm"
                                style={{
                                  height: `${Math.max((count / maxW) * 100, count > 0 ? 15 : 4)}%`,
                                  backgroundColor: 'var(--accent)',
                                  opacity: count > 0 ? 0.5 + (count / maxW) * 0.5 : 0.1,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                    <div className="flex items-center gap-2">
                      <span className="w-12" />
                      <div className="flex flex-1 gap-1">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                          <span key={i} className="flex-1 text-center text-[8px]" style={{ color: 'var(--text-faint)' }}>
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
