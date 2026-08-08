import { Coffee } from 'lucide-react'
import { formatDuration } from '@/lib/formatDuration'

interface OverviewData {
  todayPomo: number
  todayFocusSeconds: number
  totalPomo: number
  totalFocusSeconds: number
}

interface OverviewPanelProps {
  overview: OverviewData
}

export default function OverviewPanel({ overview }: OverviewPanelProps) {
  return (
    <section
      className="p-5 rounded-[16px]"
      style={{
        backgroundColor: 'var(--bg-pane-2)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center gap-2">
        <Coffee size={17} style={{ color: 'var(--text-muted)' }} />
        <h2 className="text-sm font-semibold">Today&apos;s focus</h2>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: 'var(--text-faint)' }}
          >
            Pomos
          </p>
          <p
            className="mt-1 text-3xl font-semibold tracking-[-0.04em] tabular-nums"
            style={{ color: 'var(--accent)' }}
          >
            {overview.todayPomo}
          </p>
        </div>
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: 'var(--text-faint)' }}
          >
            Focused
          </p>
          <p
            className="mt-1 text-3xl font-semibold tracking-[-0.04em] tabular-nums"
            style={{ color: 'var(--accent)' }}
          >
            {formatDuration(overview.todayFocusSeconds)}
          </p>
        </div>
      </div>

      <div
        className="mt-6 pt-4 text-xs"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
      >
        <div className="flex justify-between">
          <span>Total Pomos</span>
          <strong style={{ color: 'var(--text-primary)' }}>{overview.totalPomo}</strong>
        </div>
        <div className="flex justify-between mt-1">
          <span>Total Focus</span>
          <strong style={{ color: 'var(--text-primary)' }}>
            {formatDuration(overview.totalFocusSeconds)}
          </strong>
        </div>
      </div>
    </section>
  )
}
