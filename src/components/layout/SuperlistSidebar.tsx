'use client'
import { useState } from 'react'
import Link from 'next/link'
/* eslint-disable @next/next/no-img-element */
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Inbox, CalendarDays, CheckSquare, MessageCircle, Timer,
  Repeat, BarChart3, BookOpen, NotebookPen, ChevronRight,
  Settings, LogOut, Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { snappy } from '@/shared/design-system'
// snappy used in CollapsibleGroup chevron animation

interface NavItem {
  href: string
  icon: LucideIcon
  label: string
  color: string
  match: (p: string) => boolean
}

// Top nav — matches Superlist's Inbox/Today/Tasks/Messages
const PRIMARY_NAV: NavItem[] = [
  { href: '/',        icon: Inbox,         label: 'Inbox',    color: '#E85D40', match: p => p === '/' },
  { href: '/tasks',   icon: CheckSquare,   label: 'Tasks',    color: '#E85D40', match: p => p === '/tasks' },
  { href: '/calendar?view=week', icon: CalendarDays, label: 'Today', color: '#F5A623', match: p => p === '/calendar' },
  { href: '/chat',    icon: MessageCircle, label: 'AI Chat',  color: '#E85D40', match: p => p === '/chat' },
]

// Lists section — LAIF's unique features presented as Superlist "lists"
interface ListItem {
  href: string
  emoji: string
  label: string
  match: (p: string) => boolean
}

const LISTS: { group: string; items: ListItem[] }[] = [
  {
    group: 'Productivity',
    items: [
      { href: '/pomodoro', emoji: '🎯', label: 'Focus Timer',  match: p => p === '/pomodoro' },
      { href: '/habits',   emoji: '🔄', label: 'Habits',       match: p => p === '/habits' },
      { href: '/stats',    emoji: '📊', label: 'Statistics',    match: p => p === '/stats' },
    ],
  },
  {
    group: 'Workspace',
    items: [
      { href: '/journal',   emoji: '📝', label: 'Journal',    match: p => p === '/journal' },
      { href: '/pim-notes', emoji: '📖', label: 'Notes',      match: p => p.startsWith('/pim-notes') },
      { href: '/memories',  emoji: '🧠', label: 'Memories',   match: p => p === '/memories' },
      { href: '/contacts',  emoji: '👥', label: 'Contacts',   match: p => p === '/contacts' },
    ],
  },
]

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className="flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-colors relative"
      style={{
        color: active ? 'var(--text-1)' : 'var(--text-2)',
      }}
    >
      <item.icon size={16} strokeWidth={1.8} style={{ color: active ? item.color : 'var(--text-3)', flexShrink: 0 }} />
      <span>{item.label}</span>
      {/* Active indicator — right bar like Superlist */}
      {active && (
        <div
          className="absolute right-0 top-[6px] bottom-[6px] w-[3px] rounded-full"
          style={{ background: item.color }}
        />
      )}
    </Link>
  )
}

function ListLink({ item, active }: { item: ListItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className="flex items-center gap-2.5 px-3 py-[6px] rounded-lg text-[13px] transition-colors relative"
      style={{
        color: active ? 'var(--text-1)' : 'var(--text-2)',
        fontWeight: active ? 500 : 400,
      }}
    >
      <span className="text-sm flex-shrink-0">{item.emoji}</span>
      <span className="truncate">{item.label}</span>
      {active && (
        <div
          className="absolute right-0 top-[5px] bottom-[5px] w-[3px] rounded-full"
          style={{ background: '#E85D40' }}
        />
      )}
    </Link>
  )
}

function CollapsibleGroup({ group, items, pathname }: { group: string; items: ListItem[]; pathname: string }) {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-3 py-1 w-full text-left"
      >
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={snappy}>
          <ChevronRight size={11} style={{ color: 'var(--text-3)' }} />
        </motion.div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-3)' }}>
          {group}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="ml-1 space-y-px">
              {items.map(item => (
                <ListLink key={item.href} item={item} active={item.match(pathname)} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function SuperlistSidebar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <aside
      className="hidden md:flex flex-col h-full flex-shrink-0 py-2 md:py-3 pl-2 md:pl-3"
      style={{ width: 200 }}
    >
      <div className="flex flex-col h-full">
        {/* Primary nav */}
        <nav className="px-1 space-y-px pt-2">
          {PRIMARY_NAV.map(item => (
            <NavLink key={item.href} item={item} active={item.match(pathname)} />
          ))}
        </nav>

        {/* Separator */}
        <div className="my-3 mx-3" style={{ height: 1, background: 'var(--border)' }} />

        {/* Recent — placeholder for now */}
        <div className="px-3 py-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-3)' }}>
            Recent
          </span>
        </div>

        {/* Separator */}
        <div className="my-2 mx-3" style={{ height: 1, background: 'var(--border)' }} />

        {/* Lists */}
        <div className="flex-1 overflow-auto px-1 space-y-2">
          {LISTS.map(group => (
            <CollapsibleGroup key={group.group} group={group.group} items={group.items} pathname={pathname} />
          ))}
        </div>

        {/* Bottom: avatar + menu */}
        <div className="px-2 pb-2 pt-3 relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center"
            style={{ background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600 }}
          >
            L
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.12 }}
                className="absolute bottom-14 left-2 rounded-xl p-1.5 min-w-[180px] z-50"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
              >
                <Link href="/settings" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors"
                  style={{ color: 'var(--text-2)' }}
                >
                  <Settings size={14} /> Settings
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/login') }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] w-full text-left transition-colors"
                  style={{ color: 'var(--text-2)' }}
                >
                  <LogOut size={14} /> Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  )
}
