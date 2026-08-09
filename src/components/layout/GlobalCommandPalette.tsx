import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, CheckCircle2, Clock3, Focus, Grid3X3, Inbox, ListTodo, MessageCircle, Plus, Search, Settings, Sparkles } from 'lucide-react'
import type { TaskRecord } from '@/hooks/useTasks'

interface CommandResult {
  id: string
  label: string
  detail: string
  icon: React.ReactNode
  run: () => void
}

interface GlobalCommandPaletteProps {
  open: boolean
  tasks: TaskRecord[]
  onClose: () => void
  onNavigate: (path: string) => void
  onOpenTask: (taskId: string) => void
  onCreateTask: () => void
}

const destinations = [
  ['/today', 'Today', 'Your current tasks', CheckCircle2],
  ['/', 'Inbox', 'Capture and clarify', Inbox],
  ['/agenda', 'Agenda', 'Plan the shape of a day', Clock3],
  ['/calendar', 'Calendar', 'Arrange time across dates', CalendarDays],
  ['/tasks', 'All Tasks', 'Review every open task', ListTodo],
  ['/habits', 'Habits', 'Build steady rhythms', Sparkles],
  ['/focus', 'Focus', 'Start a protected work session', Focus],
  ['/matrix', 'Priority Matrix', 'Clarify urgency and importance', Grid3X3],
  ['/chat', 'Chatbot', 'Ask your personal assistant', MessageCircle],
  ['/settings', 'Settings', 'Preferences and integrations', Settings],
] as const

export default function GlobalCommandPalette({ open, tasks, onClose, onNavigate, onOpenTask, onCreateTask }: GlobalCommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo<CommandResult[]>(() => {
    const normalized = query.trim().toLocaleLowerCase()
    const navigation = destinations
      .filter(([, label, detail]) => !normalized || `${label} ${detail}`.toLocaleLowerCase().includes(normalized))
      .map(([path, label, detail, Icon]) => ({
        id: `nav:${path}`, label, detail, icon: <Icon size={16} />, run: () => onNavigate(path),
      }))
    const taskResults = tasks
      .filter((task) => task.status !== 'done' && task.status !== 'dropped' && (!normalized || task.title.toLocaleLowerCase().includes(normalized)))
      .slice(0, normalized ? 8 : 4)
      .map((task) => ({
        id: `task:${task._id}`, label: task.title, detail: 'Task', icon: <CheckCircle2 size={16} />, run: () => onOpenTask(task._id),
      }))
    return [
      { id: 'create', label: 'Create new task', detail: 'N', icon: <Plus size={16} />, run: onCreateTask },
      ...navigation,
      ...taskResults,
    ]
  }, [onCreateTask, onNavigate, onOpenTask, query, tasks])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActiveIndex(0)
    queueMicrotask(() => inputRef.current?.focus())
    const previousFocus = document.activeElement as HTMLElement | null
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((index) => Math.min(results.length - 1, index + 1)) }
      if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((index) => Math.max(0, index - 1)) }
      if (event.key === 'Enter') { event.preventDefault(); results[activeIndex]?.run(); onClose() }
      if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('input,button,[href],[tabindex]:not([tabindex="-1"])')
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => { document.removeEventListener('keydown', handleKeyDown); previousFocus?.focus() }
  }, [activeIndex, onClose, open, results])

  useEffect(() => setActiveIndex(0), [query])
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[10001] flex items-start justify-center bg-black/55 px-4 pt-[12vh]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Search and commands" className="w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl" style={{ backgroundColor: 'var(--bg-pane-2)', borderColor: 'var(--border)' }}>
        <label className="flex min-h-14 items-center gap-3 border-b px-4" style={{ borderColor: 'var(--border)' }}>
          <Search size={18} aria-hidden="true" style={{ color: 'var(--text-faint)' }} />
          <span className="sr-only">Search tasks and destinations</span>
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks or go anywhere…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--text-primary)' }} />
          <kbd className="rounded border px-1.5 py-0.5 text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}>Esc</kbd>
        </label>
        <div role="listbox" aria-label="Command results" className="max-h-[min(60vh,460px)] overflow-y-auto p-2">
          {results.map((result, index) => (
            <button
              key={result.id}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => { result.run(); onClose() }}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left"
              style={{ backgroundColor: index === activeIndex ? 'var(--bg-hover)' : 'transparent', color: 'var(--text-primary)' }}
            >
              <span style={{ color: 'var(--text-muted)' }}>{result.icon}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{result.label}</span>
              <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{result.detail}</span>
            </button>
          ))}
          {results.length === 0 && <p className="px-3 py-10 text-center text-sm" style={{ color: 'var(--text-faint)' }}>No matching task or destination.</p>}
        </div>
      </div>
    </div>
  )
}
