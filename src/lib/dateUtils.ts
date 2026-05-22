export function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'just now'
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDays = Math.floor(diffHr / 24)
  return `${diffDays}d ago`
}

export function startOfToday(): Date {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d
}

export function endOfToday(): Date {
  const d = new Date(); d.setHours(23, 59, 59, 999); return d
}

export function addDaysUtil(date: Date, days: number): Date {
  const d = new Date(date); d.setDate(d.getDate() + days); return d
}

export function startOfDay(date: Date): Date {
  const d = new Date(date); d.setHours(0, 0, 0, 0); return d
}
