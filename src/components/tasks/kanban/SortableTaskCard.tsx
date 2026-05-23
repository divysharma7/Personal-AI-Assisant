'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from '../TaskCard'
import type { TaskRecord } from '@/hooks/useTasks'

interface SortableTaskCardProps {
  task: TaskRecord
  columnId: string
  onToggle: (id: string) => void
  onOpenDetail: (id: string) => void
  subTaskCount?: { completed: number; total: number }
}

function SortableTaskCardInner({
  task,
  columnId,
  onToggle,
  onOpenDetail,
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
        subTaskCount={subTaskCount}
      />
    </div>
  )
}

export const SortableTaskCard = React.memo(SortableTaskCardInner)
