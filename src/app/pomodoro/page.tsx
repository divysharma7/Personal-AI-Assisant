'use client'
import { useMemo } from 'react'
import { Play, Pause, RotateCcw, Coffee, ChevronDown, Calendar, CheckSquare } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { isToday, format } from 'date-fns'
import { usePomodoroContext } from '@/contexts/PomodoroContext'
import { usePomodoro } from '@/hooks/usePomodoro'
import { useItems } from '@/hooks/useItems'
import PomodoroStats from '@/components/pomodoro/PomodoroStats'
import { smooth } from '@/shared/design-system'
import type { AnyItem, Task, CalendarEvent } from '@/types'

const WORK_SEC = 25 * 60

interface PickerItem {
  id: string
  type: 'task' | 'event'
  title: string
  durationSec: number
  subtitle?: string
}

export default function PomodoroPage() {
  const { state, actions } = usePomodoroContext()
  const { sessions } = usePomodoro()
  const { items } = useItems()
  const [pickerOpen, setPickerOpen] = useState(false)

  const mm = String(Math.floor(state.secondsLeft / 60)).padStart(2, '0')
  const ss = String(state.secondsLeft % 60).padStart(2, '0')
  const progress = 1 - state.secondsLeft / state.totalSec
  const color = state.mode === 'work' ? 'var(--accent)' : 'var(--color-task)'

  // Build picker list
  const pickerItems: PickerItem[] = useMemo(() => [
    ...(items.filter(i => {
      if (i.type !== 'event') return false
      const e = i as CalendarEvent
      return isToday(new Date(e.startDate))
    }) as CalendarEvent[]).map(e => {
      const start = new Date(e.startDate)
      const end = new Date(e.endDate)
      const durSec = Math.max(60, Math.round((end.getTime() - start.getTime()) / 1000))
      return {
        id: e._id!,
        type: 'event' as const,
        title: e.title,
        durationSec: durSec,
        subtitle: `${format(start, 'h:mm')}\u2013${format(end, 'h:mm a')}`,
      }
    }),
    ...(items.filter(i => {
      if (i.type !== 'task') return false
      const t = i as Task
      return t.status !== 'done' && (t.dueDate ? isToday(new Date(t.dueDate)) : false)
    }) as Task[]).map(t => ({
      id: t._id!,
      type: 'task' as const,
      title: t.title,
      durationSec: WORK_SEC,
    })),
  ], [items])

  function selectItem(item: PickerItem | null) {
    if (item) {
      actions.setTask(item.id, item.title, item.durationSec)
    } else {
      actions.setTask(null, '')
    }
    setPickerOpen(false)
  }

  // Recent sessions (last 10)
  const recentSessions = sessions
    .filter(s => s.type === 'focus')
    .slice(0, 10)

  const c = 2 * Math.PI * 100

  return (
    <div className="flex flex-col flex-1 overflow-auto min-h-0">
      {/* Top bar */}
      <div
        className="flex items-center gap-2.5 px-6 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Pomodoro</p>
        <span className="text-xs" style={{ color: 'var(--text-3)' }}>
          {state.todayCompleted > 0 && `${state.todayCompleted} session${state.todayCompleted > 1 ? 's' : ''} today`}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Large timer */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={smooth}
            className="flex flex-col items-center justify-center"
          >
            {/* Mode toggle */}
            <div className="flex items-center gap-2 mb-6">
              {(['work', 'break'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => actions.switchMode(m)}
                  className="px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize"
                  style={state.mode === m
                    ? { background: m === 'work' ? 'var(--accent)' : 'var(--color-task)', color: '#fff' }
                    : { background: 'var(--input-bg)', color: 'var(--text-3)' }}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Task picker */}
            {state.mode === 'work' && (
              <div className="mb-6 w-full max-w-xs relative">
                <button
                  onClick={() => setPickerOpen(o => !o)}
                  className="w-full flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors"
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: state.taskTitle ? 'var(--text-1)' : 'var(--text-3)',
                  }}
                >
                  <span className="flex-1 text-left truncate">
                    {state.taskTitle || 'Pick a task or event\u2026'}
                  </span>
                  <ChevronDown size={13} style={{ flexShrink: 0, opacity: 0.5 }} />
                </button>

                {pickerOpen && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1 rounded-xl z-10"
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      maxHeight: 220,
                      overflowY: 'auto',
                    }}
                  >
                    <button
                      onClick={() => selectItem(null)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--input-bg)] transition-colors"
                      style={{ color: 'var(--text-3)' }}
                    >
                      No specific task
                    </button>
                    {(['event', 'task'] as const).map(type => {
                      const group = pickerItems.filter(p => p.type === type)
                      if (group.length === 0) return null
                      return (
                        <div key={type}>
                          <p className="px-3 pt-2 pb-1 text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>
                            {type === 'event' ? 'Events' : 'Tasks'}
                          </p>
                          {group.map(item => (
                            <button
                              key={item.id}
                              onClick={() => selectItem(item)}
                              className="w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2"
                              style={{
                                color: item.id === state.taskId ? 'var(--accent)' : 'var(--text-1)',
                                background: item.id === state.taskId ? 'var(--accent-dim)' : 'transparent',
                              }}
                            >
                              {type === 'event'
                                ? <Calendar size={10} style={{ flexShrink: 0, opacity: 0.6 }} />
                                : <CheckSquare size={10} style={{ flexShrink: 0, opacity: 0.6 }} />
                              }
                              <span className="flex-1 truncate">{item.title}</span>
                              {item.subtitle && <span className="opacity-50 flex-shrink-0">{item.subtitle}</span>}
                            </button>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Ring */}
            <div className="relative flex items-center justify-center mb-8">
              <svg width={220} height={220} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={110} cy={110} r={100} fill="none" stroke="var(--border)" strokeWidth={6} />
                <circle
                  cx={110} cy={110} r={100} fill="none"
                  stroke={color} strokeWidth={6} strokeLinecap="round"
                  strokeDasharray={c}
                  strokeDashoffset={c * (1 - progress)}
                  style={{ transition: state.running ? 'stroke-dashoffset 1s linear' : 'none' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-bold tabular-nums" style={{ fontSize: 48, color: 'var(--text-1)', letterSpacing: '-2px', lineHeight: 1 }}>
                  {mm}:{ss}
                </span>
                <span className="text-sm mt-2" style={{ color: 'var(--text-3)' }}>
                  {state.mode === 'work' ? 'focus' : 'break'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-5">
              <button onClick={actions.reset} className="btn-ghost p-2.5">
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => state.running ? actions.pause() : actions.start()}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-colors"
                style={{ background: color, color: '#fff' }}
              >
                {state.running ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
              </button>
              <div className="flex items-center gap-1 w-10" style={{ color: 'var(--text-3)' }}>
                {state.sessions > 0 && <><Coffee size={14} /><span className="text-sm">{state.sessions}</span></>}
              </div>
            </div>
          </motion.div>

          {/* Right: Stats + recent sessions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smooth, delay: 0.1 }}
            className="space-y-6"
          >
            <PomodoroStats />

            {/* Recent sessions */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--text-3)' }}>
                Recent sessions
              </p>
              {recentSessions.length === 0 && (
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>No completed sessions yet</p>
              )}
              <div className="space-y-2">
                {recentSessions.map(s => (
                  <div
                    key={s._id}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: s.completed ? 'var(--accent)' : 'var(--text-3)' }}
                    />
                    <span className="flex-1 text-xs truncate" style={{ color: 'var(--text-1)' }}>
                      {s.taskTitle || 'Focus session'}
                    </span>
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-3)' }}>
                      {Math.round(s.duration / 60)}m
                    </span>
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-3)' }}>
                      {format(new Date(s.startedAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
