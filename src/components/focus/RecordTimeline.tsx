import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { fadeSlideUp } from '@/lib/motion'
import { formatRelativeDate } from '@/lib/formatDuration'
import RecordCard, { type FocusRecord } from './RecordCard'

interface RecordTimelineProps {
  records: FocusRecord[]
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
}

interface GroupedRecords {
  date: string
  displayDate: string
  records: FocusRecord[]
}

export default function RecordTimeline({
  records,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: RecordTimelineProps) {
  // Group records by date
  const groupedRecords = useMemo<GroupedRecords[]>(() => {
    const groups: Record<string, FocusRecord[]> = {}

    for (const record of records) {
      // Use local date for grouping
      const date = new Date(record.startTime).toLocaleDateString('en-CA')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(record)
    }

    // Convert to sorted array
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, dateRecords]) => ({
        date,
        displayDate: formatRelativeDate(date),
        records: dateRecords.sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        ),
      }))
  }, [records])

  if (records.length === 0 && !isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 px-4"
        style={{ color: 'var(--text-muted)' }}
      >
        <p className="text-sm font-medium">No focus records yet</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
          Complete a focus session or add one manually
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groupedRecords.map((group, groupIndex) => (
        <motion.div
          key={group.date}
          {...fadeSlideUp}
          transition={{ delay: groupIndex * 0.05 }}
        >
          {/* Date Header */}
          <div className="flex items-center gap-3 mb-3">
            <h3
              className="text-xs font-bold uppercase tracking-[0.14em]"
              style={{ color: 'var(--text-faint)' }}
            >
              {group.displayDate}
            </h3>
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: 'var(--border)' }}
            />
            <span
              className="text-[10px] tabular-nums"
              style={{ color: 'var(--text-faint)' }}
            >
              {group.records.length} {group.records.length === 1 ? 'session' : 'sessions'}
            </span>
          </div>

          {/* Records */}
          <div className="space-y-2">
            {group.records.map((record) => (
              <RecordCard key={record._id} record={record} />
            ))}
          </div>
        </motion.div>
      ))}

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-2">
          <motion.button
            type="button"
            onClick={onLoadMore}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold cursor-pointer disabled:opacity-50"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              transition: 'background-color 150ms ease, color 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--overlay-1)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            {isLoading ? (
              <>
                <div
                  className="h-3 w-3 animate-spin rounded-full border-2"
                  style={{
                    borderColor: 'var(--border)',
                    borderTopColor: 'var(--accent)',
                  }}
                />
                Loading...
              </>
            ) : (
              'Load more'
            )}
          </motion.button>
        </div>
      )}
    </div>
  )
}
