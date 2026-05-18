'use client'
import { useState } from 'react'
import { X, Send, Gift } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface InviteFriendsModalProps {
  open: boolean
  onClose: () => void
}

export default function InviteFriendsModal({ open, onClose }: InviteFriendsModalProps) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!email.trim() || !email.includes('@')) return
    setSending(true)
    // Stub - would call API to send invite
    await new Promise(resolve => setTimeout(resolve, 800))
    setSending(false)
    setSent(true)
    setEmail('')
    setTimeout(() => setSent(false), 3000)
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)' }}
          onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="rounded-2xl p-6 w-full max-w-md"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}>

            {/* Close button */}
            <div className="flex justify-end mb-2">
              <button onClick={onClose} className="btn-icon w-8 h-8">
                <X size={16} />
              </button>
            </div>

            {/* Gift illustration area */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--accent-soft)' }}>
                <Gift size={36} style={{ color: 'var(--accent)' }} />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-[20px] font-bold text-center mb-2" style={{ color: 'var(--text-1)' }}>
              Invite friends to LAIF
            </h2>
            <p className="text-[13px] text-center mb-6" style={{ color: 'var(--text-3)' }}>
              Share the productivity love. Send an invite to get your friends started.
            </p>

            {/* Email input + Send button */}
            <div className="flex gap-2">
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
                placeholder="friend@email.com"
                type="email"
                className="input-interactive flex-1"
              />
              <button onClick={handleSend} disabled={sending || !email.trim()}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  opacity: sending || !email.trim() ? 0.5 : 1,
                }}>
                <Send size={14} />
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>

            {/* Success message */}
            <AnimatePresence>
              {sent && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  className="text-[13px] text-center mt-3"
                  style={{ color: 'var(--color-success)' }}>
                  Invitation sent!
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
