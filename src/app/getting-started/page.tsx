import { useEffect, useState } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { env } from '@/config/env'

const API_BASE = env.VITE_API_URL

const CHECKLIST = [
  { text: 'Check off this task to see how it works', tip: 'Click the checkbox on the left. Done feels good.' },
  { text: 'Click the “+ New task” row and type something', tip: 'Press Enter to save, Escape to cancel.' },
  { text: 'Add a due date from the date action', tip: 'Pick Today, Tomorrow, Next week, or a date from the calendar.' },
  { text: 'Open a task to see its details', tip: 'Add subtasks, change priority, and leave comments without losing your place.' },
  { text: 'Change how tasks are grouped', tip: 'Try Priority to see High, Medium, and Low tasks together.' },
  { text: 'Create your first list', tip: 'Use one for Home, one for Work, or one for a project.' },
]

const FEATURES = [
  ['📋', 'Lists & workspaces', 'Create focused homes for personal work, projects, and responsibilities.', '/lists'],
  ['🔥', 'Habit tracking', 'Build routines with streaks, check-ins, weekly progress, and analytics.', '/habits'],
  ['📅', 'Calendar', 'Plan with Day, Week, Month, Year, and Agenda views.', '/calendar'],
  ['🎯', 'Focus', 'Protect a block of time, connect it to an intention, and track the result.', '/focus'],
  ['📊', 'Statistics', 'Review completion, consistency, focus time, and workload patterns.', '/statistics'],
  ['✨', 'AI chat', 'Plan your day, inspect overdue work, and break down a goal.', '/chat'],
] as const

const SHORTCUTS = [
  ['⌃N', 'Create a new task'], ['Enter', 'Save the task you are typing'],
  ['Escape', 'Cancel and close'], ['Space', 'Toggle a task'],
  ['Double-click', 'Edit a task title'], ['Right-click', 'Open task actions'],
  ['D / 1', 'Calendar day view'], ['W / 2', 'Calendar week view'],
  ['M / 3', 'Calendar month view'], ['T', 'Jump to today'],
] as const

