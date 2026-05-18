'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Search } from 'lucide-react'
import { copy } from '@/lib/copy'
import { slideFromRight, ease, buttonPress } from '@/lib/motion'

const PRESET_EMOJIS = ['\uD83D\uDCDD', '\uD83D\uDE80', '\uD83D\uDCCB', '\uD83C\uDF89', '\uD83D\uDED2']

const PRESET_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(135deg, #f5576c 0%, #ff6f61 100%)',
  'linear-gradient(135deg, #667eea 0%, #00c6fb 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
  'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
]

interface CustomizePanelProps {
  open: boolean
  onClose: () => void
  currentIcon?: string
  currentCoverIndex?: number
  onSelectEmoji: (emoji: string) => void
  onSelectCover: (index: number, gradient: string) => void
}

export default function CustomizePanel({
  open,
  onClose,
  currentIcon,
  currentCoverIndex,
  onSelectEmoji,
  onSelectCover,
}: CustomizePanelProps) {
  const [selectedEmoji, setSelectedEmoji] = useState(currentIcon || '')
  const [selectedCover, setSelectedCover] = useState(currentCoverIndex ?? -1)

  const handleEmojiClick = (emoji: string) => {
    setSelectedEmoji(emoji)
    onSelectEmoji(emoji)
  }

  const handleCoverClick = (index: number) => {
    setSelectedCover(index)
    onSelectCover(index, PRESET_GRADIENTS[index])
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          {...slideFromRight}
          transition={ease.normal}
          className="flex w-[420px] flex-shrink-0 flex-col overflow-y-auto rounded-[16px] p-6"
          style={{
            backgroundColor: 'var(--bg-pane)',
            borderLeft: '1px solid var(--border)',
          }}
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {copy.customizeList.title}
            </h2>
            <motion.button
              {...buttonPress}
              onClick={onClose}
              className="btn-primary rounded-lg px-4 py-1.5 text-sm"
            >
              {copy.customizeList.doneCta}
            </motion.button>
          </div>

          {/* Emoji section */}
          <div className="mb-6">
            <h3
              className="mb-3 text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--text-faint)' }}
            >
              {copy.customizeList.sectionEmoji}
            </h3>
            <div className="flex items-center gap-2">
              {PRESET_EMOJIS.map((emoji) => (
                <motion.button
                  key={emoji}
                  {...buttonPress}
                  onClick={() => handleEmojiClick(emoji)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xl transition-colors duration-150 cursor-pointer"
                  style={{
                    backgroundColor:
                      selectedEmoji === emoji
                        ? 'var(--accent-soft)'
                        : 'var(--bg-pane-2)',
                    border:
                      selectedEmoji === emoji
                        ? '2px solid var(--accent)'
                        : '2px solid transparent',
                  }}
                >
                  {emoji}
                </motion.button>
              ))}
              <motion.button
                {...buttonPress}
                className="flex h-10 w-10 items-center justify-center rounded-full text-lg transition-colors duration-150 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-pane-2)',
                  color: 'var(--text-faint)',
                }}
              >
                +
              </motion.button>
            </div>
          </div>

          {/* Image section */}
          <div className="mb-6">
            <h3
              className="mb-3 text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--text-faint)' }}
            >
              {copy.customizeList.sectionImage}
            </h3>
            <div className="mb-4 grid grid-cols-4 gap-2">
              {PRESET_GRADIENTS.map((gradient, i) => (
                <motion.button
                  key={i}
                  {...buttonPress}
                  onClick={() => handleCoverClick(i)}
                  className="aspect-square rounded-lg transition-all duration-150 cursor-pointer"
                  style={{
                    background: gradient,
                    border:
                      selectedCover === i
                        ? '2px solid var(--accent)'
                        : '2px solid transparent',
                    outline:
                      selectedCover === i
                        ? '2px solid var(--accent)'
                        : 'none',
                    outlineOffset: '1px',
                  }}
                />
              ))}
            </div>

            {/* Upload / Unsplash buttons */}
            <div className="flex gap-2">
              <button
                className="btn-ghost flex flex-1 items-center justify-center gap-2 rounded-lg py-2"
                style={{
                  backgroundColor: 'var(--bg-pane-2)',
                  border: '1px solid var(--border)',
                }}
              >
                <Upload size={14} />
                <span className="text-sm">{copy.customizeList.uploadCta}</span>
              </button>
              <button
                className="btn-ghost flex flex-1 items-center justify-center gap-2 rounded-lg py-2"
                style={{
                  backgroundColor: 'var(--bg-pane-2)',
                  border: '1px solid var(--border)',
                }}
              >
                <Search size={14} />
                <span className="text-sm">{copy.customizeList.searchUnsplashCta}</span>
              </button>
            </div>
          </div>

          {/* Preview area */}
          {selectedCover >= 0 && (
            <div className="mt-auto">
              <h3
                className="mb-3 text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-faint)' }}
              >
                Preview
              </h3>
              <div
                className="h-40 w-full rounded-xl"
                style={{ background: PRESET_GRADIENTS[selectedCover] }}
              />
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
