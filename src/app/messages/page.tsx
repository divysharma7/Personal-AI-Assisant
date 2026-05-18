'use client'

import { useState } from 'react'
import {
  SlidersHorizontal,
  MoreVertical,
  BookOpen,
  X,
  MessageCircle,
} from 'lucide-react'
import { copy } from '@/lib/copy'

export default function MessagesPage() {
  const [tipDismissed, setTipDismissed] = useState(false)

  return (
    <div className="flex flex-col px-6 py-5">
      {/* Header */}
      <div className="mb-1 flex items-start justify-between">
        <div />
        <div className="flex items-center gap-2">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <SlidersHorizontal size={18} strokeWidth={1.5} />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <MoreVertical size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Title */}
      <h1
        className="mb-5 text-[32px] font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        {copy.messages.title}
      </h1>

      {/* Tip banner */}
      {!tipDismissed && (
        <div
          className="mb-5 flex items-center gap-3 rounded-xl px-4 py-3"
          style={{
            backgroundColor: 'rgba(99, 91, 255, 0.08)',
            border: '1px solid rgba(99, 91, 255, 0.3)',
          }}
        >
          <BookOpen size={18} className="flex-shrink-0" style={{ color: '#635BFF' }} />
          <p className="flex-1 text-sm" style={{ color: '#635BFF' }}>
            {copy.messages.tipBanner}
          </p>
          <button
            onClick={() => setTipDismissed(true)}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
            style={{ color: '#635BFF' }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Empty state */}
      <div className="flex flex-1 flex-col items-center justify-center py-20">
        {/* Decorative squiggle SVG */}
        <svg
          width="120"
          height="80"
          viewBox="0 0 120 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-6 opacity-20"
        >
          <path
            d="M10 40 C 20 10, 40 10, 50 40 S 80 70, 90 40 S 100 10, 110 40"
            stroke="var(--text-faint)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M10 50 C 20 20, 40 20, 50 50 S 80 80, 90 50 S 100 20, 110 50"
            stroke="var(--text-faint)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />
        </svg>
        <MessageCircle
          size={40}
          strokeWidth={1}
          className="mb-4"
          style={{ color: 'var(--text-faint)' }}
        />
        <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
          {copy.messages.emptyState}
        </p>
      </div>
    </div>
  )
}
