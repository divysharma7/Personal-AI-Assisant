'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { Editor } from '@tiptap/react'
import { Bold, Italic, Strikethrough, Link2, ChevronLeft } from 'lucide-react'
import { copy } from '@/lib/copy'

interface SelectionToolbarProps {
  editor: Editor
}

export default function SelectionToolbar({ editor }: SelectionToolbarProps) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [linkMode, setLinkMode] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateToolbar = () => {
      const { from, to, empty } = editor.state.selection
      if (empty || from === to) {
        setVisible(false)
        setLinkMode(false)
        setLinkUrl('')
        return
      }

      const coords = editor.view.coordsAtPos(from)
      const endCoords = editor.view.coordsAtPos(to)
      const left = (coords.left + endCoords.left) / 2
      const top = endCoords.bottom + 8

      setPosition({ top, left })
      setVisible(true)
    }

    editor.on('selectionUpdate', updateToolbar)
    editor.on('blur', () => {
      // Delay to allow toolbar button clicks
      setTimeout(() => {
        if (!toolbarRef.current?.contains(document.activeElement)) {
          setVisible(false)
          setLinkMode(false)
          setLinkUrl('')
        }
      }, 200)
    })

    return () => {
      editor.off('selectionUpdate', updateToolbar)
    }
  }, [editor])

  const handleSetLink = useCallback(() => {
    if (!linkUrl.trim()) return
    let url = linkUrl.trim()
    if (!/^https?:\/\//.test(url)) {
      url = `https://${url}`
    }
    editor.chain().focus().setLink({ href: url, target: '_blank' }).run()
    setLinkUrl('')
    setLinkMode(false)
  }, [editor, linkUrl])

  const isActive = (mark: string) => editor.isActive(mark)

  const toolbarButtonStyle = (active: boolean): React.CSSProperties => ({
    backgroundColor: active ? 'var(--bg-hover)' : 'transparent',
    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
  })

  if (!visible) return null

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 flex items-center rounded-lg shadow-lg"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--bg-pane-2)',
        border: '1px solid var(--border)',
      }}
    >
      {linkMode ? (
        /* Link input mode */
        <div className="flex items-center gap-1 px-1 py-1">
          <button
            onClick={() => {
              setLinkMode(false)
              setLinkUrl('')
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSetLink()
              }
              if (e.key === 'Escape') {
                setLinkMode(false)
                setLinkUrl('')
              }
            }}
            placeholder={copy.popovers.link.placeholder}
            className="w-40 bg-transparent px-2 py-1 text-xs outline-none"
            style={{ color: 'var(--text-primary)' }}
            autoFocus
          />
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              handleSetLink()
            }}
            disabled={!linkUrl.trim()}
            className="rounded-md px-2 py-1 text-xs font-medium transition-colors duration-150 cursor-pointer"
            style={{
              backgroundColor: linkUrl.trim()
                ? 'var(--accent)'
                : 'transparent',
              color: linkUrl.trim() ? '#fff' : 'var(--text-faint)',
            }}
          >
            {copy.popovers.link.done}
          </button>
        </div>
      ) : (
        /* Formatting buttons */
        <div className="flex items-center gap-0.5 px-1 py-1">
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              setLinkMode(true)
              const existingHref = editor.getAttributes('link').href
              if (existingHref) setLinkUrl(existingHref as string)
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
            style={toolbarButtonStyle(isActive('link'))}
          >
            <Link2 size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              editor.chain().focus().toggleBold().run()
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
            style={toolbarButtonStyle(isActive('bold'))}
          >
            <Bold size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              editor.chain().focus().toggleItalic().run()
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
            style={toolbarButtonStyle(isActive('italic'))}
          >
            <Italic size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              editor.chain().focus().toggleStrike().run()
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
            style={toolbarButtonStyle(isActive('strike'))}
          >
            <Strikethrough size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
