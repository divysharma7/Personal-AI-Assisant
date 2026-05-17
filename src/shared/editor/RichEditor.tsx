'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import type { Editor } from '@tiptap/core'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  CheckSquare,
  Code2,
  Minus,
} from 'lucide-react'
import SlashMenu, { useSlashCommands } from './SlashMenu'
import type { SlashCommandState } from './SlashMenu'

// ── Props ────────────────────────────────────────────────────────────────────

interface RichEditorProps {
  content: string | object | null
  onUpdate: (json: object) => void
  placeholder?: string
  autofocus?: boolean
  editable?: boolean
  className?: string
}

// ── Toolbar button ───────────────────────────────────────────────────────────

function ToolbarBtn({
  active,
  title,
  onClick,
  children,
}: {
  active?: boolean
  title: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
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
        background: active ? 'var(--accent)' : 'transparent',
        color: active ? '#fff' : 'var(--text-2)',
        transition: 'background 0.12s, color 0.12s',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}

function Separator() {
  return (
    <span
      style={{
        width: 1,
        height: 18,
        background: 'var(--border)',
        flexShrink: 0,
        margin: '0 2px',
      }}
    />
  )
}

// ── Toolbar ──────────────────────────────────────────────────────────────────

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="rich-editor-toolbar">
      {/* Inline formatting */}
      <ToolbarBtn
        active={editor.isActive('bold')}
        title="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={16} />
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive('italic')}
        title="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={16} />
      </ToolbarBtn>

      <Separator />

      {/* Headings */}
      <ToolbarBtn
        active={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 size={16} />
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={16} />
      </ToolbarBtn>

      <Separator />

      {/* Lists */}
      <ToolbarBtn
        active={editor.isActive('bulletList')}
        title="Bullet List"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={16} />
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive('orderedList')}
        title="Numbered List"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={16} />
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive('taskList')}
        title="Task List"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        <CheckSquare size={16} />
      </ToolbarBtn>

      <Separator />

      {/* Block elements */}
      <ToolbarBtn
        active={editor.isActive('codeBlock')}
        title="Code Block"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code2 size={16} />
      </ToolbarBtn>
      <ToolbarBtn
        active={false}
        title="Horizontal Rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus size={16} />
      </ToolbarBtn>
    </div>
  )
}

// ── Editor styles ────────────────────────────────────────────────────────────

