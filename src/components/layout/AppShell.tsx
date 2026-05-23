'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import ArtworkPane from './ArtworkPane'
import { copy } from '@/lib/copy'
import { fade, ease, motionTokens } from '@/lib/motion'
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
        <h1 className="mb-3 text-2xl">{copy.desktopOnly.title}</h1>
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [panelStack, setPanelStack] = useState<string[]>([])

  const { focus } = useFocusState()
  const { tasks, updateTask, deleteTask, createTask } = useTasks()
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

  const handleCreateSubTask = useCallback(
    async (data: Partial<TaskRecord>) => {
      await createTask(data)
    },
    [createTask]
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
      className="relative flex h-screen p-[6px] gap-[6px]"
      style={{ backgroundColor: 'var(--bg-canvas)' }}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[99999] focus:rounded-lg focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
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

      {/* Left: Sidebar — always visible, collapsed or expanded */}
      <motion.div
        animate={{ width: sidebarCollapsed ? 48 : 260 }}
        transition={{ duration: motionTokens.duration.fast, ease: motionTokens.easing.sharp }}
        className="flex-shrink-0 overflow-hidden"
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </motion.div>

      {/* Center: Main content */}
      <main
        id="main-content"
        className="relative flex min-w-[540px] flex-1 flex-col overflow-y-auto rounded-[var(--outer-radius,20px)]"
        style={{
          backgroundColor: 'var(--bg-pane)',
          backgroundImage: 'var(--bg-atmosphere)',
          transition: 'flex 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* No AnimatePresence keyed on pathname — it destroys the React tree
            on every route change, causing webpack chunk errors and React Query
            teardown races. Next.js App Router handles transitions internally. */}
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </main>

      {/* Right: Artwork pane OR Detail panel */}
      <AnimatePresence mode="wait">
        {showDetailPanel ? (
          <motion.div
            key="detail-panel"
            initial={{ flex: '0 0 30%', opacity: 0 }}
            animate={{ flex: '0 0 40%', opacity: 1 }}
            exit={{ flex: '0 0 30%', opacity: 0 }}
            transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.sharp }}
            className="h-full overflow-hidden"
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
              allTasks={tasks}
              onCreateSubTask={handleCreateSubTask}
            />
          </motion.div>
        ) : (
          <motion.div
            key="artwork"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={ease.fast}
            className="h-full"
          >
            <ArtworkPane />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
