import { Clock3 } from 'lucide-react'

export interface FocusRecord {
  _id: string
  targetType: 'TASK' | 'HABIT' | 'NONE'
  targetId?: string | null
  targetTitleSnapshot?: string | null
  startTime: string
  endTime: string
  durationSeconds: number
  mode: 'POMO' | 'STOPWATCH'
  pomoCount: number
  note?: string | null
  source: 'TIMER' | 'MANUAL'
}

interface RecordCardProps {
  record: FocusRecord
  isLast?: boolean
}

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function formatCompactDuration(seconds: number) {
  const totalMinutes = Math.max(1, Math.round(seconds / 60))
  if (totalMinutes < 60) return `${totalMinutes}m`

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`
}

export default function RecordCard({ record, isLast = false }: RecordCardProps) {
  const targetLabel = record.targetType === 'NONE'
    ? null
    : record.targetTitleSnapshot || 'Untitled'

  return (
    <article className="focus-record-row">
      <div className="focus-record-marker" aria-hidden="true">
        <span className="focus-record-dot">
          <Clock3 size={10} strokeWidth={2.4} />
        </span>
        {!isLast && <span className="focus-record-line" />}
      </div>

      <div className="min-w-0 pb-4">
        <p className="focus-record-time tabular-nums">
          {timeFormatter.format(new Date(record.startTime))}
          <span aria-hidden="true"> – </span>
          {timeFormatter.format(new Date(record.endTime))}
        </p>
        {targetLabel && <p className="focus-record-title truncate">{targetLabel}</p>}
        {record.note && <p className="focus-record-note line-clamp-1">{record.note}</p>}
      </div>

      <span className="focus-record-duration tabular-nums">
        {formatCompactDuration(record.durationSeconds)}
      </span>
    </article>
  )
}
