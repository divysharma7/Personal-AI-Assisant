'use client'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''


import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Inbox,
  CalendarDays,
  CheckCircle2,
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
} from 'lucide-react'
import { collapse, fadeSlideDown, buttonPress, ease, motionTokens, springs } from '@/lib/motion'
import { useTasks } from '@/hooks/useTasks'
import type { TaskRecord } from '@/hooks/useTasks'
import { useWorkflows } from '@/hooks/useWorkflows'
import { CreateWorkflowDialog } from '@/components/tasks/kanban/CreateWorkflowDialog'

/* ── Primary nav — 5 items matching Superlist screenshot ── */
const NAV_ITEMS = [
  { label: 'Inbox', icon: Inbox, href: '/', badge: true },
  { label: 'Today', icon: CalendarDays, href: '/today', badge: true },
  { label: 'Tasks', icon: CheckCircle2, href: '/tasks' },
] as const

/* ── Features nav — visible in expanded sidebar ── */
const FEATURES_NAV = [
  { label: 'Habits', icon: Flame, href: '/habits' },
  { label: 'Calendar', icon: Calendar, href: '/calendar' },
  { label: 'Focus', icon: Target, href: '/focus' },
  { label: 'Statistics', icon: BarChart3, href: '/statistics' },
  { label: 'Chat', icon: MessageCircle, href: '/chat' },
] as const

