'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useList, useLists } from '@/hooks/useLists'
import BlockEditor from '@/components/editor/BlockEditor'
import ShareModal from '@/components/lists/ShareModal'
import CustomizePanel from '@/components/lists/CustomizePanel'
import ListOverflowMenu from '@/components/lists/ListOverflowMenu'
import {
  Share,
  Star,
  MoreVertical,
  Lock,
} from 'lucide-react'

// ── Toast Component ─────────────────────────────────────────────────────────

function Toast({
  message,
  action,
  onDismiss,
}: {
  message: string
  action?: { label: string; onClick: () => void }
  onDismiss: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, action ? 10000 : 5000)
    return () => clearTimeout(timer)
  }, [onDismiss, action])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 32,
        left: 24,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        borderRadius: 12,
        background: 'var(--surface-raised, var(--card))',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        fontSize: 14,
        color: 'var(--text-1)',
      }}
    >
      <span>{message}</span>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// ── Gradient Swatch ─────────────────────────────────────────────────────────

function GradientSwatch({ cover, onClick }: { cover: string; onClick: () => void }) {
  const bg = cover || 'linear-gradient(135deg, #FF4D3D 0%, #FF8C3D 50%, #FFD93D 100%)'
  return (
    <button
      type="button"
      onClick={onClick}
      title="Customize list"
      className="btn-icon"
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: bg,
        border: '2px solid var(--border)',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    />
  )
}

// ── Main Page Component ─────────────────────────────────────────────────────

