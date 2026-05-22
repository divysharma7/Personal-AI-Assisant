'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { scaleIn, buttonPress, ease, cssTransition } from '@/lib/motion'
import { copy } from '@/lib/copy'
import { useLabels } from '@/hooks/useLabels'
import { useWorkflows } from '@/hooks/useWorkflows'
import { useRouter } from 'next/navigation'

const PRESET_COLORS = [
  '#5DA8FF', '#6b66da', '#34d399', '#f59e0b',
  '#ec4899', '#ef4444', '#8b5cf6', '#06b6d4',
  '#84cc16', '#f97316', '#14b8a6', '#a855f7',
]

const EMOJI_GRID = [
  '\uD83D\uDCCB', '\uD83D\uDE80', '\uD83D\uDCE6', '\uD83C\uDFAF',
  '\uD83D\uDD25', '\uD83D\uDCA1', '\u2705', '\uD83D\uDCC8',
  '\uD83D\uDEE0\uFE0F', '\uD83C\uDF1F', '\uD83D\uDCDD', '\uD83E\uDDE9',
  '\uD83C\uDFC6', '\uD83D\uDCA0', '\uD83D\uDCDA', '\u26A1',
  '\uD83C\uDF31', '\uD83D\uDD2E', '\uD83C\uDFA8', '\uD83E\uDD16',
]

type TemplateType = 'kanban' | 'sprint' | 'sales' | 'content' | 'matrix' | 'custom'

const TEMPLATES: { type: TemplateType; icon: string; dots: string[] }[] = [
  { type: 'kanban',  icon: '\uD83D\uDCCB', dots: ['#5DA8FF', '#f59e0b', '#34d399'] },
  { type: 'sprint',  icon: '\uD83D\uDE80', dots: ['#8b5cf6', '#5DA8FF', '#f59e0b', '#34d399'] },
  { type: 'sales',   icon: '\uD83D\uDCB0', dots: ['#ec4899', '#f97316', '#5DA8FF', '#34d399'] },
  { type: 'content', icon: '\uD83D\uDCDD', dots: ['#a855f7', '#5DA8FF', '#f59e0b', '#34d399'] },
  { type: 'matrix',  icon: '\uD83C\uDFAF', dots: ['#ef4444', '#f59e0b'] },
  { type: 'custom',  icon: '\u2699\uFE0F', dots: [] },
]

interface CreateWorkflowDialogProps {
  open: boolean
  onClose: () => void
}

