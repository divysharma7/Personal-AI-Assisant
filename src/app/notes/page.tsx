'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, FileText, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import type { JSONContent } from '@tiptap/react'
import BlockEditor from '@/components/editor/BlockEditor'
import { notes } from '@/lib/api/misc'
import { fadeSlideUp, slideFromRight, ease, buttonPress } from '@/lib/motion'

interface Note {
  _id: string
  title?: string
  content?: string | JSONContent
  createdAt?: string
  updatedAt?: string
}

export default function NotesPage() {
  const [allNotes, setAllNotes] = useState<Note[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Fetch all notes
  const fetchNotes = useCallback(async () => {
    try {
      const data = await notes.list()
      setAllNotes(data)
      if (!selectedId && data.length > 0) setSelectedId(data[0]._id)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [selectedId])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  // Filtered notes
  const filtered = useMemo(() => {
    if (!search.trim()) return allNotes
    const q = search.toLowerCase()
    return allNotes.filter((n) => {
      const title = (n.title || '').toLowerCase()
      const content = typeof n.content === 'string' ? n.content.toLowerCase() : ''
      return title.includes(q) || content.includes(q)
    })
  }, [allNotes, search])

  const selectedNote = useMemo(
    () => allNotes.find((n) => n._id === selectedId) ?? null,
    [allNotes, selectedId]
  )

  // Parse content for editor
  const editorContent = useMemo(() => {
    if (!selectedNote?.content) return null
    if (typeof selectedNote.content === 'string') {
      try { return JSON.parse(selectedNote.content) }
      catch { return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: selectedNote.content }] }] } }
    }
    return selectedNote.content as JSONContent
  }, [selectedNote])

  // Create note
  const handleCreate = useCallback(async () => {
    try {
      const note = await notes.create({ title: 'Untitled', content: '' })
      setAllNotes((prev) => [note, ...prev])
      setSelectedId(note._id)
    } catch { /* ignore */ }
  }, [])

  // Save note
  const handleSave = useCallback(async (json: JSONContent) => {
    if (!selectedId) return
    try {
      const title = extractTitle(json)
      await notes.update(selectedId, { title, content: JSON.stringify(json) })
      setAllNotes((prev) => prev.map((n) => n._id === selectedId ? { ...n, title, content: json } : n))
    } catch { /* ignore */ }
  }, [selectedId])

  // Delete note
  const handleDelete = useCallback(async (id: string) => {
    try {
      await notes.delete(id)
      setAllNotes((prev) => prev.filter((n) => n._id !== id))
      if (selectedId === id) {
        const remaining = allNotes.filter((n) => n._id !== id)
        setSelectedId(remaining.length > 0 ? remaining[0]._id : null)
      }
    } catch { /* ignore */ }
  }, [selectedId, allNotes])

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel — notes list */}
      <div
        className="flex flex-col flex-shrink-0 overflow-y-auto"
        style={{ width: 280, borderRight: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Notes</span>
          <motion.button
            {...buttonPress}
            onClick={handleCreate}
            className="flex h-7 w-7 items-center justify-center rounded-md cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <Plus size={16} strokeWidth={1.5} />
          </motion.button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
            style={{ backgroundColor: 'var(--overlay-1)' }}
          >
            <Search size={14} strokeWidth={1.5} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              style={{
                flex: 1, background: 'transparent', outline: 'none', border: 'none',
                fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Inter, system-ui, sans-serif',
              }}
            />
          </div>
        </div>

        {/* Notes list */}
        <div className="flex flex-col gap-0.5 px-2 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-[13px]" style={{ color: 'var(--text-faint)' }}>Loading...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText size={32} strokeWidth={1} style={{ color: 'var(--text-faint)', opacity: 0.3, marginBottom: 8 }} />
              <p className="text-[13px]" style={{ color: 'var(--text-faint)' }}>
                {search ? 'No matching notes' : 'No notes yet'}
              </p>
            </div>
          ) : (
            filtered.map((note) => {
              const active = note._id === selectedId
              return (
                <div
                  key={note._id}
                  className="group flex items-start gap-2 rounded-lg px-2.5 py-2 cursor-pointer"
                  style={{
                    backgroundColor: active ? 'var(--overlay-2, var(--bg-hover))' : 'transparent',
                    boxShadow: active ? 'inset -3px 0 0 var(--accent)' : 'none',
                    transition: 'background-color 150ms ease',
                  }}
                  onClick={() => setSelectedId(note._id)}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {note.title || 'Untitled'}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                      {note.updatedAt ? format(new Date(note.updatedAt), 'MMM d, yyyy') : ''}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(note._id) }}
                    className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded cursor-pointer flex-shrink-0"
                    style={{ color: 'var(--text-faint)', transition: 'opacity 150ms ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger, #ef4444)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-faint)' }}
                  >
                    <Trash2 size={12} strokeWidth={1.5} />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right panel — editor */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {selectedNote ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedId}
              {...slideFromRight}
              transition={ease.normal}
              className="mx-auto w-full max-w-[720px] px-8 py-8"
            >
              <BlockEditor content={editorContent} onSave={handleSave} />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <FileText size={48} strokeWidth={1} style={{ color: 'var(--text-faint)', opacity: 0.3, marginBottom: 12 }} />
              <p className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
                Select a note
              </p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Or create a new one to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function extractTitle(json: JSONContent): string {
  if (!json?.content) return 'Untitled'
  for (const node of json.content as JSONContent[]) {
    if (node.type === 'heading' || node.type === 'paragraph') {
      const text = (node.content as JSONContent[])?.map((n) => n.text || '').join('').trim()
      if (text) return text.slice(0, 80)
    }
  }
  return 'Untitled'
}
