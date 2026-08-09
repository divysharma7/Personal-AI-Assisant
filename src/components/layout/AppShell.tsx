
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback, type ReactNode } from 'react'
import TodaySidebar from './TodaySidebar'
import { motionTokens } from '@/lib/motion'
import { useFocusState } from '@/contexts/FocusContext'
import { useTasks } from '@/hooks/useTasks'
import type { TaskRecord } from '@/hooks/useTasks'
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts'
import DetailPanelStack from '@/components/tasks/DetailPanelStack'
import GlobalTaskComposer, { type GlobalTaskComposerContext } from '@/components/tasks/GlobalTaskComposer'
import TodayTaskContextMenu from '@/components/today/TodayTaskContextMenu'
import { useLists } from '@/hooks/useLists'
import { useWorkflows } from '@/hooks/useWorkflows'
import GlobalCommandPalette from './GlobalCommandPalette'

const SHELL_EXCLUDED = ['/login', '/signup', '/onboarding']

export default function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem('laif-sidebar-collapsed')
      return stored === null ? true : stored === 'true'
    }
    catch { return true }
  })
  const [panelStack, setPanelStack] = useState<string[]>([])
  const [composerOpen, setComposerOpen] = useState(false)
  const [composerContext, setComposerContext] = useState<GlobalTaskComposerContext>({})
  const [taskMenu, setTaskMenu] = useState<{ taskId: string; x: number; y: number } | null>(null)
  const [taskActionStatus, setTaskActionStatus] = useState('')
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [pinnedTaskIds, setPinnedTaskIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('laif-pinned-task-ids') ?? '[]') as string[] }
    catch { return [] }
  })

  const { focus, error: focusError, clearError: clearFocusError } = useFocusState()
  const { tasks, updateTask, deleteTask, createTask } = useTasks()
  const { lists } = useLists()
  const { workflows } = useWorkflows()
  useGlobalShortcuts()

  useEffect(() => {
    try { localStorage.setItem('laif-sidebar-collapsed', String(sidebarCollapsed)) }
    catch { /* ignore */ }
  }, [sidebarCollapsed])

  useEffect(() => {
    try { localStorage.setItem('laif-pinned-task-ids', JSON.stringify(pinnedTaskIds)) }
    catch { /* ignore */ }
  }, [pinnedTaskIds])

  // Close panels when navigating to workflow pages (full-viewport layout)
  useEffect(() => {
    if (pathname.startsWith('/workflows')) {
      setPanelStack([])
      setSidebarCollapsed(true)
    }
  }, [pathname])

  // Task details are route-backed so copied links, refresh, and browser history
  // restore the exact object the user was viewing.
  useEffect(() => {
    const taskId = searchParams.get('task')
    setPanelStack((current) => {
      if (!taskId) return current.length === 0 ? current : []
      return current.length === 1 && current[0] === taskId ? current : [taskId]
    })
  }, [searchParams])

  // Keep the existing event contract for task cards while writing the state to
  // the URL at the shell boundary.
  useEffect(() => {
    function handleDetailTask(e: Event) {
      const customEvent = e as CustomEvent<{ taskId: string | null }>
      const taskId = customEvent.detail?.taskId ?? null
      if (taskId) {
        setPanelStack([taskId])
        setSearchParams((current) => {
          const next = new URLSearchParams(current)
          next.set('task', taskId)
          return next
        })
      } else {
        setPanelStack([])
        setSearchParams((current) => {
          const next = new URLSearchParams(current)
          next.delete('task')
          return next
        })
      }
    }
    window.addEventListener('laif:detail-task', handleDetailTask)
    return () => window.removeEventListener('laif:detail-task', handleDetailTask)
  }, [setSearchParams])

  useEffect(() => {
    const openComposer = (event: Event) => {
      const custom = event as CustomEvent<GlobalTaskComposerContext>
      setComposerContext(custom.detail ?? {})
      setComposerOpen(true)
    }
    window.addEventListener('laif:open-task-composer', openComposer)
    // Compatibility for older page-level triggers while they are migrated.
    window.addEventListener('laif:focus-new-task', openComposer)
    return () => {
      window.removeEventListener('laif:open-task-composer', openComposer)
      window.removeEventListener('laif:focus-new-task', openComposer)
    }
  }, [])

  useEffect(() => {
    const open = () => setCommandPaletteOpen(true)
    window.addEventListener('laif:open-command-palette', open)
    return () => window.removeEventListener('laif:open-command-palette', open)
  }, [])

  useEffect(() => {
    const openTaskMenu = (event: Event) => {
      const custom = event as CustomEvent<{ taskId: string; x: number; y: number }>
      if (!custom.detail?.taskId) return
      setTaskMenu({
        taskId: custom.detail.taskId,
        x: Math.max(8, Math.min(custom.detail.x, window.innerWidth - 408)),
        y: Math.max(8, Math.min(custom.detail.y, window.innerHeight - 510)),
      })
    }
    window.addEventListener('laif:task-command-menu', openTaskMenu)
    return () => window.removeEventListener('laif:task-command-menu', openTaskMenu)
  }, [])

  useEffect(() => {
    if (!taskMenu) return
    const close = () => setTaskMenu(null)
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
    window.addEventListener('click', close)
    window.addEventListener('keydown', closeOnEscape)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('resize', close)
    }
  }, [taskMenu])

  const handleClose = useCallback(() => {
    setPanelStack([])
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('task')
      return next
    })
  }, [setSearchParams])

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

  const handleCreateSubTask = useCallback(
    async (data: Partial<TaskRecord>) => {
      await createTask(data)
    },
    [createTask]
  )

  const handleCreateGlobalTask = useCallback(
    async (data: Partial<TaskRecord>, openDetail: boolean) => {
      const created = await createTask(data)
      setComposerOpen(false)
      if (openDetail) window.dispatchEvent(new CustomEvent('laif:detail-task', { detail: { taskId: created._id } }))
      else setTaskActionStatus(`Created “${created.title}”.`)
    },
    [createTask],
  )

  const runTaskAction = useCallback(async (action: () => Promise<unknown>, success: string) => {
    try {
      await action()
      setTaskActionStatus(success)
    } catch {
      setTaskActionStatus('That task change could not be saved. Please try again.')
    }
  }, [])

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
  // Every authenticated workspace uses the same quiet, compact frame. The
  // 38px rail remains available everywhere and the richer navigation drawer
  // is one click away without permanently taking attention from the work.
  // No shell for auth/onboarding routes
  const noShell = SHELL_EXCLUDED.some((p) => pathname.startsWith(p))
  if (noShell) return <>{children}</>

  // Focus progress percentage (CSS-animated via transition)
  const focusProgress = focus.isActive && focus.totalSeconds > 0
    ? ((focus.totalSeconds - focus.remainingSeconds) / focus.totalSeconds) * 100
    : 0

  return (
    <div
      className="relative flex h-screen gap-0 p-0"
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
        animate={{ width: sidebarCollapsed ? 44 : 249 }}
        transition={{ duration: motionTokens.duration.fast, ease: motionTokens.easing.sharp }}
        className="flex-shrink-0 overflow-hidden"
      >
        <TodaySidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </motion.div>

      {/* Center: Main content */}
      <main
        id="main-content"
        className="relative flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto rounded-none"
        style={{
          backgroundColor: '#19191a',
          backgroundImage: 'none',
          transition: 'flex 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* CSS-only page transition — safe, no React tree destruction */}
        <div key={pathname} className="page-transition-enter flex flex-1 flex-col">
          {children}
        </div>
      </main>

      {/* Task details remain contextual; decorative side art is intentionally
          omitted so every route keeps the user's work as the visual anchor. */}
      {showDetailPanel && (
        <AnimatePresence mode="wait">
          <motion.div
            key="detail-panel"
            initial={{ flex: '0 0 30%', opacity: 0 }}
            animate={{ flex: '0 0 40%', opacity: 1 }}
            exit={{ flex: '0 0 30%', opacity: 0 }}
            transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.sharp }}
            className="fixed inset-y-0 right-0 z-[9000] h-full w-[calc(100%-44px)] max-w-[520px] overflow-hidden shadow-2xl lg:static lg:w-auto lg:max-w-none lg:shadow-none"
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
              allTasks={tasks}
              onCreateSubTask={handleCreateSubTask}
            />
          </motion.div>
        </AnimatePresence>
      )}

      <GlobalTaskComposer
        open={composerOpen}
        context={composerContext}
        onClose={() => setComposerOpen(false)}
        onCreate={handleCreateGlobalTask}
      />

      <GlobalCommandPalette
        open={commandPaletteOpen}
        tasks={tasks}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={navigate}
        onOpenTask={(taskId) => window.dispatchEvent(new CustomEvent('laif:detail-task', { detail: { taskId } }))}
        onCreateTask={() => window.dispatchEvent(new CustomEvent('laif:open-task-composer'))}
      />

      {taskMenu && (() => {
        const task = tasks.find((item) => item._id === taskMenu.taskId)
        if (!task) return null
        const tags = Array.from(new Set(tasks.flatMap((item) => item.tags ?? []))).sort((a, b) => a.localeCompare(b))
        const openTask = (taskId: string) => window.dispatchEvent(new CustomEvent('laif:detail-task', { detail: { taskId } }))
        const copyLink = async () => {
          const url = new URL(window.location.href)
          url.searchParams.set('task', task._id)
          await navigator.clipboard.writeText(url.toString())
        }
        return (
          <div onClick={(event) => event.stopPropagation()}>
            <TodayTaskContextMenu
              task={task}
              position={{ x: taskMenu.x, y: taskMenu.y }}
              lists={lists}
              workflows={workflows}
              allTags={tags}
              pinned={pinnedTaskIds.includes(task._id)}
              onClose={() => setTaskMenu(null)}
              onDateChange={(dueDate) => void runTaskAction(() => updateTask(task._id, { dueDate }), 'Task date updated.')}
              onPriorityChange={(priority) => void runTaskAction(() => updateTask(task._id, { priority: priority ?? 'none' }), 'Task priority updated.')}
              onAddSubtask={() => void runTaskAction(async () => {
                const subtask = await createTask({
                  title: 'New subtask', parentId: task._id, status: 'todo', priority: task.priority,
                  dueDate: task.dueDate, listId: task.listId, workflowId: task.workflowId, sectionId: task.sectionId,
                })
                openTask(subtask._id)
              }, 'Subtask created.')}
              onTogglePin={() => setPinnedTaskIds((current) => current.includes(task._id) ? current.filter((id) => id !== task._id) : [...current, task._id])}
              onWontDo={() => void runTaskAction(() => updateTask(task._id, { status: 'dropped' }), 'Task moved to Won’t Do.')}
              onMoveToList={(listId) => void runTaskAction(() => updateTask(task._id, { listId, workflowId: null, sectionId: null }), 'Task moved.')}
              onMoveToWorkflow={(workflowId, sectionId) => void runTaskAction(() => updateTask(task._id, { workflowId, sectionId, listId: null }), 'Task moved to workflow.')}
              onTagsChange={(nextTags) => void runTaskAction(() => updateTask(task._id, { tags: nextTags }), 'Task tags updated.')}
              onStartFocus={(mode) => window.dispatchEvent(new CustomEvent('laif:start-focus', { detail: { taskId: task._id, taskTitle: task.title, mode, targetType: 'TASK' } }))}
              onDuplicate={() => void runTaskAction(() => createTask({
                title: `${task.title} copy`, description: task.description, status: 'todo', priority: task.priority,
                dueDate: task.dueDate, listId: task.listId, workflowId: task.workflowId, sectionId: task.sectionId,
                tags: task.tags, estimatedEffort: task.estimatedEffort, repeat: task.repeat,
              }), 'Task duplicated.')}
              onCopyLink={() => void runTaskAction(copyLink, 'Task link copied.')}
              onConvertToNote={() => {
                void runTaskAction(() => updateTask(task._id, {
                  notes: task.notes ?? { type: 'doc', content: [{ type: 'paragraph' }] },
                  tags: Array.from(new Set([...(task.tags ?? []), 'note'])),
                }), 'Task converted to a note.')
                openTask(task._id)
              }}
              onDelete={() => {
                if (!window.confirm(`Delete “${task.title}”?`)) return
                void runTaskAction(() => deleteTask(task._id), 'Task deleted.')
              }}
            />
          </div>
        )
      })()}

      <p className="sr-only" role="status" aria-live="polite">{taskActionStatus}</p>

      {focusError && (
        <div role="alert" className="fixed bottom-4 left-1/2 z-[10000] flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl" style={{ backgroundColor: 'var(--bg-pane-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
          <span>{focusError}</span>
          <button type="button" onClick={clearFocusError} className="min-h-10 rounded-lg px-3 text-xs font-semibold" style={{ color: 'var(--accent)' }}>Dismiss</button>
        </div>
      )}
    </div>
  )
}
