'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import {
  Inbox,
  CalendarDays,
  CheckCircle2,
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
} from 'lucide-react'
import { copy } from '@/lib/copy'
import { collapse, fadeSlideDown, buttonPress, spring, ease } from '@/lib/motion'
import { useLists } from '@/hooks/useLists'

/* ── Primary nav items ── */
const NAV_ITEMS = [
  { label: copy.inbox.title, icon: Inbox, href: '/' },
  { label: copy.today.title, icon: CalendarDays, href: '/today' },
  { label: copy.tasks.title, icon: CheckCircle2, href: '/tasks' },
  { label: copy.updates.title, icon: Bell, href: '/updates' },
] as const

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [favoritesOpen, setFavoritesOpen] = useState(true)
  const [meetingsOpen, setMeetingsOpen] = useState(true)
  const [listsHovered, setListsHovered] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const fabPopoverRef = useRef<HTMLDivElement>(null)
  const [userInitial, setUserInitial] = useState('U')
  const { lists, createList, isCreating } = useLists()

  // Favorites = lists pinned to favorites
  const favoriteLists = lists.filter((l) => l.pinnedToFavorites)

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
    if (!avatarOpen && !fabOpen) return
    const handler = (e: MouseEvent) => {
      if (avatarOpen && popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
      if (fabOpen && fabPopoverRef.current && !fabPopoverRef.current.contains(e.target as Node)) {
        setFabOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [avatarOpen, fabOpen])

  const handleSignOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }, [router])

  const handleCreateList = useCallback(async () => {
    if (isCreating) return
    try {
      const newList = await createList({ title: '', icon: '' })
      router.push(`/lists/${newList._id}`)
    } catch {
      // silently fail
    }
  }, [createList, isCreating, router])

  const handleFabAction = useCallback(
    async (action: string) => {
      setFabOpen(false)
      switch (action) {
        case 'task':
          // Focus the new task input on current page via keyboard shortcut event
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', ctrlKey: true }))
          break
        case 'list':
          await handleCreateList()
          break
        // talk and meeting are disabled stubs
      }
    },
    [handleCreateList]
  )

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="flex w-[260px] flex-shrink-0 flex-col rounded-[16px] p-3"
      style={{ backgroundColor: 'var(--bg-pane)' }}
    >
      {/* ── Primary nav ── */}
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
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
              {/* Active left accent bar */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              )}
              <item.icon size={20} strokeWidth={1.5} />
              <span className="flex-1 text-left text-[14px]">{item.label}</span>
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
              onClick={handleCreateList}
              disabled={isCreating}
              className="flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
              style={{ color: 'var(--text-faint)' }}
              title={copy.sidebar.newListTooltip}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Plus size={14} strokeWidth={1.5} />
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
        {lists.map((list) => {
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
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              )}
              <span className="flex-shrink-0 text-base">
                {list.icon || '\uD83D\uDCCB'}
              </span>
              <span className="truncate text-[14px]">
                {list.title || copy.list.untitled}
              </span>
            </button>
          )
        })}
      </div>

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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  )
}
