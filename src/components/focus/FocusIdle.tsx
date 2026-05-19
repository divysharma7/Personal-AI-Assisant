'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Clock, Play } from 'lucide-react'
import { fade, fadeSlideUp, ease, buttonPress, spring } from '@/lib/motion'
import type { FocusTheme } from './FocusClock'

interface MockTask {
  _id: string
  title: string
  listName?: string
}

interface FocusIdleProps {
  onStartSession: (taskId: string | null, durationMinutes: number) => void
  theme: FocusTheme
}

// Mock tasks — will be wired to useTasks after merge
const mockTasks: MockTask[] = [
  { _id: '1', title: 'Review pull requests', listName: 'Work' },
  { _id: '2', title: 'Write documentation', listName: 'Work' },
  { _id: '3', title: 'Design homepage wireframes', listName: 'Design' },
  { _id: '4', title: 'Study React patterns', listName: 'Learning' },
  { _id: '5', title: 'Plan weekly goals', listName: 'Personal' },
]

const durations = [15, 25, 30, 45, 60]

export default function FocusIdle({ onStartSession, theme }: FocusIdleProps) {
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<MockTask | null>(null)
  const [selectedDuration, setSelectedDuration] = useState(25)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredTasks = useMemo(() => {
    if (!search.trim()) return mockTasks
    const q = search.toLowerCase()
    return mockTasks.filter((t) => t.title.toLowerCase().includes(q))
  }, [search])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const themeColors = {
    aurora: { circle: 'rgba(124, 58, 237, 0.3)', text: '#c084fc' },
    minimal: { circle: 'rgba(255, 255, 255, 0.1)', text: 'rgba(255, 255, 255, 0.6)' },
    liquid: { circle: 'rgba(249, 115, 22, 0.3)', text: '#f97316' },
  }

  const colors = themeColors[theme]

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
      {/* Ghost clock with slow pulse */}
      <motion.div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 280,
          height: 280,
          border: '1px solid rgba(255, 255, 255, 0.06)',
          background: `radial-gradient(circle, ${colors.circle}, transparent 70%)`,
          opacity: 0.3,
        }}
        animate={{
          scale: [1, 1.03, 1],
          opacity: [0.25, 0.35, 0.25],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Clock size={64} strokeWidth={0.8} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
      </motion.div>

      {/* Prompt text */}
      <motion.p
        {...fadeSlideUp}
        transition={ease.slow}
        className="text-lg font-medium"
        style={{ color: 'rgba(255, 255, 255, 0.5)' }}
      >
        Pick a task to focus on
      </motion.p>

      {/* Task search dropdown */}
      <div className="relative w-full max-w-sm" ref={dropdownRef}>
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-150"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Search size={16} strokeWidth={1.5} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
          <input
            ref={inputRef}
            type="text"
            value={selectedTask ? selectedTask.title : search}
            onChange={(e) => {
              setSearch(e.target.value)
              setSelectedTask(null)
              setDropdownOpen(true)
            }}
            onFocus={() => setDropdownOpen(true)}
            placeholder="Search tasks..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
          />
        </div>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              {...fade}
              transition={ease.fast}
              className="absolute left-0 right-0 top-full mt-2 rounded-xl py-2 z-20"
              style={{
                backgroundColor: 'rgba(20, 20, 30, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                maxHeight: 240,
                overflowY: 'auto',
              }}
            >
              {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center gap-1 px-4 py-4">
                  <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                    No tasks yet — start a free session
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <button
                    key={task._id}
                    onClick={() => {
                      setSelectedTask(task)
                      setSearch('')
                      setDropdownOpen(false)
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 cursor-pointer"
                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <div
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colors.text }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm">{task.title}</span>
                      {task.listName && (
                        <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                          {task.listName}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Duration picker */}
      <div className="flex items-center gap-2">
        {durations.map((d) => (
          <motion.button
            key={d}
            {...buttonPress}
            onClick={() => setSelectedDuration(d)}
            className="rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors duration-150"
            style={{
              backgroundColor: selectedDuration === d ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              color: selectedDuration === d ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.45)',
              border: selectedDuration === d ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
            }}
          >
            {d}m
          </motion.button>
        ))}
      </div>

      {/* Start buttons */}
      <div className="flex flex-col items-center gap-3">
        <motion.button
          {...buttonPress}
          onClick={() => onStartSession(selectedTask?._id ?? null, selectedDuration)}
          className="flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold cursor-pointer transition-opacity duration-150"
          style={{
            backgroundColor: 'var(--accent, #FF4D3D)',
            color: '#ffffff',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          <Play size={16} strokeWidth={2} />
          {selectedTask ? 'Start focus session' : 'Start a free session'}
        </motion.button>
      </div>
    </div>
  )
}
