'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { copy } from '@/lib/copy'
import { fade, fadeSlideUp, ease } from '@/lib/motion'

interface ProfileTabProps {
  firstName: string
  lastName: string
  email: string
  onFirstNameChange: (v: string) => void
  onLastNameChange: (v: string) => void
  onSignOut: () => void
}

export default function ProfileTab({
  firstName,
  lastName,
  email,
  onFirstNameChange,
  onLastNameChange,
  onSignOut,
}: ProfileTabProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)

  return (
    <>
      <motion.div key="profile" {...fade} transition={ease.normal} className="flex flex-col gap-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white cursor-pointer"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {firstName ? firstName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {firstName} {lastName}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              Click avatar to change (coming soon)
            </p>
          </div>
        </div>

        {/* Name fields */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {copy.settings.profile.firstName}
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              autoComplete="given-name"
              className="input-field"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {copy.settings.profile.lastName}
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              autoComplete="family-name"
              className="input-field"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            {copy.settings.profile.email}
          </label>
          <input
            type="text"
            value={email}
            readOnly
            className="input-field cursor-not-allowed opacity-60"
          />
        </div>

        {/* Delete account */}
        <div className="mt-4 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer"
            style={{
              color: 'var(--priority-high)',
              backgroundColor: 'transparent',
              border: '1px solid var(--priority-high)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 77, 61, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            {copy.settings.profile.deleteAccount}
          </button>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-faint)' }}>
            {copy.settings.profile.deleteWarning}
          </p>
        </div>
      </motion.div>

      {/* ─── Delete Account Modal ─── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            {...fade}
            transition={ease.fast}
            role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            onClick={() => setShowDeleteModal(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') setShowDeleteModal(false) }}
          >
            <motion.div
              {...fadeSlideUp}
              transition={ease.normal}
              role="dialog"
              aria-modal="true"
              aria-label="Delete account confirmation"
              className="w-full max-w-md rounded-2xl p-6"
              style={{
                backgroundColor: 'var(--bg-pane)',
                border: '1px solid var(--border)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {copy.settings.profile.deleteAccount}
                </h3>
                <button
                  aria-label="Close"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
                  style={{ color: 'var(--text-faint)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
              <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                {copy.settings.profile.deleteWarning}
              </p>
              <label className="mb-5 flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteConfirmed}
                  onChange={(e) => setDeleteConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded"
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {copy.settings.profile.deleteConfirmCheckbox}
                </span>
              </label>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {copy.settings.profile.deleteCancelCta}
                </button>
                <button
                  disabled={!deleteConfirmed}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: 'var(--priority-high)' }}
                >
                  {copy.settings.profile.deleteConfirmCta}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
