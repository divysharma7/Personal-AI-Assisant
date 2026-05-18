'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, StickyNote } from 'lucide-react'
import PostItNote from '@/components/postits/PostItNote'
import FloatingChat from '@/components/chat/FloatingChat'
import { useNotes } from '@/hooks/useNotes'
import { NOTE_COLORS } from '@/lib/utils'

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, maxReached } = useNotes()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header — Superlist style */}
      <div className="flex-shrink-0 px-8 md:px-10 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[32px] md:text-[36px] font-bold" style={{ color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Post-its
            </h1>
            <span className="text-[13px] font-medium" style={{ color: 'var(--text-3)' }}>{notes.length}/30</span>
          </div>
          <div className="flex items-center gap-1.5">
            {NOTE_COLORS.map(c => (
              <motion.button
                key={c.bg}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => !maxReached && addNote(c.bg)}
                disabled={maxReached}
                title={`Add ${c.label} note`}
                className="w-5 h-5 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: c.bg }}
              />
            ))}
            <button
              onClick={() => !maxReached && addNote()}
              disabled={maxReached}
              className="flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed ml-2"
              style={{ background: 'var(--text-1)', color: 'var(--card)' }}
            >
              <Plus size={13} />
              New note
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto relative" style={{ minHeight: 0 }}>
        <div style={{ minHeight: '100%', position: 'relative' }}>
          <AnimatePresence>
            {notes.map(note => (
              <PostItNote key={note._id} note={note} onUpdate={updateNote} onDelete={deleteNote} />
            ))}
          </AnimatePresence>

          <FloatingChat onRefreshItems={() => {}} />

          {notes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.15)' }}>
                  <StickyNote size={28} className="text-amber-400" />
                </div>
                <p className="font-medium" style={{ color: 'var(--text-1)' }}>No notes yet</p>
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>Click a colour above or "New note" to get started.</p>
                <button onClick={() => addNote()} className="btn-primary flex items-center gap-2 mt-2">
                  <Plus size={14} /> Add your first note
                </button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
