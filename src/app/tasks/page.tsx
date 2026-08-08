import TaskWorkspace from '@/components/today/TaskWorkspace'

/**
 * The all-tasks route intentionally uses the same workspace as Today and
 * Next 7 Days. This keeps completion, detail opening, right-click workflows,
 * focus, moving, view options, and keyboard behavior consistent everywhere.
 */
export default function TasksPage() {
  return <TaskWorkspace range="all" />
}
