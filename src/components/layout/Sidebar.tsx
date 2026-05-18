'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Inbox, CalendarDays, CheckCircle2, MessageSquare,
  ChevronRight, ChevronDown, Plus, SlidersHorizontal,
  Settings, LogOut, UserPlus, HelpCircle, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { copy } from '@/lib/copy'
import { snappy } from '@/shared/design-system'

// ── Primary nav items ────────────────────────────────────────
interface NavItem {
  href: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
  label: string
  match: (p: string) => boolean
  badgeKey?: 'inbox' | 'today'
}

const PRIMARY_NAV: NavItem[] = [
  { href: '/', icon: Inbox, label: 'Inbox', match: p => p === '/', badgeKey: 'inbox' },
  { href: '/today', icon: CalendarDays, label: 'Today', match: p => p === '/today', badgeKey: 'today' },
  { href: '/tasks', icon: CheckCircle2, label: 'Tasks', match: p => p === '/tasks' },
  { href: '/messages', icon: MessageSquare, label: 'Messages', match: p => p === '/messages' },
]

// ── Collapsed tooltip ────────────────────────────────────────
function Tooltip({ label }: { label: string }) {
  return (
    <div
      className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 pointer-events-none"
    >
      <motion.span
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -4 }}
        transition={{ duration: 0.12 }}
        className="block whitespace-nowrap rounded-lg px-2.5 py-1 text-[12px] font-medium"
        style={{
          background: 'var(--surface-raised, var(--card))',
          border: '1px solid var(--border)',
          color: 'var(--text-1)',
          boxShadow: 'var(--shadow-popover)',
        }}
      >
        {label}
      </motion.span>
    </div>
  )
}

// ── Nav Link ─────────────────────────────────────────────────
function NavLink({
  item,
  active,
  collapsed,
  badge,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
  badge?: number
}) {
  const [hovered, setHovered] = useState(false)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'relative flex items-center gap-3 rounded-lg text-[14px] font-medium transition-colors duration-150 cursor-pointer',
        collapsed ? 'justify-center px-0 py-2.5 mx-1' : 'px-3 py-2',
        active ? '' : 'hover:bg-[var(--sidebar-item-hover)]',
      )}
      style={{
        color: active ? 'var(--text-1)' : 'var(--text-2)',
        background: active ? 'var(--bg-hover)' : undefined,
      }}
    >
      {/* Active indicator — left bar */}
      {active && (
        <div
          className="absolute left-0 top-[6px] bottom-[6px] w-[2px] rounded-full"
          style={{ background: 'var(--accent)' }}
        />
      )}

      <span className="flex-shrink-0"><Icon size={20} strokeWidth={1.5} /></span>
      {!collapsed && <span className="flex-1">{item.label}</span>}

      {/* Badge */}
      {!collapsed && badge !== undefined && badge > 0 && (
        <span
          className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{
            background: 'var(--bg-pane-2, var(--surface-raised))',
            color: 'var(--text-2)',
          }}
        >
          {badge}
        </span>
      )}

      {/* Tooltip when collapsed */}
      <AnimatePresence>
        {collapsed && hovered && <Tooltip label={item.label} />}
      </AnimatePresence>
    </Link>
  )
}

