'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, PanelRight, Plus, ImageIcon, Search } from 'lucide-react'
import { fade, ease, buttonPress } from '@/lib/motion'

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1518173946687-a347108b4519?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1431887773042-803ed52bed26?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1504567961542-e24d9439a724?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1465056836900-8f1e940f2114?w=400&h=600&fit=crop',
]

const PRESET_EMOJIS = ['🚀', '📝', '🎉', '🛒']

export default function ArtworkPane() {
  const [coverVisible, setCoverVisible] = useState(true)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedEmoji, setSelectedEmoji] = useState('🚀')
  const [isHovered, setIsHovered] = useState(false)
  const [tooltip, setTooltip] = useState<string | null>(null)
  const ttTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('laif:cover-state')
    if (saved) {
      try {
        const p = JSON.parse(saved)
        if (typeof p.visible === 'boolean') setCoverVisible(p.visible)
        if (typeof p.image === 'number') setSelectedImage(p.image)
        if (typeof p.emoji === 'string') setSelectedEmoji(p.emoji)
      } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('laif:cover-state', JSON.stringify({ visible: coverVisible, image: selectedImage, emoji: selectedEmoji }))
  }, [coverVisible, selectedImage, selectedEmoji])

  const showTip = useCallback((t: string) => {
    if (ttTimer.current) clearTimeout(ttTimer.current)
    ttTimer.current = setTimeout(() => setTooltip(t), 400)
  }, [])
  const hideTip = useCallback(() => {
    if (ttTimer.current) clearTimeout(ttTimer.current)
    setTooltip(null)
  }, [])

  // Collapsed
  if (!coverVisible) {
    return (
      <aside className="relative flex w-[40px] flex-shrink-0 h-full items-start justify-center pt-3 rounded-[var(--outer-radius,20px)]" style={{ backgroundColor: 'var(--bg-pane)' }}>
        <button onClick={() => setCoverVisible(true)} className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer transition-sl" style={{ color: 'var(--text-faint)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
          <PanelRight size={16} strokeWidth={1.5} />
        </button>
      </aside>
    )
  }

  // Customize open — controls on top, large preview on bottom
  if (customizeOpen) {
    return (
      <aside className="flex w-[400px] flex-shrink-0 h-full flex-col rounded-[var(--outer-radius,20px)] overflow-hidden" style={{ backgroundColor: 'var(--bg-pane)' }}>
        {/* Controls section */}
        <div className="flex-shrink-0 px-4 pt-4 pb-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[18px] font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0' }}>Customize list</span>
            <button
              onClick={() => setCustomizeOpen(false)}
              className="rounded-full px-3 py-1 text-[13px] font-medium cursor-pointer transition-sl"
              style={{ backgroundColor: 'var(--overlay-2, var(--bg-hover))', color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-3, var(--bg-hover))' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2, var(--bg-hover))' }}
            >
              Done
            </button>
          </div>

          {/* Emoji row */}
          <p className="text-[12px] font-medium mb-2" style={{ color: 'var(--text-faint)' }}>Emoji</p>
          <div className="flex items-center gap-2 mb-4">
            {PRESET_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelectedEmoji(emoji)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-xl cursor-pointer transition-sl"
                style={{
                  border: selectedEmoji === emoji ? '2px solid var(--text-primary)' : '2px solid transparent',
                  backgroundColor: 'var(--overlay-2, var(--bg-hover))',
                }}
              >
                {emoji}
              </button>
            ))}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full cursor-pointer transition-sl"
              style={{ backgroundColor: 'var(--overlay-2, var(--bg-hover))', color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-3, var(--bg-hover))' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2, var(--bg-hover))' }}
            >
              <Plus size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Image grid — 6 columns, square, very rounded */}
          <p className="text-[12px] font-medium mb-2" style={{ color: 'var(--text-faint)' }}>Image</p>
          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {PRESET_IMAGES.map((url, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className="relative aspect-square overflow-hidden rounded-xl cursor-pointer"
                style={{ border: selectedImage === i ? '2px solid var(--text-primary)' : '2px solid transparent' }}
              >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${url})` }} />
              </button>
            ))}
          </div>

          {/* Upload / Search buttons — pill style */}
          <div className="flex items-center gap-2 mb-2">
            <button
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium cursor-pointer transition-sl"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--overlay-3, var(--border))' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <ImageIcon size={14} strokeWidth={1.5} />
              Upload
            </button>
            <button
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium cursor-pointer transition-sl"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--overlay-3, var(--border))' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <Search size={14} strokeWidth={1.5} />
              Search Unsplash
            </button>
          </div>
        </div>

        {/* Large preview image — fills remaining space */}
        <div className="flex-1 min-h-0 p-2">
          <div
            className="h-full w-full rounded-2xl bg-cover bg-center"
            style={{ backgroundImage: `url(${PRESET_IMAGES[selectedImage]})` }}
          />
        </div>
      </aside>
    )
  }

  // Default — cover image with hover controls
  return (
    <aside
      className="relative flex w-[400px] flex-shrink-0 h-full flex-col overflow-hidden rounded-[var(--outer-radius,20px)]"
      style={{ backgroundColor: 'var(--bg-pane)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); hideTip() }}
    >
      {/* Full cover image */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${PRESET_IMAGES[selectedImage]})`, opacity: 0.35 }} />
      <div className="absolute inset-x-0 bottom-0 h-40" style={{ background: 'linear-gradient(to top, var(--bg-pane) 0%, transparent 100%)' }} />

      {/* Hover controls */}
      <AnimatePresence>
        {isHovered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
            <motion.button {...buttonPress} onClick={() => setCustomizeOpen(true)}
              onMouseEnter={() => showTip('Customize list')} onMouseLeave={hideTip}
              className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', color: '#fff' }}>
              <Settings size={16} strokeWidth={1.5} />
            </motion.button>
            <motion.button {...buttonPress} onClick={() => setCoverVisible(false)}
              onMouseEnter={() => showTip('Hide cover image')} onMouseLeave={hideTip}
              className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', color: '#fff' }}>
              <PanelRight size={16} strokeWidth={1.5} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}
            className="absolute top-12 right-3 z-30 rounded-lg px-2.5 py-1 text-[11px] font-medium"
            style={{ backgroundColor: 'var(--bg-pane-2)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-elevated)', border: '1px solid var(--border)' }}>
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <span className="text-5xl">{selectedEmoji}</span>
      </div>
    </aside>
  )
}
