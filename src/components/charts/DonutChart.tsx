export function DonutChart({ segments, centerLabel, centerSub, size = 120 }: {
  segments: { value: number; color: string; label: string }[]
  centerLabel: string
  centerSub: string
  size?: number
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  const circumference = 2 * Math.PI * (size / 2 - 6)
  let offset = 0

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
          {segments.map((seg, i) => {
            const pct = seg.value / total
            const dashArray = `${pct * circumference} ${circumference}`
            const rotation = offset * 360 - 90
            offset += pct
            return (
              <circle
                key={i}
                cx={size / 2} cy={size / 2} r={size / 2 - 6}
                fill="none"
                stroke={seg.color}
                strokeWidth="12"
                strokeDasharray={dashArray}
                transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>{centerLabel}</span>
          <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{centerSub}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-[12px]" style={{ color: 'var(--text-primary)' }}>
              {seg.value} | {seg.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
