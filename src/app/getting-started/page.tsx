'use client'

import { useState, useEffect } from 'react'
import { Check, ArrowRight, Sparkles } from 'lucide-react'

const CHECKLIST = [
  { text: 'Check off this task to see how it works', tip: 'Click the checkbox on the left. Done feels good.' },
  { text: 'Click the "+ New task" row and type something', tip: 'Press Enter to save, Escape to cancel. That\'s it.' },
  { text: 'Add a due date by clicking the date chip below a task', tip: 'Pick Today, Tomorrow, Next week, or any date from the calendar.' },
  { text: 'Open task details with the → arrow on the right', tip: 'The detail panel slides in — add subtasks, change priority, leave comments.' },
  { text: 'Change how tasks are grouped using the pill in the top-right', tip: 'Try "Priority" to see your High/Medium/Low tasks separated.' },
  { text: 'Create your first list using the 📁 icon next to Favorites', tip: 'Lists are workspaces — one for Home, one for Work, one for a project.' },
]

export default function GettingStartedPage() {
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [userName, setUserName] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.name) setUserName(d.name.split(' ')[0])
    }).catch(() => {})
  }, [])

  const toggle = (i: number) => {
    setChecked(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n })
  }

  const progress = Math.round((checked.size / CHECKLIST.length) * 100)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto',
      fontFamily: 'Inter, system-ui, sans-serif',
      paddingTop: 48, paddingBottom: 80, paddingLeft: '18%', paddingRight: '10%',
    }}>
      {/* Title */}
      <h1 style={{
        fontSize: 42, fontWeight: 700, letterSpacing: '-0.02em',
        color: 'var(--text-primary)', marginBottom: 36,
      }}>
        Getting Started
      </h1>

      {/* ── Welcome ── */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          👋 {userName ? `Welcome, ${userName}` : 'Welcome to LAIF'}
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-muted)', maxWidth: 560 }}>
          LAIF is your personal life operating system. All your <strong style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>tasks</strong>, <strong style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>habits</strong>, <strong style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>calendar</strong>, and <strong style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>focus time</strong> in one place. It should feel as natural as pen and paper — but smarter.
        </p>
      </div>

      {/* ── Your first 2 minutes ── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
            Your first 2 minutes:
          </h3>
          <span style={{ fontSize: 13, fontWeight: 600, color: progress === 100 ? 'var(--success, #34d399)' : 'var(--text-faint)' }}>
            {checked.size}/{CHECKLIST.length} done
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 4, borderRadius: 999, marginBottom: 20,
          backgroundColor: 'var(--overlay-2, rgba(108,108,158,0.12))',
        }}>
          <div style={{
            height: '100%', borderRadius: 999,
            width: `${progress}%`,
            backgroundColor: progress === 100 ? 'var(--success, #34d399)' : 'var(--accent)',
            transition: 'width 300ms ease, background-color 300ms ease',
          }} />
        </div>

        {/* Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {CHECKLIST.map((item, i) => {
            const done = checked.has(i)
            return (
              <div
                key={i}
                onClick={() => toggle(i)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer',
                  padding: '10px 12px', borderRadius: 10,
                  backgroundColor: done ? 'rgba(52,211,153,0.04)' : 'transparent',
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={(e) => { if (!done) e.currentTarget.style.backgroundColor = 'var(--overlay-1, rgba(108,108,158,0.05))' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = done ? 'rgba(52,211,153,0.04)' : 'transparent' }}
              >
                <div style={{
                  flexShrink: 0, width: 22, height: 22, marginTop: 1,
                  borderRadius: 6,
                  border: done ? 'none' : '2px solid var(--overlay-3, #605f6a)',
                  backgroundColor: done ? 'var(--success, #34d399)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 150ms ease',
                }}>
                  {done && <Check size={14} strokeWidth={2.5} color="#fff" />}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontSize: 15, fontWeight: 600, lineHeight: 1.5,
                    color: done ? 'var(--text-faint)' : 'var(--text-primary)',
                    textDecoration: done ? 'line-through' : 'none',
                    textDecorationColor: 'var(--success, #34d399)',
                  }}>
                    {item.text}
                  </span>
                  <p style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 2, lineHeight: 1.4 }}>
                    {item.tip}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── How the screen works ── */}
      <div style={{ marginBottom: 48 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
          How the screen works
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <FeatureBlock
            title="Left sidebar → Navigate"
            body="Jump between Inbox, Today, Tasks, Updates, and Lists. Click your avatar at the bottom to access Habits, Calendar, Focus, Matrix, Statistics, and Chat. The + button creates tasks or new lists."
          />
          <FeatureBlock
            title="Center → Your tasks"
            body="This is where you work. Tasks show a checkbox, priority bars, title, due date, and subtask count. Click a date chip to reschedule. Click priority to change it. Double-click a title to rename. Right-click for the full context menu."
          />
          <FeatureBlock
            title="Right panel → Details or cover image"
            body="Click any task and the right side becomes a detail panel — edit everything, add subtasks with the '+ New task' bar inside, leave comments. When no task is open, it shows a customizable cover image (hover the gear icon to pick a new one)."
          />
        </div>
      </div>

      {/* ── What you can do ── */}
      <div style={{ marginBottom: 48 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
          What you can do
        </h3>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        }}>
          <FeatureCard emoji="📋" title="Lists & Workspaces" desc="Create a list for Home, Work, a project — whatever you need. Each list works the same way: add tasks, track them, finish them." link="/lists" />
          <FeatureCard emoji="🔥" title="Habit Tracking" desc="Build daily routines with streaks, mood journals, weekly grids, and analytics. Morning meditation, reading, gym — all tracked." link="/habits" />
          <FeatureCard emoji="📅" title="Calendar" desc="Day, Week, Month, Year, and Agenda views. Drag tasks to schedule them. See overdue items. Connect Google Calendar." link="/calendar" />
          <FeatureCard emoji="🎯" title="Focus Timer" desc="Pomodoro-style deep work sessions tied to specific tasks. Pick a task, start a focus session, track your output." link="/focus" />
          <FeatureCard emoji="📊" title="Statistics" desc="See your completion rates, streaks, focus time, and habit consistency across Overview, Task, and Focus tabs." link="/statistics" />
          <FeatureCard emoji="✨" title="AI Chat" desc="Ask LAIF anything — 'Plan my day', 'What's overdue?', 'Break down this goal'. It knows your tasks and can create them for you." link="/chat" />
        </div>
      </div>

      {/* ── Keyboard shortcuts ── */}
      <div style={{ marginBottom: 48 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
          Keyboard shortcuts you&apos;ll love
        </h3>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        }}>
          <ShortcutRow keys="⌃N" action="Create a new task" />
          <ShortcutRow keys="Enter" action="Save the task you're typing" />
          <ShortcutRow keys="Escape" action="Cancel and close anything" />
          <ShortcutRow keys="Space" action="Toggle a task's checkbox" />
          <ShortcutRow keys="Double-click" action="Edit a task title inline" />
          <ShortcutRow keys="Right-click" action="Open the context menu" />
          <ShortcutRow keys="D / 1" action="Calendar → Day view" />
          <ShortcutRow keys="W / 2" action="Calendar → Week view" />
          <ShortcutRow keys="M / 3" action="Calendar → Month view" />
          <ShortcutRow keys="T" action="Calendar → Jump to today" />
        </div>
      </div>

      {/* ── Philosophy ── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{
          padding: '24px 28px', borderRadius: 16,
          backgroundColor: 'var(--overlay-1, rgba(108,108,158,0.06))',
          border: '1px solid var(--overlay-2, rgba(108,108,158,0.1))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Sparkles size={20} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              The idea behind LAIF
            </h3>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-muted)', margin: 0 }}>
            Most productivity apps make you feel behind. LAIF is designed to make you feel in control. The Today view shows only what matters right now. The AI assistant understands your workload. The focus timer turns intentions into action. And when you check something off, you hear it — because finishing things should feel good.
          </p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ marginBottom: 16 }}>
        <svg width="100%" height="20" viewBox="0 0 600 20" preserveAspectRatio="none">
          <path d="M0 10 Q50 2, 100 10 T200 10 T300 10 T400 10 T500 10 T600 10" fill="none" stroke="var(--accent-blue, #2281d9)" strokeWidth="2" opacity="0.3" />
        </svg>
      </div>

      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-faint)', fontStyle: 'italic' }}>
        You&apos;re all set. Go to <a href="/today" style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 2 }}>Today</a> and start adding tasks. You&apos;ll figure out the rest as you go — that&apos;s how it&apos;s designed.
      </p>
    </div>
  )
}

/* ── Sub-components ── */

function FeatureBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{title}</h4>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>{body}</p>
    </div>
  )
}

function FeatureCard({ emoji, title, desc, link }: { emoji: string; title: string; desc: string; link: string }) {
  return (
    <a
      href={link}
      style={{
        display: 'flex', flexDirection: 'column', gap: 8,
        padding: '16px 18px', borderRadius: 14, textDecoration: 'none',
        backgroundColor: 'var(--overlay-1, rgba(108,108,158,0.06))',
        border: '1px solid var(--overlay-2, rgba(108,108,158,0.1))',
        transition: 'all 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--overlay-2, rgba(108,108,158,0.12))'
        e.currentTarget.style.borderColor = 'var(--overlay-3, rgba(108,108,158,0.2))'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--overlay-1, rgba(108,108,158,0.06))'
        e.currentTarget.style.borderColor = 'var(--overlay-2, rgba(108,108,158,0.1))'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
      <span style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-faint)' }}>{desc}</span>
    </a>
  )
}

function ShortcutRow({ keys, action }: { keys: string; action: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
      <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{action}</span>
      <span style={{
        fontSize: 12, fontWeight: 600, color: 'var(--text-faint)',
        backgroundColor: 'var(--overlay-2, rgba(108,108,158,0.12))',
        padding: '2px 8px', borderRadius: 6, fontFamily: 'monospace',
      }}>
        {keys}
      </span>
    </div>
  )
}
