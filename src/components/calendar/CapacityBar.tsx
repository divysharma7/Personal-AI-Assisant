'use client'

import type { CapacityBarProps } from './types'

/**
 * CapacityBar — horizontal bar showing scheduled vs capacity hours.
 * Color transitions: blue(0-60%), green(60-80%), amber(80-95%), orange(95-110%), red(110%+)
 */
function getCapacityColor(percent: number): string {
  if (percent <= 60) return '#5DA8FF'
  if (percent <= 80) return '#34D399'
  if (percent <= 95) return '#FFB23D'
  if (percent <= 110) return '#FB923C'
  return '#EF4444'
}

function getWarningText(percent: number): string | null {
  if (percent >= 110) return 'Over capacity!'
  if (percent >= 95) return 'Nearly full'
  if (percent >= 80) return 'Getting busy'
  return null
}

export default function CapacityBar({ scheduledHours, capacityHours }: CapacityBarProps) {
  const percent = capacityHours > 0 ? (scheduledHours / capacityHours) * 100 : 0
  const clampedWidth = Math.min(percent, 100)
  const color = getCapacityColor(percent)
  const warning = getWarningText(percent)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-muted)' }}
        >
          {scheduledHours}h / {capacityHours}h
          <span
            className="ml-1.5"
            style={{ color: 'var(--text-faint)' }}
          >
            ({Math.round(percent)}%)
          </span>
        </span>
        {warning && (
          <span
            className="text-[10px] font-medium"
            style={{ color }}
          >
            {warning}
          </span>
        )}
      </div>
      <div
        className="h-1.5 w-full rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--bg-pane-2)' }}
      >
        <div
          className="cal-capacity-fill h-full rounded-full"
          style={{
            width: `${clampedWidth}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}
