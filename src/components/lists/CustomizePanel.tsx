'use client'

import { useState, useCallback } from 'react'
import { X } from 'lucide-react'

// ── Preset emojis (Superlist defaults) ──────────────────────────────────────

const PRESET_EMOJIS = ['\u{1F4DD}', '\u{1F680}', '\u{1F389}', '\u{1F6D2}', '\u{2B50}']

// ── Preset cover images (placeholders — 12 gradient/color covers) ───────────

const PRESET_COVERS = [
  'linear-gradient(135deg, #FF4D3D 0%, #FF8C3D 100%)',
  'linear-gradient(135deg, #FF8C3D 0%, #FFD93D 100%)',
  'linear-gradient(135deg, #34D399 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
  'linear-gradient(135deg, #F472B6 0%, #FB923C 100%)',
  'linear-gradient(135deg, #A78BFA 0%, #818CF8 100%)',
  'linear-gradient(135deg, #10B981 0%, #84CC16 100%)',
  'linear-gradient(135deg, #FBBF24 0%, #F97316 100%)',
  'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
  'linear-gradient(135deg, #14B8A6 0%, #22D3EE 100%)',
  'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
]

interface CustomizePanelProps {
  currentIcon: string
  currentCover: string
  onSelectEmoji: (emoji: string) => void
  onSelectCover: (cover: string) => void
  onClose: () => void
}

export default function CustomizePanel({
  currentIcon,
  currentCover,
  onSelectEmoji,
  onSelectCover,
  onClose,
}: CustomizePanelProps) {
  const [selectedEmoji, setSelectedEmoji] = useState(currentIcon)
  const [selectedCover, setSelectedCover] = useState(currentCover)

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      setSelectedEmoji(emoji)
      onSelectEmoji(emoji)
    },
    [onSelectEmoji]
  )

  const handleCoverSelect = useCallback(
    (cover: string) => {
      setSelectedCover(cover)
      onSelectCover(cover)
    },
    [onSelectCover]
  )

  return (
    <div
      style={{
        width: 420,
        height: '100%',
        background: 'var(--surface-raised, var(--card))',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--text-1)',
          }}
        >
          Customize list
        </h3>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Done
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Emoji section */}
        <div style={{ marginBottom: 28 }}>
          <h4
            style={{
              margin: '0 0 12px',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-2)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Emoji
          </h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PRESET_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiSelect(emoji)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border:
                    selectedEmoji === emoji
                      ? '2px solid var(--accent)'
                      : '1px solid var(--border)',
                  background: 'var(--bg-hover)',
                  fontSize: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
              >
                {emoji}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                // Clear emoji
                handleEmojiSelect('')
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '1px dashed var(--border)',
                background: 'transparent',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-3)',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Image / cover section */}
        <div style={{ marginBottom: 28 }}>
          <h4
            style={{
              margin: '0 0 12px',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-2)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Image
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
            }}
          >
            {PRESET_COVERS.map((cover, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleCoverSelect(cover)}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 10,
                  border:
                    selectedCover === cover
                      ? '2px solid var(--accent)'
                      : '1px solid var(--border)',
                  background: cover,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
              />
            ))}
          </div>

          {/* Upload + Search buttons */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 12,
            }}
          >
            <button
              type="button"
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-1)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Upload
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-1)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Search Unsplash
            </button>
          </div>
        </div>

        {/* Preview */}
        {selectedCover && (
          <div style={{ marginBottom: 20 }}>
            <h4
              style={{
                margin: '0 0 12px',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-2)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Preview
            </h4>
            <div
              style={{
                width: '100%',
                height: 160,
                borderRadius: 12,
                background: selectedCover,
                border: '1px solid var(--border)',
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
