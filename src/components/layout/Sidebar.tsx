'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Inbox,
  CalendarDays,
  CheckCircle2,
  Bell,
  List,
  ChevronDown,
  Plus,
  Search,
  PanelLeft,
  Settings,
  LogOut,
  ListChecks,
  Mic,
  Calendar,
  Flame,
  BarChart3,
  Target,
  MessageCircle,
  LayoutGrid,
  SlidersHorizontal,
  FolderPlus,
  X,
} from 'lucide-react'
import { collapse, fadeSlideDown, buttonPress, ease } from '@/lib/motion'
import { useLists } from '@/hooks/useLists'
import { useTasks } from '@/hooks/useTasks'

/* ── Primary nav — 5 items matching Superlist screenshot ── */
const NAV_ITEMS = [
  { label: 'Inbox', icon: Inbox, href: '/', badge: true },
  { label: 'Today', icon: CalendarDays, href: '/today', badge: true },
  { label: 'Tasks', icon: CheckCircle2, href: '/tasks' },
  { label: 'Updates', icon: Bell, href: '/updates' },
  { label: 'Lists', icon: List, href: '/lists' },
] as const

/* ── Profile menu items — features moved from sidebar ── */
const PROFILE_NAV = [
  { label: 'Habits', icon: Flame, href: '/habits' },
  { label: 'Calendar', icon: Calendar, href: '/calendar' },
  { label: 'Focus', icon: Target, href: '/focus' },
  { label: 'Matrix', icon: LayoutGrid, href: '/matrix' },
  { label: 'Statistics', icon: BarChart3, href: '/statistics' },
  { label: 'Chat', icon: MessageCircle, href: '/chat' },
] as const

