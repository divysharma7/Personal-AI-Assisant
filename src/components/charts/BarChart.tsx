export function BarChart({ data, labels, accent, height = 100 }: {
  data: number[]
  labels: string[]
  accent?: string
  height?: number
}) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <div
            className="w-full rounded-t"
            style={{
              height: `${(v / max) * (height * 0.8)}px`,
              backgroundColor: i === data.length - 1 ? (accent || 'var(--accent)') : 'var(--overlay-2, var(--bg-hover))',
              minHeight: 2,
            }}
          />
          <span className="text-[10px] font-medium truncate" style={{ color: 'var(--text-muted)' }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}
