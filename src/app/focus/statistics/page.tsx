import { motion } from 'framer-motion'
import { fadeSlideUp } from '@/lib/motion'
import { ArrowLeft, BarChart3, Clock, Target } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  useFocusStatistics,
  getHourLabel,
} from '@/hooks/useFocusStatistics'
import { formatDuration } from '@/lib/formatDuration'

type GroupBy = 'day' | 'week' | 'month'

export default function FocusStatisticsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const groupParam = searchParams.get('group')
  const groupBy: GroupBy = groupParam === 'week' || groupParam === 'month' ? groupParam : 'day'
  const limit = groupBy === 'day' ? 14 : 12

  const { data: stats, isLoading } = useFocusStatistics(groupBy, limit)

  // Calculate max values for chart scaling
  const maxDailyDuration = stats?.dailyStats.reduce(
    (max, s) => Math.max(max, s.durationSeconds),
    0
  ) || 1

  const maxHourDuration = stats?.hourDistribution.reduce(
    (max, h) => Math.max(max, h.totalSeconds),
    0
  ) || 1

  return (
    <div className="workspace-page">
      {/* Header */}
      <header
        className="workspace-header justify-start gap-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <button
          type="button"
          onClick={() => navigate('/focus')}
          className="control-icon"
          aria-label="Back to Focus"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <BarChart3 size={20} style={{ color: 'var(--accent)' }} />
          <h1 className="type-page-title">Focus Statistics</h1>
        </div>
      </header>

      {/* Content */}
      <main className="w-full max-w-[960px] px-5 py-6 sm:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="h-8 w-8 animate-spin rounded-full border-3"
              style={{
                borderColor: 'var(--border)',
                borderTopColor: 'var(--accent)',
              }}
            />
          </div>
        ) : (
          <motion.div {...fadeSlideUp} className="space-y-4">
            {/* Period Selector */}
            <div className="segmented-control">
              {(['day', 'week', 'month'] as GroupBy[]).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setSearchParams({ group: period }, { replace: true })}
                  aria-pressed={groupBy === period}
                  className="capitalize"
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Focus Duration Chart */}
            <section
              className="surface-card p-4"
            >
              <div className="flex items-center gap-2 mb-6">
                <Clock size={18} style={{ color: 'var(--accent)' }} />
                <h2 className="type-section-title">
                  Focus Duration by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
                </h2>
              </div>

              {stats?.dailyStats && stats.dailyStats.length > 0 ? (
                <div className="flex items-end gap-2 h-48">
                  {stats.dailyStats.map((stat, index) => {
                    const height = (stat.durationSeconds / maxDailyDuration) * 100
                    return (
                      <div
                        key={stat.period}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <div className="w-full flex justify-center">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            className="w-full max-w-8 rounded-t"
                            style={{
                              backgroundColor: 'var(--accent)',
                              minHeight: stat.durationSeconds > 0 ? '4px' : '0',
                            }}
                          />
                        </div>
                        <span
                          className="text-[10px] tabular-nums"
                          style={{ color: 'var(--text-faint)' }}
                        >
                          {stat.period.slice(5)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p
                  className="text-sm text-center py-12"
                  style={{ color: 'var(--text-muted)' }}
                >
                  No data yet
                </p>
              )}

              {stats?.dailyStats && stats.dailyStats.length > 0 && (
                <div
                  className="mt-4 pt-4 text-xs"
                  style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
                >
                  <div className="flex justify-between">
                    <span>Total focus time</span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {formatDuration(
                        stats.dailyStats.reduce((sum, s) => sum + s.durationSeconds, 0)
                      )}
                    </strong>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Total pomos</span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {stats.dailyStats.reduce((sum, s) => sum + s.pomoCount, 0)}
                    </strong>
                  </div>
                </div>
              )}
            </section>

            {/* Top Tasks & Habits */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Top Tasks */}
              <section
                className="surface-card p-4"
                style={{
                  backgroundColor: 'var(--bg-pane)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <Target size={18} style={{ color: 'var(--accent)' }} />
                  <h2 className="type-section-title">Top Tasks</h2>
                </div>

                {stats?.topTasks && stats.topTasks.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topTasks.map((task, index) => (
                      <div
                        key={task.targetId}
                        className="flex items-center gap-3"
                      >
                        <span
                          className="text-xs font-medium w-5"
                          style={{ color: 'var(--text-faint)' }}
                        >
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm truncate"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {task.title}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: 'var(--text-faint)' }}
                          >
                            {task.count} {task.count === 1 ? 'session' : 'sessions'}
                          </p>
                        </div>
                        <span
                          className="text-sm font-medium tabular-nums"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {formatDuration(task.durationSeconds)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    className="text-sm text-center py-8"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    No task focus yet
                  </p>
                )}
              </section>

              {/* Top Habits */}
              <section
                className="surface-card p-4"
                style={{
                  backgroundColor: 'var(--bg-pane)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <Target size={18} style={{ color: 'var(--accent-purple, var(--accent))' }} />
                  <h2 className="type-section-title">Top Habits</h2>
                </div>

                {stats?.topHabits && stats.topHabits.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topHabits.map((habit, index) => (
                      <div
                        key={habit.targetId}
                        className="flex items-center gap-3"
                      >
                        <span
                          className="text-xs font-medium w-5"
                          style={{ color: 'var(--text-faint)' }}
                        >
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm truncate"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {habit.title}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: 'var(--text-faint)' }}
                          >
                            {habit.count} {habit.count === 1 ? 'session' : 'sessions'}
                          </p>
                        </div>
                        <span
                          className="text-sm font-medium tabular-nums"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {formatDuration(habit.durationSeconds)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    className="text-sm text-center py-8"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    No habit focus yet
                  </p>
                )}
              </section>
            </div>

            {/* Hour Distribution */}
            <section
              className="surface-card p-4"
              style={{
                backgroundColor: 'var(--bg-pane)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Clock size={18} style={{ color: 'var(--accent)' }} />
                <h2 className="type-section-title">Focus by Hour of Day</h2>
              </div>

              {stats?.hourDistribution ? (
                <div className="flex items-end gap-1 h-32">
                  {stats.hourDistribution.map((hour) => {
                    const height = (hour.totalSeconds / maxHourDuration) * 100
                    return (
                      <div
                        key={hour.hour}
                        className="flex-1 flex flex-col items-center gap-1"
                        title={`${getHourLabel(hour.hour)}: ${formatDuration(hour.totalSeconds)}`}
                      >
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: hour.hour * 0.02, duration: 0.3 }}
                          className="w-full rounded-t"
                          style={{
                            backgroundColor: 'var(--accent)',
                            opacity: hour.totalSeconds > 0 ? 0.8 : 0.2,
                            minHeight: '2px',
                          }}
                        />
                        {hour.hour % 6 === 0 && (
                          <span
                            className="text-[9px] tabular-nums"
                            style={{ color: 'var(--text-faint)' }}
                          >
                            {getHourLabel(hour.hour)}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p
                  className="text-sm text-center py-12"
                  style={{ color: 'var(--text-muted)' }}
                >
                  No data yet
                </p>
              )}
            </section>
          </motion.div>
        )}
      </main>
    </div>
  )
}
