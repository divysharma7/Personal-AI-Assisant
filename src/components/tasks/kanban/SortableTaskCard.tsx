'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from '../TaskCard'
import type { TaskRecord } from '@/hooks/useTasks'

interface SortableTaskCardProps {
  task: TaskRecord
  columnId: string
  onToggle: (id: string) => void
  onOpenDetail: (id: string) => void
  labels?: { _id: string; name: string; color?: string }[]
  subTaskCount?: { completed: number; total: number }
}

export function SortableTaskCard({
  task,
  columnId,
  onToggle,
  onOpenDetail,
  labels,
  subTaskCount,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: { type: 'task', task, columnId },
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        isDragging={isDragging}
        onToggle={onToggle}
        onOpenDetail={onOpenDetail}
        labels={labels}
        subTaskCount={subTaskCount}
      />
    </div>
  )
}
