'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Flame,
  Target,
  Clock,
  BarChart3,
  TrendingUp,
  Calendar,
  ListChecks,
  Timer,
} from 'lucide-react'
import { buttonPress, fadeSlideUp, ease } from '@/lib/motion'
import { useTasks } from '@/hooks/useTasks'
import { useHabits } from '@/hooks/useHabits'

type StatsTab = 'overview' | 'task' | 'focus'
type Period = 'daily' | 'weekly' | 'monthly'

const TABS: { key: StatsTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'task', label: 'Task' },
  { key: 'focus', label: 'Focus' },
]

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function StatTile({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-[24px] font-bold" style={{ color: color || 'var(--accent)' }}>{value}</span>
      <span className="text-[11px] font-medium" style={{ color: 'var(--text-faint)' }}>{label}</span>
      {sub && <span className="text-[10px]" style={{ color: '#34d399' }}>{sub}</span>}
    </div>
  )
}

function MiniBarChart({ data, labels, accent }: { data: number[]; labels: string[]; accent?: string }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-1 h-[100px]">
      {data.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-t"
            style={{
              height: `${(v / max) * 80}px`,
              backgroundColor: i === data.length - 1 ? (accent || 'var(--accent)') : 'var(--overlay-2, var(--bg-hover))',
              minHeight: 2,
            }}
          />
          <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

function MiniAreaChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 1)
  const h = 80
  const w = data.length > 1 ? 100 / (data.length - 1) : 100
  const points = data.map((v, i) => `${i * w},${h - (v / max) * h}`).join(' ')
  const areaPoints = `0,${h} ${points} ${(data.length - 1) * w},${h}`

  return (
    <div className="relative h-[100px]">
      <svg viewBox={`0 0 ${(data.length - 1) * w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#areaGrad)" />
        <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
        {data.map((v, i) => (
          <circle key={i} cx={i * w} cy={h - (v / max) * h} r="3" fill="var(--accent)" />
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        {labels.map((l, i) => (
          <span key={i} className="text-[9px]" style={{ color: 'var(--text-faint)' }}>{l}</span>
        ))}
      </div>
    </div>
  )
}

function DonutChart({ segments, centerLabel, centerSub }: {
  segments: { value: number; color: string; label: string }[]
  centerLabel: string
  centerSub: string
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  let offset = 0

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: 120, height: 120 }}>
        <svg viewBox="0 0 120 120" className="w-full h-full">
          {segments.map((seg, i) => {
            const pct = seg.value / total
            const dashArray = `${pct * 314} ${314}`
            const rotation = offset * 360 - 90
            offset += pct
            return (
              <circle
                key={i}
                cx="60" cy="60" r="50"
                fill="none"
                stroke={seg.color}
                strokeWidth="12"
                strokeDasharray={dashArray}
                transform={`rotate(${rotation} 60 60)`}
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>{centerLabel}</span>
          <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{centerSub}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-[12px]" style={{ color: 'var(--text-primary)' }}>
              {seg.value} | {seg.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Card({ title, children, rightControl }: { title: string; children: React.ReactNode; rightControl?: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg,16px)] p-4" style={{ backgroundColor: 'var(--overlay-1, var(--bg-pane-2))', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h4>
        {rightControl}
      </div>
      {children}
    </div>
  )
}

export default function StatisticsPage() {
  const [tab, setTab] = useState<StatsTab>('overview')
  const { tasks } = useTasks()
  const { habits, weekCompletions, todayStr: getTodayStr } = useHabits()

  const todayStr = getTodayStr()

  // Compute stats from real data
  const allTasks = tasks
  const completedTasks = allTasks.filter((t) => t.status === 'done')
  const activeHabits = habits.filter((h) => !h.archived)

  // Last 7 days data
  const last7Days = useMemo(() => {
    const days: { date: Date; key: string; label: string }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      days.push({ date: d, key: formatDateKey(d), label: i === 0 ? 'Today' : String(d.getDate()) })
    }
    return days
  }, [])

  const completionsByDay = useMemo(() => {
    return last7Days.map(({ key }) =>
      completedTasks.filter((t) => t.completedAt && formatDateKey(new Date(t.completedAt)) === key).length
    )
  }, [last7Days, completedTasks])

  const completionRateByDay = useMemo(() => {
    return last7Days.map(({ key }) => {
      const due = allTasks.filter((t) => t.dueDate && formatDateKey(new Date(t.dueDate)) === key).length
      const done = completedTasks.filter((t) => t.completedAt && formatDateKey(new Date(t.completedAt)) === key).length
      return due > 0 ? Math.round((done / due) * 100) : 0
    })
  }, [last7Days, allTasks, completedTasks])

  // Habit weekly status
  const habitWeekStatus = useMemo(() => {
    return WEEKDAYS.map((_, dayIdx) => {
      const d = new Date()
      const currentDay = d.getDay()
      const diff = dayIdx - currentDay
      const targetDate = new Date(d)
      targetDate.setDate(d.getDate() + diff)
      const key = formatDateKey(targetDate)
      const total = activeHabits.length || 1
      const done = activeHabits.filter((h) => h.completions.includes(key)).length
      return done / total
    })
  }, [activeHabits])

  // Task breakdown
  const overdueTasks = allTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length
  const onTimeTasks = completedTasks.filter((t) => t.dueDate && t.completedAt && new Date(t.completedAt) <= new Date(t.dueDate)).length
  const undatedTasks = completedTasks.filter((t) => !t.dueDate).length
  const uncompletedTasks = allTasks.filter((t) => t.status !== 'done' && t.status !== 'dropped').length
  const completionRate = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0

  return (
    <div className="flex flex-col h-full px-6 py-5 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ color: 'var(--text-primary)' }}>Statistics</h1>

        {/* Tab switcher */}
        <div className="flex items-center rounded-full p-0.5" style={{ backgroundColor: 'var(--overlay-2, var(--bg-pane-2))' }}>
          {TABS.map((t) => (
            <motion.button
              key={t.key}
              {...buttonPress}
              onClick={() => setTab(t.key)}
              className="rounded-full px-4 py-1.5 text-[13px] font-medium cursor-pointer transition-sl"
              style={{
                backgroundColor: tab === t.key ? 'var(--bg-pane)' : 'transparent',
                color: tab === t.key ? 'var(--text-primary)' : 'var(--text-faint)',
                boxShadow: tab === t.key ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {t.label}
            </motion.button>
          ))}
        </div>

        <a
          href="/"
          className="rounded-lg px-4 py-1.5 text-[13px] font-semibold text-white no-underline cursor-pointer"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Done
        </a>
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <motion.div {...fadeSlideUp} transition={ease.normal} className="flex flex-col gap-4">
          {/* Summary strip */}
          <div className="flex items-center justify-between rounded-[var(--radius-lg,16px)] px-5 py-3" style={{ backgroundColor: 'var(--overlay-1, var(--bg-pane-2))', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-6">
              <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                <strong style={{ color: 'var(--accent)' }}>{allTasks.length}</strong> Tasks
              </span>
              <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                <strong style={{ color: 'var(--accent)' }}>{completedTasks.length}</strong> Completed
              </span>
              <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                <strong style={{ color: 'var(--accent)' }}>{activeHabits.length}</strong> Habits
              </span>
            </div>
          </div>

          {/* Overview grid */}
          <Card title="Overview">
            <div className="grid grid-cols-3 gap-4">
              <StatTile label="Today's Completion" value={completionsByDay[6] || 0} />
              <StatTile label="Today's Focus" value="0h 0m" />
              <StatTile label="Current Streak" value={habits.reduce((m, h) => Math.max(m, h.currentStreak), 0)} />
              <StatTile label="Total Completed" value={completedTasks.length} />
              <StatTile label="Total Habits" value={activeHabits.length} />
              <StatTile label="Best Streak" value={habits.reduce((m, h) => Math.max(m, h.bestStreak), 0)} />
            </div>
          </Card>

          {/* Completion curve */}
          <Card title="Recent Completion Curve">
            <MiniAreaChart data={completionsByDay} labels={last7Days.map((d) => d.label)} />
          </Card>

          {/* Completion rate curve */}
          <Card title="Recent Completion Rate">
            <MiniBarChart data={completionRateByDay} labels={last7Days.map((d) => d.label)} />
          </Card>

          {/* Weekly habit status */}
          {activeHabits.length > 0 && (
            <Card title="Weekly Habit Status">
              <div className="flex items-center justify-around py-2">
                {WEEKDAYS.map((day, i) => {
                  const ratio = habitWeekStatus[i]
                  return (
                    <div key={day} className="flex flex-col items-center gap-1.5">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{
                          background: ratio > 0
                            ? `conic-gradient(var(--accent) ${ratio * 360}deg, var(--overlay-2, var(--bg-hover)) ${ratio * 360}deg)`
                            : 'var(--overlay-2, var(--bg-hover))',
                        }}
                      >
                        {ratio >= 1 && <Check size={16} strokeWidth={2.5} className="text-white" />}
                      </div>
                      <span className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>{day}</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {tab === 'task' && (
        <motion.div {...fadeSlideUp} transition={ease.normal} className="flex flex-col gap-4">
          {/* Overview */}
          <Card title="Overview">
            <div className="flex items-center gap-0">
              <StatTile label="Completed Tasks" value={completedTasks.length} />
              <div className="h-10 w-px" style={{ backgroundColor: 'var(--border)' }} />
              <StatTile label="Completion Rate" value={`${completionRate}%`} />
            </div>
          </Card>

          {/* Completion rate distribution */}
          <Card title="Completion Rate Distribution">
            <DonutChart
              centerLabel={`${completionRate}%`}
              centerSub="Completion Rate"
              segments={[
                { value: overdueTasks, color: '#ef4444', label: 'Overdue' },
                { value: onTimeTasks, color: 'var(--accent)', label: 'On-Time' },
                { value: undatedTasks, color: '#f59e0b', label: 'Undated' },
                { value: uncompletedTasks, color: 'var(--overlay-3, #6b6b75)', label: 'Uncompleted' },
              ]}
            />
          </Card>

          {/* Completion by day */}
          <Card title="Daily Completions">
            <MiniBarChart data={completionsByDay} labels={last7Days.map((d) => d.label)} />
          </Card>
        </motion.div>
      )}

      {tab === 'focus' && (
        <motion.div {...fadeSlideUp} transition={ease.normal} className="flex flex-col gap-4">
          {/* Overview */}
          <Card title="Focus Overview">
            <div className="flex items-center gap-0">
              <StatTile label="Today's Focus" value="0h 0m" />
              <div className="h-10 w-px" style={{ backgroundColor: 'var(--border)' }} />
              <StatTile label="Total Focus" value="0h 0m" />
              <div className="h-10 w-px" style={{ backgroundColor: 'var(--border)' }} />
              <StatTile label="Sessions Today" value={0} />
            </div>
          </Card>

          {/* Focus trend */}
          <Card title="Focus Trend">
            <MiniBarChart
              data={[0, 0, 0, 0, 0, 0, 0]}
              labels={last7Days.map((d) => d.label)}
            />
          </Card>

          {/* Year grid placeholder */}
          <Card title="Year Grid">
            <div className="flex flex-col items-center justify-center py-8">
              <Timer size={32} strokeWidth={1} style={{ color: 'var(--text-faint)', opacity: 0.3 }} />
              <p className="mt-2 text-[13px]" style={{ color: 'var(--text-faint)' }}>
                Start a focus session to see your year grid
              </p>
            </div>
          </Card>

          {/* Focus records */}
          <Card title="Focus Records">
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-[13px]" style={{ color: 'var(--text-faint)' }}>No focus records yet</p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
