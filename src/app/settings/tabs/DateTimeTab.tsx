'use client'

import { motion } from 'framer-motion'
import { fade, ease } from '@/lib/motion'

interface DateTimeTabProps {
  calWeekStartsOn: 'monday' | 'sunday' | 'saturday'
  calTimeFormat: '12' | '24'
  detectedTz: string
  userTimezone?: string
  onWeekStartChange: (v: 'monday' | 'sunday' | 'saturday') => void
  onTimeFormatChange: (v: '12' | '24') => void
  persistCalPref: (data: Record<string, unknown>) => void
}

export default function DateTimeTab({
  calWeekStartsOn,
  calTimeFormat,
  detectedTz,
  userTimezone,
  onWeekStartChange,
  onTimeFormatChange,
  persistCalPref,
}: DateTimeTabProps) {
  return (
    <motion.div key="datetime" {...fade} transition={ease.normal} className="flex flex-col gap-6">
      {/* Start Week On */}
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
          Week
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Start Week On</span>
          <select
            value={calWeekStartsOn}
            onChange={(e) => {
              const v = e.target.value as 'monday' | 'sunday' | 'saturday'
              onWeekStartChange(v)
              const map: Record<string, number> = { sunday: 0, monday: 1, saturday: 6 }
              persistCalPref({ weekStartsOn: map[v] })
            }}
            className="rounded-lg px-2 py-1.5 text-sm outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-pane-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="sunday">Sunday</option>
            <option value="monday">Monday</option>
            <option value="saturday">Saturday</option>
          </select>
        </div>
      </div>

      {/* Separator */}
      <div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* Time Format */}
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
          Time Format
        </p>
        <div className="flex items-center gap-2">
          {(['12', '24'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => {
                onTimeFormatChange(fmt)
                persistCalPref({ timeFormat: fmt === '12' ? '12h' : '24h' })
              }}
              className="rounded-full px-4 py-2 text-xs font-medium transition-colors duration-150 cursor-pointer"
              style={{
                backgroundColor: calTimeFormat === fmt ? 'var(--accent)' : 'var(--bg-hover)',
                color: calTimeFormat === fmt ? '#FFFFFF' : 'var(--text-muted)',
              }}
            >
              {fmt}-hour {fmt === '12' ? '(1:30 PM)' : '(13:30)'}
            </button>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* Timezone */}
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
          Time Zone
        </p>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>Detected:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {detectedTz || 'Unknown'}
          </span>
        </div>
        {userTimezone && userTimezone !== detectedTz && (
          <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>Saved:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {userTimezone}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