export default function GettingStartedPage() {
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [userName, setUserName] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (data?.name) setUserName(data.name.split(' ')[0])
        const ids = data?.gettingStartedState?.checkedStepIds
        if (Array.isArray(ids)) {
          setChecked(new Set(ids
            .map((id: unknown) => Number(id))
            .filter((id: number) => Number.isInteger(id) && id >= 0 && id < CHECKLIST.length)))
        }
      })
      .catch(() => {})
  }, [])

  const toggle = async (index: number) => {
    if (saving) return
    const previous = checked
    const next = new Set(previous)
    if (next.has(index)) next.delete(index)
    else next.add(index)
    setChecked(next)
    setSaveError('')
    setSaving(true)

    try {
      const response = await fetch(`${API_BASE}/api/users/me/getting-started`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          checkedStepIds: Array.from(next).sort((a, b) => a - b).map(String),
          completed: next.size === CHECKLIST.length,
        }),
      })
      if (!response.ok) throw new Error('save failed')
    } catch {
      setChecked(previous)
      setSaveError('Progress could not be saved. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }
  const progress = Math.round((checked.size / CHECKLIST.length) * 100)

  return (
    <div className="workspace-page overflow-y-auto">
      <header className="workspace-header">
        <h1 className="type-page-title">Getting Started</h1>
        <span className="type-meta tabular-nums text-[var(--text-muted)]">{progress}% complete</span>
      </header>

      <main className="w-full max-w-[760px] px-5 py-6 sm:px-8">
        <section className="mb-8">
          <p className="type-micro mb-1 font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">Welcome</p>
          <h2 className="type-section-title">{userName ? `Welcome, ${userName}` : 'Welcome to Life OS'}</h2>
          <p className="type-body mt-2 max-w-[620px] text-[var(--text-muted)]">
            Tasks, habits, calendar, and focus time live in one calm workspace. Start with these six small actions; every feature remains available from the navigation rail.
          </p>
        </section>

        <section className="mb-9" aria-labelledby="first-minutes-title">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="first-minutes-title" className="type-section-title">Your first two minutes</h2>
            <span className="type-meta tabular-nums" style={{ color: progress === 100 ? 'var(--success)' : 'var(--text-muted)' }}>
              {checked.size}/{CHECKLIST.length} done
            </span>
          </div>
          <div className="mb-3 h-1 overflow-hidden rounded-full bg-[var(--bg-active)]" role="progressbar" aria-label="Getting started progress" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full transition-[width,background-color] duration-300" style={{ width: `${progress}%`, background: progress === 100 ? 'var(--success)' : 'var(--accent)' }} />
          </div>
          {saveError ? <p role="alert" className="type-meta mb-3 text-[var(--priority-high)]">{saveError}</p> : null}
          <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]">
            {CHECKLIST.map((item, index) => {
              const done = checked.has(index)
              return (
                <button
                  key={item.text}
                  type="button"
                  aria-pressed={done}
                  disabled={saving}
                  onClick={() => toggle(index)}
                  className="flex w-full items-start gap-3 border-b border-[var(--border)] bg-[var(--bg-card)] px-3 py-3 text-left last:border-b-0 hover:bg-[var(--bg-hover)] disabled:cursor-wait disabled:opacity-70"
                >
                  <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border" style={{ borderColor: done ? 'var(--success)' : 'var(--border-strong)', background: done ? 'var(--success)' : 'transparent' }}>
                    {done ? <Check size={12} strokeWidth={2.5} color="var(--text-on-dark)" /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="type-row-title block" style={{ color: done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : undefined }}>{item.text}</span>
                    <span className="type-meta mt-0.5 block text-[var(--text-muted)]">{item.tip}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="mb-9" aria-labelledby="screen-title">
          <h2 id="screen-title" className="type-section-title mb-3">How the workspace works</h2>
          <div className="grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-3">
            <FeatureBlock title="Rail · Navigate" body="Move between Today, tasks, habits, calendar, focus, statistics, chat, plan, and shutdown." />
            <FeatureBlock title="Center · Work" body="Complete, schedule, prioritize, group, and move tasks without leaving the current view." />
            <FeatureBlock title="Panel · Inspect" body="Open details, subtasks, comments, and workflow context while your list stays visible." />
          </div>
        </section>

        <section className="mb-9" aria-labelledby="features-title">
          <h2 id="features-title" className="type-section-title mb-3">Explore the system</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {FEATURES.map(([emoji, title, description, href]) => <FeatureCard key={href} emoji={emoji} title={title} description={description} href={href} />)}
          </div>
        </section>

        <section className="mb-9" aria-labelledby="shortcuts-title">
          <h2 id="shortcuts-title" className="type-section-title mb-3">Keyboard shortcuts</h2>
          <div className="grid gap-x-6 sm:grid-cols-2">
            {SHORTCUTS.map(([keys, action]) => <ShortcutRow key={`${keys}-${action}`} keys={keys} action={action} />)}
          </div>
        </section>

        <section className="surface-card mb-8 flex gap-3 p-4">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-[var(--accent)]" />
          <div>
            <h2 className="type-section-title">The idea behind Life OS</h2>
            <p className="type-body mt-1 text-[var(--text-muted)]">The interface stays quiet so your work is the loudest thing on screen. Today narrows attention, the assistant reduces planning overhead, and Focus turns an intention into protected time.</p>
          </div>
        </section>

        <p className="type-meta pb-8 text-[var(--text-muted)]">
          You are ready. Go to <a href="/today" className="font-semibold text-[var(--accent)] underline underline-offset-2">Today</a> and add the next thing that matters.
        </p>
      </main>
    </div>
  )
}

function FeatureBlock({ title, body }: { title: string; body: string }) {
  return <div className="bg-[var(--bg-card)] p-4"><h3 className="type-row-title">{title}</h3><p className="type-meta mt-1 text-[var(--text-muted)]">{body}</p></div>
}

function FeatureCard({ emoji, title, description, href }: { emoji: string; title: string; description: string; href: string }) {
  return (
    <a href={href} className="surface-card flex gap-3 p-3 no-underline transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)]">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--overlay-2)] text-base" aria-hidden="true">{emoji}</span>
      <span><span className="type-row-title block text-[var(--text-primary)]">{title}</span><span className="type-meta mt-0.5 block text-[var(--text-muted)]">{description}</span></span>
    </a>
  )
}

function ShortcutRow({ keys, action }: { keys: string; action: string }) {
  return <div className="flex min-h-9 items-center justify-between border-b border-[var(--border)] py-1"><span className="type-meta text-[var(--text-secondary)]">{action}</span><kbd className="type-micro rounded-[5px] border border-[var(--border)] bg-[var(--bg-pane-2)] px-1.5 py-0.5 font-mono text-[var(--text-muted)]">{keys}</kbd></div>
}
