'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Home, CalendarDays, CheckSquare, Timer, Repeat, BarChart3,
  BookOpen, NotebookPen, StickyNote, Settings, Sun, Moon, LogOut,
  type LucideIcon,
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface NavItem {
  href: string
  icon: LucideIcon
  label: string
  match: (p: string) => boolean
}

const MAIN_NAV: NavItem[] = [
  { href: '/',                     icon: Home,         label: 'Home',      match: p => p === '/' },
  { href: '/tasks',                icon: CheckSquare,  label: 'Tasks',     match: p => p === '/tasks' },
  { href: '/calendar?view=week',   icon: CalendarDays, label: 'Calendar',  match: p => p === '/calendar' },
  { href: '/habits',               icon: Repeat,       label: 'Habits',    match: p => p === '/habits' },
  { href: '/pomodoro',             icon: Timer,        label: 'Focus',     match: p => p === '/pomodoro' },
  { href: '/stats',                icon: BarChart3,    label: 'Stats',     match: p => p === '/stats' },
]

const SECONDARY_NAV: NavItem[] = [
  { href: '/journal',              icon: NotebookPen,  label: 'Journal',   match: p => p === '/journal' },
  { href: '/pim-notes',            icon: BookOpen,     label: 'Notes',     match: p => p.startsWith('/pim-notes') },
  { href: '/memories',             icon: StickyNote,   label: 'Memories',  match: p => p === '/memories' },
]

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors"
      style={{
        color: active ? 'var(--text-1)' : 'var(--text-2)',
        background: active ? 'var(--accent-soft)' : 'transparent',
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--surface-1, var(--surface))'
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      <item.icon size={16} strokeWidth={active ? 2.2 : 1.8} style={{ opacity: active ? 1 : 0.6, flexShrink: 0 }} />
      <span>{item.label}</span>
    </Link>
  )
}

export default function SuperlistSidebar() {
  const pathname = usePathname()
  const { themeObj, toggle } = useTheme()

  return (
    <aside
      className="hidden md:flex flex-col h-full flex-shrink-0"
      style={{
        width: 240,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Image src="/logo_new.png" alt="LAIF" width={24} height={24} unoptimized className="object-contain" />
        <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>LAIF</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-auto">
        {MAIN_NAV.map(item => (
          <NavLink key={item.href} item={item} active={item.match(pathname)} />
        ))}

        {/* Separator */}
        <div className="my-3" style={{ height: 1, background: 'var(--border)', opacity: 0.5 }} />

        <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
          Workspace
        </p>

        {SECONDARY_NAV.map(item => (
          <NavLink key={item.href} item={item} active={item.match(pathname)} />
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-4 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors"
          style={{
            color: pathname === '/settings' ? 'var(--text-1)' : 'var(--text-2)',
            background: pathname === '/settings' ? 'var(--accent-soft)' : 'transparent',
          }}
        >
          <Settings size={16} strokeWidth={1.8} style={{ opacity: 0.6 }} />
          <span>Settings</span>
        </Link>

        <div className="flex items-center gap-1 px-2 pt-1">
          <button
            onClick={toggle}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-1, var(--surface))')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            title="Toggle theme"
          >
            {themeObj.mode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={() => { fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/login') }}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-1, var(--surface))')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            title="Log out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
