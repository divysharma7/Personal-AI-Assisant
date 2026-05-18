'use client'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Timer, Flame, BookOpen } from 'lucide-react'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { useItems } from '@/hooks/useItems'
import { usePomodoro } from '@/hooks/usePomodoro'
import { useHabits } from '@/hooks/useHabits'
import { snappy } from '@/shared/design-system'
import FloatingChat from '@/components/chat/FloatingChat'

type Range = '7d' | '30d' | '90d'

function getRange(range: Range): Date[] {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const end = new Date()
  return eachDayOfInterval({ start: subDays(end, days - 1), end })
}

function BarChart({ data, color, maxLabel }: { data: { label: string; value: number }[]; color: string; maxLabel: string }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-[3px] h-28">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${d.label}: ${d.value}`}>
          <motion.div
            initial={{ height: 0 }} animate={{ height: `${(d.value / max) * 100}%` }}
            transition={{ ...snappy, delay: i * 0.02 }}
            className="w-full rounded-t-sm min-h-[2px]"
            style={{ background: d.value > 0 ? color : 'var(--surface-1)' }}
          />
          {data.length <= 14 && (
            <span className="text-[9px]" style={{ color: 'var(--text-3)' }}>{d.label}</span>
          )}
        </div>
      ))}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: typeof CheckSquare; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--surface)' }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={14} style={{ color }} />
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>{label}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{sub}</p>}
    </div>
  )
}

export default function StatsPage() {
  const [range, setRange] = useState<Range>('7d')
  const { items } = useItems()
  const { sessions } = usePomodoro()
  const { habits, todayCompletionRate } = useHabits()
  const { silentRefresh } = useItems()

  const days = useMemo(() => getRange(range), [range])

  // Tasks completed per day
  const taskData = useMemo(() => {
    const tasks = items.filter(i => i.type === 'task' && 'status' in i && i.status === 'done')
    return days.map(d => {
      const dayStr = format(d, 'yyyy-MM-dd')
      const count = tasks.filter(t => {
        const updated = 'updatedAt' in t ? (t as { updatedAt?: string }).updatedAt : (t as { createdAt?: string }).createdAt
        return updated && updated.startsWith(dayStr)
      }).length
      return { label: format(d, days.length <= 14 ? 'EEE' : 'd'), value: count }
    })
  }, [items, days])

  // Focus minutes per day
  const focusData = useMemo(() => {
    return days.map(d => {
      const dayStr = format(d, 'yyyy-MM-dd')
      const mins = sessions
        .filter(s => s.type === 'focus' && s.completed && s.startedAt.startsWith(dayStr))
        .reduce((sum, s) => sum + Math.round(s.duration / 60), 0)
      return { label: format(d, days.length <= 14 ? 'EEE' : 'd'), value: mins }
    })
  }, [sessions, days])

  // Summary stats
  const totalTasksCompleted = taskData.reduce((s, d) => s + d.value, 0)
  const totalFocusMinutes = focusData.reduce((s, d) => s + d.value, 0)

  // Journal streak (count consecutive days with journal entries — approximate from items)
  const journalStreak = useMemo(() => {
    // We don't have direct journal access here, so show habit completion rate instead
    return Math.round(todayCompletionRate * 100)
  }, [todayCompletionRate])

  return (
    <>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-8 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Statistics</h1>
          <div className="flex items-center rounded-xl p-0.5 gap-0.5" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
            {(['7d', '30d', '90d'] as Range[]).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                style={range === r ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--text-2)' }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto px-8 py-4 space-y-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={CheckSquare} label="Tasks Done" value={totalTasksCompleted} sub={`Last ${range}`} color="#22c55e" />
            <StatCard icon={Timer} label="Focus Time" value={`${totalFocusMinutes}m`} sub={`Last ${range}`} color="#6366f1" />
            <StatCard icon={Flame} label="Habit Rate" value={`${journalStreak}%`} sub="Today" color="#f59e0b" />
            <StatCard icon={BookOpen} label="Habits" value={habits.length} sub={`${habits.filter(h => h.completions.includes(format(new Date(), 'yyyy-MM-dd'))).length} done today`} color="#8b5cf6" />
          </div>

          {/* Tasks chart */}
          <div className="rounded-2xl p-4" style={{ background: 'var(--surface)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Tasks Completed</h3>
            <BarChart data={taskData} color="#22c55e" maxLabel="tasks" />
          </div>

          {/* Focus chart */}
          <div className="rounded-2xl p-4" style={{ background: 'var(--surface)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Focus Minutes</h3>
            <BarChart data={focusData} color="#6366f1" maxLabel="min" />
          </div>
        </div>
      </main>
      <FloatingChat onRefreshItems={silentRefresh} />
    </>
  )
}
