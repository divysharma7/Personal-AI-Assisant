'use client'
import { useState, useEffect } from 'react'

// Curated landscape artwork URLs — warm, ambient, Superlist-style
const ARTWORKS = [
  'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&q=80',
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80',
]

export default function ArtworkPane() {
  const [artIdx, setArtIdx] = useState(-1)

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    setArtIdx(dayOfYear % ARTWORKS.length)
  }, [])

  return (
    <div
      className="hidden lg:block flex-shrink-0"
      style={{ width: 380 }}
    >
      <div
        className="h-full overflow-hidden"
        style={{
          borderRadius: 'var(--radius-pane, 16px)',
          backgroundImage: artIdx >= 0 ? `url(${ARTWORKS[artIdx]})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          background: artIdx < 0 ? 'var(--bg-pane, var(--surface))' : undefined,
        }}
      />
    </div>
  )
}
