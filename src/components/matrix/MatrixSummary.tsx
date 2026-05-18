'use client'

import { motion } from 'framer-motion'
import { copy } from '@/lib/copy'
import { fade, ease } from '@/lib/motion'
import type { TaskRecord } from '@/hooks/useTasks'

interface MatrixSummaryProps {
  doFirstTasks: TaskRecord[]
  allTasks: TaskRecord[]
}

export default function MatrixSummary({
  doFirstTasks,
  allTasks,
}: MatrixSummaryProps) {
  const totalEffort = allTasks.reduce(
    (sum, t) => sum + (t.estimatedEffort ?? 0),
    0
  )
  const doFirstEffort = doFirstTasks.reduce(
    (sum, t) => sum + (t.estimatedEffort ?? 0),
    0
  )
  const atRisk = doFirstTasks.filter((t) => !t.actualEffort || t.actualEffort === 0).length
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const doneToday = allTasks.filter((t) => {
    if (t.status !== 'done') return false
    if (!t.updatedAt) return false
    return new Date(t.updatedAt) >= todayStart
  }).length

  const stats = [
    {
      label: copy.matrix.summary.totalEffort,
      value: `${totalEffort}h`,
      color: 'var(--text-primary)',
    },
    {
      label: copy.matrix.summary.doFirstEffort,
      value: `${doFirstEffort}h`,
      color: '#FF4D3D',
    },
    {
      label: copy.matrix.summary.atRisk,
      value: `${atRisk}`,
      color: '#FFB23D',
    },
    {
      label: copy.matrix.summary.doneToday,
      value: `${doneToday}`,
      color: 'var(--accent)',
    },
  ]

  return (
    <motion.div
      {...fade}
      transition={ease.slow}
      className="flex items-center gap-6 rounded-xl px-5 py-3"
      style={{
        backgroundColor: 'var(--bg-pane)',
        border: '1px solid var(--border)',
      }}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-2">
          <span
            className="text-[12px]"
            style={{ color: 'var(--text-faint)' }}
          >
            {stat.label}
          </span>
          <span
            className="text-[14px] font-semibold"
            style={{ color: stat.color }}
          >
            {stat.value}
          </span>
        </div>
      ))}

      <span
        className="ml-auto text-[11px]"
        style={{ color: 'var(--text-faint)' }}
      >
        {copy.matrix.filterNote}
      </span>
    </motion.div>
  )
}
