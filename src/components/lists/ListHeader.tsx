'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Star, MoreVertical } from 'lucide-react'
import { copy } from '@/lib/copy'
import { buttonPress } from '@/lib/motion'
import ListOverflowMenu from './ListOverflowMenu'

interface ListHeaderProps {
  isPrivate: boolean
  collaboratorNames: string[]
  pinnedToFavorites: boolean
  hideCompletedTasks: boolean
  isInbox: boolean
  accentGradient?: string
  onToggleFavorite: () => void
  onToggleHideCompleted: () => void
  onMarkAllIncomplete: () => void
  onDeleteList: () => void
  onShareClick: () => void
  onCustomizeClick: () => void
}

export default function ListHeader({
  isPrivate,
  collaboratorNames,
  pinnedToFavorites,
  hideCompletedTasks,
  isInbox,
  accentGradient,
  onToggleFavorite,
  onToggleHideCompleted,
  onMarkAllIncomplete,
  onDeleteList,
  onShareClick,
  onCustomizeClick,
}: ListHeaderProps) {
  const [overflowOpen, setOverflowOpen] = useState(false)

  const shareLabel = isPrivate
    ? copy.list.privateLabel
    : copy.list.sharedWithLabel(collaboratorNames)

  return (
    <div
      className="sticky top-0 z-10 flex items-center justify-between px-8 py-3"
      style={{
        backgroundColor: 'var(--bg-pane)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left: Share pill + label */}
      <div className="flex items-center gap-3">
        <motion.button
          {...buttonPress}
          onClick={onShareClick}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
          style={{
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            backgroundColor: 'transparent',
          }}
        >
          <Share2 size={12} />
          <span>{copy.list.shareCta}</span>
        </motion.button>
        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
          {shareLabel}
        </span>
      </div>

      {/* Right: Customize swatch + Star + Overflow */}
      <div className="relative flex items-center gap-2">
        {/* Gradient swatch */}
        <motion.button
          {...buttonPress}
          onClick={onCustomizeClick}
          className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer"
          style={{
            background:
              accentGradient ||
              'conic-gradient(from 0deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #667eea)',
          }}
        />

        {/* Star */}
        <motion.button
          {...buttonPress}
          onClick={onToggleFavorite}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
          style={{ color: pinnedToFavorites ? 'var(--accent)' : 'var(--text-faint)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Star
            size={16}
            strokeWidth={1.5}
            fill={pinnedToFavorites ? 'var(--accent)' : 'none'}
          />
        </motion.button>

        {/* Overflow */}
        <motion.button
          {...buttonPress}
          onClick={() => setOverflowOpen(!overflowOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
          style={{ color: 'var(--text-faint)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <MoreVertical size={16} strokeWidth={1.5} />
        </motion.button>

        <ListOverflowMenu
          open={overflowOpen}
          onClose={() => setOverflowOpen(false)}
          hideCompleted={hideCompletedTasks}
          onToggleHideCompleted={onToggleHideCompleted}
          onMarkAllIncomplete={onMarkAllIncomplete}
          onDeleteList={onDeleteList}
          isInbox={isInbox}
        />
      </div>
    </div>
  )
}
