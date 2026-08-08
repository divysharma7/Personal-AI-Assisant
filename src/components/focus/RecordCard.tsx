import { Target, Clock, MessageSquare } from 'lucide-react'
import { formatDuration, formatTimeRange } from '@/lib/formatDuration'

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
}

export default function RecordCard({ record }: RecordCardProps) {
  const targetLabel = record.targetType === 'NONE'
    ? 'No target'
    : record.targetTitleSnapshot || 'Unknown'

  const isPomo = record.mode === 'POMO'

  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3"
      style={{
        backgroundColor: 'var(--overlay-1)',
        transition: 'background-color 150ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2)' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
    >
      {/* Target Icon */}
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 mt-0.5"
        style={{
          backgroundColor: isPomo ? 'var(--accent)' : 'var(--accent-purple, var(--accent))',
          opacity: 0.15,
        }}
      >
        <Target
          size={14}
          style={{
            color: isPomo ? 'var(--accent)' : 'var(--accent-purple, var(--accent))',
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className="text-sm font-medium truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {targetLabel}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: isPomo ? 'var(--accent)' : 'var(--accent-purple, var(--accent))',
                  color: '#fff',
                  opacity: 0.9,
                }}
              >
                {isPomo ? 'Pomo' : 'Stopwatch'}
              </span>
              {record.source === 'MANUAL' && (
                <span
                  className="text-[10px] font-medium"
                  style={{ color: 'var(--text-faint)' }}
                >
                  Manual
                </span>
              )}
            </div>
          </div>

          {/* Duration & Time */}
          <div className="text-right flex-shrink-0">
            <p
              className="text-sm font-semibold tabular-nums"
              style={{ color: 'var(--text-primary)' }}
            >
              {formatDuration(record.durationSeconds)}
            </p>
            <p
              className="text-[11px] tabular-nums"
              style={{ color: 'var(--text-muted)' }}
            >
              {formatTimeRange(record.startTime, record.endTime)}
            </p>
          </div>
        </div>

        {/* Pomo Count */}
        {isPomo && record.pomoCount > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <Clock size={11} style={{ color: 'var(--text-faint)' }} />
            <span
              className="text-[11px]"
              style={{ color: 'var(--text-faint)' }}
            >
              {record.pomoCount} {record.pomoCount === 1 ? 'pomo' : 'pomos'}
            </span>
          </div>
        )}

        {/* Note */}
        {record.note && (
          <div className="flex items-start gap-1 mt-1.5">
            <MessageSquare
              size={11}
              style={{ color: 'var(--text-faint)', flexShrink: 0, marginTop: 2 }}
            />
            <p
              className="text-[11px] leading-relaxed line-clamp-2"
              style={{ color: 'var(--text-muted)' }}
            >
              {record.note}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
