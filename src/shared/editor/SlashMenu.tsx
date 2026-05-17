'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Extension } from '@tiptap/core'
import { ReactRenderer } from '@tiptap/react'
import type { Editor } from '@tiptap/core'
import { motion, AnimatePresence } from 'framer-motion'
import { snappy } from '@/shared/design-system/motion'
import {
  Heading1,
  Heading2,
  List,
  ListOrdered,
  CheckSquare,
  Code2,
  Minus,
  Quote,
} from 'lucide-react'

// ── Menu item definitions ────────────────────────────────────────────────────

interface SlashMenuItem {
  title: string
  description: string
  icon: React.ReactNode
  command: (editor: Editor) => void
}

const SLASH_ITEMS: SlashMenuItem[] = [
  {
    title: 'Heading 1',
    description: 'Large heading',
    icon: <Heading1 size={18} />,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    description: 'Medium heading',
    icon: <Heading2 size={18} />,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: 'Bullet List',
    description: 'Unordered list',
    icon: <List size={18} />,
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: 'Numbered List',
    description: 'Ordered list',
    icon: <ListOrdered size={18} />,
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: 'Task List',
    description: 'Checklist with checkboxes',
    icon: <CheckSquare size={18} />,
    command: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    title: 'Code Block',
    description: 'Fenced code block',
    icon: <Code2 size={18} />,
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: 'Divider',
    description: 'Horizontal rule',
    icon: <Minus size={18} />,
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    title: 'Quote',
    description: 'Blockquote',
    icon: <Quote size={18} />,
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
]

// ── Slash menu popup component ──────────────────────────────────────────────

interface SlashMenuPopupProps {
  editor: Editor
  query: string
  onClose: () => void
  position: { top: number; left: number }
}

function SlashMenuPopup({ editor, query, onClose, position }: SlashMenuPopupProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const filteredItems = useMemo(() => {
    if (!query) return SLASH_ITEMS
    const lower = query.toLowerCase()
    return SLASH_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower)
    )
  }, [query])

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredItems.length])

  const selectItem = useCallback(
    (index: number) => {
      const item = filteredItems[index]
      if (item) {
        item.command(editor)
        onClose()
      }
    },
    [filteredItems, editor, onClose]
  )

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        selectItem(selectedIndex)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [filteredItems.length, selectedIndex, selectItem, onClose])

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  if (filteredItems.length === 0) {
    return null
  }

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: 4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.98 }}
      transition={snappy}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 9999,
      }}
      className="slash-menu-popup"
    >
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '4px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          minWidth: 200,
          maxWidth: 260,
          maxHeight: 320,
          overflowY: 'auto',
        }}
      >
        {filteredItems.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              selectItem(index)
            }}
            onMouseEnter={() => setSelectedIndex(index)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '8px 10px',
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              background: index === selectedIndex ? 'var(--input-bg)' : 'transparent',
              color: 'var(--text-1)',
              fontSize: '0.85rem',
              textAlign: 'left',
              transition: 'background 0.1s',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                borderRadius: 6,
                background: 'var(--input-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-2)',
                flexShrink: 0,
              }}
            >
              {item.icon}
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontWeight: 500, color: 'var(--text-1)' }}>
                {item.title}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                {item.description}
              </span>
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

// ── Slash commands hook ─────────────────────────────────────────────────────

interface SlashCommandState {
  active: boolean
  query: string
  position: { top: number; left: number }
  range: { from: number; to: number } | null
}