/* ── Habits inline section ── */
function HabitsSection({ tasks }: { tasks: TaskRecord[] }) {
  const [open, setOpen] = useState(true)
  const router = useRouter()
  const habits = useMemo(() => tasks.filter((t) => t.isHabit && t.status !== 'dropped'), [tasks])
  const { updateTask } = useTasks()

  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString().split('T')[0]
  }, [])

  const isCheckedToday = useCallback((habit: TaskRecord) => {
    if (!habit.completions || !Array.isArray(habit.completions)) return false
    return habit.completions.some((c) => c.date?.startsWith(today) && c.status === 'achieved')
  }, [today])

  const toggleCheckin = useCallback(async (habit: TaskRecord) => {
    const checked = isCheckedToday(habit)
    const completions = Array.isArray(habit.completions) ? [...habit.completions] : []
    if (checked) {
      const idx = completions.findIndex((c) => c.date?.startsWith(today))
      if (idx >= 0) completions.splice(idx, 1)
    } else {
      completions.push({ date: new Date().toISOString(), status: 'achieved' as const, value: 1 })
    }
    await updateTask(habit._id, { completions })
  }, [today, isCheckedToday, updateTask])

  if (habits.length === 0) return null

  return (
    <div className="mt-4">
      <div className="group mb-1 flex items-center justify-between px-2.5">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 cursor-pointer"
          style={{ color: 'var(--text-faint)' }}
        >
          <span className="text-[12px] font-medium">Habits</span>
          <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: motionTokens.duration.fast }}>
            <ChevronDown size={12} strokeWidth={1.5} />
          </motion.div>
        </button>
        <button
          onClick={() => router.push('/habits')}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded cursor-pointer"
          style={{ color: 'var(--text-faint)', transitionDuration: '150ms', minWidth: 44, minHeight: 44 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-faint)' }}
          title="View all habits"
          aria-label="View all habits"
        >
          <Flame size={12} strokeWidth={1.5} />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div {...collapse} transition={ease.normal} className="flex flex-col gap-0.5 overflow-hidden">
            {habits.map((habit) => {
              const checked = isCheckedToday(habit)
              const icon = habit.habitIcon || '🔥'
              const color = habit.color || 'var(--accent)'
              return (
                <div
                  key={habit._id}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1 text-[13px] font-medium cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => router.push(`/habits?selected=${habit._id}`)}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
                  <span className="flex-1 truncate">{habit.title}</span>
                  {/* Today check-in toggle */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleCheckin(habit) }}
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{
                      width: 18,
                      height: 18,
                      border: checked ? 'none' : `1.5px solid ${color}`,
                      backgroundColor: checked ? color : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 150ms ease, border-color 150ms ease',
                    }}
                    title={checked ? 'Uncheck today' : 'Check in today'}
                  >
                    {checked && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5.5L4 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Workflows inline section ── */
function WorkflowsSection() {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const { workflows } = useWorkflows()

  useEffect(() => {
    const handler = () => setCreateOpen(true)
    window.addEventListener('laif:create-workflow', handler)
    return () => window.removeEventListener('laif:create-workflow', handler)
  }, [])

  return (
    <>
      <div className="mt-5">
        <div className="group mb-1 flex items-center justify-between px-2.5">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 cursor-pointer"
            style={{ color: 'var(--text-faint)' }}
          >
            <span className="text-[12px] font-medium">Workflows</span>
            <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: motionTokens.duration.fast }}>
              <ChevronDown size={12} strokeWidth={1.5} />
            </motion.div>
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            title="New Workflow"
            aria-label="New Workflow"
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded cursor-pointer"
            style={{ color: 'var(--text-faint)', transitionDuration: '150ms', minWidth: 44, minHeight: 44 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-faint)' }}
          >
            <Plus size={12} strokeWidth={1.5} />
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div {...collapse} transition={ease.normal} className="flex flex-col gap-0.5 overflow-hidden">
              {workflows.map((wf) => {
                const active = pathname === `/workflows/${wf._id}`
                return (
                  <Link
                    key={wf._id}
                    href={`/workflows/${wf._id}`}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[14px] font-medium no-underline transition-sl"
                    style={{
                      color: 'var(--text-primary)',
                      backgroundColor: active ? 'var(--overlay-2, var(--bg-hover))' : 'transparent',
                      boxShadow: active ? 'inset -3px 0 0 var(--accent)' : 'none',
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = active ? 'var(--overlay-2, var(--bg-hover))' : 'transparent' }}
                  >
                    <span style={{ fontSize: 16 }}>{wf.icon || '📋'}</span>
                    <span className="truncate">{wf.name}</span>
                  </Link>
                )
              })}
              {workflows.length === 0 && (
                <p className="px-2.5 py-2 text-[13px]" style={{ color: 'var(--text-faint)' }}>
                  No workflows yet
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <CreateWorkflowDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  )
}

interface SidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export default function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { tasks } = useTasks()
  const prefersReduced = useReducedMotion()

  const [isHovered, setIsHovered] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const [userInitial, setUserInitial] = useState('U')
  const popoverRef = useRef<HTMLDivElement>(null)
  const fabPopoverRef = useRef<HTMLDivElement>(null)


  // Badge counts for primary nav
  const inboxCount = useMemo(() => tasks.filter(t => t.status !== 'done' && t.status !== 'dropped' && !t.listId).length, [tasks])
  const todayCount = useMemo(() => {
    const now = new Date()
    return tasks.filter(t => {
      if (t.status === 'done' || t.status === 'dropped' || !t.dueDate) return false
      const d = new Date(t.dueDate)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
    }).length
  }, [tasks])

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/me`)
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

  const handleSignOut = useCallback(async () => {
    await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' })
    router.push('/login')
  }, [router])

  const isActive = (href: string) => {
    // When a smart filter is active, deactivate regular nav items
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const getBadgeCount = (href: string) => {
    if (href === '/') return inboxCount
    if (href === '/today') return todayCount
    return 0
  }

  /* ── Collapsed icon-only sidebar ── */
  if (collapsed) {
    const COLLAPSED_NAV = [
      ...NAV_ITEMS.map((item) => ({ label: item.label, icon: item.icon, href: item.href })),
      ...FEATURES_NAV.map((item) => ({ label: item.label, icon: item.icon, href: item.href })),
    ]

    return (
      <aside
        className="flex flex-shrink-0 flex-col items-center h-full"
        style={{
          width: 48,
          padding: '10px 0 12px',
          backgroundColor: 'var(--bg-pane)',
        }}
      >
        {/* Avatar at top */}
        <button
          onClick={() => setAvatarOpen(!avatarOpen)}
          aria-label="User menu"
          className="flex items-center justify-center rounded-full text-[11px] font-semibold text-white cursor-pointer overflow-hidden"
          style={{
            width: 28,
            height: 28,
            backgroundColor: 'var(--avatar-bg, #6b7280)',
            marginBottom: 12,
            flexShrink: 0,
          }}
        >
          {userInitial}
        </button>

        {/* Icon nav */}
        <nav className="flex flex-col items-center gap-1">
          {COLLAPSED_NAV.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className="flex items-center justify-center rounded-lg no-underline"
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: active ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  transition: 'background-color 150ms ease, color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--text-muted)'
                  }
                }}
              >
                <item.icon size={20} strokeWidth={1.5} />
              </Link>
            )
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Expand button at bottom */}
        <button
          onClick={onToggleCollapse}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className="flex items-center justify-center rounded-lg cursor-pointer"
          style={{
            width: 36,
            height: 36,
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-faint)',
            transition: 'background-color 150ms ease, color 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--text-faint)'
          }}
        >
          <PanelLeft size={18} strokeWidth={1.5} />
        </button>
      </aside>
    )
  }

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
                initial={prefersReduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={prefersReduced ? { duration: 0 } : { duration: motionTokens.duration.fast }}
                {...buttonPress}
                onClick={() => router.push('/tasks')}
                aria-label="Search"
                className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer transition-sl"
                style={{ color: 'var(--text-faint)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <Search size={16} strokeWidth={1.5} />
              </motion.button>
              <motion.button
                initial={prefersReduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={prefersReduced ? { duration: 0 } : { duration: motionTokens.duration.fast }}
                {...buttonPress}
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
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
                  style={{ backgroundColor: 'var(--overlay-2, var(--bg-hover))', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}
                >
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Features section ── */}
      <div className="mt-4">
        <div className="mb-1 px-2.5">
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-faint)' }}>Features</span>
        </div>
        <nav className="flex flex-col gap-0.5">
          {FEATURES_NAV.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[14px] font-medium no-underline transition-sl"
                style={{
                  color: 'var(--text-primary)',
                  backgroundColor: active ? 'var(--overlay-2, var(--bg-hover))' : 'transparent',
                  boxShadow: active ? 'inset -3px 0 0 var(--accent)' : 'none',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = active ? 'var(--overlay-2, var(--bg-hover))' : 'transparent' }}
              >
                <item.icon size={16} strokeWidth={1.5} style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }} />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* ── Workflows section ── */}
      <WorkflowsSection />

      {/* ── Habits section ── */}
      <HabitsSection tasks={tasks} />

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
            <motion.div animate={{ rotate: fabOpen ? 45 : 0 }} transition={{ duration: motionTokens.duration.fast }}>
              <Plus size={22} strokeWidth={1.5} />
            </motion.div>
          </motion.button>
          <AnimatePresence>
            {fabOpen && (
              <motion.div
                initial={prefersReduced ? false : { opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={prefersReduced ? { duration: 0 } : ease.normal}
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
                  onClick={() => { setFabOpen(false); window.dispatchEvent(new CustomEvent('laif:create-workflow')) }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-medium transition-sl cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <div className="flex items-center gap-3"><ListChecks size={18} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} /><span>New workflow</span></div>
                  <span className="text-[12px]" style={{ color: 'var(--text-faint)' }}>⇧⌘N</span>
                </button>
                <button
                  onClick={() => { setFabOpen(false); router.push('/chat') }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-medium transition-sl cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <div className="flex items-center gap-3"><BarChart3 size={18} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} /><span>Talk mode</span></div>
                  <span className="text-[12px]" style={{ color: 'var(--text-faint)' }}>⌃T</span>
                </button>
                <button
                  onClick={() => { setFabOpen(false); router.push('/chat') }}
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
                initial={prefersReduced ? false : { opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={prefersReduced ? { duration: 0 } : ease.normal}
                className="absolute bottom-full right-0 mb-3 w-52 rounded-2xl p-2"
                style={{ backgroundColor: 'var(--bg-pane-2, var(--bg-pane))', border: '1px solid var(--overlay-2, var(--border))', boxShadow: 'var(--shadow-elevated)' }}
              >
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
