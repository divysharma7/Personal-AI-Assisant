'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Link2, Check, X, ChevronDown } from 'lucide-react'
import { copy } from '@/lib/copy'
import { scaleIn, ease } from '@/lib/motion'
import type { ListCollaborator } from '@/hooks/useLists'

interface ShareModalProps {
  open: boolean
  onClose: () => void
  listTitle: string
  collaborators: ListCollaborator[]
  onInvite: (email: string) => void
  onRemove: (userId: string) => void
}

export default function ShareModal({
  open,
  onClose,
  listTitle,
  collaborators,
  onInvite,
  onRemove,
}: ShareModalProps) {
  const [searchValue, setSearchValue] = useState('')
  const [copied, setCopied] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose()
    },
    [onClose]
  )

  const handleInvite = useCallback(() => {
    if (!searchValue.trim()) return
    onInvite(searchValue.trim())
    setSearchValue('')
  }, [searchValue, onInvite])

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}`
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [])

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  return (
    <AnimatePresence>
      {open && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <motion.div
            {...scaleIn}
            transition={ease.normal}
            className="w-[480px] rounded-2xl p-6"
            style={{
              backgroundColor: 'var(--bg-pane-2)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Search/invite row */}
            <div className="mb-4 flex items-center gap-2">
              <div
                className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5"
                style={{
                  backgroundColor: 'var(--bg-pane)',
                  border: '1px solid var(--border)',
                }}
              >
                <Search size={16} style={{ color: 'var(--text-faint)' }} />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInvite()
                  }}
                  placeholder={copy.share.searchPlaceholder}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                {searchValue && (
                  <button
                    onClick={() => setSearchValue('')}
                    className="cursor-pointer"
                    style={{ color: 'var(--text-faint)' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={handleInvite}
                disabled={!searchValue.trim()}
                className="btn-primary whitespace-nowrap"
              >
                {copy.share.inviteCta}
              </button>
            </div>

            {/* Pending invite preview */}
            {searchValue.trim() && isEmail(searchValue.trim()) && (
              <button
                onClick={handleInvite}
                className="mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors duration-150 cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: 'var(--text-faint)' }}
                >
                  {searchValue.trim().charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{searchValue.trim()}</p>
                  <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    Pending
                  </p>
                </div>
              </button>
            )}

            {/* Collaborator rows */}
            <div className="mb-4 flex flex-col gap-0.5">
              {collaborators.map((collab) => (
                <CollaboratorRow
                  key={collab.userId}
                  collaborator={collab}
                  listTitle={listTitle}
                  onRemove={onRemove}
                />
              ))}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between border-t pt-4"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {copy.share.accountContext}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--text-faint)' }} />
              </div>
              <button
                onClick={handleCopyLink}
                className="btn-ghost flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check size={14} style={{ color: 'var(--accent)' }} />
                    <span style={{ color: 'var(--accent)' }}>
                      {copy.share.copiedConfirmation}
                    </span>
                  </>
                ) : (
                  <>
                    <Link2 size={14} />
                    <span>{copy.share.copyLinkCta}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function CollaboratorRow({
  collaborator,
  listTitle,
  onRemove,
}: {
  collaborator: ListCollaborator
  listTitle: string
  onRemove: (userId: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const isCreator = collaborator.role === 'creator'
  const roleLabel = isCreator
    ? copy.share.roles.creator
    : copy.share.roles.collaborator

  return (
    <div
      className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-150"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? 'var(--bg-hover)' : 'transparent',
      }}
    >
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        {(collaborator.email || collaborator.userId).charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="truncate text-[15px]"
          style={{ color: 'var(--text-primary)' }}
        >
          {collaborator.email || collaborator.userId}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
          {roleLabel}
          {collaborator.pending && ' (Pending)'}
        </p>
      </div>
      {!isCreator && hovered && (
        <button
          onClick={() => onRemove(collaborator.userId)}
          className="btn-ghost text-xs"
          style={{ color: 'var(--accent)' }}
        >
          {copy.share.removeCta}
        </button>
      )}
    </div>
  )
}