export default function CreateWorkflowDialog({ open, onClose }: CreateWorkflowDialogProps) {
  const router = useRouter()
  const { labels } = useLabels()
  const { createWorkflow } = useWorkflows()

  const [name, setName] = useState('')
  const [icon, setIcon] = useState(EMOJI_GRID[0])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('kanban')
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setName('')
      setIcon(EMOJI_GRID[0])
      setShowEmojiPicker(false)
      setSelectedTemplate('kanban')
      setSelectedLabelIds([])
      setSelectedColor(PRESET_COLORS[0])
    }
  }, [open])

  // Escape to close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const toggleLabel = useCallback((labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    )
  }, [])

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return
    const result = await createWorkflow({
      name: name.trim(),
      icon,
      color: selectedColor,
      templateType: selectedTemplate,
      labelIds: selectedLabelIds,
    })
    onClose()
    if (result?._id) {
      router.push(`/workflows/${result._id}`)
    }
  }, [name, icon, selectedColor, selectedTemplate, selectedLabelIds, createWorkflow, onClose, router])

  const wfCopy = copy.workflows
  const tplCopy = wfCopy.templates

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={ease.fast}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
          onClick={onClose}
        >
          <motion.div
            {...scaleIn}
            transition={ease.normal}
            style={{
              width: 480,
              maxWidth: '95vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: 16,
              backgroundColor: 'var(--bg-pane)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-modal, 0 8px 32px rgba(0,0,0,0.12))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {wfCopy.createTitle}
              </h2>
              <motion.button
                {...buttonPress}
                onClick={onClose}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-faint)',
                  transition: cssTransition.bg,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <X size={16} strokeWidth={1.5} />
              </motion.button>
            </div>

            {/* ── Body ── */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Section 1: Name + Icon */}
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--overlay-1, var(--bg-hover))',
                      fontSize: 20,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </button>
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={ease.fast}
                        style={{
                          position: 'absolute',
                          top: 50,
                          left: 0,
                          zIndex: 10,
                          display: 'grid',
                          gridTemplateColumns: 'repeat(5, 1fr)',
                          gap: 4,
                          padding: 8,
                          borderRadius: 12,
                          backgroundColor: 'var(--bg-pane)',
                          border: '1px solid var(--border)',
                          boxShadow: 'var(--shadow-elevated, 0 4px 16px rgba(0,0,0,0.12))',
                        }}
                      >
                        {EMOJI_GRID.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setIcon(emoji)
                              setShowEmojiPicker(false)
                            }}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 6,
                              border: 'none',
                              backgroundColor: emoji === icon ? 'var(--accent-soft, rgba(99,102,241,0.15))' : 'transparent',
                              fontSize: 16,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: cssTransition.bg,
                            }}
                            onMouseEnter={(e) => {
                              if (emoji !== icon) e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
                            }}
                            onMouseLeave={(e) => {
                              if (emoji !== icon) e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={wfCopy.namePlaceholder}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate()
                  }}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-pane-2, var(--bg-base))',
                    padding: '0 14px',
                    fontSize: 14,
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Section 2: Template */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
                  {wfCopy.templateLabel}
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8,
                  }}
                >
                  {TEMPLATES.map((tpl) => {
                    const isSelected = selectedTemplate === tpl.type
                    const tplInfo = tplCopy[tpl.type]
                    return (
                      <button
                        key={tpl.type}
                        onClick={() => setSelectedTemplate(tpl.type)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: 6,
                          padding: 12,
                          borderRadius: 10,
                          border: isSelected
                            ? '1.5px solid var(--accent, #6366f1)'
                            : '1px solid var(--border)',
                          backgroundColor: isSelected
                            ? 'var(--accent-soft, rgba(99,102,241,0.08))'
                            : 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: cssTransition.fast,
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{tpl.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {tplInfo.label}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.3 }}>
                          {tplInfo.desc}
                        </span>
                        {tpl.dots.length > 0 && (
                          <div style={{ display: 'flex', gap: 3, marginTop: 2 }}>
                            {tpl.dots.map((dotColor, i) => (
                              <div
                                key={i}
                                style={{
                                  width: 16,
                                  height: 4,
                                  borderRadius: 2,
                                  backgroundColor: dotColor,
                                  opacity: 0.7,
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Section 3: Labels */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 4px 0' }}>
                  {wfCopy.labelsLabel}
                </h3>
                <p style={{ fontSize: 11, color: 'var(--text-faint)', margin: '0 0 10px 0' }}>
                  {wfCopy.labelsHint}
                </p>
                {labels.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {labels.map((label) => {
                      const isActive = selectedLabelIds.includes(label._id)
                      return (
                        <button
                          key={label._id}
                          onClick={() => toggleLabel(label._id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '5px 10px',
                            borderRadius: 16,
                            border: isActive
                              ? '1.5px solid var(--accent, #6366f1)'
                              : '1px solid var(--border)',
                            backgroundColor: isActive
                              ? 'var(--accent-soft, rgba(99,102,241,0.08))'
                              : 'transparent',
                            fontSize: 12,
                            fontWeight: 500,
                            color: isActive ? 'var(--accent, #6366f1)' : 'var(--text-primary)',
                            cursor: 'pointer',
                            transition: cssTransition.fast,
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: label.color || 'var(--text-muted)',
                              flexShrink: 0,
                            }}
                          />
                          {label.name}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>
                    {wfCopy.noLabels}
                  </p>
                )}
              </div>

              {/* Section 4: Color */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
                  {wfCopy.colorLabel}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {PRESET_COLORS.map((color) => {
                    const isActive = selectedColor === color
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: color,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          outline: isActive ? `2px solid var(--accent, #6366f1)` : 'none',
                          outlineOffset: 2,
                          transition: cssTransition.fast,
                        }}
                      >
                        {isActive && <Check size={14} strokeWidth={2.5} color="#fff" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 8,
                padding: '12px 24px',
                borderTop: '1px solid var(--border)',
              }}
            >
              <button
                onClick={onClose}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {wfCopy.cancelCta}
              </button>
              <motion.button
                {...buttonPress}
                onClick={handleCreate}
                disabled={!name.trim()}
                style={{
                  padding: '8px 24px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: 'var(--accent, #6366f1)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: name.trim() ? 'pointer' : 'not-allowed',
                  opacity: name.trim() ? 1 : 0.5,
                }}
              >
                {wfCopy.createCta}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { CreateWorkflowDialog }
