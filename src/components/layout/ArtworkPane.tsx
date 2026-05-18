'use client'

import { useMemo } from 'react'

/** Get a daily-rotating Unsplash landscape image */
function getDailyImageUrl(): string {
  const today = new Date()
  const dayOfYear =
    Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  // Use different curated collection IDs for variety
  const collections = [
    '1065976', // landscapes
    '3330448', // nature
    '1459961', // minimal
    '894/900', // travel
  ]
  const idx = dayOfYear % collections.length
  return `https://source.unsplash.com/collection/${collections[idx]}/760x1080?day=${dayOfYear}`
}

export default function ArtworkPane() {
  const imageUrl = useMemo(() => getDailyImageUrl(), [])

  return (
    <aside
      className="relative flex w-[380px] flex-shrink-0 items-end overflow-hidden rounded-[16px]"
      style={{
        backgroundColor: 'var(--bg-pane)',
        backgroundImage: `linear-gradient(180deg, var(--bg-pane) 0%, var(--bg-pane-2) 50%, var(--bg-pane) 100%)`,
      }}
    >
      {/* Unsplash image background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 transition-opacity duration-500"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* Gradient overlay at bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-32"
        style={{
          background:
            'linear-gradient(to top, var(--bg-pane) 0%, transparent 100%)',
        }}
      />

      {/* Branding footer */}
      <div className="relative z-10 w-full p-6">
        <p
          className="text-xs font-medium tracking-wider opacity-40"
          style={{ color: 'var(--text-faint)' }}
        >
          LAIF
        </p>
      </div>
    </aside>
  )
}
