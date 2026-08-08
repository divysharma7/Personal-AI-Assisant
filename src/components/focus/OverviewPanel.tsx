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
  const metrics = [
    { label: "Today's Pomo", value: overview.todayPomo },
    { label: "Today's Focus", value: formatDuration(overview.todayFocusSeconds) },
    { label: 'Total Pomo', value: overview.totalPomo },
    { label: 'Total Focus Duration', value: formatDuration(overview.totalFocusSeconds) },
  ]

  return (
    <section>
      <h2 className="focus-panel-heading">Overview</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="focus-metric-card">
            <p className="focus-metric-label">{metric.label}</p>
            <p className="focus-metric-value tabular-nums">{metric.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
