export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div
        className="h-5 w-5 animate-spin rounded-full border-2"
        style={{
          borderColor: 'var(--border)',
          borderTopColor: 'var(--accent)',
        }}
      />
    </div>
  )
}
