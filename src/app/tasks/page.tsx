import TaskWorkspace from '@/components/today/TaskWorkspace'

/**
 * Keep the all-tasks route on the proven workspace until the replacement
 * screen implements every exposed action and has full-stack coverage.
 */
export default function TasksPage() {
  return <TaskWorkspace range="all" />
}
