'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import {
  Inbox,
  CalendarDays,
  CheckCircle2,
  LayoutGrid,
  Bell,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  Settings,
  LogOut,
  Star,
  ListChecks,
  Mic,
  Calendar,
  Loader2,
  Flame,
  BarChart3,
  Target,
} from 'lucide-react'
import { useFocusState } from '@/contexts/FocusContext'
import { copy } from '@/lib/copy'
import { collapse, fadeSlideDown, fadeSlideUp, fade, buttonPress, spring, ease } from '@/lib/motion'
import { useLists } from '@/hooks/useLists'
import { useFolders } from '@/hooks/useFolders'
import { useTasks } from '@/hooks/useTasks'
import type { ListDoc } from '@/hooks/useLists'

/* ── Primary nav items ── */
// TODO: move to copy.ts
const HABITS_NAV_LABEL = 'Habits'

const FOCUS_NAV_LABEL = 'Focus'
const CALENDAR_NAV_LABEL = 'Calendar'

const NAV_ITEMS = [
  { label: copy.inbox.title, icon: Inbox, href: '/' },
  { label: copy.today.title, icon: CalendarDays, href: '/today' },
  { label: copy.tasks.title, icon: CheckCircle2, href: '/tasks' },
  { label: HABITS_NAV_LABEL, icon: Flame, href: '/habits' },
  { label: copy.matrix.title, icon: LayoutGrid, href: '/matrix' },
  { label: CALENDAR_NAV_LABEL, icon: Calendar, href: '/calendar' },
  { label: FOCUS_NAV_LABEL, icon: Target, href: '/focus' },
  { label: copy.updates.title, icon: Bell, href: '/updates' },
] as const

/* ── Emoji presets for icon picker ── */
const EMOJI_PRESETS = ['\uD83D\uDCC1', '\uD83D\uDCCB', '\uD83D\uDCDD', '\uD83C\uDFAF', '\uD83D\uDD25', '\u2B50']

