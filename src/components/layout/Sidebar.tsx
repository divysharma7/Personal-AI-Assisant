'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import {
  Inbox,
  CalendarDays,
  CheckCircle2,
  MessageCircle,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  Settings,
  LogOut,
} from 'lucide-react'
import { copy } from '@/lib/copy'
import { collapse, fadeSlideDown, buttonPress, spring, ease } from '@/lib/motion'

/* ── Primary nav items ── */
const NAV_ITEMS = [
  { label: copy.inbox.title, icon: Inbox, href: '/' },
  { label: copy.today.title, icon: CalendarDays, href: '/today' },
  { label: copy.tasks.title, icon: CheckCircle2, href: '/tasks' },
  { label: copy.messages.title, icon: MessageCircle, href: '/messages' },
] as const

/* ── Demo lists ── */
const LISTS = [
  { emoji: '\uD83D\uDC4B', name: 'Getting Started' },
  { emoji: '\uD83D\uDCC5', name: 'This Week' },
  { emoji: '\uD83D\uDCDD', name: 'Meeting Notes' },
  { emoji: '\uD83C\uDF4E', name: 'Groceries' },
  { emoji: '\uD83D\uDCDA', name: 'Reading List' },
  { emoji: '\uD83C\uDFAF', name: 'Habits' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [recentOpen, setRecentOpen] = useState(true)
  const [listsHovered, setListsHovered] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [userInitial, setUserInitial] = useState('U')

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

  // Close popover on outside click
  useEffect(() => {
    if (!avatarOpen) return
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [avatarOpen])

  const handleSignOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }, [router])

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

      {/* ── Recent section ── */}
      <button
        onClick={() => setRecentOpen(!recentOpen)}
        className="mb-1 flex items-center gap-1.5 px-3 py-1 cursor-pointer"
      >
        <motion.div animate={{ rotate: recentOpen ? 90 : 0 }} transition={ease.fast}>
          <ChevronRight size={12} style={{ color: 'var(--text-faint)' }} />
        </motion.div>
        <span
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: 'var(--text-faint)' }}
        >
          {copy.sidebar.sectionRecent}
        </span>
      </button>
      <AnimatePresence>
        {recentOpen && (
          <motion.div {...collapse} transition={ease.normal} className="mb-1 flex flex-col gap-0.5 px-3 overflow-hidden">
            <span className="py-1.5 text-xs" style={{ color: 'var(--text-faint)' }}>
              No recent items
            </span>
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
            <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
              {copy.sidebar.browseAll}
            </span>
          )}
        </div>
        {listsHovered && (
          <div className="flex items-center gap-1">
            <button
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
        {LISTS.map((list) => (
          <button
            key={list.name}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <span className="text-base">{list.emoji}</span>
            <span className="truncate text-[14px]">{list.name}</span>
          </button>
        ))}
      </div>

      {/* ── Separator ── */}
      <div className="my-4 h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* ── Sticky footer ── */}
      <div className="relative flex items-center justify-between px-2 pb-1">
        <div className="flex-1" />
        {/* Avatar */}
        <button
          onClick={() => setAvatarOpen(!avatarOpen)}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white transition-colors duration-150 cursor-pointer"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {userInitial}
        </button>

        {/* Popover */}
        <AnimatePresence>
          {avatarOpen && (
            <motion.div
              {...fadeSlideDown}
              transition={ease.fast}
              ref={popoverRef}
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
    </aside>
  )
}