// ── Collapsible section ──────────────────────────────────────
function CollapsibleSection({
  label,
  defaultOpen = true,
  collapsed: sidebarCollapsed,
  children,
  rightContent,
}: {
  label: string
  defaultOpen?: boolean
  collapsed: boolean
  children: React.ReactNode
  rightContent?: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [hovered, setHovered] = useState(false)

  if (sidebarCollapsed) return null

  return (
    <div>
      <div
        className="flex items-center px-3 py-1 group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 flex-1 text-left"
        >
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={snappy}>
            <ChevronRight size={11} style={{ color: 'var(--text-3)' }} />
          </motion.div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-3)' }}>
            {label}
          </span>
        </button>
        {hovered && rightContent && (
          <div className="flex items-center gap-1">
            {rightContent}
          </div>
        )}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── User avatar menu ─────────────────────────────────────────
function UserAvatar({ collapsed }: { collapsed: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setMenuOpen(o => !o)}
        className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
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
            className="popover absolute p-1.5 min-w-[200px]"
            style={{
              bottom: 'calc(100% + 8px)',
              left: collapsed ? 0 : undefined,
              right: collapsed ? undefined : 0,
            }}
          >
            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              className="popover-item text-[13px]"
            >
              <Settings size={14} /> Settings
            </Link>
            <button
              onClick={() => { setMenuOpen(false); window.open('mailto:support@laif.app', '_blank') }}
              className="popover-item text-[13px] w-full text-left"
            >
              <HelpCircle size={14} /> Get support
            </button>
            <button
              onClick={() => setMenuOpen(false)}
              className="popover-item text-[13px] w-full text-left"
            >
              <UserPlus size={14} /> Invite friends
            </button>
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <button
              onClick={() => {
                setMenuOpen(false)
                fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/login')
              }}
              className="popover-item text-[13px] w-full text-left"
            >
              <LogOut size={14} /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main Sidebar ─────────────────────────────────────────────
export default function NewSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [hoveringHeader, setHoveringHeader] = useState(false)

  // Placeholder badge counts
  const badges: Record<string, number> = {
    inbox: 0,
    today: 0,
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="hidden md:flex flex-col h-full flex-shrink-0 relative"
      style={{
        background: 'var(--bg-pane, var(--surface))',
        borderRadius: 'var(--radius-pane, 16px)',
      }}
    >
      {/* Collapse toggle — shown on hover of header area */}
      <div
        className="relative px-2 pt-3 pb-1"
        onMouseEnter={() => setHoveringHeader(true)}
        onMouseLeave={() => setHoveringHeader(false)}
      >
        <AnimatePresence>
          {hoveringHeader && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              onClick={() => setCollapsed(c => !c)}
              className="btn-icon w-7 h-7 absolute top-3 right-2 z-10"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Primary nav */}
      <nav className="px-2 space-y-0.5">
        {PRIMARY_NAV.map(item => (
          <NavLink
            key={item.href}
            item={item}
            active={item.match(pathname)}
            collapsed={collapsed}
            badge={item.badgeKey ? badges[item.badgeKey] : undefined}
          />
        ))}
      </nav>

      {/* Recent section */}
      <div className="mt-3 px-1">
        <CollapsibleSection
          label={copy.sidebar.sectionRecent}
          defaultOpen={true}
          collapsed={collapsed}
        >
          <div className="px-3 py-2">
            <span className="text-[12px]" style={{ color: 'var(--text-3)' }}>
              No recent items
            </span>
          </div>
        </CollapsibleSection>
      </div>

      {/* Divider */}
      {!collapsed && (
        <div className="mx-3 my-2" style={{ height: 1, background: 'var(--border)' }} />
      )}

      {/* Lists section */}
      <div className="flex-1 overflow-auto px-1">
        <CollapsibleSection
          label={copy.sidebar.sectionLists}
          defaultOpen={true}
          collapsed={collapsed}
          rightContent={
            <>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-3)' }}>
                {copy.sidebar.browseAll}
              </span>
              <button
                className="btn-icon w-5 h-5"
                title={copy.sidebar.newListTooltip}
              >
                <Plus size={13} />
              </button>
              <button className="btn-icon w-5 h-5">
                <SlidersHorizontal size={13} />
              </button>
            </>
          }
        >
          {/* Placeholder list items */}
          <div className="space-y-px ml-1">
            <Link
              href="/"
              className={cn(
                'flex items-center gap-2.5 px-3 py-[6px] text-[13px] rounded-lg transition-colors',
                pathname === '/getting-started' ? 'bg-[var(--bg-hover)]' : 'hover:bg-[var(--sidebar-item-hover)]'
              )}
              style={{ color: 'var(--text-2)' }}
            >
              <span className="text-sm flex-shrink-0">{'👋'}</span>
              <span className="truncate">Getting Started</span>
            </Link>
          </div>
        </CollapsibleSection>
      </div>

      {/* Sticky footer */}
      <div className="px-3 pb-3 pt-2 flex-shrink-0">
        {!collapsed && (
          <div className="mb-2" style={{ height: 1, background: 'var(--border)' }} />
        )}
        <div className={cn(
          'flex items-center',
          collapsed ? 'justify-center' : 'justify-end',
        )}>
          <UserAvatar collapsed={collapsed} />
        </div>
      </div>
    </motion.aside>
  )
}
