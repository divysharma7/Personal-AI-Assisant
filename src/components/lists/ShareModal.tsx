'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, Link2, Check, X, User } from 'lucide-react'
import type { ListCollaborator } from '@/hooks/useLists'

interface ShareModalProps {
  listTitle: string
  collaborators: ListCollaborator[]
  onInvite: (email: string) => void
  onRemove: (userId: string) => void
  onClose: () => void
}

export default function ShareModal({
  listTitle,
  collaborators,
  onInvite,
  onRemove,
  onClose,
}: ShareModalProps) {
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose()
    },
    [onClose]
  )

  const handleInvite = useCallback(() => {
    if (!search.trim()) return
    onInvite(search.trim())
    setSearch('')
  }, [search, onInvite])

  const handleCopyLink = useCallback(() => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [])

  const isEmail = search.includes('@') && search.includes('.')

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          width: 480,
          maxHeight: '80vh',
          background: 'var(--surface-raised, var(--card))',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--text-1)',
            }}
          >
            Share
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            style={{ width: 32, height: 32 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search + invite row */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 9999,
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
            }}
          >
            <Search size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search people, teams, or emails"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInvite()
              }}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'var(--text-1)',
                fontSize: 14,
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleInvite}
            disabled={!search.trim()}
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              border: 'none',
              background: search.trim() ? 'var(--accent)' : 'var(--bg-hover)',
              color: search.trim() ? '#fff' : 'var(--text-3)',
              fontSize: 14,
              fontWeight: 600,
              cursor: search.trim() ? 'pointer' : 'default',
              whiteSpace: 'nowrap',
              opacity: search.trim() ? 1 : 0.5,
            }}
          >
            Invite
          </button>
        </div>

        {/* Pending invite preview */}
        {isEmail && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 10,
              background: 'var(--bg-hover)',
              cursor: 'pointer',
            }}
            onClick={handleInvite}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--accent-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
                flexShrink: 0,
              }}
            >
              <User size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>
                {search}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Pending</div>
            </div>
          </div>
        )}

        {/* Collaborator rows */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {collaborators.length === 0 && !isEmail && (
            <div
              style={{
                padding: '24px 0',
                textAlign: 'center',
                color: 'var(--text-3)',
                fontSize: 14,
              }}
            >
              No collaborators yet. Invite someone to share this list.
            </div>
          )}

          {collaborators.map((collab) => (
            <CollaboratorRow
              key={collab.userId}
              collab={collab}
              onRemove={collab.role === 'creator' ? undefined : () => onRemove(collab.userId)}
            />
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: 'var(--text-2)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Personal
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-1)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {copied ? (
              <>
                <Check size={14} />
                Copied
              </>
            ) : (
              <>
                <Link2 size={14} />
                Copy link
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function CollaboratorRow({
  collab,
  onRemove,
}: {
  collab: ListCollaborator
  onRemove?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 10,
        transition: 'background 0.1s',
        background: hovered ? 'var(--bg-hover)' : 'transparent',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'var(--accent-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)',
          fontSize: 14,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {(collab.email || collab.userId).charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--text-1)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {collab.email || collab.userId}
          {collab.pending && (
            <span
              style={{
                marginLeft: 6,
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'var(--color-warning-soft)',
                color: 'var(--color-warning)',
                fontWeight: 600,
              }}
            >
              Pending
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'capitalize' }}>
          {collab.role}
        </div>
      </div>
      {onRemove && hovered && (
        <button
          type="button"
          onClick={onRemove}
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-2)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Remove
        </button>
      )}
    </div>
  )
}
