'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Plus } from 'lucide-react'
import { copy } from '@/lib/copy'
import { buttonPress, fade, ease } from '@/lib/motion'

interface LabelsTabProps {
  labels: { _id: string; name: string }[]
  onCreateLabel: (name: string) => Promise<unknown>
  onDeleteLabel: (id: string) => Promise<void>
}

export default function LabelsTab({ labels, onCreateLabel, onDeleteLabel }: LabelsTabProps) {
  const [newLabelName, setNewLabelName] = useState('')

  const handleCreateLabel = useCallback(async () => {
    const name = newLabelName.trim()
    if (!name) return
    await onCreateLabel(name)
    setNewLabelName('')
  }, [newLabelName, onCreateLabel])

  return (
    <motion.div key="labels" {...fade} transition={ease.normal} className="flex flex-col gap-4">
      {/* Create new label */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newLabelName}
          onChange={(e) => setNewLabelName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreateLabel()
          }}
          placeholder={copy.settings.labels.createPlaceholder}
          aria-label="New label name"
          className="input-field flex-1"
        />
        <motion.button
          {...buttonPress}
          onClick={handleCreateLabel}
          className="flex items-center gap-1 rounded-full px-3 py-2.5 text-xs font-semibold text-white cursor-pointer"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <Plus size={14} strokeWidth={2} />
          {copy.settings.labels.createCta}
        </motion.button>
      </div>

      {/* Label list */}
      <div className="flex flex-col gap-1">
        {labels.map((label) => (
          <div
            key={label._id}
            className="flex items-center justify-between rounded-lg px-3 py-2"
            style={{ backgroundColor: 'var(--bg-pane-2)' }}
          >
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {label.name}
            </span>
            <button
              onClick={() => onDeleteLabel(label._id)}
              aria-label={`Delete ${label.name}`}
              className="flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
              style={{ color: 'var(--text-faint)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--priority-high)'
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-faint)'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Trash2 size={14} strokeWidth={1.5} />
            </button>
          </div>
        ))}
        {labels.length === 0 && (
          <p className="py-4 text-sm" style={{ color: 'var(--text-faint)' }}>
            {copy.settings.labels.emptyState}
          </p>
        )}
      </div>
    </motion.div>
  )
}
