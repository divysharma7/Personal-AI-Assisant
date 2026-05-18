'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import { copy } from '@/lib/copy'
import SelectionToolbar from './SelectionToolbar'
import SlashMenu from './SlashMenu'

interface BlockEditorProps {
  content: JSONContent | null
  onSave: (json: JSONContent) => void
}

export default function BlockEditor({ content, onSave }: BlockEditorProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [slashOpen, setSlashOpen] = useState(false)
  const [slashQuery, setSlashQuery] = useState('')
  const [slashPosition, setSlashPosition] = useState({ top: 0, left: 0 })
  const initialContentSet = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            const level = node.attrs.level as number
            return `Heading ${level}`
          }
          return copy.list.emptyBlockPlaceholder
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          style: 'color: var(--info); text-decoration: underline;',
        },
      }),
    ],
    content: content || {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    },
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[200px] prose-editor',
      },
      handleKeyDown: (_view, event) => {
        if (slashOpen) {
          if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(event.key)) {
            // Let SlashMenu handle these
            return false
          }
        }
        return false
      },
    },
    onUpdate: ({ editor: ed }) => {
      // Check for slash command
      const { from } = ed.state.selection
      const textBefore = ed.state.doc.textBetween(
        Math.max(0, from - 50),
        from,
        '\n'
      )
      const slashMatch = textBefore.match(/\/([^/\n]*)$/)

      if (slashMatch) {
        const coords = ed.view.coordsAtPos(from)
        setSlashQuery(slashMatch[1])
        setSlashPosition({
          top: coords.bottom + 4,
          left: coords.left,
        })
        setSlashOpen(true)
      } else {
        setSlashOpen(false)
        setSlashQuery('')
      }

      // Debounced save
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onSave(ed.getJSON())
      }, 1000)
    },
  })

  // Set initial content once when it loads from the server
  useEffect(() => {
    if (editor && content && !initialContentSet.current) {
      // Only set if the editor has default empty content
      const currentContent = editor.getJSON()
      const isDefault =
        currentContent.content?.length === 1 &&
        currentContent.content[0].type === 'paragraph' &&
        !currentContent.content[0].content
      if (isDefault) {
        editor.commands.setContent(content)
        initialContentSet.current = true
      }
    }
  }, [editor, content])

  const handleSlashSelect = useCallback(
    (action: string) => {
      if (!editor) return

      // Delete the slash command text
      const { from } = editor.state.selection
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - 50),
        from,
        '\n'
      )
      const slashMatch = textBefore.match(/\/([^/\n]*)$/)
      if (slashMatch) {
        const deleteFrom = from - slashMatch[0].length
        editor.chain().focus().deleteRange({ from: deleteFrom, to: from }).run()
      }

      switch (action) {
        case 'taskList':
          editor.chain().focus().toggleTaskList().run()
          break
        case 'paragraph':
          editor.chain().focus().setParagraph().run()
          break
        case 'heading1':
          editor.chain().focus().toggleHeading({ level: 1 }).run()
          break
        case 'heading2':
          editor.chain().focus().toggleHeading({ level: 2 }).run()
          break
        case 'heading3':
          editor.chain().focus().toggleHeading({ level: 3 }).run()
          break
        case 'horizontalRule':
          editor.chain().focus().setHorizontalRule().run()
          break
        case 'bulletList':
          editor.chain().focus().toggleBulletList().run()
          break
        case 'orderedList':
          editor.chain().focus().toggleOrderedList().run()
          break
        case 'blockquote':
          editor.chain().focus().toggleBlockquote().run()
          break
        default:
          break
      }

      setSlashOpen(false)
      setSlashQuery('')
    },
    [editor]
  )

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  if (!editor) return null

  return (
    <div className="relative">
      {/* Selection toolbar (floating bubble menu) */}
      <SelectionToolbar editor={editor} />

      {/* Editor content */}
      <EditorContent editor={editor} />

      {/* Slash command menu */}
      {slashOpen && (
        <SlashMenu
          query={slashQuery}
          onSelect={handleSlashSelect}
          onClose={() => {
            setSlashOpen(false)
            setSlashQuery('')
          }}
          position={slashPosition}
        />
      )}
    </div>
  )
}
