import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  ListChecks,
  LogOut,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Printer,
  Share2,
  SlidersHorizontal,
} from 'lucide-react'
import { buttonPress, ease, fadeSlideDown } from '@/lib/motion'
import type { CalendarHeaderProps, CalendarViewMode } from './types'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const VIEW_OPTIONS: { key: CalendarViewMode; label: string; shortcut?: string }[] = [
  { key: 'year', label: 'Year', shortcut: 'Y' },
  { key: 'month', label: 'Month', shortcut: 'M' },
  { key: 'week', label: 'Week', shortcut: 'W' },
  { key: 'day', label: 'Day', shortcut: 'D' },
  { key: 'agenda', label: 'Agenda', shortcut: 'A' },
  { key: '3day', label: 'Multi-Day', shortcut: '3' },
  { key: 'multiweek', label: '2 Weeks' },
]

const menuButtonClass = 'flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12px] font-medium'

type Props = CalendarHeaderProps & {
  onOpenViewOptions?: () => void
  onOpenArrangeTasks?: () => void
  onBackToApp?: () => void
}

function headerTitle(date: Date, view: CalendarViewMode) {
  return view === 'year' ? String(date.getFullYear()) : MONTHS[date.getMonth()]
}

export default function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onNavigate,
  onQuickAdd,
  onOpenViewOptions,
  onOpenArrangeTasks,
  onBackToApp,
}: Props) {
  const [moreOpen, setMoreOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<HTMLDivElement>(null)
  const activeLabel = VIEW_OPTIONS.find((option) => option.key === view)?.label ?? 'Week'

  useEffect(() => {
    function closeMenus(event: MouseEvent) {
      const target = event.target as Node
      if (moreOpen && moreRef.current && !moreRef.current.contains(target)) setMoreOpen(false)
      if (viewOpen && viewRef.current && !viewRef.current.contains(target)) setViewOpen(false)
    }
    document.addEventListener('mousedown', closeMenus)
    return () => document.removeEventListener('mousedown', closeMenus)
  }, [moreOpen, viewOpen])

  return (
    <header className="calendar-header">
      <div className="calendar-header__title">
        <motion.button {...buttonPress} className="calendar-header__app-button" onClick={onBackToApp} aria-label="Back to app">
          <PanelLeft size={16} strokeWidth={1.6} />
        </motion.button>
        <h1>{headerTitle(currentDate, view)}</h1>
      </div>

      <div className="calendar-header__controls">
        <motion.button {...buttonPress} className="calendar-control calendar-control--square" onClick={onQuickAdd} aria-label="Quick add event">
          <Plus size={17} strokeWidth={1.7} />
        </motion.button>

        <div className="relative" ref={viewRef}>
          <button className="calendar-control calendar-control--view" onClick={() => setViewOpen((open) => !open)} aria-haspopup="menu" aria-expanded={viewOpen}>
            {activeLabel}
            <ChevronDown size={12} strokeWidth={1.6} />
          </button>
          <AnimatePresence>
            {viewOpen && (
              <motion.div {...fadeSlideDown} transition={ease.normal} className="calendar-menu calendar-menu--views" role="menu">
                {VIEW_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    className={menuButtonClass}
                    data-active={view === option.key}
                    onClick={() => {
                      onViewChange(option.key)
                      setViewOpen(false)
                    }}
                    role="menuitem"
                  >
                    <span>{option.label}</span>
                    {option.shortcut && <kbd>{option.shortcut}</kbd>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="calendar-nav-group">
          <motion.button {...buttonPress} onClick={() => onNavigate(-1)} aria-label="Previous period">
            <ChevronLeft size={15} strokeWidth={1.6} />
          </motion.button>
          <motion.button {...buttonPress} className="calendar-nav-group__today" onClick={() => onNavigate(0)}>
            Today
          </motion.button>
          <motion.button {...buttonPress} onClick={() => onNavigate(1)} aria-label="Next period">
            <ChevronRight size={15} strokeWidth={1.6} />
          </motion.button>
        </div>

        <div className="relative" ref={moreRef}>
          <motion.button {...buttonPress} className="calendar-control calendar-control--more" onClick={() => setMoreOpen((open) => !open)} aria-label="More calendar options" aria-haspopup="menu" aria-expanded={moreOpen}>
            <MoreHorizontal size={18} strokeWidth={1.6} />
          </motion.button>
          <AnimatePresence>
            {moreOpen && (
              <motion.div {...fadeSlideDown} transition={ease.normal} className="calendar-menu calendar-menu--more" role="menu">
                <button className={menuButtonClass} onClick={() => { onOpenViewOptions?.(); setMoreOpen(false) }}>
                  <SlidersHorizontal size={14} /> View options
                </button>
                <button className={menuButtonClass} onClick={() => { onOpenArrangeTasks?.(); setMoreOpen(false) }}>
                  <ListChecks size={14} /> Arrange tasks
                </button>
                <div className="calendar-menu__separator" />
                <button className={menuButtonClass} onClick={() => { window.print(); setMoreOpen(false) }}>
                  <Printer size={14} /> Print
                </button>
                <button className={menuButtonClass} onClick={() => { void navigator.share?.({ title: 'Calendar', url: window.location.href }); setMoreOpen(false) }}>
                  <Share2 size={14} /> Share
                </button>
                <button className={menuButtonClass} onClick={() => { window.dispatchEvent(new CustomEvent('laif:show-keyboard-shortcuts')); setMoreOpen(false) }}>
                  <Keyboard size={14} /> Keyboard shortcuts
                </button>
                <button className={menuButtonClass} onClick={() => { onBackToApp?.(); setMoreOpen(false) }}>
                  <LogOut size={14} /> Back to app
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
