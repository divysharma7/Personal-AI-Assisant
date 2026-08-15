'use client'

import {
  Activity,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDot,
  Clock3,
  Columns3,
  Copy,
  Ellipsis,
  Eye,
  EyeOff,
  FileText,
  Flag,
  Link2,
  List,
  ListChecks,
  ListPlus,
  ListTodo,
  MessageSquare,
  MoreHorizontal,
  PanelTop,
  Pin,
  PinOff,
  Plus,
  Printer,
  Save,
  Tag,
  Timer,
  Trash2,
  Upload,
  XSquare,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { format, isSameDay, addDays, startOfDay } from 'date-fns'
import { useTasks, type TaskRecord } from '@/hooks/useTasks'
import './task-management.css'

/* ═══════════════════════════════════════
   Types & helpers
   ═══════════════════════════════════════ */

type ViewMode = 'timeline' | 'list' | 'kanban'

const isDone = (s: string) => s === 'done' || s === 'completed'

function toDate(v?: string | null): Date | null {
  if (!v) return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

function relDate(str: string | null | undefined, now: Date): string | null {
  if (!str) return null
  const d = new Date(str)
  const diff = Math.round((startOfDay(d).getTime() - startOfDay(now).getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 1 && diff <= 7) return `in ${diff} days`
  if (diff < -1) return `${Math.abs(diff)} days ago`
  return format(d, 'MMM d')
}

const PRIO_CLR: Record<string, string> = {
  high: 'var(--priority-high)',
  medium: 'var(--priority-medium)',
  low: 'var(--priority-low)',
}

function PriorityIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="12" width="3.5" height="6" rx="1" fill={color} />
      <rect x="8.25" y="8" width="3.5" height="10" rx="1" fill={color} />
      <rect x="13.5" y="4" width="3.5" height="14" rx="1" fill={color} />
    </svg>
  )
}

const DURATION_OPTS = [
  { v: 0, l: 'None' }, { v: 15, l: '15 min' }, { v: 30, l: '30 min' },
  { v: 45, l: '45 min' }, { v: 60, l: '1 hour' }, { v: 90, l: '1.5 hours' },
  { v: 120, l: '2 hours' }, { v: 180, l: '3 hours' }, { v: 240, l: '4 hours' },
  { v: 480, l: '8 hours' },
]

/* ═══════════════════════════════════════
   Checkbox
   ═══════════════════════════════════════ */

function CheckBtn({ done, onClick, size = 16 }: { done: boolean; onClick: (e: ReactMouseEvent) => void; size?: number }) {
  return (
    <button
      type="button"
      className={`tm-check${done ? ' is-done' : ''}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      aria-label={done ? 'Mark incomplete' : 'Mark complete'}
    >
      {done ? <Check size={size - 4} strokeWidth={3} /> : null}
    </button>
  )
}

/* ═══════════════════════════════════════
   Task Card
   ═══════════════════════════════════════ */

function TaskCard({
  task, selected, details,
  onToggle, onSelect, onMenu,
}: {
  task: TaskRecord; selected: boolean; details: boolean
  onToggle: () => void; onSelect: (e: React.MouseEvent) => void; onMenu: (e: ReactMouseEvent) => void
}) {
  const done = isDone(task.status)
  const [now] = useState(() => new Date())
  const label = relDate(task.dueDate, now)
  const due = toDate(task.dueDate)
  const overdue = due ? due < startOfDay(now) && !done : false

  return (
    <article
      className={`tm-task${selected ? ' is-selected' : ''}${done ? ' is-completed' : ''}`}
      onClick={(e) => onSelect(e)}
      onContextMenu={onMenu}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect(e as unknown as React.MouseEvent) }}
    >
      <CheckBtn done={done} onClick={(e) => { e.stopPropagation(); onToggle() }} />
      <div className="tm-task-body">
        <h3 className="tm-task-title">{task.title}</h3>
        {details && task.description && <p className="tm-task-desc">{task.description}</p>}
        {details && (label || (task.priority && task.priority !== 'none')) && (
          <div className="tm-task-meta">
            {label && (
              <span className={overdue ? 'is-overdue' : ''} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={11} />{label}
              </span>
            )}
            {task.priority && task.priority !== 'none' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <PriorityIcon color={PRIO_CLR[task.priority] || PRIO_CLR.low} size={12} />
                {task.priority[0].toUpperCase() + task.priority.slice(1)}
              </span>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        className="tm-card-more"
        aria-label={`More actions for ${task.title}`}
        onClick={(e) => { e.stopPropagation(); onMenu(e) }}
      >
        <MoreHorizontal size={15} />
      </button>
    </article>
  )
}

/* ═══════════════════════════════════════
   Detail Popover
   ═══════════════════════════════════════ */

function DetailPopover({
  task, pos, onClose, onToggle, onUpdate, onComment, onActions,
}: {
  task: TaskRecord; pos: { top: number; left: number }
  onClose: () => void; onToggle: () => void
  onUpdate: (d: Partial<TaskRecord>) => void
  onComment: (t: string) => void
  onActions: (x: number, y: number) => void
}) {
  const [text, setText] = useState('')
  const dateRef = useRef<HTMLInputElement>(null)
  const done = isDone(task.status)
  const due = toDate(task.dueDate)
  const [now] = useState(() => new Date())
  const dateLabel = due
    ? isSameDay(due, now) ? 'Today' : isSameDay(due, addDays(now, 1)) ? 'Tomorrow' : format(due, 'EEE, MMM d')
    : 'No date'

  const submitComment = () => { const t = text.trim(); if (t) { onComment(t); setText('') } }

  return (
    <>
      <div className="tm-popover-scrim" onClick={onClose} />
      <div className="tm-detail-popover" style={{ top: pos.top, left: pos.left }} onClick={(e) => e.stopPropagation()}>
        <div className="tm-pop-scroll">
          {/* Header */}
          <div className="tm-pop-header">
            <button type="button" className={`tm-pop-check${done ? ' is-done' : ''}`} onClick={onToggle} aria-label={done ? 'Mark incomplete' : 'Mark complete'}>
              {done ? <Check size={13} strokeWidth={3} /> : null}
            </button>
            <h2 className={`tm-pop-title${done ? ' is-done' : ''}`}>{task.title}</h2>
          </div>

          {/* Date */}
          <div className="tm-pop-field" onClick={() => dateRef.current?.showPicker?.() || dateRef.current?.click()}>
            <span className="tm-pop-field-icon"><Calendar size={14} /></span>
            <span className="tm-pop-field-label">Date</span>
            <span className={`tm-pop-field-value${!due ? ' is-empty' : ''}`}>{dateLabel}</span>
            <input ref={dateRef} type="date" className="tm-date-input" tabIndex={-1}
              value={due ? format(due, 'yyyy-MM-dd') : ''}
              onChange={(e) => { if (e.target.value) onUpdate({ dueDate: new Date(`${e.target.value}T12:00:00`).toISOString() }) }}
            />
          </div>

          {/* Duration */}
          <div className="tm-pop-field">
            <span className="tm-pop-field-icon"><Timer size={14} /></span>
            <span className="tm-pop-field-label">Duration</span>
            <select className="tm-duration-select" value={task.estimatedEffort || 0}
              onChange={(e) => onUpdate({ estimatedEffort: parseInt(e.target.value, 10) || null })}
            >
              {DURATION_OPTS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>

          {/* Priority */}
          <div className="tm-pop-field">
            <span className="tm-pop-field-icon"><Flag size={14} /></span>
            <span className="tm-pop-field-label">Priority</span>
            <div className="tm-priority-btns">
              {([['high', '#db5147'], ['medium', '#d8ad42'], ['low', '#6874ed'], ['none', '#96969b']] as const).map(([p, c]) => (
                <button key={p} type="button"
                  className={`tm-priority-btn${task.priority === p || (!task.priority && p === 'none') ? ' is-active' : ''}`}
                  title={p === 'none' ? 'None' : p[0].toUpperCase() + p.slice(1)}
                  onClick={() => onUpdate({ priority: p === 'none' ? 'none' : p })}
                >
                  <Flag size={13} fill={c} color={c} />
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <>
              <div className="tm-pop-section">Description</div>
              <p className="tm-pop-desc">{task.description}</p>
            </>
          )}

          {/* Comments */}
          <div className="tm-pop-section">
            <MessageSquare size={11} /> Comments {task.comments?.length ? `(${task.comments.length})` : ''}
          </div>
          {task.comments?.map((c, i) => (
            <div key={i} className="tm-comment">
              <p className="tm-comment-text">{c.text}</p>
              <span className="tm-comment-meta">{c.authorName || 'You'}{c.createdAt ? ` · ${format(new Date(c.createdAt), 'MMM d, h:mm a')}` : ''}</span>
            </div>
          ))}
          <div className="tm-comment-row">
            <input className="tm-comment-input" placeholder="Add a comment..." value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitComment() }}
            />
            <button type="button" className="tm-comment-send" onClick={submitComment} disabled={!text.trim()}>
              <Check size={13} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="tm-pop-footer">
          <button type="button" className="tm-pop-more" aria-label="More actions"
            onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); onActions(r.right - 196, r.bottom + 4) }}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════
   Actions Menu
   ═══════════════════════════════════════ */

function ActionsMenu({
  task, pos, pinned, onClose,
  onSubtask, onPin, onWontDo, onTags, onUpload, onFocus, onActivities, onTemplate, onDup, onLink, onNote, onDelete,
}: {
  task: TaskRecord; pos: { x: number; y: number }; pinned: boolean; onClose: () => void
  onSubtask: () => void; onPin: () => void; onWontDo: () => void; onTags: () => void
  onUpload: () => void; onFocus: (m: 'POMO' | 'STOPWATCH') => void
  onActivities: () => void; onTemplate: () => void; onDup: () => void
  onLink: () => void; onNote: () => void; onDelete: () => void
}) {
  const [focusOpen, setFocusOpen] = useState(false)
  const act = (fn: () => void) => { fn(); onClose() }

  return (
    <>
      <div className="tm-popover-scrim" onClick={onClose} />
      <div className="tm-actions" style={{ left: pos.x, top: pos.y }} role="menu" aria-label={`${task.title} actions`}>
        <button type="button" role="menuitem" onClick={() => act(onSubtask)}><ListPlus size={15} /><span>Add Subtask</span></button>
        <button type="button" role="menuitem" onClick={() => act(onPin)}>{pinned ? <PinOff size={15} /> : <Pin size={15} />}<span>{pinned ? 'Unpin' : 'Pin'}</span></button>
        <button type="button" role="menuitem" onClick={() => act(onWontDo)}><XSquare size={15} /><span>Won&apos;t Do</span></button>
        <div className="tm-actions-rule" />
        <button type="button" role="menuitem" onClick={() => act(onTags)}><Tag size={15} /><span>Tags</span></button>
        <button type="button" role="menuitem" onClick={() => act(onUpload)}><Upload size={15} /><span>Upload Attachment</span></button>
        <div className="tm-sub-wrap">
          <button type="button" role="menuitem"
            onMouseEnter={() => setFocusOpen(true)} onMouseLeave={() => setFocusOpen(false)}
            onClick={() => setFocusOpen((o) => !o)}
          >
            <CircleDot size={15} /><span>Start Focus</span><ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
          </button>
          {focusOpen && (
            <div className="tm-submenu" role="menu" onMouseEnter={() => setFocusOpen(true)} onMouseLeave={() => setFocusOpen(false)}>
              <button type="button" role="menuitem" onClick={() => act(() => onFocus('POMO'))}><CircleDot size={14} /><span>Pomodoro</span></button>
              <button type="button" role="menuitem" onClick={() => act(() => onFocus('STOPWATCH'))}><Clock3 size={14} /><span>Stopwatch</span></button>
            </div>
          )}
        </div>
        <div className="tm-actions-rule" />
        <button type="button" role="menuitem" onClick={() => act(onActivities)}><Activity size={15} /><span>Task Activities</span></button>
        <button type="button" role="menuitem" onClick={() => act(onTemplate)}><Save size={15} /><span>Save as Template</span></button>
        <button type="button" role="menuitem" onClick={() => act(onDup)}><Copy size={15} /><span>Duplicate</span></button>
        <button type="button" role="menuitem" onClick={() => act(onLink)}><Link2 size={15} /><span>Copy Link</span></button>
        <button type="button" role="menuitem" onClick={() => act(onNote)}><FileText size={15} /><span>Convert to Note</span></button>
        <div className="tm-actions-rule" />
        <button type="button" role="menuitem" className="is-danger" onClick={() => act(onDelete)}><Trash2 size={15} /><span>Delete</span></button>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════
   View Menu
   ═══════════════════════════════════════ */

function ViewMenu({ view, showCompleted, showDetails, onPrint, onView, onComp, onDet }: {
  view: ViewMode; showCompleted: boolean; showDetails: boolean
  onPrint: () => void; onView: (v: ViewMode) => void; onComp: () => void; onDet: () => void
}) {
  return (
    <div className="tm-view-menu" role="menu" aria-label="View options">
      <p className="tm-view-menu-label">View</p>
      <div className="tm-view-choices" role="group" aria-label="Layout">
        <button type="button" className={view === 'timeline' ? 'is-active' : ''} onClick={() => onView('timeline')} aria-label="Timeline"><PanelTop size={19} /></button>
        <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => onView('list')} aria-label="List"><List size={19} /></button>
        <button type="button" className={view === 'kanban' ? 'is-active' : ''} onClick={() => onView('kanban')} aria-label="Kanban"><Columns3 size={19} /></button>
      </div>
      <div className="tm-menu-rule" />
      <button type="button" className="tm-menu-row" onClick={onComp} role="menuitem">
        {showCompleted ? <EyeOff size={15} /> : <Eye size={15} />}<span>{showCompleted ? 'Hide Completed' : 'Show Completed'}</span>
      </button>
      <button type="button" className="tm-menu-row" onClick={onDet} role="menuitem">
        <ListChecks size={15} /><span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
      </button>
      <div className="tm-menu-rule" />
      <button type="button" className="tm-menu-row" onClick={onPrint} role="menuitem">
        <Printer size={15} /><span>Print View</span>
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════
   Main Component
   ═══════════════════════════════════════ */

export default function TaskManagementScreen() {
  const { tasks, isLoading, createTask, updateTask, deleteTask, toggleComplete } = useTasks()

  // State
  const [view, setView] = useState<ViewMode>('timeline')
  const [showCompleted, setShowCompleted] = useState(true)
  const [showDetails, setShowDetails] = useState(true)
  const [selId, setSelId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [popPos, setPopPos] = useState({ top: 100, left: 400 })
  const [actionsMenu, setActionsMenu] = useState<{ id: string; x: number; y: number } | null>(null)
  const [ctxMenu, setCtxMenu] = useState<{ id: string; x: number; y: number } | null>(null)
  const [pinned, setPinned] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('laif-pinned-task-ids') ?? '[]') as string[] } catch { return [] }
  })
  const [composerOpen, setComposerOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [compOpen, setCompOpen] = useState(true)

  const anchorRef = useRef<HTMLDivElement>(null)

  // Persist pinned
  useEffect(() => { try { localStorage.setItem('laif-pinned-task-ids', JSON.stringify(pinned)) } catch { /* */ } }, [pinned])

  // Close on click-outside / Escape
  useEffect(() => {
    const down = (e: MouseEvent) => {
      const t = e.target as Element
      if (anchorRef.current && !anchorRef.current.contains(t)) setMenuOpen(false)
      if (!t.closest('.tm-actions') && !t.closest('.tm-popover-scrim') && !t.closest('.tm-detail-popover')) setActionsMenu(null)
      if (!t.closest('.tm-actions') && !t.closest('.tm-popover-scrim')) setCtxMenu(null)
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (actionsMenu) setActionsMenu(null)
        else if (ctxMenu) setCtxMenu(null)
        else setSelId(null)
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', down)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key) }
  }, [actionsMenu, ctxMenu])

  // Derived
  const filtered = useMemo(() => tasks
    .filter((t) => !t.isHabit && t.status !== 'dropped')
    .sort((a, b) => {
      const pd = Number(pinned.includes(b._id)) - Number(pinned.includes(a._id))
      if (pd) return pd
      const ad = toDate(a.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER
      const bd = toDate(b.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER
      return ad !== bd ? ad - bd : (a.title || '').localeCompare(b.title || '')
    })
  , [tasks, pinned])

  const active = useMemo(() => filtered.filter((t) => !isDone(t.status)), [filtered])
  const completed = useMemo(() => filtered.filter((t) => isDone(t.status)), [filtered])

  // Timeline groups (vertical: today + next 6 days + past/undated)
  const groups = useMemo(() => {
    const now = new Date()
    const today = startOfDay(now)
    const map = new Map<string, { date: Date; items: TaskRecord[] }>()
    for (let i = 0; i < 7; i++) { const d = addDays(today, i); map.set(format(d, 'yyyy-MM-dd'), { date: d, items: [] }) }
    map.set('past', { date: today, items: [] })
    map.set('none', { date: today, items: [] })

    const vis = showCompleted ? filtered : active
    for (const t of vis) {
      const d = toDate(t.dueDate)
      if (!d) map.get('none')!.items.push(t)
      else if (d < today) map.get('past')!.items.push(t)
      else {
        const k = format(d, 'yyyy-MM-dd')
        const g = map.get(k)
        if (g) g.items.push(t)
        else map.set(k, { date: d, items: [t] })
      }
    }

    const out: { key: string; label: string; sub: string; items: TaskRecord[] }[] = []
    const pg = map.get('past')!
    if (pg.items.length) out.push({ key: 'past', label: 'Past', sub: '', items: pg.items })
    for (let i = 0; i < 7; i++) {
      const d = addDays(today, i)
      const k = format(d, 'yyyy-MM-dd')
      const g = map.get(k)!
      out.push({ key: k, label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(d, 'EEEE'), sub: format(d, 'MMM d'), items: g.items })
    }
    const ng = map.get('none')!
    if (ng.items.length) out.push({ key: 'none', label: 'No Date', sub: '', items: ng.items })
    return out
  }, [filtered, active, showCompleted])

  const sel = selId ? tasks.find((t) => t._id === selId) ?? null : null
  const ctxTask = ctxMenu ? tasks.find((t) => t._id === ctxMenu.id) ?? null : null

  // Handlers
  const select = useCallback((id: string, rect?: DOMRect) => {
    setSelId((c) => c === id ? null : id)
    if (rect) {
      const w = 340, gap = 14
      let l = rect.right + gap
      if (l + w > window.innerWidth - 16) l = rect.left - w - gap
      if (l < 16) l = 16
      setPopPos({ top: Math.max(16, Math.min(rect.top, window.innerHeight - 520)), left: l })
    }
  }, [])

  const toggle = useCallback((id: string) => { void toggleComplete(id) }, [toggleComplete])
  const update = useCallback((id: string, d: Partial<TaskRecord>) => { void updateTask(id, d) }, [updateTask])

  const addComment = useCallback((id: string, text: string) => {
    const t = tasks.find((x) => x._id === id)
    if (!t) return
    void updateTask(id, { comments: [...(t.comments ?? []), { text, createdAt: new Date().toISOString(), authorName: 'You' }] })
  }, [tasks, updateTask])

  const openCtx = useCallback((task: TaskRecord, e: ReactMouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setCtxMenu({ id: task._id, x: Math.max(8, Math.min(e.clientX, window.innerWidth - 210)), y: Math.max(8, Math.min(e.clientY, window.innerHeight - 520)) })
  }, [])

  const addSub = useCallback(async (t: TaskRecord) => {
    const s = await createTask({ title: 'New subtask', parentId: t._id, status: 'todo', priority: t.priority, dueDate: t.dueDate, listId: t.listId })
    setSelId(s._id)
  }, [createTask])

  const dup = useCallback((t: TaskRecord) => {
    void createTask({ title: `${t.title} copy`, description: t.description, status: 'todo', priority: t.priority, dueDate: t.dueDate, listId: t.listId, tags: t.tags, estimatedEffort: t.estimatedEffort })
  }, [createTask])

  const focus = useCallback((t: TaskRecord, m: 'POMO' | 'STOPWATCH') => {
    window.dispatchEvent(new CustomEvent('laif:start-focus', { detail: { taskId: t._id, taskTitle: t.title, mode: m, targetType: 'TASK' } }))
  }, [])

  const copyLink = useCallback((t: TaskRecord) => {
    const u = new URL(window.location.href); u.searchParams.set('task', t._id); void navigator.clipboard?.writeText(u.toString())
  }, [])

  const toNote = useCallback((t: TaskRecord) => {
    void updateTask(t._id, { notes: t.notes ?? { type: 'doc', content: [{ type: 'paragraph' }] }, tags: Array.from(new Set([...(t.tags ?? []), 'note'])) })
    setSelId(t._id)
  }, [updateTask])

  const submit = useCallback((e: FormEvent) => {
    e.preventDefault(); const t = newTitle.trim(); if (!t) return
    void createTask({ title: t, status: 'todo', priority: 'none', dueDate: new Date().toISOString() })
    setNewTitle(''); setComposerOpen(false)
  }, [newTitle, createTask])

  const openDetail = useCallback((id: string) => {
    window.dispatchEvent(new CustomEvent('laif:detail-task', { detail: { taskId: id } }))
  }, [])

  // Actions helpers
  const actTask = actionsMenu ? tasks.find((t) => t._id === actionsMenu.id) ?? null : null

  const renderActions = (t: TaskRecord, p: { x: number; y: number }) => (
    <ActionsMenu
      task={t} pos={p} pinned={pinned.includes(t._id)}
      onClose={() => { setActionsMenu(null); setCtxMenu(null) }}
      onSubtask={() => void addSub(t)}
      onPin={() => setPinned((ids) => ids.includes(t._id) ? ids.filter((i) => i !== t._id) : [...ids, t._id])}
      onWontDo={() => { void updateTask(t._id, { status: 'dropped' }); setSelId(null) }}
      onTags={() => {}} onUpload={() => {}}
      onFocus={(m) => focus(t, m)}
      onActivities={() => openDetail(t._id)}
      onTemplate={() => {}}
      onDup={() => void dup(t)}
      onLink={() => copyLink(t)}
      onNote={() => toNote(t)}
      onDelete={() => { if (window.confirm(`Delete "${t.title}"?`)) { void deleteTask(t._id); setSelId(null) } }}
    />
  )

  // Card renderers
  const renderCard = (t: TaskRecord) => (
    <TaskCard key={t._id} task={t} selected={selId === t._id} details={showDetails}
      onToggle={() => toggle(t._id)}
      onSelect={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); select(t._id, r) }}
      onMenu={(e) => openCtx(t, e)}
    />
  )

  return (
    <div className="tm">
      {/* Header */}
      <header className="tm-header">
        <div className="tm-header-left"><ListTodo size={18} /><h1>Tasks</h1></div>
        <div className="tm-header-right">
          <div className="tm-menu-anchor" ref={anchorRef}>
            <button type="button" className="tm-ctrl" title="View options" aria-label="View options"
              onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen}
            >
              <Ellipsis size={18} />
            </button>
            {menuOpen && (
              <ViewMenu view={view} showCompleted={showCompleted} showDetails={showDetails}
                onView={(v) => { setView(v); setMenuOpen(false) }}
                onComp={() => setShowCompleted((v) => !v)}
                onDet={() => setShowDetails((v) => !v)}
                onPrint={() => window.print()}
              />
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="tm-content">
        {/* Controls */}
        <div className="tm-controls">
          <button type="button" className="tm-toggle" onClick={() => window.print()}><Printer size={13} /> Print View</button>
          <button type="button" className={`tm-toggle${showDetails ? ' is-on' : ''}`} onClick={() => setShowDetails((v) => !v)}><Eye size={13} /> Show Details</button>
          <button type="button" className={`tm-toggle${!showCompleted ? ' is-on' : ''}`} onClick={() => setShowCompleted((v) => !v)}>
            {showCompleted ? <EyeOff size={13} /> : <Eye size={13} />} Hide Completed
          </button>
        </div>

        {isLoading ? (
          <div className="tm-loading"><div className="tm-loading-card" /><div className="tm-loading-card" /><div className="tm-loading-card" /></div>
        ) : (
          <>
            {/* ══ Timeline ══ */}
            {view === 'timeline' && (
              <div className="tm-timeline">
                {groups.map((g) => (
                  <section key={g.key} className="tm-day-section">
                    <div className="tm-day-header">
                      <h2>{g.label}</h2>
                      <span className="tm-day-count">{g.items.length}</span>
                      {g.sub && <span className="tm-day-date">{g.sub}</span>}
                    </div>
                    <div className="tm-day-tasks">
                      {g.items.length ? g.items.map(renderCard) : <p style={{ fontSize: 11, color: 'var(--text-faint)', padding: '4px 2px' }}>No tasks</p>}
                    </div>
                  </section>
                ))}
                {groups.length === 0 && (
                  <div className="tm-empty"><ListTodo size={22} /><h3>No tasks</h3><p>All clear for now.</p></div>
                )}
              </div>
            )}

            {/* ══ List ══ */}
            {view === 'list' && (
              <div className="tm-list-wrap">
                <div className="tm-list-head"><h3>All Tasks</h3><span>{(showCompleted ? filtered : active).length}</span></div>
                <div className="tm-list-items">{active.map(renderCard)}</div>
                {composerOpen ? (
                  <form className="tm-composer" onSubmit={submit}>
                    <Circle size={14} />
                    <input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="What needs to be done?" onKeyDown={(e) => { if (e.key === 'Escape') setComposerOpen(false) }} />
                    <button type="submit">Add</button>
                  </form>
                ) : (
                  <button type="button" className="tm-empty-add" style={{ marginTop: 8 }} onClick={() => setComposerOpen(true)}><Plus size={14} /> Add a task</button>
                )}
                {showCompleted && completed.length > 0 && (
                  <section className="tm-completed-group">
                    <button type="button" className="tm-completed-toggle" onClick={() => setCompOpen((o) => !o)}>
                      <ChevronDown size={13} className={compOpen ? '' : 'is-closed'} /> Completed <span>{completed.length}</span>
                    </button>
                    {compOpen && <div className="tm-list-items">{completed.map(renderCard)}</div>}
                  </section>
                )}
                {active.length === 0 && !composerOpen && <div className="tm-empty"><ListTodo size={22} /><h3>No tasks yet</h3><p>Add a task to get started.</p></div>}
              </div>
            )}

            {/* ══ Kanban ══ */}
            {view === 'kanban' && (
              <div className="tm-kanban-scroll">
                <div className="tm-kanban-board">
                  {[
                    { id: 'todo', title: 'To Do', items: active.filter((t) => t.status !== 'in-progress') },
                    { id: 'in-progress', title: 'In Progress', items: active.filter((t) => t.status === 'in-progress') },
                    { id: 'done', title: 'Done', items: showCompleted ? completed : [] },
                  ].map((col) => (
                    <div key={col.id} className="tm-kanban-col">
                      <div className="tm-kanban-col-head"><h3>{col.title}</h3><span>{col.items.length}</span></div>
                      <div className="tm-kanban-col-tasks">
                        {col.items.length ? col.items.map((t) => (
                          <TaskCard key={t._id} task={t} selected={selId === t._id} details={false}
                            onToggle={() => toggle(t._id)}
                            onSelect={() => select(t._id)}
                            onMenu={(e) => openCtx(t, e)}
                          />
                        )) : <p style={{ fontSize: 11, color: 'var(--text-faint)', padding: '4px 2px' }}>No tasks</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Detail popover */}
      {sel && !actionsMenu && !ctxMenu && (
        <DetailPopover task={sel} pos={popPos}
          onClose={() => setSelId(null)}
          onToggle={() => toggle(sel._id)}
          onUpdate={(d) => update(sel._id, d)}
          onComment={(t) => addComment(sel._id, t)}
          onActions={(x, y) => setActionsMenu({ id: sel._id, x, y })}
        />
      )}

      {/* Actions from popover footer */}
      {actTask && actionsMenu && renderActions(actTask, actionsMenu)}

      {/* Context menu from card right-click / three-dot */}
      {ctxTask && ctxMenu && !actionsMenu && renderActions(ctxTask, ctxMenu)}
    </div>
  )
}
