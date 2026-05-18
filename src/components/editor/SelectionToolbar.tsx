'use client'

/**
 * SelectionToolbar — Floating inline formatting toolbar.
 *
 * Renders inside a TipTap BubbleMenu. Provides 4 actions:
 * Link, Bold, Italic, Strikethrough.
 *
 * The Link action opens a 2-step inline popover:
 *   Step 1: back arrow + URL input + Done button
 *   Step 2: typing the URL with clear + Done
 *
 * This component is used by BlockEditor internally via BubbleMenu.
 * Exported separately so it can be reused in task detail editors too.
 */

import { useState, useCallback } from 'react'
import type { Editor } from '@tiptap/core'
import {
  Link2,
  Bold,
  Italic,
  Strikethrough,
  ChevronLeft,
} from 'lucide-react'

interface SelectionToolbarProps {
  editor: Editor
}

export default function SelectionToolbar({ editor }: SelectionToolbarProps) {
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
