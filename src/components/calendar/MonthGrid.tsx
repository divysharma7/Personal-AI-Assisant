'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { format, isSameMonth, isToday, isWeekend } from 'date-fns'
import { cn, getCalendarDays, getItemsForDay, ITEM_COLORS, ITEM_BG } from '@/lib/utils'
import type { AnyItem } from '@/types'
import { Calendar, CheckSquare, Bell } from 'lucide-react'
import { Sheet } from '@/shared/ui/Sheet'

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const ICONS = { event: Calendar, task: CheckSquare, reminder: Bell }

interface MonthGridProps {
  year: number
  month: number
  items: AnyItem[]
  onDayClick?: (date: Date) => void
  onItemClick?: (item: AnyItem) => void
}

export default function MonthGrid({ year, month, items, onDayClick, onItemClick }: MonthGridProps) {
  const days = getCalendarDays(year, month)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const selectedDayItems = selectedDay ? getItemsForDay(items, selectedDay) : []

  function handleDayClick(day: Date) {
    setSelectedDay(day)
    setSheetOpen(true)
    onDayClick?.(day)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--border)' }}>
        {DAY_HEADERS.map((d, i) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-semibold tracking-wider"
            style={{ color: i === 0 || i === 6 ? 'var(--text-3)' : 'var(--text-3)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div
        className="flex-1 grid grid-cols-7"
        style={{ gridTemplateRows: `repeat(${days.length / 7}, minmax(0, 1fr))` }}
      >
        {days.map((day, idx) => {
          const dayItems = getItemsForDay(items, day)
          const inMonth  = isSameMonth(day, new Date(year, month))
          const today    = isToday(day)
          const weekend  = isWeekend(day)
          const visible  = dayItems.slice(0, 3)
          const overflow = dayItems.length - 3

          return (
            <div
              key={idx}
              onClick={() => handleDayClick(day)}
              className={cn(
                'relative p-1.5 cursor-pointer overflow-hidden cal-day-cell',
                today && 'cal-day-today',
                !today && weekend && inMonth && 'cal-day-weekend',
                !today && !inMonth && 'cal-day-out',
              )}
              style={{
                borderRight:  idx % 7 !== 6 ? '1px solid var(--cal-col-border)' : undefined,
                borderBottom: idx < days.length - 7 ? '1px solid var(--cal-col-border)' : undefined,
              }}
            >
              {/* Date number */}
              <div className="flex items-start justify-end mb-1">
                <span
                  className={cn(
                    'w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors',
                  )}
                  style={
                    today
                      ? { background: 'var(--accent)', color: '#fff' }
                      : { color: inMonth ? 'var(--text-1)' : 'var(--text-3)' }
                  }
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-0.5">
                {visible.map((item) => {
                  const Icon = ICONS[item.type]
                  return (
                    <motion.button
                      key={item._id}
                      whileHover={{ scale: 1.02 }}
                      onClick={(e) => { e.stopPropagation(); onItemClick?.(item) }}
                      className="item-pill w-full text-left"
                      style={{ background: ITEM_BG[item.type], color: ITEM_COLORS[item.type] }}
                    >
                      <Icon size={10} className="flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </motion.button>
                  )
                })}
                {overflow > 0 && (
                  <div className="flex items-center gap-0.5 pl-1">
                    {/* Colored dots summary for overflowing items */}
                    {dayItems.slice(3, 6).map((item, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: ITEM_COLORS[item.type] }}
                      />
                    ))}
                    <span className="text-xs ml-0.5" style={{ color: 'var(--text-3)' }}>
                      +{overflow}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Day detail Sheet */}
      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={selectedDay ? format(selectedDay, 'EEEE, MMMM d, yyyy') : ''}
        description={
          selectedDayItems.length === 0
            ? 'Your day is wide open.'
            : `${selectedDayItems.length} item${selectedDayItems.length !== 1 ? 's' : ''}`
        }
      >
        <div className="space-y-2 pt-2">
          {selectedDayItems.length === 0 && (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--text-3)' }}>
              No items scheduled for this day.
            </p>
          )}
          {selectedDayItems.map((item) => {
            const Icon = ICONS[item.type]
            return (
              <button
                key={item._id}
                onClick={() => { onItemClick?.(item); setSheetOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-[var(--bg-overlay)]"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: ITEM_BG[item.type] }}
                >
                  <Icon size={14} style={{ color: ITEM_COLORS[item.type] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>
                    {item.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {item.type === 'event' && item.startDate
                      ? format(new Date(item.startDate), 'h:mm a')
                      : item.type === 'task' && item.dueDate
                      ? format(new Date(item.dueDate), 'h:mm a')
                      : item.type === 'reminder' && item.reminderDate
                      ? format(new Date(item.reminderDate), 'h:mm a')
                      : 'All day'}
                  </p>
                </div>
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: ITEM_COLORS[item.type] }}
                />
              </button>
            )
          })}
        </div>
      </Sheet>
    </div>
  )
}
