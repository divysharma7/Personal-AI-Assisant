'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Plus,
  ChevronDown,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Palette,
  GripVertical,
} from 'lucide-react'
import { ease, motionTokens } from '@/lib/motion'

const PRESET_COLORS = [
  '#5DA8FF', '#6b66da', '#34d399', '#f59e0b',
  '#ec4899', '#ef4444', '#8b5cf6', '#06b6d4',
  '#84cc16', '#f97316', '#14b8a6', '#a855f7',
]

// -- Color Picker Dropdown --
function ColorPicker({
  currentColor,
  onSelect,
  onClose,
}: {
  currentColor: string
  onSelect: (color: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={ease.fast}
      style={{
        position: 'absolute',
        left: 24,
        top: -4,
        zIndex: 100,
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'var(--bg-pane)',
        border: '1px solid var(--overlay-2, var(--border))',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 6,
        width: 140,
      }}
    >
      {PRESET_COLORS.map((color) => (
        <button
          key={color}
          onClick={() => { onSelect(color); onClose() }}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            backgroundColor: color,
            border: currentColor === color ? '2px solid var(--text-primary)' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'transform 100ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        />
      ))}
    </motion.div>
  )
}

// -- Context Menu --
function ContextMenu({
  x,
  y,
  listId,
  listName,
  onRename,
  onChangeColor,
  onHide,
  onDelete,
  onClose,
}: {
  x: number
  y: number
  listId: string
  listName: string
  onRename: (id: string) => void
  onChangeColor: (id: string) => void
  onHide: (id: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const items = [
    { icon: <Pencil size={13} strokeWidth={1.5} />, label: 'Rename', action: () => onRename(listId) },
    { icon: <Palette size={13} strokeWidth={1.5} />, label: 'Change Color', action: () => onChangeColor(listId) },
    { icon: <EyeOff size={13} strokeWidth={1.5} />, label: 'Hide', action: () => onHide(listId) },
    { icon: <Trash2 size={13} strokeWidth={1.5} />, label: 'Delete', action: () => onDelete(listId), color: '#ef4444' },
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={ease.fast}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 200,
        minWidth: 160,
        padding: 4,
        borderRadius: 12,
        backgroundColor: 'var(--bg-pane)',
        border: '1px solid var(--overlay-2, var(--border))',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => { item.action(); onClose() }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: '6px 10px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            color: item.color || 'var(--text-primary)',
            fontSize: 13,
            fontWeight: 500,
            transition: 'background-color 100ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <span style={{ color: item.color || 'var(--text-muted)', display: 'flex' }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </motion.div>
  )
}

// -- Section Header --
function SectionHeader({ label, expanded, onToggle, trailing }: { label: string; expanded: boolean; onToggle: () => void; trailing?: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 10px 4px',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 0,
          color: 'var(--text-muted)',
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <motion.span
          animate={{ rotate: expanded ? 0 : -90 }}
          transition={{ duration: motionTokens.duration.fast }}
          style={{ display: 'flex' }}
        >
          <ChevronDown size={12} strokeWidth={2} />
        </motion.span>
        {label}
      </button>
      {trailing}
    </div>
  )
}

interface ListFilterPanelProps {
  lists: { id: string; name: string; color: string; visible: boolean }[]
  onToggleList?: (id: string) => void
}

export default function ListFilterPanel({ lists, onToggleList }: ListFilterPanelProps) {
  const [calendarsExpanded, setCalendarsExpanded] = useState(true)
  const [hiddenExpanded, setHiddenExpanded] = useState(false)
  const [colorPickerListId, setColorPickerListId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; listId: string; listName: string } | null>(null)
  const [draggedListId, setDraggedListId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const handleListContextMenu = useCallback((e: React.MouseEvent, listId: string, listName: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, listId, listName })
  }, [])

  const handleListColorChange = useCallback((_listId: string, _color: string) => {
    window.dispatchEvent(new CustomEvent('laif:list-color-change', { detail: { listId: _listId, color: _color } }))
  }, [])

  const handleDragStart = useCallback((listId: string) => {
    setDraggedListId(listId)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, listId: string) => {
    e.preventDefault()
    setDragOverId(listId)
  }, [])

  const handleDrop = useCallback((targetId: string) => {
    if (draggedListId && draggedListId !== targetId) {
      window.dispatchEvent(new CustomEvent('laif:list-reorder', { detail: { fromId: draggedListId, toId: targetId } }))
    }
    setDraggedListId(null)
    setDragOverId(null)
  }, [draggedListId])

  const handleDragEnd = useCallback(() => {
    setDraggedListId(null)
    setDragOverId(null)
  }, [])

  const visibleLists = lists.filter((l) => l.visible)
  const hiddenLists = lists.filter((l) => !l.visible)

  return (
    <>
      {/* Calendars / Lists Section */}
      <SectionHeader
        label="Calendars"
        expanded={calendarsExpanded}
        onToggle={() => setCalendarsExpanded((v) => !v)}
        trailing={
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('laif:create-list'))}
            title="New calendar"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 20, height: 20, borderRadius: 4, cursor: 'pointer',
              backgroundColor: 'transparent', border: 'none',
              color: 'var(--text-faint)',
              transition: 'background-color 150ms ease, color 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)' }}
          >
            <Plus size={13} strokeWidth={2} />
          </button>
        }
      />
      <AnimatePresence>
        {calendarsExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.sharp }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* All */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '5px 10px', borderRadius: 8,
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  All
                </span>
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 16, height: 16, borderRadius: 4,
                  backgroundColor: 'var(--accent)',
                }}>
                  <Check size={10} strokeWidth={2.5} color="#fff" />
                </span>
              </div>

              {/* Visible lists */}
              {visibleLists.map((list) => (
                <div
                  key={list.id}
                  draggable
                  onDragStart={() => handleDragStart(list.id)}
                  onDragOver={(e) => handleDragOver(e, list.id)}
                  onDrop={() => handleDrop(list.id)}
                  onDragEnd={handleDragEnd}
                  onContextMenu={(e) => handleListContextMenu(e, list.id, list.name)}
                  style={{
                    position: 'relative',
                    borderRadius: 8,
                    border: dragOverId === list.id ? '1px dashed var(--accent)' : '1px solid transparent',
                    opacity: draggedListId === list.id ? 0.5 : 1,
                    transition: 'opacity 150ms ease, border-color 150ms ease',
                  }}
                >
                  <button
                    onClick={() => onToggleList?.(list.id)}
                    style={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                      gap: 8,
                      padding: '5px 10px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      transition: 'background-color 100ms ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    {/* Drag handle */}
                    <span style={{ color: 'var(--text-faint)', opacity: 0.5, display: 'flex', cursor: 'grab' }}>
                      <GripVertical size={11} strokeWidth={1.5} />
                    </span>

                    {/* Color dot with color picker */}
                    <span
                      onClick={(e) => { e.stopPropagation(); setColorPickerListId(colorPickerListId === list.id ? null : list.id) }}
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        backgroundColor: list.color,
                        flexShrink: 0,
                        cursor: 'pointer',
                        transition: 'transform 100ms ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                    />

                    <span style={{ flex: 1, textAlign: 'left', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {list.name}
                    </span>

                    <span style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      backgroundColor: list.visible ? 'var(--accent)' : 'transparent',
                      border: list.visible ? 'none' : '1.5px solid var(--overlay-3, var(--text-faint))',
                    }}>
                      {list.visible && <Check size={10} strokeWidth={2.5} color="#fff" />}
                    </span>
                  </button>

                  {/* Color picker popover */}
                  <AnimatePresence>
                    {colorPickerListId === list.id && (
                      <ColorPicker
                        currentColor={list.color}
                        onSelect={(color) => handleListColorChange(list.id, color)}
                        onClose={() => setColorPickerListId(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Calendars Section */}
      {hiddenLists.length > 0 && (
        <>
          <div style={{ margin: '6px 10px', height: 1, backgroundColor: 'var(--border)' }} />
          <SectionHeader
            label={`Hidden (${hiddenLists.length})`}
            expanded={hiddenExpanded}
            onToggle={() => setHiddenExpanded((v) => !v)}
          />
          <AnimatePresence>
            {hiddenExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.sharp }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {hiddenLists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => onToggleList?.(list.id)}
                      style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        gap: 8,
                        padding: '5px 10px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'var(--text-faint)',
                        fontSize: 13,
                        transition: 'background-color 100ms ease, color 100ms ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'; e.currentTarget.style.color = 'var(--text-muted)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)' }}
                    >
                      <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: list.color, flexShrink: 0, opacity: 0.4 }} />
                      <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {list.name}
                      </span>
                      <Eye size={13} strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            listId={contextMenu.listId}
            listName={contextMenu.listName}
            onRename={(id) => window.dispatchEvent(new CustomEvent('laif:rename-list', { detail: { listId: id } }))}
            onChangeColor={(id) => { setColorPickerListId(id); setContextMenu(null) }}
            onHide={(id) => onToggleList?.(id)}
            onDelete={(id) => window.dispatchEvent(new CustomEvent('laif:delete-list', { detail: { listId: id } }))}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