export function useSlashCommands(editor: Editor | null) {
  const [state, setState] = useState<SlashCommandState>({
    active: false,
    query: '',
    position: { top: 0, left: 0 },
    range: null,
  })

  const close = useCallback(() => {
    setState({ active: false, query: '', position: { top: 0, left: 0 }, range: null })
  }, [])

  // Watch for slash character
  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      const { state: editorState } = editor.view
      const { from } = editorState.selection
      const textBefore = editorState.doc.textBetween(
        Math.max(0, from - 50),
        from,
        '\n'
      )

      // Find the last `/` that is either at the start of a line or after a space
      const match = textBefore.match(/(?:^|[ \n])\/([a-zA-Z]*)$/)

      if (match) {
        const query = match[1] || ''
        const slashPos = from - query.length - 1 // position of the `/`

        // Get cursor position for floating menu
        const coords = editor.view.coordsAtPos(from)
        const editorRect = editor.view.dom.getBoundingClientRect()

        setState({
          active: true,
          query,
          position: {
            top: coords.bottom + 4,
            left: Math.min(coords.left, editorRect.right - 270),
          },
          range: { from: slashPos, to: from },
        })
      } else {
        if (state.active) {
          close()
        }
      }
    }

    editor.on('update', handleUpdate)
    editor.on('selectionUpdate', handleUpdate)

    return () => {
      editor.off('update', handleUpdate)
      editor.off('selectionUpdate', handleUpdate)
    }
  }, [editor, state.active, close])

  const handleClose = useCallback(() => {
    if (editor && state.range) {
      // Delete the slash + query text
      editor.chain().focus().deleteRange(state.range).run()
    }
    close()
  }, [editor, state.range, close])

  const handleSelect = useCallback(() => {
    if (editor && state.range) {
      // Delete the slash + query text before executing the command
      editor.chain().focus().deleteRange(state.range).run()
    }
    close()
  }, [editor, state.range, close])

  return { state, handleClose, handleSelect }
}

// ── Rendered slash menu ─────────────────────────────────────────────────────

interface SlashMenuProps {
  editor: Editor
  state: SlashCommandState
  onClose: () => void
}

export default function SlashMenu({ editor, state, onClose }: SlashMenuProps) {
  const handleClose = useCallback(() => {
    // Delete the slash + query text before closing
    if (state.range) {
      editor.chain().focus().deleteRange(state.range).run()
    }
    onClose()
  }, [editor, state.range, onClose])

  const handleItemSelect = useCallback(
    (item: SlashMenuItem) => {
      if (state.range) {
        editor.chain().focus().deleteRange(state.range).run()
      }
      // Small timeout to ensure the deletion completes first
      setTimeout(() => {
        item.command(editor)
      }, 0)
      onClose()
    },
    [editor, state.range, onClose]
  )

  return (
    <AnimatePresence>
      {state.active && (
        <SlashMenuInner
          editor={editor}
          query={state.query}
          onClose={handleClose}
          onItemSelect={handleItemSelect}
          position={state.position}
        />
      )}
    </AnimatePresence>
  )
}

// Inner component that handles item selection with deletion
function SlashMenuInner({
  editor,
  query,
  onClose,
  onItemSelect,
  position,
}: {
  editor: Editor
  query: string
  onClose: () => void
  onItemSelect: (item: SlashMenuItem) => void
  position: { top: number; left: number }
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const filteredItems = useMemo(() => {
    if (!query) return SLASH_ITEMS
    const lower = query.toLowerCase()
    return SLASH_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower)
    )
  }, [query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredItems.length])

  const selectItem = useCallback(
    (index: number) => {
      const item = filteredItems[index]
      if (item) {
        onItemSelect(item)
      }
    },
    [filteredItems, onItemSelect]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        selectItem(selectedIndex)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [filteredItems.length, selectedIndex, selectItem, onClose])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  if (filteredItems.length === 0) {
    return null
  }

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: 4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.98 }}
      transition={snappy}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '4px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          minWidth: 200,
          maxWidth: 260,
          maxHeight: 320,
          overflowY: 'auto',
        }}
      >
        {filteredItems.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              selectItem(index)
            }}
            onMouseEnter={() => setSelectedIndex(index)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '8px 10px',
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              background: index === selectedIndex ? 'var(--input-bg)' : 'transparent',
              color: 'var(--text-1)',
              fontSize: '0.85rem',
              textAlign: 'left',
              transition: 'background 0.1s',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                borderRadius: 6,
                background: 'var(--input-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-2)',
                flexShrink: 0,
              }}
            >
              {item.icon}
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontWeight: 500, color: 'var(--text-1)' }}>
                {item.title}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                {item.description}
              </span>
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

export { SLASH_ITEMS }
export type { SlashMenuItem, SlashCommandState }
