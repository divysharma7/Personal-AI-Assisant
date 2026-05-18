'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import type { Editor } from '@tiptap/core'
import {
  CheckSquare,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  List,
  ListOrdered,
  Image as ImageIcon,
  Paperclip,
  Link2,
  Bold,
  Italic,
  Strikethrough,
  ChevronLeft,
} from 'lucide-react'

// ── Slash menu items (exact order from spec) ────────────────────────────────

interface SlashItem {
  label: string
  icon: React.ReactNode
  command: (editor: Editor) => void
}

const SLASH_ITEMS: SlashItem[] = [
  {
    label: 'Task',
    icon: <CheckSquare size={16} />,
    command: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    label: 'Paragraph',
    icon: <Pilcrow size={16} />,
    command: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    label: 'Heading 1',
    icon: <Heading1 size={16} />,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    label: 'Heading 2',
    icon: <Heading2 size={16} />,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: 'Heading 3',
    icon: <Heading3 size={16} />,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: 'Divider',
    icon: <Minus size={16} />,
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    label: 'Bullet list',
    icon: <List size={16} />,
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    label: 'Numbered list',
    icon: <ListOrdered size={16} />,
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    label: 'Image',
    icon: <ImageIcon size={16} />,
    command: (editor) => {
      const url = prompt('Enter image URL:')
      if (url) {
        editor.chain().focus().insertContent(
          `<p><img src="${url}" alt="image" /></p>`
        ).run()
      }
    },
  },
  {
    label: 'Attachment',
    icon: <Paperclip size={16} />,
    command: (editor) => {
      // Stub: insert a placeholder paragraph for attachment
      editor.chain().focus().insertContent({
        type: 'paragraph',
        content: [{ type: 'text', text: '[Attachment placeholder]' }],
      }).run()
    },
  },
]

// ── Slash Menu Component ────────────────────────────────────────────────────

function EditorSlashMenu({
  editor,
  query,
  position,
  range,
  onClose,
}: {
  editor: Editor
  query: string
  position: { top: number; left: number }
  range: { from: number; to: number } | null
  onClose: () => void
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const filtered = query
    ? SLASH_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : SLASH_ITEMS

  useEffect(() => {
    setSelectedIndex(0)
  }, [filtered.length])

  const selectItem = useCallback(
    (index: number) => {
      const item = filtered[index]
      if (!item) return
      // Delete the slash + query text
      if (range) {
        editor.chain().focus().deleteRange(range).run()
      }
      setTimeout(() => item.command(editor), 0)
      onClose()
    },
    [filtered, editor, range, onClose]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filtered.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        selectItem(selectedIndex)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        if (range) editor.chain().focus().deleteRange(range).run()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [filtered.length, selectedIndex, selectItem, onClose, editor, range])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  if (filtered.length === 0) return null

  return (
    <div
      ref={menuRef}
      className="block-editor-slash-menu"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 9999,
        width: 240,
        background: 'var(--surface-raised, var(--card))',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        maxHeight: 360,
        overflowY: 'auto',
      }}
    >
      {filtered.map((item, i) => (
        <button
          key={item.label}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            selectItem(i)
          }}
          onMouseEnter={() => setSelectedIndex(i)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '8px 10px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            background: i === selectedIndex ? 'var(--bg-hover)' : 'transparent',
            color: 'var(--text-1)',
            fontSize: 14,
            textAlign: 'left',
            transition: 'background 0.1s',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'var(--bg-hover)',
              color: 'var(--text-2)',
              flexShrink: 0,
            }}
          >
            {item.icon}
          </span>
          <span style={{ fontWeight: 500 }}>{item.label}</span>
        </button>
      ))}
    </div>
  )
}

// ── Slash command hook ───────────────────────────────────────────────────────

interface SlashState {
  active: boolean
  query: string
  position: { top: number; left: number }
  range: { from: number; to: number } | null
}

function useSlash(editor: Editor | null) {
  const [state, setState] = useState<SlashState>({
    active: false,
    query: '',
    position: { top: 0, left: 0 },
    range: null,
  })

  const close = useCallback(() => {
    setState({ active: false, query: '', position: { top: 0, left: 0 }, range: null })
  }, [])

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

      const match = textBefore.match(/(?:^|[ \n])\/([a-zA-Z ]*)$/)

      if (match) {
        const query = match[1] || ''
        const slashPos = from - query.length - 1
        const coords = editor.view.coordsAtPos(from)
        const editorRect = editor.view.dom.getBoundingClientRect()

        setState({
          active: true,
          query,
          position: {
            top: coords.bottom + 4,
            left: Math.min(coords.left, editorRect.right - 250),
          },
          range: { from: slashPos, to: from },
        })
      } else {
        setState((prev) => (prev.active ? { active: false, query: '', position: { top: 0, left: 0 }, range: null } : prev))
      }
    }

    editor.on('update', handleUpdate)
    editor.on('selectionUpdate', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
      editor.off('selectionUpdate', handleUpdate)
    }
  }, [editor])

  return { state, close }
}

