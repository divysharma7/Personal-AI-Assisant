'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import ArtworkPane from './ArtworkPane'
import { copy } from '@/lib/copy'
import { fade, ease } from '@/lib/motion'
import { useFocusState } from '@/contexts/FocusContext'
import { useTasks } from '@/hooks/useTasks'
import { useLabels } from '@/hooks/useLabels'
import type { TaskRecord } from '@/hooks/useTasks'
import DetailPanelStack from '@/components/tasks/DetailPanelStack'

const SHELL_EXCLUDED = ['/login', '/signup', '/onboarding']

function DesktopOnlyNotice() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}
    >
      <motion.div
        {...fade}
        transition={ease.slow}
        className="rounded-2xl p-8"
        style={{ backgroundColor: 'var(--bg-pane)', maxWidth: 400 }}
      >
        <h1 className="mb-3 text-2xl font-bold">{copy.desktopOnly.title}</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {copy.desktopOnly.body}
        </p>
      </motion.div>
    </div>
  )
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isDesktop, setIsDesktop] = useState(true)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [panelStack, setPanelStack] = useState<string[]>([])

  const { focus } = useFocusState()
  const { tasks, updateTask, deleteTask } = useTasks()
  const { labels, createLabel } = useLabels()

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Listen for detail-task events from InboxPage
  useEffect(() => {
    function handleDetailTask(e: Event) {
      const customEvent = e as CustomEvent<{ taskId: string | null }>
      const taskId = customEvent.detail?.taskId ?? null
      if (taskId) {
        setDetailTaskId(taskId)
        setPanelStack([taskId])
      } else {
        setDetailTaskId(null)
        setPanelStack([])
      }
    }
    window.addEventListener('laif:detail-task', handleDetailTask)
    return () => window.removeEventListener('laif:detail-task', handleDetailTask)
  }, [])

  const handleClose = useCallback(() => {
    setDetailTaskId(null)
    setPanelStack([])
    // Notify the page
    window.dispatchEvent(
      new CustomEvent('laif:detail-task', { detail: { taskId: null } })
    )
  }, [])

  const handlePushTask = useCallback(
    (taskId: string) => {
      setPanelStack((prev) => [...prev, taskId])
    },
    []
  )

  const handlePopTask = useCallback(() => {
    setPanelStack((prev) => {
      if (prev.length <= 1) {
        handleClose()
        return []
      }
      return prev.slice(0, -1)
    })
  }, [handleClose])

  const handlePopToIndex = useCallback(
    (index: number) => {
      setPanelStack((prev) => {
        if (index < 0 || index >= prev.length) return prev
        return prev.slice(0, index + 1)
      })
    },
    []
  )

  const handleUpdateTask = useCallback(
    async (id: string, data: Partial<TaskRecord>) => {
      await updateTask(id, data)
    },
    [updateTask]
  )

  const handleDeleteTask = useCallback(
    async (id: string) => {
      await deleteTask(id)
      handleClose()
    },
    [deleteTask, handleClose]
  )

  const handleAddComment = useCallback(
    async (taskId: string, text: string) => {
      const task = tasks.find((t) => t._id === taskId)
      if (!task) return
      const newComment = {
        text,
        createdAt: new Date().toISOString(),
        authorName: 'You',
      }
      await updateTask(taskId, {
        comments: [...(task.comments || []), newComment],
      })
    },
    [tasks, updateTask]
  )

  const handleCreateLabel = useCallback(
    async (name: string) => {
      await createLabel(name)
    },
    [createLabel]
  )

  // Build stack entries from task IDs
  const stackEntries = panelStack
    .map((taskId) => {
      const task = tasks.find((t) => t._id === taskId)
      if (!task) return null
      return {
        task,
        comments: task.comments || [],
      }
    })
    .filter(Boolean) as { task: TaskRecord; comments: TaskRecord['comments'] }[]

  const showDetailPanel = stackEntries.length > 0

  // No shell for auth/onboarding routes
  const noShell = SHELL_EXCLUDED.some((p) => pathname.startsWith(p))
  if (noShell) return <>{children}</>

  // Small viewport notice
  if (!isDesktop) return <DesktopOnlyNotice />

  // Focus progress percentage (CSS-animated via transition)
  const focusProgress = focus.isActive && focus.totalSeconds > 0
    ? ((focus.totalSeconds - focus.remainingSeconds) / focus.totalSeconds) * 100
    : 0

  return (
    <div
      className="relative flex h-screen p-[3px]"
      style={{ backgroundColor: 'var(--bg-canvas)' }}
    >
      {/* Top progress hairline — visible during active focus */}
      {focus.isActive && (
        <div
          className="absolute left-0 top-0 z-[9999] h-[2px]"
          style={{
            width: `${focusProgress}%`,
            transition: 'width 1s linear',
            background: 'linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 60%, white))',
            backgroundSize: '200% 100%',
            animation: 'focusHairlineShimmer 2s linear infinite',
          }}
        />
      )}

      {/* Left: Sidebar */}
      <Sidebar />

      {/* Gap */}
      <div className="w-[1px] flex-shrink-0" />

      {/* Center: Main content */}
      <main
        className="flex min-w-[540px] flex-1 flex-col overflow-y-auto rounded-[16px]"
        style={{ backgroundColor: 'var(--bg-pane)' }}
      >
        {children}
      </main>

      {/* Gap */}
      <div className="w-[1px] flex-shrink-0" />

      {/* Right: Artwork pane OR Detail panel */}
      <AnimatePresence mode="wait">
        {showDetailPanel ? (
          <motion.div
            key="detail-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={ease.fast}
            className="flex-shrink-0"
          >
            <DetailPanelStack
              stack={stackEntries}
              onPushTask={handlePushTask}
              onPopTask={handlePopTask}
              onPopToIndex={handlePopToIndex}
              onClose={handleClose}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
              onAddComment={handleAddComment}
              labels={labels}
              allLabels={labels}
              onCreateLabel={handleCreateLabel}
            />
          </motion.div>
        ) : (
          <motion.div
            key="artwork"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={ease.fast}
          >
            <ArtworkPane />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