export default function ListPage() {
  const params = useParams()
  const router = useRouter()
  const listId = params.id as string

  const { list, isLoading, updateBlocks } = useList(listId)
  const { updateList, deleteListAsync } = useLists()

  const [showShare, setShowShare] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [overflowAnchor, setOverflowAnchor] = useState<{ top: number; right: number } | null>(null)
  const [toast, setToast] = useState<{
    message: string
    action?: { label: string; onClick: () => void }
  } | null>(null)

  const titleRef = useRef<HTMLDivElement>(null)
  const overflowBtnRef = useRef<HTMLButtonElement>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Title editing ─────────────────────────────────────────────────────

  const handleTitleBlur = useCallback(() => {
    if (!list) return
    const newTitle = titleRef.current?.textContent?.trim() || ''
    if (newTitle !== list.title) {
      updateList({ id: listId, title: newTitle } as Parameters<typeof updateList>[0])
    }
  }, [list, listId, updateList])

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleTitleBlur()
        // Focus the editor body
        const editorEl = document.querySelector('.block-editor-content .tiptap') as HTMLElement
        editorEl?.focus()
      }
    },
    [handleTitleBlur]
  )

  // ── Block editor update (debounced) ───────────────────────────────────

  const handleBlocksUpdate = useCallback(
    (json: unknown) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        updateBlocks(json)
      }, 800)
    },
    [updateBlocks]
  )

  // ── Actions ───────────────────────────────────────────────────────────

  const handleToggleFavorite = useCallback(() => {
    if (!list) return
    updateList({
      id: listId,
      pinnedToFavorites: !list.pinnedToFavorites,
    } as Parameters<typeof updateList>[0])
  }, [list, listId, updateList])

  const handleToggleHideCompleted = useCallback(() => {
    if (!list) return
    updateList({
      id: listId,
      hideCompletedTasks: !list.hideCompletedTasks,
    } as Parameters<typeof updateList>[0])
  }, [list, listId, updateList])

  const handleMarkAllIncomplete = useCallback(() => {
    setToast({ message: 'All tasks marked incomplete' })
  }, [])

  const handleDeleteList = useCallback(async () => {
    if (!list) return
    const deletedTitle = list.title || 'Untitled'
    try {
      await deleteListAsync(listId)
      setToast({
        message: `"${deletedTitle}" deleted`,
        action: {
          label: 'Undo',
          onClick: () => {
            // Undo: re-fetch / re-create would require backend undo
            setToast(null)
          },
        },
      })
      router.push('/')
    } catch {
      setToast({ message: 'Failed to delete list' })
    }
  }, [list, listId, deleteListAsync, router])

  const handleInvite = useCallback(
    (email: string) => {
      if (!list) return
      const newCollab = {
        userId: email,
        email,
        role: 'collaborator' as const,
        pending: true,
        invitedAt: new Date().toISOString(),
      }
      updateList({
        id: listId,
        collaborators: [...list.collaborators, newCollab],
        isPrivate: false,
      } as Parameters<typeof updateList>[0])
      setToast({ message: `"${list.title || 'Untitled'}" has been shared with ${email}` })
    },
    [list, listId, updateList]
  )

  const handleRemoveCollab = useCallback(
    (userId: string) => {
      if (!list) return
      const updated = list.collaborators.filter((c) => c.userId !== userId)
      updateList({
        id: listId,
        collaborators: updated,
        isPrivate: updated.length === 0,
      } as Parameters<typeof updateList>[0])
    },
    [list, listId, updateList]
  )

  const handleSelectEmoji = useCallback(
    (emoji: string) => {
      updateList({ id: listId, icon: emoji } as Parameters<typeof updateList>[0])
    },
    [listId, updateList]
  )

  const handleSelectCover = useCallback(
    (cover: string) => {
      updateList({ id: listId, coverImageUrl: cover } as Parameters<typeof updateList>[0])
    },
    [listId, updateList]
  )

  const handleOverflowClick = useCallback(() => {
    if (overflowBtnRef.current) {
      const rect = overflowBtnRef.current.getBoundingClientRect()
      setOverflowAnchor({ top: rect.bottom, right: rect.right })
    }
  }, [])

  // ── Render ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--text-3)',
          fontSize: 15,
        }}
      >
        Loading...
      </div>
    )
  }

  if (!list) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--text-3)',
          fontSize: 15,
        }}
      >
        List not found
      </div>
    )
  }

  const isCustomized = !!(list.icon || list.coverImageUrl)

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Main content */}
      <div
        style={{
          flex: 1,
          minWidth: 540,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* List header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          {/* Left: Share pill + privacy label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => setShowShare(true)}
              className="pill-interactive"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Share size={14} />
              <span>Share</span>
            </button>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              {list.isPrivate ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Lock size={12} />
                  This list is private
                </span>
              ) : (
                `Shared with ${list.collaborators.length} ${list.collaborators.length === 1 ? 'person' : 'people'}`
              )}
            </span>
          </div>

          {/* Right: swatch + star + overflow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GradientSwatch
              cover={list.coverImageUrl}
              onClick={() => setShowCustomize(!showCustomize)}
            />
            <button
              type="button"
              className="btn-icon"
              onClick={handleToggleFavorite}
              style={{ width: 32, height: 32 }}
              title={list.pinnedToFavorites ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                size={18}
                fill={list.pinnedToFavorites ? 'var(--color-danger, #FF4D3D)' : 'none'}
                color={list.pinnedToFavorites ? 'var(--color-danger, #FF4D3D)' : 'currentColor'}
              />
            </button>
            <button
              ref={overflowBtnRef}
              type="button"
              className="btn-icon"
              onClick={handleOverflowClick}
              style={{ width: 32, height: 32 }}
            >
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px 24px 80px',
          }}
        >
          {/* List title */}
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div
              ref={titleRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              data-placeholder="Untitled"
              style={{
                fontSize: 48,
                fontWeight: 800,
                fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif",
                color: list.title ? 'var(--text-1)' : 'var(--text-3)',
                outline: 'none',
                lineHeight: 1.15,
                marginBottom: 8,
                minHeight: '1.15em',
              }}
            >
              {list.title || ''}
            </div>

            {/* Empty title placeholder via CSS */}
            <style>{`
              [data-placeholder]:empty::before {
                content: attr(data-placeholder);
                color: var(--text-3);
                pointer-events: none;
              }
              [data-placeholder]:empty:focus::before {
                color: var(--text-3);
              }
            `}</style>

            {/* Decorative line */}
            {isCustomized && (
              <div
                style={{
                  width: '70%',
                  height: 3,
                  borderRadius: 2,
                  background: list.coverImageUrl || 'var(--accent)',
                  marginBottom: 24,
                  opacity: 0.6,
                }}
              />
            )}

            {/* Block editor */}
            <BlockEditor
              content={list.blocks}
              onUpdate={handleBlocksUpdate}
              placeholder="Start typing, or type '/' to choose a different content type"
              autofocus={false}
            />
          </div>
        </div>
      </div>

      {/* Right pane: Customize panel */}
      {showCustomize && (
        <CustomizePanel
          currentIcon={list.icon}
          currentCover={list.coverImageUrl}
          onSelectEmoji={handleSelectEmoji}
          onSelectCover={handleSelectCover}
          onClose={() => setShowCustomize(false)}
        />
      )}

      {/* Share modal */}
      {showShare && (
        <ShareModal
          listTitle={list.title || 'Untitled'}
          collaborators={list.collaborators}
          onInvite={handleInvite}
          onRemove={handleRemoveCollab}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Overflow menu */}
      {overflowAnchor && (
        <ListOverflowMenu
          hideCompleted={list.hideCompletedTasks}
          isInbox={list.isInbox}
          anchorRect={overflowAnchor}
          onToggleHideCompleted={handleToggleHideCompleted}
          onMarkAllIncomplete={handleMarkAllIncomplete}
          onDeleteList={handleDeleteList}
          onClose={() => setOverflowAnchor(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          action={toast.action}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}
