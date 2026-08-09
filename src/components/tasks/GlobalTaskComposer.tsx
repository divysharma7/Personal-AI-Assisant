import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CalendarDays, Flag, Inbox, X } from 'lucide-react'
import type { TaskRecord } from '@/hooks/useTasks'

export interface GlobalTaskComposerContext {
  dueDate?: string | null
  listId?: string | null
  workflowId?: string | null
  sectionId?: string | null
}

interface GlobalTaskComposerProps {
  open: boolean
  context: GlobalTaskComposerContext
  onClose: () => void
  onCreate: (data: Partial<TaskRecord>, openDetail: boolean) => Promise<void>
}

export default function GlobalTaskComposer({
  open,
  context,
  onClose,
  onCreate,
}: GlobalTaskComposerProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const openDetailRef = useRef(false)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(context.dueDate ?? '')
  const [priority, setPriority] = useState<TaskRecord['priority']>('none')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    returnFocusRef.current = document.activeElement as HTMLElement | null
    setDueDate(context.dueDate ?? '')
    setError('')
    const frame = window.requestAnimationFrame(() => titleRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [context.dueDate, open])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) {
        event.preventDefault()
        onClose()
        returnFocusRef.current?.focus()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open, saving])

  if (!open) return null

  const close = () => {
    if (saving) return
    setTitle('')
    setDueDate(context.dueDate ?? '')
    setPriority('none')
    setError('')
    onClose()
    window.requestAnimationFrame(() => returnFocusRef.current?.focus())
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setError('Enter a task title.')
      titleRef.current?.focus()
      return
    }
    setSaving(true)
    setError('')
    try {
      await onCreate({
        title: trimmed,
        status: 'todo',
        priority,
        dueDate: dueDate || null,
        listId: context.listId ?? null,
        workflowId: context.workflowId ?? null,
        sectionId: context.sectionId ?? null,
      }, openDetailRef.current)
      openDetailRef.current = false
      setTitle('')
      setPriority('none')
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Task could not be created. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-start justify-center bg-black/55 px-4 pt-[12vh] backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-task-composer-title"
        aria-describedby={error ? 'global-task-composer-error' : undefined}
        className="w-full max-w-[520px] overflow-hidden rounded-2xl border shadow-2xl"
        style={{ backgroundColor: 'var(--bg-pane)', borderColor: 'var(--border)' }}
      >
        <form onSubmit={submit}>
          <header className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
            <span
              className="grid h-9 w-9 place-items-center rounded-xl"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <Inbox size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="global-task-composer-title" className="text-base font-semibold text-pretty" style={{ color: 'var(--text-primary)' }}>
                Create Task
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                Capture it now. Organize it without leaving your current view.
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close task composer"
              className="grid h-10 w-10 place-items-center rounded-xl transition-colors hover:bg-[var(--bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="space-y-4 px-5 py-5">
            <div>
              <label htmlFor="global-task-title" className="mb-2 block text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Task Title
              </label>
              <input
                ref={titleRef}
                id="global-task-title"
                name="task-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') openDetailRef.current = event.shiftKey
                }}
                autoComplete="off"
                placeholder="For example, send the design review…"
                className="h-12 w-full rounded-xl border bg-transparent px-4 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                style={{ borderColor: error ? 'var(--priority-high)' : 'var(--border)', color: 'var(--text-primary)' }}
              />
              <p id="global-task-composer-error" aria-live="polite" className="mt-2 min-h-4 text-xs" style={{ color: error ? 'var(--priority-high)' : 'var(--text-faint)' }}>
                {error || 'Enter creates. Shift+Enter creates and opens details. Escape cancels.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  <CalendarDays size={14} aria-hidden="true" /> Due Date
                </span>
                <input
                  type="date"
                  name="task-due-date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="h-11 w-full rounded-xl border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  style={{ backgroundColor: 'var(--bg-pane-2)', borderColor: 'var(--border)', color: 'var(--text-primary)', colorScheme: 'dark' }}
                />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  <Flag size={14} aria-hidden="true" /> Priority
                </span>
                <select
                  name="task-priority"
                  value={priority ?? 'none'}
                  onChange={(event) => setPriority(event.target.value as TaskRecord['priority'])}
                  className="h-11 w-full rounded-xl border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  style={{ backgroundColor: 'var(--bg-pane-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="none">No Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>
          </div>

          <footer className="flex items-center justify-end gap-2 border-t px-5 py-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-pane-2)' }}>
            <button
              type="button"
              onClick={close}
              disabled={saving}
              className="h-10 rounded-xl px-4 text-sm font-medium transition-colors hover:bg-[var(--bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-wait disabled:opacity-60"
              style={{ color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-xl px-5 text-sm font-semibold text-white transition-[opacity,transform] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {saving ? 'Creating…' : 'Create Task'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
