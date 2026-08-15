import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { format, addDays, addWeeks, addMonths, startOfWeek, endOfWeek, isSameDay, isSameMonth } from 'date-fns'
import {
  BarChart3, ChevronLeft, ChevronRight, Clock, Trophy,
} from 'lucide-react'
import { buttonPress, fadeSlideUp, ease } from '@/lib/motion'
import { useFocusDashboard } from '@/hooks/useFocusDashboard'
import { useFocusStatistics } from '@/hooks/useFocusStatistics'
import { useStatisticsOverview } from '@/hooks/useStatisticsOverview'
import { useStatisticsTask } from '@/hooks/useStatisticsTask'
import { formatDuration } from '@/lib/formatDuration'
import { StatTile, BarChart, AreaChart, DonutChart } from '@/components/charts'
import { useSearchParams, useNavigate } from 'react-router-dom'

type StatsTab = 'overview' | 'task' | 'focus'
type TimeRange = 'day' | 'week' | 'month'
type ChartRange = 7 | 14 | 30

const TABS: { key: StatsTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'task', label: 'Task' },
  { key: 'focus', label: 'Focus' },
]

function formatDateKey(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

/* ═══════════════════════════════════════
   Card wrapper
   ═══════════════════════════════════════ */

function Card({ title, children, rightControl }: { title: string; children: React.ReactNode; rightControl?: React.ReactNode }) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="type-section-title">{title}</h4>
        {rightControl}
      </div>
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════
   Skeleton loader
   ═══════════════════════════════════════ */

function Skeleton({ height = 120 }: { height?: number }) {
  return (
    <div className="rounded-[var(--radius-md)] animate-pulse" style={{ height, background: 'var(--bg-card)' }} />
  )
}

/* ═══════════════════════════════════════
   Error state
   ═══════════════════════════════════════ */

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <BarChart3 size={32} strokeWidth={1} style={{ color: 'var(--text-faint)', opacity: 0.3 }} />
      <p className="mt-2 text-[13px]" style={{ color: 'var(--text-muted)' }}>Failed to load data</p>
      <button type="button" onClick={onRetry} className="btn-ghost mt-2 text-[12px]">
        Retry
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════
   Empty state
   ═══════════════════════════════════════ */

function EmptyState({ message = 'No data available' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <BarChart3 size={32} strokeWidth={1} style={{ color: 'var(--text-faint)', opacity: 0.3 }} />
      <p className="mt-2 text-[13px]" style={{ color: 'var(--text-faint)' }}>{message}</p>
    </div>
  )
}

/* ═══════════════════════════════════════
   Chart range selector (Day/Week/Month)
   ═══════════════════════════════════════ */

function ChartRangeSelect({ value, onChange }: { value: ChartRange; onChange: (v: ChartRange) => void }) {
  return (
    <div className="segmented-control" style={{ transform: 'scale(0.85)', transformOrigin: 'right center' }}>
      {([7, 14, 30] as const).map((v) => (
        <motion.button key={v} {...buttonPress}
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className="cursor-pointer"
        >
          {v === 7 ? '7D' : v === 14 ? '14D' : '30D'}
        </motion.button>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════
   Achievement Score
   ═══════════════════════════════════════ */

function AchievementCard({ score, totalTasks, completedTasks, focusMinutes }: {
  score: number; totalTasks: number; completedTasks: number; focusMinutes: number
}) {
  const tier = score >= 80 ? 'gold' : score >= 50 ? 'silver' : score >= 20 ? 'bronze' : 'starter'
  const tierColors = { gold: '#f59e0b', silver: '#94a3b8', bronze: '#cd7f32', starter: 'var(--text-muted)' }
  const tierLabels = { gold: 'Gold', silver: 'Silver', bronze: 'Bronze', starter: 'Starter' }

  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="type-section-title">My Achievement Score</h4>
        <Trophy size={18} style={{ color: tierColors[tier] }} />
      </div>
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center">
          <span className="text-[36px] font-bold" style={{ color: tierColors[tier] }}>{score}</span>
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-faint)' }}>{tierLabels[tier]}</span>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Tasks</span>
            <span className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>{completedTasks}/{totalTasks}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Focus</span>
            <span className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>{formatDuration(focusMinutes * 60)}</span>
          </div>
          <div className="w-full h-2 rounded-full mt-1" style={{ background: 'var(--overlay-2)' }}>
            <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.min(100, score)}%`, background: tierColors[tier] }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   Date Range Controls (for Task tab)
   ═══════════════════════════════════════ */

function DateRangeControls({ range, date, onChange }: {
  range: TimeRange; date: Date; onChange: (range: TimeRange, date: Date) => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isAtToday = (() => {
    if (range === 'day') return isSameDay(date, today)
    if (range === 'week') return date >= startOfWeek(today, { weekStartsOn: 1 }) && date <= endOfWeek(today, { weekStartsOn: 1 })
    return isSameMonth(date, today)
  })()

  const label = (() => {
    if (range === 'day') {
      return isSameDay(date, today) ? 'Today' : format(date, 'MMM d, yyyy')
    }
    if (range === 'week') {
      const ws = startOfWeek(date, { weekStartsOn: 1 })
      const we = endOfWeek(date, { weekStartsOn: 1 })
      return `${format(ws, 'MMM d')} – ${format(we, 'MMM d')}`
    }
    return format(date, 'MMMM yyyy')
  })()

  const goPrev = () => {
    if (range === 'day') onChange(range, addDays(date, -1))
    else if (range === 'week') onChange(range, addWeeks(date, -1))
    else onChange(range, addMonths(date, -1))
  }

  const goNext = () => {
    if (range === 'day') onChange(range, addDays(date, 1))
    else if (range === 'week') onChange(range, addWeeks(date, 1))
    else onChange(range, addMonths(date, 1))
  }

  const goToday = () => onChange(range, today)

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Range selector */}
      <div className="segmented-control">
        {(['day', 'week', 'month'] as const).map((r) => (
          <motion.button key={r} {...buttonPress}
            onClick={() => onChange(r, date)}
            aria-pressed={range === r}
            className="cursor-pointer capitalize"
          >
            {r === 'day' ? 'Daily' : r === 'week' ? 'Weekly' : 'Monthly'}
          </motion.button>
        ))}
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-1">
        <button type="button" className="control-icon" onClick={goPrev} aria-label="Previous period">
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={goToday}
          className="text-[12px] font-medium px-2 py-1 rounded-[var(--radius-sm)] cursor-pointer"
          style={{ color: 'var(--text-primary)', background: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          {label}
        </button>
        <button
          type="button"
          className="control-icon"
          onClick={goNext}
          disabled={isAtToday}
          aria-label="Next period"
          style={{ opacity: isAtToday ? 0.3 : 1 }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   Overview Tab
   ═══════════════════════════════════════ */

function OverviewTab() {
  const [chartRange, setChartRange] = useState<ChartRange>(7)
  const { data, isLoading, error, refetch } = useStatisticsOverview(chartRange)

  const achievementScore = useMemo(() => {
    if (!data) return 0
    const total = data.tasks.completed + data.tasks.open
    if (total === 0) return 0
    const taskScore = (data.tasks.completed / total) * 70
    const focusBonus = Math.min(30, (data.focus.minutesInRange / 60) * 2)
    return Math.round(taskScore + focusBonus)
  }, [data])

  if (isLoading) return <div className="flex flex-col gap-4"><Skeleton height={80} /><Skeleton height={200} /><Skeleton height={200} /></div>
  if (error) return <ErrorState onRetry={refetch} />
  if (!data) return <EmptyState />

  const daily = data.daily
  const dailyLabels = daily.map((d) => d.date.slice(5))

  return (
    <motion.div {...fadeSlideUp} transition={ease.normal} className="flex flex-col gap-4">
      {/* Summary strip */}
      <div className="flex items-center flex-wrap gap-x-6 gap-y-2 rounded-[var(--radius-lg)] px-5 py-3"
        style={{ backgroundColor: 'var(--overlay-1, var(--bg-pane-2))', border: '1px solid var(--border)' }}
      >
        <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
          <strong style={{ color: 'var(--accent)' }}>{data.tasks.completed + data.tasks.open}</strong> Total Tasks
        </span>
        <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
          <strong style={{ color: 'var(--accent)' }}>{data.tasks.completed}</strong> Completed
        </span>
        <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
          <strong style={{ color: 'var(--accent)' }}>{data.total.lists}</strong> Lists
        </span>
        <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
          <strong style={{ color: 'var(--accent)' }}>{data.statsDays}</strong> Active Days
        </span>
      </div>

      {/* Overview grid */}
      <Card title="Overview">
        <div className="grid grid-cols-3 gap-4">
          <StatTile label="Today's Completion" value={data.today.completed} />
          <StatTile label="Today's Pomo" value={data.today.pomo} />
          <StatTile label="Today's Focus" value={formatDuration(data.today.focusSeconds)} />
          <StatTile label="Total Completion" value={data.total.completed} />
          <StatTile label="Total Pomo" value={data.total.pomo} />
          <StatTile label="Total Focus" value={formatDuration(data.total.focusSeconds)} />
        </div>
      </Card>

      {/* Achievement */}
      <AchievementCard
        score={achievementScore}
        totalTasks={data.tasks.completed + data.tasks.open}
        completedTasks={data.tasks.completed}
        focusMinutes={data.focus.minutesInRange}
      />

      {/* Charts */}
      <Card title="Recent Completion Curve" rightControl={<ChartRangeSelect value={chartRange} onChange={setChartRange} />}>
        {daily.some((d) => d.tasks > 0) ? (
          <AreaChart data={daily.map((d) => d.tasks)} labels={dailyLabels} gradientId="compGrad" />
        ) : (
          <EmptyState message="No completions in this period" />
        )}
      </Card>

      <Card title="Recent Pomo Curve">
        {daily.some((d) => d.pomoCount > 0) ? (
          <BarChart data={daily.map((d) => d.pomoCount)} labels={dailyLabels} accent="var(--accent)" />
        ) : (
          <EmptyState message="No pomodoro sessions" />
        )}
      </Card>

      <Card title="Recent Focused Duration Curve">
        {daily.some((d) => d.focusMinutes > 0) ? (
          <AreaChart data={daily.map((d) => d.focusMinutes)} labels={dailyLabels} gradientId="focusGrad" />
        ) : (
          <EmptyState message="No focus sessions" />
        )}
      </Card>
    </motion.div>
  )
}

/* ═══════════════════════════════════════
   Task Tab
   ═══════════════════════════════════════ */

function TaskTab() {
  const [range, setRange] = useState<TimeRange>('day')
  const [date, setDate] = useState(new Date())
  const dateKey = formatDateKey(date)
  const { data, isLoading, error, refetch } = useStatisticsTask(range, dateKey)
  const [listFilter, setListFilter] = useState<string>('all')

  useEffect(() => {
    if (
      listFilter !== 'all'
      && data
      && !data.current.byList.some((item) => (item.listId ?? 'null') === listFilter)
    ) {
      setListFilter('all')
    }
  }, [data, listFilter])

  const handleDateChange = useCallback((r: TimeRange, d: Date) => {
    setRange(r)
    setDate(d)
  }, [])

  if (isLoading) return <div className="flex flex-col gap-4"><Skeleton height={60} /><Skeleton height={100} /><Skeleton height={200} /></div>
  if (error) return <ErrorState onRetry={refetch} />
  if (!data) return <EmptyState />

  const { current: cur, previous: prev } = data

  // Comparison diffs
  const completedDiff = cur.completedTasks - prev.completedTasks
  const rateDiff = cur.completionRate - prev.completionRate

  // List data with filter
  const filteredByList = listFilter === 'all'
    ? cur.byList
    : cur.byList.filter((item) => (item.listId ?? 'null') === listFilter)

  return (
    <motion.div {...fadeSlideUp} transition={ease.normal} className="flex flex-col gap-4">
      {/* Date controls */}
      <DateRangeControls range={range} date={date} onChange={handleDateChange} />

      {/* Task Overview - two cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="surface-card p-4 flex flex-col items-center">
          <span className="text-[32px] font-bold" style={{ color: 'var(--accent)' }}>{cur.completedTasks}</span>
          <span className="text-[12px] font-medium mt-1" style={{ color: 'var(--text-muted)' }}>Completed Tasks</span>
          <span className="text-[11px] mt-2" style={{ color: completedDiff >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {completedDiff === 0 ? 'No change' : `${completedDiff > 0 ? '+' : ''}${completedDiff}`} from previous period {completedDiff >= 0 ? '↑' : '↓'}
          </span>
        </div>
        <div className="surface-card p-4 flex flex-col items-center">
          <span className="text-[32px] font-bold" style={{ color: 'var(--accent)' }}>{cur.completionRate}%</span>
          <span className="text-[12px] font-medium mt-1" style={{ color: 'var(--text-muted)' }}>Completion Rate</span>
          <span className="text-[11px] mt-2" style={{ color: rateDiff >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {rateDiff === 0 ? 'No change' : `${rateDiff > 0 ? '+' : ''}${rateDiff}%`} from previous period {rateDiff >= 0 ? '↑' : '↓'}
          </span>
        </div>
      </div>

      {/* Completion Rate Distribution */}
      <Card title="Completion Rate Distribution">
        {(cur.overdueTasks + cur.onTimeTasks + cur.undatedTasks + cur.uncompletedTasks) > 0 ? (
          <DonutChart
            centerLabel={`${cur.completionRate}%`}
            centerSub="Completion Rate"
            segments={[
              { value: cur.overdueTasks, color: '#ef4444', label: 'Overdue' },
              { value: cur.onTimeTasks, color: 'var(--accent)', label: 'On-Time' },
              { value: cur.undatedTasks, color: '#f59e0b', label: 'Undated' },
              { value: cur.uncompletedTasks, color: 'var(--overlay-3, #6b6b75)', label: 'Uncompleted' },
            ]}
          />
        ) : (
          <EmptyState message="No tasks in this period" />
        )}
      </Card>

      {/* Classified Completion Statistics */}
      <Card
        title="Classified Completion Statistics"
        rightControl={cur.byList.length > 0 ? (
          <select
            aria-label="Filter completions by list"
            className="input-field"
            style={{ width: 'auto', minHeight: 28, fontSize: 11, padding: '0 8px' }}
            value={listFilter}
            onChange={(e) => setListFilter(e.target.value)}
          >
            <option value="all">All Lists</option>
            {cur.byList.map((item) => (
              <option key={item.listId ?? 'null'} value={item.listId ?? 'null'}>{item.listName}</option>
            ))}
          </select>
        ) : undefined}
      >
        {filteredByList.length > 0 ? (
          <BarChart
            data={filteredByList.map((item) => item.count)}
            labels={filteredByList.map((item) => item.listName)}
            height={120}
          />
        ) : (
          <EmptyState message="No Data" />
        )}
      </Card>
    </motion.div>
  )
}

/* ═══════════════════════════════════════
   Focus Tab
   ═══════════════════════════════════════ */

function FocusTab() {
  const { data: focusDashboard, isLoading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useFocusDashboard()
  const { data: focusStatistics, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useFocusStatistics('day', 7)

  const isLoading = dashboardLoading || statsLoading
  const hasError = dashboardError || statsError

  if (isLoading) return <div className="flex flex-col gap-4"><Skeleton height={80} /><Skeleton height={200} /></div>
  if (hasError) return <ErrorState onRetry={() => { refetchDashboard(); refetchStats() }} />

  const focusByDay = focusStatistics?.dailyStats.map((s) => Math.round(s.durationSeconds / 60)) ?? []
  const focusLabels = focusStatistics?.dailyStats.map((s) => s.period.slice(5)) ?? []
  const pomoByDay = focusStatistics?.dailyStats.map((s) => s.pomoCount) ?? []
  const todayKey = formatDateKey(new Date())
  const sessionsToday = focusStatistics?.dailyStats.find((s) => s.period === todayKey)?.count ?? 0

  return (
    <motion.div {...fadeSlideUp} transition={ease.normal} className="flex flex-col gap-4">
      {/* Focus overview tiles */}
      <Card title="Focus Overview">
        <div className="flex items-center gap-0">
          <StatTile label="Today's Focus" value={formatDuration(focusDashboard?.overview.todayFocusSeconds ?? 0)} />
          <div className="h-10 w-px" style={{ backgroundColor: 'var(--border)' }} />
          <StatTile label="Total Focus" value={formatDuration(focusDashboard?.overview.totalFocusSeconds ?? 0)} />
          <div className="h-10 w-px" style={{ backgroundColor: 'var(--border)' }} />
          <StatTile label="Sessions Today" value={sessionsToday} />
          <div className="h-10 w-px" style={{ backgroundColor: 'var(--border)' }} />
          <StatTile label="Total Pomo" value={focusDashboard?.overview.totalPomo ?? 0} />
        </div>
      </Card>

      {/* Focus trend */}
      <Card title="Focus Trend">
        {focusByDay.length > 0 && focusByDay.some((v) => v > 0) ? (
          <BarChart data={focusByDay} labels={focusLabels} accent="var(--accent)" />
        ) : (
          <EmptyState message="No focus sessions yet" />
        )}
      </Card>

      {/* Pomo curve */}
      <Card title="Pomo Curve">
        {pomoByDay.length > 0 && pomoByDay.some((v) => v > 0) ? (
          <BarChart data={pomoByDay} labels={focusLabels} accent="var(--accent)" />
        ) : (
          <EmptyState message="No pomodoro sessions" />
        )}
      </Card>

      {/* Focus records link */}
      <Card title="Focus Statistics">
        <div className="flex items-center justify-between py-2">
          <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            {focusDashboard?.records.length
              ? `${focusDashboard.records.length} recent records`
              : 'No focus records yet'}
          </span>
          <a
            href="/focus/statistics"
            className="btn-ghost text-[12px] no-underline"
          >
            <Clock size={14} /> View Details
          </a>
        </div>
      </Card>
    </motion.div>
  )
}

/* ═══════════════════════════════════════
   Main Page
   ═══════════════════════════════════════ */

export default function StatisticsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const requestedTab = searchParams.get('tab')
  const tab: StatsTab = TABS.some((t) => t.key === requestedTab) ? (requestedTab as StatsTab) : 'overview'

  return (
    <div className="workspace-page px-5 py-5 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="type-page-title" style={{ color: 'var(--text-primary)' }}>Statistics</h1>

        <div className="segmented-control">
          {TABS.map((t) => (
            <motion.button
              key={t.key}
              {...buttonPress}
              onClick={() => setSearchParams((current) => {
                const next = new URLSearchParams(current)
                next.set('tab', t.key)
                return next
              }, { replace: true })}
              aria-pressed={tab === t.key}
              className="cursor-pointer"
            >
              {t.label}
            </motion.button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-primary min-h-8 cursor-pointer"
        >
          Done
        </button>
      </div>

      {/* Tab content */}
      {tab === 'overview' && <OverviewTab />}
      {tab === 'task' && <TaskTab />}
      {tab === 'focus' && <FocusTab />}
    </div>
  )
}