// ── Selection position hook ─────────────────────────────────────────────────

function useSelectionToolbar(editor: Editor | null) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      const { state } = editor
      const { from, to, empty } = state.selection

      if (empty || from === to) {
        setPosition(null)
        return
      }

      try {
        const fromCoords = editor.view.coordsAtPos(from)
        const toCoords = editor.view.coordsAtPos(to)
        setPosition({
          top: toCoords.bottom + 6,
          left: (fromCoords.left + toCoords.right) / 2,
        })
      } catch {
        setPosition(null)
      }
    }

    editor.on('selectionUpdate', handleSelectionUpdate)
    editor.on('blur', () => {
      // Delay hiding so clicking toolbar buttons works
      setTimeout(() => {
        if (!editor.isFocused) setPosition(null)
      }, 200)
    })

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
    }
  }, [editor])

  return position
}

// ── Selection Toolbar (floating) ────────────────────────────────────────────

function SelectionToolbar({ editor }: { editor: Editor }) {
  const [linkMode, setLinkMode] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const applyLink = useCallback(() => {
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run()
    } else {
      const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
    setLinkMode(false)
    setLinkUrl('')
  }, [editor, linkUrl])

  if (linkMode) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 8px',
          background: 'var(--surface-raised, var(--card))',
          border: '1px solid var(--border)',
          borderRadius: 9999,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          minWidth: 280,
        }}
      >
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            setLinkMode(false)
            setLinkUrl('')
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 6,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-2)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <ChevronLeft size={16} />
        </button>
        <input
          type="text"
          placeholder="Enter a URL"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              applyLink()
            }
            if (e.key === 'Escape') {
              e.preventDefault()
              setLinkMode(false)
              setLinkUrl('')
            }
          }}
          autoFocus
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--text-1)',
            fontSize: 13,
            padding: '4px 0',
          }}
        />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            applyLink()
          }}
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            border: 'none',
            background: linkUrl.trim() ? 'var(--accent)' : 'var(--bg-hover)',
            color: linkUrl.trim() ? '#fff' : 'var(--text-3)',
            fontSize: 13,
            fontWeight: 600,
            cursor: linkUrl.trim() ? 'pointer' : 'default',
            flexShrink: 0,
          }}
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '4px 6px',
        background: 'var(--surface-raised, var(--card))',
        border: '1px solid var(--border)',
        borderRadius: 9999,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      }}
    >
      <ToolbarButton
        active={editor.isActive('link')}
        onMouseDown={() => {
          const existingUrl = editor.getAttributes('link').href || ''
          setLinkUrl(existingUrl)
          setLinkMode(true)
        }}
      >
        <Link2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('bold')}
        onMouseDown={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('italic')}
        onMouseDown={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('strike')}
        onMouseDown={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={16} />
      </ToolbarButton>
    </div>
  )
}

function ToolbarButton({
  active,
  onMouseDown,
  children,
}: {
  active?: boolean
  onMouseDown: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        onMouseDown()
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
        borderRadius: 6,
        border: 'none',
        cursor: 'pointer',
        background: active ? 'var(--bg-hover)' : 'transparent',
        color: active ? 'var(--text-1)' : 'var(--text-2)',
        transition: 'background 0.1s',
      }}
    >
      {children}
    </button>
  )
}

// ── Block Editor Styles ─────────────────────────────────────────────────────

