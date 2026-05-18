'use client'
import { useState, useEffect } from 'react'

// Curated landscape artwork URLs — warm, ambient, Superlist-style
const ARTWORKS = [
  'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&q=80', // desert moon
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&q=80', // mountain lake
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80', // misty forest
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80', // golden fields
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80', // sunlit valley
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80', // waterfall
]

export default function ArtworkPanel() {
  const [artIdx, setArtIdx] = useState(-1)

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    setArtIdx(dayOfYear % ARTWORKS.length)
  }, [])

  return (
    <div
      className="hidden lg:block flex-shrink-0 py-2 md:py-3 pr-2 md:pr-3"
      style={{ width: 280 }}
    >
      <div
        className="h-full rounded-2xl md:rounded-[20px] overflow-hidden"
        style={{
          backgroundImage: artIdx >= 0 ? `url(${ARTWORKS[artIdx]})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          background: artIdx < 0 ? 'var(--surface)' : undefined,
        }}
      />
    </div>
  )
}
