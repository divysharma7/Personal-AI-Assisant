import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { fadeSlideUp } from '@/lib/motion'
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

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
})

export default function RecordTimeline({
  records,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: RecordTimelineProps) {
  const groupedRecords = useMemo<GroupedRecords[]>(() => {
    const groups: Record<string, FocusRecord[]> = {}

    for (const record of records) {
      const recordDate = new Date(record.startTime)
      const date = recordDate.toLocaleDateString('en-CA')
      if (!groups[date]) groups[date] = []
      groups[date].push(record)
    }

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, dateRecords]) => ({
        date,
        displayDate: dateFormatter.format(new Date(`${date}T12:00:00`)),
        records: dateRecords.sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
        ),
      }))
  }, [records])

  if (records.length === 0 && !isLoading) {
    return (
      <div className="focus-record-empty">
        <p>No focus records yet</p>
        <span>Finished sessions will appear here.</span>
      </div>
    )
  }

  return (
    <div className="focus-record-groups">
      {groupedRecords.map((group, groupIndex) => (
        <motion.section
          key={group.date}
          {...fadeSlideUp}
          transition={{ delay: groupIndex * 0.04 }}
          className="focus-record-group"
        >
          <h3 className="focus-record-date">{group.displayDate}</h3>
          <div>
            {group.records.map((record, index) => (
              <RecordCard
                key={record._id}
                record={record}
                isLast={index === group.records.length - 1}
              />
            ))}
          </div>
        </motion.section>
      ))}

      {hasMore && onLoadMore && (
        <motion.button
          type="button"
          onClick={onLoadMore}
          disabled={isLoading}
          className="focus-load-more"
        >
          {isLoading ? 'Loading…' : 'Load more'}
        </motion.button>
      )}
    </div>
  )
}
