export function AreaChart({ data, labels, gradientId = 'areaGrad' }: {
  data: number[]
  labels: string[]
  gradientId?: string
}) {
  const max = Math.max(...data, 1)
  const h = 80
  const w = data.length > 1 ? 100 / (data.length - 1) : 100
  const points = data.map((v, i) => `${i * w},${h - (v / max) * h}`).join(' ')
  const areaPoints = `0,${h} ${points} ${(data.length - 1) * w},${h}`

  return (
    <div className="relative h-[100px]">
      <svg viewBox={`0 0 ${(data.length - 1) * w || 100} ${h}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#${gradientId})`} />
        <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
        {data.map((v, i) => (
          <circle key={i} cx={i * w} cy={h - (v / max) * h} r="3" fill="var(--accent)" />
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        {labels.map((l, i) => (
          <span key={i} className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{l}</span>
        ))}
      </div>
    </div>
  )
}
