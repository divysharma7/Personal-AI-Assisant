'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  List,
  Type,
  Mic,
  Sparkles,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  ListOrdered,
  Quote,
  Image,
  Paperclip,
} from 'lucide-react'
import { fadeSlideDown, ease } from '@/lib/motion'

export interface SlashMenuItem {
  label: string
  icon: React.ReactNode
  action: string
  disabled?: boolean
}

const SLASH_ITEMS: SlashMenuItem[] = [
  { label: 'Task', icon: <CheckCircle2 size={16} />, action: 'taskList' },
  { label: 'Sublist', icon: <List size={16} />, action: 'sublist', disabled: true },
  { label: 'Paragraph', icon: <Type size={16} />, action: 'paragraph' },
  { label: 'Talk', icon: <Mic size={16} />, action: 'talk', disabled: true },
  { label: 'Make with AI', icon: <Sparkles size={16} />, action: 'ai', disabled: true },
  { label: 'Heading 1', icon: <Heading1 size={16} />, action: 'heading1' },
  { label: 'Heading 2', icon: <Heading2 size={16} />, action: 'heading2' },
  { label: 'Heading 3', icon: <Heading3 size={16} />, action: 'heading3' },
  { label: 'Divider', icon: <Minus size={16} />, action: 'horizontalRule' },
  { label: 'Bullet list', icon: <List size={16} />, action: 'bulletList' },
  { label: 'Numbered list', icon: <ListOrdered size={16} />, action: 'orderedList' },
  { label: 'Blockquote', icon: <Quote size={16} />, action: 'blockquote' },
  { label: 'Image', icon: <Image size={16} />, action: 'image', disabled: true },
  { label: 'Attachment', icon: <Paperclip size={16} />, action: 'attachment', disabled: true },
]

interface SlashMenuProps {
  query: string
  onSelect: (action: string) => void
  onClose: () => void
  position: { top: number; left: number }
}

export default function SlashMenu({
  query,
  onSelect,
  onClose,
  position,
}: SlashMenuProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const filtered = SLASH_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  )

  // Reset active index when filter changes
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % filtered.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const item = filtered[activeIndex]
        if (item && !item.disabled) {
          onSelect(item.action)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [filtered, activeIndex, onSelect, onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Scroll active item into view
  useEffect(() => {
    const activeEl = menuRef.current?.querySelector(`[data-index="${activeIndex}"]`)
    activeEl?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  if (filtered.length === 0) return null

  return (
    <motion.div
      {...fadeSlideDown}
      transition={ease.fast}
      ref={menuRef}
      className="fixed z-50 w-60 max-h-80 overflow-y-auto rounded-xl p-1.5 shadow-lg"
      style={{
        top: position.top,
        left: position.left,
        backgroundColor: 'var(--bg-pane-2)',
        border: '1px solid var(--border)',
      }}
    >
      {filtered.map((item, index) => (
        <button
          key={item.label}
          data-index={index}
          onClick={() => {
            if (!item.disabled) onSelect(item.action)
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-100 cursor-pointer"
          style={{
            backgroundColor:
              index === activeIndex ? 'var(--bg-hover)' : 'transparent',
            color: item.disabled ? 'var(--text-faint)' : 'var(--text-primary)',
            opacity: item.disabled ? 0.6 : 1,
          }}
          onMouseEnter={() => setActiveIndex(index)}
        >
          <span
            className="flex-shrink-0"
            style={{ color: item.disabled ? 'var(--text-faint)' : 'var(--text-muted)' }}
          >
            {item.icon}
          </span>
          <span className="flex-1">{item.label}</span>
          {item.disabled && (
            <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
              (coming soon)
            </span>
          )}
        </button>
      ))}
    </motion.div>
  )
}
