/**
 * Task color resolution based on settings (list, tag, or priority mode).
 * Adapted for laif's Task type (uses `_id` and string priority).
 */

import type { TaskRecord } from '@/hooks/useTasks'

/** Priority string -> color mapping for laif's string-based priority field */
const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',    // red
  medium: '#f59e0b',  // amber
  low: '#3b82f6',     // blue
  none: '#6b7280',    // gray
}

const DEFAULT_COLOR = '#6366f1'

export interface ListInfo {
  id: string
  color?: string | null
}

export function getTaskColor(
  task: TaskRecord,
  lists: ListInfo[],
  settings: { taskColorMode: string }
): string {
  switch (settings.taskColorMode) {
    case 'priority':
      return PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS['none'] ?? DEFAULT_COLOR

    case 'tag':
      // Placeholder: fall through to list color until per-task tags are fetched
      return getListColor(task, lists)

    case 'list':
    default:
      return getListColor(task, lists)
  }
}

function getListColor(task: TaskRecord, lists: ListInfo[]): string {
  if (!task.listId) return DEFAULT_COLOR
  const list = lists.find((l) => l.id === task.listId)
  return list?.color ?? DEFAULT_COLOR
}

export { PRIORITY_COLORS, DEFAULT_COLOR }
