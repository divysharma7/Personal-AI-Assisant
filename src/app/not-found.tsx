import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center"
      style={{ color: 'var(--text-primary)' }}
    >
      <h2 className="mb-2 text-6xl font-bold" style={{ color: 'var(--text-faint)' }}>
        404
      </h2>
      <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="rounded-full px-6 py-2.5 text-sm font-medium text-white"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        Back to Inbox
      </Link>
    </div>
  )
}