function FocusPulsingDot() {
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 100)
    return () => clearInterval(id)
  }, [])

  // Derive opacity from 4s heartbeat cycle
  const phase = (Date.now() % 4000) / 4000
  const opacity = 0.4 + 0.6 * Math.sin(phase * Math.PI * 2)

  return (
    <span
      className="inline-block h-2 w-2 rounded-full flex-shrink-0"
      style={{
        backgroundColor: 'var(--accent)',
        opacity,
      }}
    />
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { focus } = useFocusState()
  const [favoritesOpen, setFavoritesOpen] = useState(true)
  const [meetingsOpen, setMeetingsOpen] = useState(true)
  const [listsHovered, setListsHovered] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const fabPopoverRef = useRef<HTMLDivElement>(null)
  const [userInitial, setUserInitial] = useState('U')
  const { lists } = useLists()
  const { createFolder, updateFolder, deleteFolder, moveTaskToFolder, isCreating } = useFolders()
  const { tasks } = useTasks()

  // Check if current time falls within any scheduled task (for Calendar pulsing dot)
  const hasActiveScheduledTask = tasks.some((t) => {
    if (!t.scheduledStart || !t.scheduledEnd || t.status === 'done') return false
    const now = Date.now()
    return new Date(t.scheduledStart).getTime() <= now && new Date(t.scheduledEnd).getTime() >= now
  })

  // ── Inline creation state ──
  const [isInlineCreating, setIsInlineCreating] = useState(false)
  const [inlineTitle, setInlineTitle] = useState('')
  const inlineInputRef = useRef<HTMLInputElement>(null)

  // ── Inline rename state ──
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameTitle, setRenameTitle] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  // ── Context menu state ──
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; list: ListDoc } | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  // ── Icon picker state ──
  const [iconPickerFor, setIconPickerFor] = useState<string | null>(null)
  const [customEmoji, setCustomEmoji] = useState('')

  // ── Group move sub-menu state ──
  const [groupMenuFor, setGroupMenuFor] = useState<string | null>(null)

  // ── Delete animation state ──
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Drag-over state ──
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  // ── Toast state ──
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [toastUndo, setToastUndo] = useState<(() => void) | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Flash highlight state ──
  const [flashId, setFlashId] = useState<string | null>(null)

  // Favorites = lists pinned to favorites
  const favoriteLists = lists.filter((l) => l.pinnedToFavorites)

  // Show toast helper
  const showToast = useCallback((msg: string, undoFn?: () => void) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastMsg(msg)
    setToastUndo(undoFn ? () => undoFn : null)
    toastTimer.current = setTimeout(() => {
      setToastMsg(null)
      setToastUndo(null)
    }, 4000)
  }, [])

  // Fetch user info for avatar
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.name) setUserInitial(data.name.charAt(0).toUpperCase())
        else if (data?.username) setUserInitial(data.username.charAt(0).toUpperCase())
      })
      .catch(() => {})
  }, [])

  // Close popovers on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarOpen && popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
      if (fabOpen && fabPopoverRef.current && !fabPopoverRef.current.contains(e.target as Node)) {
        setFabOpen(false)
      }
      if (contextMenu && contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
        setIconPickerFor(null)
        setGroupMenuFor(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [avatarOpen, fabOpen, contextMenu])

  // Auto-focus inline input
  useEffect(() => {
    if (isInlineCreating) {
      inlineInputRef.current?.focus()
    }
  }, [isInlineCreating])

  // Auto-focus rename input
  useEffect(() => {
    if (renamingId) {
      renameInputRef.current?.focus()
      renameInputRef.current?.select()
    }
  }, [renamingId])

  const handleSignOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }, [router])

  // ── Inline folder creation ──
  const handleStartInlineCreate = useCallback(() => {
    setIsInlineCreating(true)
    setInlineTitle('')
  }, [])

  const handleInlineCreateSubmit = useCallback(async () => {
    const title = inlineTitle.trim()
    if (!title) {
      setIsInlineCreating(false)
      return
    }
    try {
      const result = await createFolder({ title, icon: '\uD83D\uDCC1' })
      setIsInlineCreating(false)
      setInlineTitle('')
      router.push(`/lists/${result.list._id}`)
    } catch {
      setIsInlineCreating(false)
    }
  }, [inlineTitle, createFolder, router])

  const handleInlineCreateCancel = useCallback(() => {
    setIsInlineCreating(false)
    setInlineTitle('')
  }, [])

  // ── Inline rename ──
  const handleStartRename = useCallback((list: ListDoc) => {
    setRenamingId(list._id)
    setRenameTitle(list.title)
    setContextMenu(null)
  }, [])

  const handleRenameSubmit = useCallback(async () => {
    if (!renamingId) return
    const trimmed = renameTitle.trim()
    if (trimmed) {
      try {
        await updateFolder({ id: renamingId, title: trimmed })
        setFlashId(renamingId)
        setTimeout(() => setFlashId(null), 600)
      } catch {
        // silently fail
      }
    }
    setRenamingId(null)
    setRenameTitle('')
  }, [renamingId, renameTitle, updateFolder])

  const handleRenameCancel = useCallback(() => {
    setRenamingId(null)
    setRenameTitle('')
  }, [])

  // ── Context menu actions ──
  const handleContextMenu = useCallback((e: React.MouseEvent, list: ListDoc) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, list })
    setIconPickerFor(null)
    setGroupMenuFor(null)
  }, [])

  const handleDeleteFolder = useCallback(async (list: ListDoc) => {
    setContextMenu(null)
    setDeletingId(list._id)

    // Wait for fade animation
    setTimeout(async () => {
      try {
        await deleteFolder(list._id)
        showToast(copy.folders.deleted)
      } catch {
        // silently fail
      }
      setDeletingId(null)
    }, 300)
  }, [deleteFolder, showToast])

  const handleChangeIcon = useCallback(async (listId: string, icon: string) => {
    try {
      await updateFolder({ id: listId, icon })
      setFlashId(listId)
      setTimeout(() => setFlashId(null), 600)
    } catch {
      // silently fail
    }
    setIconPickerFor(null)
    setContextMenu(null)
  }, [updateFolder])

  const handleMoveToGroup = useCallback(async (listId: string, groupTitle: string) => {
    try {
      await updateFolder({ id: listId, groupTitle })
    } catch {
      // silently fail
    }
    setGroupMenuFor(null)
    setContextMenu(null)
  }, [updateFolder])

  // ── Drag-and-drop handlers for sidebar list items ──
  const handleDragOver = useCallback((e: React.DragEvent, listId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverId(listId)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverId(null)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, list: ListDoc) => {
    e.preventDefault()
    setDragOverId(null)
    const taskId = e.dataTransfer.getData('application/x-laif-task') || e.dataTransfer.getData('text/plain')
    if (!taskId) return
    try {
      await moveTaskToFolder({ taskId, folderId: list._id })
      showToast(copy.folders.taskMoved(list.title || copy.list.untitled))
    } catch {
      // silently fail
    }
  }, [moveTaskToFolder, showToast])

  // ── FAB actions ──
  const handleFabAction = useCallback(
    async (action: string) => {
      setFabOpen(false)
      switch (action) {
        case 'task':
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', ctrlKey: true }))
          break
        case 'list':
          handleStartInlineCreate()
          break
      }
    },
    [handleStartInlineCreate]
  )

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  // Get unique group titles from lists
  const groupTitles = Array.from(
    new Set(lists.filter((l) => l.groupId).map((l) => l.groupId as string))
  )

  return (
    <aside
      className="flex w-[260px] flex-shrink-0 flex-col rounded-[16px] p-3"
      style={{ backgroundColor: 'var(--bg-pane)' }}
    >
      {/* ── Primary nav ── */}
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          const isFocusItem = item.href === '/focus'
          const showFocusDot = isFocusItem && focus.isActive
          const isCalendarItem = item.href === '/calendar'
          const showCalendarDot = isCalendarItem && hasActiveScheduledTask
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150 cursor-pointer"
              style={{
                backgroundColor: active ? 'var(--bg-hover)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              )}
              <item.icon size={20} strokeWidth={1.5} />
              <div className="flex flex-1 flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px]">{item.label}</span>
                  {showFocusDot && (
                    <FocusPulsingDot />
                  )}
                  {showCalendarDot && (
                    <FocusPulsingDot />
                  )}
                </div>
                {showFocusDot && focus.taskTitle && (
                  <span
                    className="truncate text-[11px]"
                    style={{ color: 'var(--text-faint)' }}
                  >
                    {focus.taskTitle}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </nav>

      {/* ── Separator ── */}
      <div className="my-4 h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* ── Favorites section ── */}
      <button
        onClick={() => setFavoritesOpen(!favoritesOpen)}
        className="mb-1 flex items-center gap-1.5 px-3 py-1 cursor-pointer"
      >
        <motion.div animate={{ rotate: favoritesOpen ? 90 : 0 }} transition={ease.fast}>
          <ChevronRight size={12} style={{ color: 'var(--text-faint)' }} />
        </motion.div>
        <span
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: 'var(--text-faint)' }}
        >
          {copy.sidebar.sectionFavorites}
        </span>
      </button>
      <AnimatePresence>
        {favoritesOpen && (
          <motion.div {...collapse} transition={ease.normal} className="mb-1 flex flex-col gap-0.5 px-1 overflow-hidden">
            {favoriteLists.length === 0 && (
              <span className="px-2 py-1.5 text-xs" style={{ color: 'var(--text-faint)' }}>
                No starred lists
              </span>
            )}
            {favoriteLists.map((list) => {
              const active = pathname === `/lists/${list._id}`
              return (
                <button
                  key={list._id}
                  onClick={() => router.push(`/lists/${list._id}`)}
                  className="group relative flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors duration-150 cursor-pointer"
                  style={{
                    backgroundColor: active ? 'var(--bg-hover)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <Star size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                  <span className="truncate text-[14px]">
                    {list.title || copy.list.untitled}
                  </span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Separator ── */}
      <div className="my-4 h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* ── Meetings section ── */}
      <button
        onClick={() => setMeetingsOpen(!meetingsOpen)}
        className="mb-1 flex items-center gap-1.5 px-3 py-1 cursor-pointer"
      >
        <motion.div animate={{ rotate: meetingsOpen ? 90 : 0 }} transition={ease.fast}>
          <ChevronRight size={12} style={{ color: 'var(--text-faint)' }} />
        </motion.div>
        <span
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: 'var(--text-faint)' }}
        >
          {copy.sidebar.sectionMeetings}
        </span>
      </button>
      <AnimatePresence>
        {meetingsOpen && (
          <motion.div {...collapse} transition={ease.normal} className="mb-1 flex flex-col gap-0.5 px-1 overflow-hidden">
            <div
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm opacity-50"
              style={{ color: 'var(--text-muted)' }}
            >
              <Calendar size={14} strokeWidth={1.5} />
              <span className="truncate text-[14px]">Meeting: May 17</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Separator ── */}
      <div className="my-4 h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* ── Lists section ── */}
      <div
        className="mb-1 flex items-center justify-between px-3 py-1"
        onMouseEnter={() => setListsHovered(true)}
        onMouseLeave={() => setListsHovered(false)}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: 'var(--text-faint)' }}
          >
            {copy.sidebar.sectionLists}
          </span>
          {listsHovered && (
            <button
              onClick={() => router.push('/lists')}
              className="text-[11px] cursor-pointer"
              style={{ color: 'var(--text-faint)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-faint)' }}
            >
              {copy.sidebar.browseAll}
            </button>
          )}
        </div>
        {listsHovered && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleStartInlineCreate}
              disabled={isCreating}
              className="relative flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
              style={{ color: 'var(--text-faint)' }}
              title={copy.sidebar.newListTooltip}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {isCreating ? (
                <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
              ) : (
                <Plus size={14} strokeWidth={1.5} />
              )}
            </button>
            <button
              className="flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
              style={{ color: 'var(--text-faint)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <SlidersHorizontal size={14} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>

      {/* List items */}
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-1">
        {/* Inline creation input */}
        <AnimatePresence>
          {isInlineCreating && (
            <motion.div
              {...fadeSlideUp}
              transition={ease.fast}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5"
            >
              <span className="flex-shrink-0 text-base">{'\uD83D\uDCC1'}</span>
              <input
                ref={inlineInputRef}
                value={inlineTitle}
                onChange={(e) => setInlineTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleInlineCreateSubmit()
                  if (e.key === 'Escape') handleInlineCreateCancel()
                }}
                onBlur={handleInlineCreateSubmit}
                placeholder={copy.folders.createPlaceholder}
                className="flex-1 bg-transparent text-[14px] outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing lists */}
        <AnimatePresence>
          {lists.map((list) => {
            const active = pathname === `/lists/${list._id}`
            const isBeingDeleted = deletingId === list._id
            const isDragTarget = dragOverId === list._id
            const isFlashing = flashId === list._id
            const isRenaming = renamingId === list._id

            return (
              <motion.div
                key={list._id}
                {...fade}
                transition={ease.normal}
                layout
                animate={{
                  opacity: isBeingDeleted ? 0 : 1,
                  scale: isBeingDeleted ? 0.95 : 1,
                }}
              >
                <button
                  onClick={() => {
                    if (!isRenaming) router.push(`/lists/${list._id}`)
                  }}
                  onDoubleClick={(e) => {
                    e.preventDefault()
                    handleStartRename(list)
                  }}
                  onContextMenu={(e) => handleContextMenu(e, list)}
                  onDragOver={(e) => handleDragOver(e, list._id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, list)}
                  className="group relative flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-all duration-150 cursor-pointer"
                  style={{
                    backgroundColor: isFlashing
                      ? 'rgba(99, 91, 255, 0.12)'
                      : active
                      ? 'var(--bg-hover)'
                      : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                    border: isDragTarget ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                    borderRadius: '8px',
                  }}
                  onMouseEnter={(e) => {
                    if (!active && !isDragTarget) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                  }}
                  onMouseLeave={(e) => {
                    if (!active && !isFlashing) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                  )}
                  <span className="flex-shrink-0 text-base">
                    {list.icon || '\uD83D\uDCCB'}
                  </span>

                  {isRenaming ? (
                    <input
                      ref={renameInputRef}
                      value={renameTitle}
                      onChange={(e) => setRenameTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSubmit()
                        if (e.key === 'Escape') handleRenameCancel()
                      }}
                      onBlur={handleRenameSubmit}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-transparent text-[14px] outline-none"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  ) : (
                    <span className="truncate text-[14px]">
                      {list.title || copy.list.untitled}
                    </span>
                  )}
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* ── Context menu (portal-like, fixed position) ── */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            ref={contextMenuRef}
            {...fadeSlideDown}
            transition={ease.fast}
            className="fixed z-50 w-52 rounded-xl p-1.5 shadow-lg"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              backgroundColor: 'var(--bg-pane-2)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Rename */}
            <button
              onClick={() => handleStartRename(contextMenu.list)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              {copy.folders.contextMenu.rename}
            </button>

            {/* Change icon */}
            <div className="relative">
              <button
                onClick={() => setIconPickerFor(iconPickerFor ? null : contextMenu.list._id)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {copy.folders.contextMenu.changeIcon}
              </button>

              {/* Emoji picker */}
              <AnimatePresence>
                {iconPickerFor === contextMenu.list._id && (
                  <motion.div
                    {...fadeSlideDown}
                    transition={ease.fast}
                    className="absolute left-full top-0 ml-1 rounded-xl p-2 shadow-lg"
                    style={{
                      backgroundColor: 'var(--bg-pane-2)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div className="flex gap-1 mb-1.5">
                      {EMOJI_PRESETS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleChangeIcon(contextMenu.list._id, emoji)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors duration-150 cursor-pointer"
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        value={customEmoji}
                        onChange={(e) => setCustomEmoji(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customEmoji.trim()) {
                            handleChangeIcon(contextMenu.list._id, customEmoji.trim())
                            setCustomEmoji('')
                          }
                        }}
                        placeholder="Custom"
                        className="w-20 rounded-md bg-transparent px-2 py-1 text-xs outline-none"
                        style={{
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Move to group */}
            <div className="relative">
              <button
                onClick={() => setGroupMenuFor(groupMenuFor ? null : contextMenu.list._id)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span>{copy.folders.contextMenu.moveToGroup}</span>
                <ChevronRight size={12} style={{ color: 'var(--text-faint)' }} />
              </button>

              {/* Group sub-menu */}
              <AnimatePresence>
                {groupMenuFor === contextMenu.list._id && (
                  <motion.div
                    {...fadeSlideDown}
                    transition={ease.fast}
                    className="absolute left-full top-0 ml-1 w-44 rounded-xl p-1.5 shadow-lg"
                    style={{
                      backgroundColor: 'var(--bg-pane-2)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {groupTitles.length === 0 && (
                      <span className="block px-3 py-1.5 text-xs" style={{ color: 'var(--text-faint)' }}>
                        No groups yet
                      </span>
                    )}
                    {/* Existing groups - show list titles that have groupIds as a proxy */}
                    {groupTitles.map((gId) => (
                      <button
                        key={gId}
                        onClick={() => handleMoveToGroup(contextMenu.list._id, gId)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 cursor-pointer"
                        style={{ color: 'var(--text-primary)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        {gId}
                      </button>
                    ))}
                    {/* New group option */}
                    <button
                      onClick={() => {
                        const name = window.prompt('Group name:')
                        if (name?.trim()) {
                          handleMoveToGroup(contextMenu.list._id, name.trim())
                        }
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 cursor-pointer"
                      style={{ color: 'var(--accent)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      <Plus size={12} strokeWidth={1.5} />
                      {copy.folders.contextMenu.newGroup}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Separator */}
            <div className="my-1 h-px" style={{ backgroundColor: 'var(--border)' }} />

            {/* Delete */}
            <button
              onClick={() => handleDeleteFolder(contextMenu.list)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 cursor-pointer"
              style={{ color: '#ef4444' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              {copy.folders.contextMenu.delete}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Separator ── */}
      <div className="my-4 h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* ── Sticky footer with + FAB and Avatar ── */}
      <div className="relative flex items-center justify-between px-2 pb-1">
        {/* + FAB */}
        <div className="relative" ref={fabPopoverRef}>
          <motion.button
            {...buttonPress}
            onClick={() => setFabOpen(!fabOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors duration-150 cursor-pointer"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Plus size={18} strokeWidth={2} />
          </motion.button>

          {/* FAB Popover */}
          <AnimatePresence>
            {fabOpen && (
              <motion.div
                {...fadeSlideDown}
                transition={ease.fast}
                className="absolute bottom-full left-0 mb-2 w-56 rounded-xl p-2 shadow-lg"
                style={{
                  backgroundColor: 'var(--bg-pane-2)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* New task */}
                <button
                  onClick={() => handleFabAction('task')}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors duration-150 cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <ListChecks size={16} strokeWidth={1.5} />
                    <span>{copy.sidebar.fab.newTask}</span>
                  </div>
                  <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                    {copy.sidebar.fab.newTaskShortcut}
                  </span>
                </button>

                {/* New list */}
                <button
                  onClick={() => handleFabAction('list')}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors duration-150 cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Plus size={16} strokeWidth={1.5} />
                    <span>{copy.sidebar.fab.newList}</span>
                  </div>
                  <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                    {copy.sidebar.fab.newListShortcut}
                  </span>
                </button>

                {/* Talk mode — disabled */}
                <button
                  disabled
                  className="flex w-full cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-sm opacity-40"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <div className="flex items-center gap-2">
                    <Mic size={16} strokeWidth={1.5} />
                    <span>{copy.sidebar.fab.talkMode}</span>
                  </div>
                  <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                    {copy.sidebar.fab.talkModeShortcut}
                  </span>
                </button>

                {/* New meeting — disabled */}
                <button
                  disabled
                  className="flex w-full cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-sm opacity-40"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={16} strokeWidth={1.5} />
                    <span>{copy.sidebar.fab.newMeeting}</span>
                  </div>
                  <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                    {copy.sidebar.fab.newMeetingShortcut}
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setAvatarOpen(!avatarOpen)}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white transition-colors duration-150 cursor-pointer"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {userInitial}
          </button>

          {/* Avatar Popover */}
          <AnimatePresence>
            {avatarOpen && (
              <motion.div
                {...fadeSlideDown}
                transition={ease.fast}
                className="absolute bottom-full right-0 mb-2 w-48 rounded-xl p-2 shadow-lg"
                style={{
                  backgroundColor: 'var(--bg-pane-2)',
                  border: '1px solid var(--border)',
                }}
              >
                <button
                  onClick={() => {
                    setAvatarOpen(false)
                    router.push('/profile')
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-150 cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <BarChart3 size={16} strokeWidth={1.5} />
                  <span>Statistics</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-150 cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <LogOut size={16} strokeWidth={1.5} />
                  <span>{copy.settings.signOut}</span>
                </button>
                <button
                  onClick={() => {
                    setAvatarOpen(false)
                    router.push('/settings')
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-150 cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <Settings size={16} strokeWidth={1.5} />
                  <span>{copy.settings.title}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Toast notification ── */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            {...fadeSlideUp}
            transition={ease.fast}
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl px-4 py-2.5 shadow-lg"
            style={{
              backgroundColor: 'var(--bg-pane-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <span className="text-sm">{toastMsg}</span>
            {toastUndo && (
              <button
                onClick={() => {
                  toastUndo()
                  setToastMsg(null)
                  setToastUndo(null)
                }}
                className="text-sm font-medium cursor-pointer"
                style={{ color: 'var(--accent)' }}
              >
                {copy.folders.undo}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  )
}
