'use client'

import { motion } from 'framer-motion'
import { fade, ease } from '@/lib/motion'

/* ── Keyboard shortcuts data ── */
const VIEW_SHORTCUTS = [
  { keys: ['D', '1'], description: 'Day view' },
  { keys: ['3'], description: '3-Day view' },
  { keys: ['W', '2'], description: 'Week view' },
  { keys: ['M', '4'], description: 'Month view' },
  { keys: ['Y', '5'], description: 'Year view' },
  { keys: ['A', '6'], description: 'Agenda view' },
]
const NAV_SHORTCUTS = [
  { keys: ['T'], description: 'Go to today' },
  { keys: ['\u2190'], description: 'Navigate back' },
  { keys: ['\u2192'], description: 'Navigate forward' },
]
const ACTION_SHORTCUTS = [
  { keys: ['N'], description: 'New task' },
  { keys: ['Esc'], description: 'Clear selection' },
  { keys: ['\u2318/Ctrl', 'Click'], description: 'Multi-select' },
  { keys: ['\u2318', 'K'], description: 'Command palette' },
]

function ShortcutGroup({
  title,
  shortcuts,
  delayOffset = 0,
  separator = '/',
}: {
  title: string
  shortcuts: { keys: string[]; description: string }[]
  delayOffset?: number
  separator?: string
}) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
        {title}
      </p>
      <div className="flex flex-col gap-1">
        {shortcuts.map((shortcut, idx) => (
          <motion.div
            key={shortcut.description}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (delayOffset + idx) * 0.02, duration: 0.15 }}
            className="flex items-center justify-between rounded-md px-3 py-2"
            style={{ transition: 'background-color 100ms ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{shortcut.description}</span>
            <div className="flex items-center gap-1.5">
              {shortcut.keys.map((key, i) => (
                <span key={i}>
                  {i > 0 && <span className="mx-1 text-xs" style={{ color: 'var(--text-faint)' }}>{separator}</span>}
                  <kbd
                    className="inline-flex min-w-[24px] items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-medium"
                    style={{
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-pane-2)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {key}
                  </kbd>
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function ShortcutsTab() {
  return (
    <motion.div key="shortcuts" {...fade} transition={ease.normal} className="flex flex-col gap-6">
      <ShortcutGroup title="View Switching" shortcuts={VIEW_SHORTCUTS} delayOffset={0} />
      <div className="h-px" style={{ backgroundColor: 'var(--border)' }} />
      <ShortcutGroup title="Navigation" shortcuts={NAV_SHORTCUTS} delayOffset={VIEW_SHORTCUTS.length} />
      <div className="h-px" style={{ backgroundColor: 'var(--border)' }} />
      <ShortcutGroup title="Actions" shortcuts={ACTION_SHORTCUTS} delayOffset={VIEW_SHORTCUTS.length + NAV_SHORTCUTS.length} separator="+" />
    </motion.div>
  )
}