const BLOCK_EDITOR_STYLES = `
  .block-editor-content .tiptap {
    outline: none;
    min-height: 200px;
    padding: 0;
    font-size: 15px;
    line-height: 1.7;
    color: var(--text-1);
    font-family: var(--font-sans);
  }

  .block-editor-content .tiptap p {
    margin: 0 0 0.25em;
    line-height: 1.7;
  }

  .block-editor-content .tiptap h1 {
    font-size: 28px;
    font-weight: 700;
    margin: 1.2em 0 0.4em;
    color: var(--text-1);
    font-family: var(--font-sans);
  }

  .block-editor-content .tiptap h2 {
    font-size: 22px;
    font-weight: 700;
    margin: 1em 0 0.3em;
    color: var(--text-1);
    font-family: var(--font-sans);
  }

  .block-editor-content .tiptap h3 {
    font-size: 18px;
    font-weight: 700;
    margin: 0.8em 0 0.2em;
    color: var(--text-1);
    font-family: var(--font-sans);
  }

  .block-editor-content .tiptap hr {
    border: none;
    border-top: 2px solid var(--border);
    margin: 1.5em 0;
  }

  .block-editor-content .tiptap ul:not([data-type="taskList"]) {
    list-style-type: disc;
    padding-left: 1.5em;
    margin: 0.25em 0 0.5em;
  }

  .block-editor-content .tiptap ol {
    list-style-type: decimal;
    padding-left: 1.5em;
    margin: 0.25em 0 0.5em;
  }

  .block-editor-content .tiptap li {
    margin: 0.15em 0;
    line-height: 1.7;
  }

  .block-editor-content .tiptap strong {
    font-weight: 700;
    color: var(--text-1);
  }

  .block-editor-content .tiptap a {
    color: var(--color-info, #5DA8FF);
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
  }

  .block-editor-content .tiptap a:hover {
    opacity: 0.8;
  }

  .block-editor-content .tiptap img {
    max-width: 100%;
    border-radius: 12px;
    margin: 0.5em 0;
  }

  /* Task list styles */
  .block-editor-content .tiptap ul[data-type="taskList"] {
    list-style: none;
    padding-left: 0;
    margin: 0.25em 0 0.5em;
  }

  .block-editor-content .tiptap ul[data-type="taskList"] li {
    display: flex;
    align-items: flex-start;
    gap: 0.5em;
    padding: 4px 8px;
    border-radius: 8px;
    transition: background 0.1s;
  }

  .block-editor-content .tiptap ul[data-type="taskList"] li:hover {
    background: var(--bg-hover);
  }

  .block-editor-content .tiptap ul[data-type="taskList"] li > label {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    cursor: pointer;
    margin-top: 3px;
  }

  .block-editor-content .tiptap ul[data-type="taskList"] li > label input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border: 2px solid var(--color-danger, #FF4D3D);
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    background: transparent;
    flex-shrink: 0;
    position: relative;
  }

  .block-editor-content .tiptap ul[data-type="taskList"] li > label input[type="checkbox"]:checked {
    background: var(--color-danger, #FF4D3D);
    border-color: var(--color-danger, #FF4D3D);
  }

  .block-editor-content .tiptap ul[data-type="taskList"] li > label input[type="checkbox"]:checked::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 1px;
    width: 6px;
    height: 10px;
    border: 2px solid white;
    border-top: none;
    border-left: none;
    transform: rotate(45deg);
  }

  .block-editor-content .tiptap ul[data-type="taskList"] li[data-checked="true"] > div {
    color: var(--text-3);
    text-decoration: line-through;
  }

  .block-editor-content .tiptap ul[data-type="taskList"] li > div {
    flex: 1;
    line-height: 1.7;
  }

  .block-editor-content .tiptap ul[data-type="taskList"] li > div p {
    margin: 0;
  }

  /* Placeholder */
  .block-editor-content .tiptap p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    color: var(--text-3);
    pointer-events: none;
    float: left;
    height: 0;
  }

  .block-editor-content .tiptap .is-empty::before {
    content: attr(data-placeholder);
    color: var(--text-3);
    pointer-events: none;
    float: left;
    height: 0;
  }

  /* Blockquote */
  .block-editor-content .tiptap blockquote {
    border-left: 3px solid var(--accent);
    padding-left: 1em;
    margin: 0.6em 0;
    color: var(--text-2);
    font-style: italic;
  }

  /* Code */
  .block-editor-content .tiptap code {
    background: var(--bg-hover);
    border-radius: 4px;
    padding: 0.15em 0.35em;
    font-size: 0.85em;
    font-family: var(--font-mono, monospace);
  }
`

// ── Main BlockEditor Component ──────────────────────────────────────────────

interface BlockEditorProps {
  content: unknown
  onUpdate: (json: unknown) => void
  placeholder?: string
  autofocus?: boolean
  className?: string
}

export default function BlockEditor({
  content,
  onUpdate,
  placeholder = "Start typing, or type '/' to choose a different content type",
  autofocus = false,
  className = '',
}: BlockEditorProps) {
  const onUpdateRef = useRef(onUpdate)
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
      }),
    ],
    content: parseContent(content),
    autofocus: autofocus ? 'end' : false,
    editable: true,
    onUpdate: ({ editor: ed }) => {
      onUpdateRef.current(ed.getJSON())
    },
  })

  const { state: slashState, close: slashClose } = useSlash(editor)
  const selectionPos = useSelectionToolbar(editor)

  return (
    <>
      <style>{BLOCK_EDITOR_STYLES}</style>
      <div className={`block-editor-content ${className}`}>
        <EditorContent editor={editor} />
        {editor && selectionPos && (
          <div
            style={{
              position: 'fixed',
              top: selectionPos.top,
              left: selectionPos.left,
              transform: 'translateX(-50%)',
              zIndex: 9998,
            }}
          >
            <SelectionToolbar editor={editor} />
          </div>
        )}
        {editor && slashState.active && (
          <EditorSlashMenu
            editor={editor}
            query={slashState.query}
            position={slashState.position}
            range={slashState.range}
            onClose={slashClose}
          />
        )}
      </div>
    </>
  )
}

function parseContent(content: unknown): string | object {
  if (!content) return ''
  if (typeof content === 'object') return content as object
  if (typeof content === 'string') {
    try {
      return JSON.parse(content)
    } catch {
      return content
    }
  }
  return ''
}