const EDITOR_STYLES = `
  /* ── Rich editor toolbar ───────────────────────────────── */
  .rich-editor-toolbar {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 6px 8px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px 10px 0 0;
    border-bottom: none;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .rich-editor-toolbar button:hover {
    background: var(--input-bg);
  }

  .rich-editor-toolbar button[style*="var(--accent)"]:hover {
    opacity: 0.9;
  }

  /* ── Mobile: toolbar sticks to bottom ─────────────────── */
  @media (max-width: 640px) {
    .rich-editor-toolbar {
      position: sticky;
      bottom: 0;
      z-index: 50;
      border-radius: 0;
      border: 1px solid var(--border);
      order: 2;
    }
    .rich-editor-wrapper {
      display: flex;
      flex-direction: column;
    }
    .rich-editor-content-wrapper {
      order: 1;
    }
  }

  /* ── Rich editor content area ──────────────────────────── */
  .rich-editor-content .tiptap {
    outline: none;
    min-height: 120px;
    padding: 12px 14px;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--text-2);
  }

  .rich-editor-content .tiptap:focus {
    color: var(--text-1);
  }

  .rich-editor-content .tiptap p {
    margin: 0 0 0.35em;
    line-height: 1.6;
  }

  .rich-editor-content .tiptap h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 1em 0 0.3em;
    color: var(--text-1);
  }

  .rich-editor-content .tiptap h2 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0.9em 0 0.25em;
    color: var(--text-1);
  }

  .rich-editor-content .tiptap h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0.8em 0 0.2em;
    color: var(--text-1);
  }

  .rich-editor-content .tiptap blockquote {
    border-left: 3px solid var(--accent);
    padding-left: 1em;
    margin: 0.6em 0;
    color: var(--text-2);
    font-style: italic;
  }

  .rich-editor-content .tiptap code {
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.1em 0.35em;
    font-size: 0.85em;
    font-family: ui-monospace, monospace;
  }

  .rich-editor-content .tiptap pre {
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1em;
    margin: 0.6em 0;
    overflow-x: auto;
  }

  .rich-editor-content .tiptap pre code {
    background: none;
    border: none;
    padding: 0;
  }

  .rich-editor-content .tiptap hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 1.2em 0;
  }

  .rich-editor-content .tiptap ul:not([data-type="taskList"]) {
    list-style-type: disc;
    padding-left: 1.4em;
    margin: 0.25em 0 0.5em;
  }

  .rich-editor-content .tiptap ol {
    list-style-type: decimal;
    padding-left: 1.4em;
    margin: 0.25em 0 0.5em;
  }

  .rich-editor-content .tiptap li {
    margin: 0.1em 0;
    line-height: 1.6;
  }

  .rich-editor-content .tiptap strong {
    font-weight: 600;
    color: var(--text-1);
  }

  .rich-editor-content .tiptap em {
    color: var(--text-2);
  }

  /* ── Task list ─────────────────────────────────────────── */
  .rich-editor-content .tiptap ul[data-type="taskList"] {
    list-style: none;
    padding-left: 0;
    margin: 0.25em 0 0.5em;
  }

  .rich-editor-content .tiptap ul[data-type="taskList"] li {
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.2em 0.4em;
    border-radius: 6px;
    transition: background 0.1s;
    min-height: 1.6em;
  }

  .rich-editor-content .tiptap ul[data-type="taskList"] li:hover {
    background: var(--input-bg);
  }

  .rich-editor-content .tiptap ul[data-type="taskList"] li > label {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    cursor: pointer;
    line-height: 1;
  }

  .rich-editor-content .tiptap ul[data-type="taskList"] li > label input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    width: 15px;
    height: 15px;
    border: 1.5px solid var(--border);
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    position: relative;
    background: transparent;
    flex-shrink: 0;
    display: block;
  }

  .rich-editor-content .tiptap ul[data-type="taskList"] li > label input[type="checkbox"]:checked {
    background: var(--accent);
    border-color: var(--accent);
  }

  .rich-editor-content .tiptap ul[data-type="taskList"] li > label input[type="checkbox"]:checked::after {
    content: '';
    position: absolute;
    left: 3px;
    top: 0px;
    width: 5px;
    height: 9px;
    border: 1.5px solid white;
    border-top: none;
    border-left: none;
    transform: rotate(45deg);
  }

  .rich-editor-content .tiptap ul[data-type="taskList"] li > div {
    flex: 1;
    line-height: 1.6;
    margin: 0;
    padding: 0;
  }

  .rich-editor-content .tiptap ul[data-type="taskList"] li > div p {
    margin: 0;
  }

  .rich-editor-content .tiptap ul[data-type="taskList"] li[data-checked="true"] > div {
    color: var(--text-3);
    text-decoration: line-through;
  }

  /* ── Placeholder ───────────────────────────────────────── */
  .rich-editor-content .tiptap p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    color: var(--text-3);
    pointer-events: none;
    float: left;
    height: 0;
    white-space: pre-line;
    line-height: 1.75;
  }
`

// ── Main component ───────────────────────────────────────────────────────────

export function RichEditor({
  content,
  onUpdate,
  placeholder = 'Start writing...',
  autofocus = false,
  editable = true,
  className = '',
}: RichEditorProps) {
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
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
      }),
    ],
    content: parseContent(content),
    autofocus: autofocus ? 'end' : false,
    editable,
    onUpdate: ({ editor }) => {
      onUpdateRef.current(editor.getJSON())
    },
  })

  // Update editable state if it changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable)
    }
  }, [editor, editable])

  // Slash commands
  const { state: slashState, handleClose: slashClose } = useSlashCommands(editor)

  return (
    <>
      <style>{EDITOR_STYLES}</style>
      <div
        className={`rich-editor-wrapper ${className}`}
        style={{
          border: '1px solid var(--border)',
          borderRadius: 10,
          background: 'var(--bg)',
          overflow: 'hidden',
        }}
      >
        {editor && <Toolbar editor={editor} />}
        <div className="rich-editor-content-wrapper">
          <EditorContent editor={editor} className="rich-editor-content" />
        </div>
        {editor && (
          <SlashMenu editor={editor} state={slashState} onClose={slashClose} />
        )}
      </div>
    </>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseContent(content: string | object | null): string | object {
  if (!content) return ''
  if (typeof content === 'object') return content
  try {
    return JSON.parse(content)
  } catch {
    return content
  }
}

// ── Exports ──────────────────────────────────────────────────────────────────

export default RichEditor
