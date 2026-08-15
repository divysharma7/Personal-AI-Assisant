export function StatTile({ label, value, sub, color }: {
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-[24px] font-bold" style={{ color: color || 'var(--accent)' }}>{value}</span>
      <span className="text-[11px] font-medium" style={{ color: 'var(--text-faint)' }}>{label}</span>
      {sub && <span className="type-micro" style={{ color: 'var(--success)' }}>{sub}</span>}
    </div>
  )
}
