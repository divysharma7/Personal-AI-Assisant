'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { JSONContent } from '@tiptap/react'
import { copy } from '@/lib/copy'
import { useList, useLists } from '@/hooks/useLists'
import { fadeSlideUp, ease } from '@/lib/motion'
import ListHeader from '@/components/lists/ListHeader'
import BlockEditor from '@/components/editor/BlockEditor'
import ShareModal from '@/components/lists/ShareModal'
import CustomizePanel from '@/components/lists/CustomizePanel'

export default function ListPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { list, isLoading, updateBlocks } = useList(id)
  const { updateList, deleteList } = useLists()

  const [shareOpen, setShareOpen] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const titleRef = useRef<HTMLDivElement>(null)
  const [localTitle, setLocalTitle] = useState('')

  // Sync local title when list data arrives
  useEffect(() => {
    if (list && localTitle === '' && list.title) {
      setLocalTitle(list.title)
    }
  }, [list, localTitle])

  // Focus title on mount for new lists
  useEffect(() => {
    if (list && !list.title && titleRef.current) {
      titleRef.current.focus()
    }
  }, [list])

  const handleTitleBlur = useCallback(() => {
    if (!list) return
    const newTitle = titleRef.current?.textContent?.trim() || ''
    if (newTitle !== list.title) {
      updateList({ id: list._id, title: newTitle } as Parameters<typeof updateList>[0])
    }
  }, [list, updateList])

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleTitleBlur()
        // Focus editor body
        const editorEl = document.querySelector('.prose-editor') as HTMLElement
        editorEl?.focus()
      }
    },
    [handleTitleBlur]
  )

  const handleSaveBlocks = useCallback(
    (json: JSONContent) => {
      updateBlocks(json)
    },
    [updateBlocks]
  )

  const handleToggleFavorite = useCallback(() => {
    if (!list) return
    updateList({
      id: list._id,
      pinnedToFavorites: !list.pinnedToFavorites,
    } as Parameters<typeof updateList>[0])
  }, [list, updateList])

  const handleToggleHideCompleted = useCallback(() => {
    if (!list) return
    updateList({
      id: list._id,
      hideCompletedTasks: !list.hideCompletedTasks,
    } as Parameters<typeof updateList>[0])
  }, [list, updateList])

  const handleMarkAllIncomplete = useCallback(() => {
    // Task blocks will be fully implemented in Phase 3
  }, [])

  const handleDeleteList = useCallback(() => {
    if (!list) return
    deleteList(list._id)
    router.push('/')
  }, [list, deleteList, router])

  const handleInvite = useCallback(
    (email: string) => {
      if (!list) return
      const existing = list.collaborators || []
      const newCollab = {
        userId: email,
        email,
        role: 'collaborator' as const,
        pending: true,
        invitedAt: new Date().toISOString(),
      }
      updateList({
        id: list._id,
        collaborators: [...existing, newCollab],
        isPrivate: false,
      } as Parameters<typeof updateList>[0])
    },
    [list, updateList]
  )

  const handleRemoveCollaborator = useCallback(
    (userId: string) => {
      if (!list) return
      const filtered = (list.collaborators || []).filter(
        (c) => c.userId !== userId
      )
      updateList({
        id: list._id,
        collaborators: filtered,
        isPrivate: filtered.length === 0,
      } as Parameters<typeof updateList>[0])
    },
    [list, updateList]
  )

  const handleSelectEmoji = useCallback(
    (emoji: string) => {
      if (!list) return
      updateList({ id: list._id, icon: emoji } as Parameters<typeof updateList>[0])
    },
    [list, updateList]
  )

  const handleSelectCover = useCallback(
    (_index: number, gradient: string) => {
      if (!list) return
      updateList({ id: list._id, coverImageUrl: gradient } as Parameters<typeof updateList>[0])
    },
    [list, updateList]
  )

  if (isLoading) {
    return (
      <div
        className="flex flex-1 items-center justify-center"
        style={{ color: 'var(--text-faint)' }}
      >
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </div>
    )
  }

  if (!list) {
    return (
      <div
        className="flex flex-1 items-center justify-center"
        style={{ color: 'var(--text-faint)' }}
      >
        <p className="text-sm">List not found</p>
      </div>
    )
  }

  const accentGradient = list.coverImageUrl || undefined
  const collaboratorNames = (list.collaborators || [])
    .filter((c) => c.role !== 'creator')
    .map((c) => c.email || c.userId)

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Sticky header */}
        <ListHeader
          isPrivate={list.isPrivate}
          collaboratorNames={collaboratorNames}
          pinnedToFavorites={list.pinnedToFavorites}
          hideCompletedTasks={list.hideCompletedTasks}
          isInbox={list.isInbox}
          accentGradient={accentGradient}
          onToggleFavorite={handleToggleFavorite}
          onToggleHideCompleted={handleToggleHideCompleted}
          onMarkAllIncomplete={handleMarkAllIncomplete}
          onDeleteList={handleDeleteList}
          onShareClick={() => setShareOpen(true)}
          onCustomizeClick={() => setCustomizeOpen(!customizeOpen)}
        />

        {/* List body */}
        <motion.div
          {...fadeSlideUp}
          transition={ease.normal}
          className="flex-1 px-8 py-6"
        >
          {/* Title block */}
          <div className="mb-6">
            <div
              ref={titleRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              onInput={() => {
                setLocalTitle(titleRef.current?.textContent || '')
              }}
              className="text-[48px] font-[800] leading-tight outline-none"
              style={{
                fontFamily: 'var(--font-serif, Georgia, serif)',
                color: localTitle
                  ? 'var(--text-primary)'
                  : 'var(--text-faint)',
              }}
              data-placeholder={copy.list.untitled}
            >
              {list.title || ''}
            </div>

            {/* Decorative colored line */}
            {(list.icon || list.coverImageUrl) && (
              <div
                className="mt-3 h-[3px] w-[70%] rounded-full"
                style={{
                  background:
                    list.coverImageUrl ||
                    'linear-gradient(90deg, var(--accent), var(--info))',
                }}
              />
            )}
          </div>

          {/* Block editor */}
          <BlockEditor
            content={list.blocks as JSONContent | null}
            onSave={handleSaveBlocks}
          />
        </motion.div>
      </div>

      {/* Customize panel (right side, replaces artwork) */}
      <CustomizePanel
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        currentIcon={list.icon}
        onSelectEmoji={handleSelectEmoji}
        onSelectCover={handleSelectCover}
      />

      {/* Share modal */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        listTitle={list.title || copy.list.untitled}
        collaborators={list.collaborators || []}
        onInvite={handleInvite}
        onRemove={handleRemoveCollaborator}
      />
    </div>
  )
}