interface SidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export default function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { tasks } = useTasks()
  const { lists, createList } = useLists()

  const [isHovered, setIsHovered] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(true)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const [userInitial, setUserInitial] = useState('U')
  const popoverRef = useRef<HTMLDivElement>(null)
  const fabPopoverRef = useRef<HTMLDivElement>(null)

  // Inline list creation inside favorites
  const [isCreatingFav, setIsCreatingFav] = useState(false)
  const [newFavTitle, setNewFavTitle] = useState('')
  const favInputRef = useRef<HTMLInputElement>(null)

  // Badge counts
  const inboxCount = tasks.filter((t) => t.status !== 'done' && t.status !== 'dropped' && !t.listId).length
  const todayCount = tasks.filter((t) => {
    if (t.status === 'done' || t.status === 'dropped' || !t.dueDate) return false
    const d = new Date(t.dueDate)
    const now = new Date()
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  }).length

  const favoriteLists = lists.filter((l) => l.pinnedToFavorites)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.name) setUserInitial(data.name.charAt(0).toUpperCase())
        else if (data?.username) setUserInitial(data.username.charAt(0).toUpperCase())
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarOpen && popoverRef.current && !popoverRef.current.contains(e.target as Node)) setAvatarOpen(false)
      if (fabOpen && fabPopoverRef.current && !fabPopoverRef.current.contains(e.target as Node)) setFabOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [avatarOpen, fabOpen])

  // Auto-focus inline input
  useEffect(() => {
    if (isCreatingFav) favInputRef.current?.focus()
  }, [isCreatingFav])

  const handleCreateFavoriteList = useCallback(async () => {
    const title = newFavTitle.trim()
    if (!title) { setIsCreatingFav(false); return }
    try {
      const newList = await createList({ title, icon: '📁', pinnedToFavorites: true })
      setIsCreatingFav(false)
      setNewFavTitle('')
      router.push(`/lists/${newList._id}`)
    } catch {
      setIsCreatingFav(false)
    }
  }, [newFavTitle, createList, router])

  const handleSignOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }, [router])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const getBadgeCount = (href: string) => {
    if (href === '/') return inboxCount
    if (href === '/today') return todayCount
    return 0
  }

  if (collapsed) return null

  return (
    <aside
      className="flex w-[260px] flex-shrink-0 flex-col h-full"
      style={{ padding: '8px 8px 12px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Top icons (search + toggle) — visible on hover ── */}
      <div className="flex items-center justify-end gap-1 mb-3 px-1" style={{ minHeight: 28 }}>
        <AnimatePresence>
          {isHovered && (
            <>
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                {...buttonPress}
                className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer transition-sl"
                style={{ color: 'var(--text-faint)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <Search size={16} strokeWidth={1.5} />
              </motion.button>
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                {...buttonPress}
                onClick={onToggleCollapse}
                className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer transition-sl"
                style={{ color: 'var(--text-faint)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <PanelLeft size={16} strokeWidth={1.5} />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ── Primary nav — 5 items ── */}
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          const count = 'badge' in item && item.badge ? getBadgeCount(item.href) : 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[14px] font-semibold transition-sl no-underline"
              style={{
                backgroundColor: active ? 'var(--overlay-2, var(--bg-hover))' : 'transparent',
                color: 'var(--text-primary)',
                boxShadow: active ? 'inset -3px 0 0 var(--accent)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = active ? 'var(--overlay-2, var(--bg-hover))' : 'transparent'
              }}
            >
              <item.icon size={18} strokeWidth={1.5} style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }} />
              <span className="flex-1">{item.label}</span>
              {count > 0 && (
                <span
                  className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-medium"
                  style={{ backgroundColor: 'var(--overlay-2, var(--bg-hover))', color: 'var(--text-muted)' }}
                >
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Favorites section ── */}
      <div className="mt-5">
        <div className="group mb-1 flex items-center justify-between px-2.5">
          <button
            onClick={() => setFavoritesOpen(!favoritesOpen)}
            className="flex items-center gap-1 cursor-pointer"
            style={{ color: 'var(--text-faint)' }}
          >
            <span className="text-[12px] font-medium">Favorites</span>
            <motion.div animate={{ rotate: favoritesOpen ? 0 : -90 }} transition={{ duration: 0.15 }}>
              <ChevronDown size={12} strokeWidth={1.5} />
            </motion.div>
          </button>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ transitionDuration: '150ms' }}>
            <button
              onClick={() => { setIsCreatingFav(true); setNewFavTitle(''); setFavoritesOpen(true) }}
              className="flex h-5 w-5 items-center justify-center rounded cursor-pointer transition-sl"
              style={{ color: 'var(--text-faint)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-faint)' }}
            >
              <FolderPlus size={12} strokeWidth={1.5} />
            </button>
            <button className="flex h-5 w-5 items-center justify-center rounded cursor-pointer" style={{ color: 'var(--text-faint)' }}>
              <SlidersHorizontal size={12} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <AnimatePresence>
          {favoritesOpen && (
            <motion.div {...collapse} transition={ease.normal} className="flex flex-col gap-0.5 overflow-hidden">
              {/* Inline creation input */}
              {isCreatingFav && (
                <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5">
                  <span className="text-base">📁</span>
                  <input
                    ref={favInputRef}
                    value={newFavTitle}
                    onChange={(e) => setNewFavTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateFavoriteList()
                      if (e.key === 'Escape') { setIsCreatingFav(false); setNewFavTitle('') }
                    }}
                    onBlur={handleCreateFavoriteList}
                    placeholder="List name..."
                    className="flex-1 bg-transparent text-[14px] font-medium outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
              )}
              {favoriteLists.map((list) => {
                const active = pathname === `/lists/${list._id}`
                return (
                  <Link
                    key={list._id}
                    href={`/lists/${list._id}`}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[14px] font-medium no-underline transition-sl"
                    style={{
                      color: 'var(--text-primary)',
                      backgroundColor: active ? 'var(--overlay-2, var(--bg-hover))' : 'transparent',
                      boxShadow: active ? 'inset -3px 0 0 var(--accent)' : 'none',
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = active ? 'var(--overlay-2, var(--bg-hover))' : 'transparent' }}
                  >
                    <span className="text-base">{list.icon || '📋'}</span>
                    <span className="truncate">{list.title || 'Untitled'}</span>
                  </Link>
                )
              })}
              {/* Ghost placeholder / Getting Started */}
              {favoriteLists.length === 0 && (
                <Link
                  href="/getting-started"
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[14px] font-medium no-underline transition-sl"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <span className="text-base">👋</span>
                  <span>Getting Started</span>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1 min-h-[24px]" />

      {/* ── Footer: + button (left) and avatar (right) ── */}
      <div className="flex items-center justify-between px-2">
        {/* + FAB */}
        <div className="relative" ref={fabPopoverRef}>
          <motion.button
            {...buttonPress}
            onClick={() => setFabOpen(!fabOpen)}
            aria-label="Create new"
            className="flex h-11 items-center justify-center rounded-xl cursor-pointer transition-sl"
            style={{
              width: fabOpen ? 48 : 44,
              border: '1px solid var(--overlay-3, var(--border))',
              color: 'var(--text-primary)',
              backgroundColor: fabOpen ? 'var(--overlay-2, var(--bg-hover))' : 'transparent',
            }}
            onMouseEnter={(e) => { if (!fabOpen) e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
            onMouseLeave={(e) => { if (!fabOpen) e.currentTarget.style.backgroundColor = fabOpen ? 'var(--overlay-2, var(--bg-hover))' : 'transparent' }}
          >
            <motion.div animate={{ rotate: fabOpen ? 45 : 0 }} transition={{ duration: 0.15 }}>
              <Plus size={22} strokeWidth={1.5} />
            </motion.div>
          </motion.button>
          <AnimatePresence>
            {fabOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={ease.normal}
                className="absolute bottom-full left-0 mb-3 rounded-2xl p-2"
                style={{ minWidth: 240, backgroundColor: 'var(--bg-pane-2, var(--bg-pane))', border: '1px solid var(--overlay-2, var(--border))', boxShadow: 'var(--shadow-elevated)' }}
              >
                <button
                  onClick={() => { setFabOpen(false); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', ctrlKey: true })) }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-medium transition-sl cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <div className="flex items-center gap-3"><CheckCircle2 size={18} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} /><span>New task</span></div>
                  <span className="text-[12px]" style={{ color: 'var(--text-faint)' }}>⌃N</span>
                </button>
                <button
                  onClick={() => { setFabOpen(false); router.push('/lists') }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-medium transition-sl cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <div className="flex items-center gap-3"><List size={18} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} /><span>New list</span></div>
                  <span className="text-[12px]" style={{ color: 'var(--text-faint)' }}>⇧⌘N</span>
                </button>
                <button
                  onClick={() => { setFabOpen(false) }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-medium transition-sl cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <div className="flex items-center gap-3"><BarChart3 size={18} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} /><span>Talk mode</span></div>
                  <span className="text-[12px]" style={{ color: 'var(--text-faint)' }}>⌃T</span>
                </button>
                <button
                  onClick={() => { setFabOpen(false) }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-medium transition-sl cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <div className="flex items-center gap-3"><Mic size={18} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} /><span>New meeting note</span></div>
                  <span className="text-[12px]" style={{ color: 'var(--text-faint)' }}>⇧⌘M</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar — profile menu with feature links */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setAvatarOpen(!avatarOpen)}
            aria-label="User menu"
            className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white cursor-pointer overflow-hidden"
            style={{ backgroundColor: 'var(--avatar-bg, #6b7280)' }}
          >
            {userInitial}
          </button>
          <AnimatePresence>
            {avatarOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={ease.normal}
                className="absolute bottom-full right-0 mb-3 w-52 rounded-2xl p-2"
                style={{ backgroundColor: 'var(--bg-pane-2, var(--bg-pane))', border: '1px solid var(--overlay-2, var(--border))', boxShadow: 'var(--shadow-elevated)' }}
              >
                {/* Feature links */}
                {PROFILE_NAV.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => { setAvatarOpen(false); router.push(item.href) }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-medium transition-sl cursor-pointer"
                    style={{ color: pathname.startsWith(item.href) ? 'var(--accent)' : 'var(--text-primary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <item.icon size={16} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                    {item.label}
                  </button>
                ))}

                <div className="mx-2 my-1.5 h-px" style={{ backgroundColor: 'var(--border)' }} />

                <button
                  onClick={() => { setAvatarOpen(false); router.push('/settings') }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-medium transition-sl cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <Settings size={16} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                  Settings
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-medium transition-sl cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <LogOut size={16} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  )
}
