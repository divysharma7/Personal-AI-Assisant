'use client'
import { useMemo } from 'react'
import { Flame, Clock, Target, TrendingUp } from 'lucide-react'
import { usePomodoro } from '@/hooks/usePomodoro'

export default function PomodoroStats() {
  const { sessions, stats } = usePomodoro()

  // Last 7 days bar chart data
  const weekData = useMemo(() => {
    const days: { label: string; minutes: number }[] = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      const dayLabel = d.toLocaleDateString('en', { weekday: 'short' })
      const minutes = Math.round(
        sessions
          .filter(s => s.type === 'focus' && s.completed && new Date(s.startedAt) >= dayStart && new Date(s.startedAt) < dayEnd)
          .reduce((sum, s) => sum + s.duration, 0) / 60
      )
      days.push({ label: dayLabel, minutes })
    }
    return days
  }, [sessions])

  const maxMinutes = Math.max(...weekData.map(d => d.minutes), 1)

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Clock size={14} />}
          label="Today"
          value={`${stats.todayFocusMinutes}m`}
          color="var(--accent)"
        />
        <StatCard
          icon={<TrendingUp size={14} />}
          label="This week"
          value={`${stats.weekFocusMinutes}m`}
          color="var(--color-task)"
        />
        <StatCard
          icon={<Target size={14} />}
          label="Total sessions"
          value={String(stats.totalSessions)}
          color="#c084fc"
        />
        <StatCard
          icon={<Flame size={14} />}
          label="Streak"
          value={`${stats.currentStreak}d`}
          color="#f59e0b"
        />
      </div>

      {/* Bar chart - last 7 days */}
      <div>
        <p className="section-header mb-3">
          Last 7 days
        </p>
        <svg width="100%" height={80} viewBox="0 0 280 80" preserveAspectRatio="none">
          {weekData.map((day, i) => {
            const barWidth = 24
            const gap = (280 - barWidth * 7) / 6
            const x = i * (barWidth + gap)
            const barHeight = maxMinutes > 0 ? (day.minutes / maxMinutes) * 50 : 0
            return (
              <g key={day.label}>
                {/* Bar background */}
                <rect
                  x={x}
                  y={10}
                  width={barWidth}
                  height={50}
                  rx={4}
                  fill="var(--input-bg)"
                />
                {/* Bar fill */}
                <rect
                  x={x}
                  y={10 + (50 - barHeight)}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  fill="var(--accent)"
                  opacity={0.85}
                />
                {/* Day label */}
                <text
                  x={x + barWidth / 2}
                  y={74}
                  textAnchor="middle"
                  fontSize={9}
                  fill="var(--text-3)"
                >
                  {day.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div
      className="rounded-2xl p-3"
      style={{ background: 'var(--surface)' }}
    >
      <div className="flex items-center gap-1.5 mb-1" style={{ color }}>
        {icon}
        <span className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>{label}</span>
      </div>
      <p className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>{value}</p>
    </div>
  )
}
