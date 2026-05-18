'use client'

import { useCallback, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Plus, Search, Star } from 'lucide-react'
import { copy } from '@/lib/copy'
import { useLists } from '@/hooks/useLists'
import { fadeSlideUp, buttonPress, stagger, ease } from '@/lib/motion'
import InfoBanner from '@/components/shared/InfoBanner'

type ListFilter = 'all' | 'shared' | 'private' | 'meetings'

const FILTERS: { key: ListFilter; label: string }[] = [
  { key: 'all', label: copy.listsDirectory.filters.all },
  { key: 'shared', label: copy.listsDirectory.filters.shared },
  { key: 'private', label: copy.listsDirectory.filters.private },
  { key: 'meetings', label: copy.listsDirectory.filters.meetings },
]

export default function ListsDirectoryPage() {
  const router = useRouter()
  const { lists, createList, updateList, isCreating } = useLists()
  const [activeFilter, setActiveFilter] = useState<ListFilter>('all')
  const [tipDismissed, setTipDismissed] = useState(false)
  const [search, setSearch] = useState('')

  const filteredLists = useMemo(() => {
    let result = lists

    // Apply filter
    switch (activeFilter) {
      case 'shared':
        result = result.filter((l) => !l.isPrivate || (l.collaborators && l.collaborators.length > 0))
        break
      case 'private':
        result = result.filter((l) => l.isPrivate)
        break
      case 'meetings':
        result = result.filter((l) => l.type === 'meeting')
        break
    }

    // Apply search
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((l) => (l.title || '').toLowerCase().includes(q))
    }

    return result
  }, [lists, activeFilter, search])

  const handleCreateList = useCallback(async () => {
    if (isCreating) return
    try {
      const newList = await createList({ title: '', icon: '' })
      router.push(`/lists/${newList._id}`)
    } catch {
      // silently fail
    }
  }, [createList, isCreating, router])

  const handleToggleStar = useCallback(
    (listId: string, currentValue: boolean) => {
      updateList({ id: listId, pinnedToFavorites: !currentValue })
    },
    [updateList]
  )

  return (
    <div className="flex flex-col px-6 py-5">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h1
          className="text-[32px] font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {copy.listsDirectory.title}
        </h1>
        <div className="flex items-center gap-2">
          <motion.button
            {...buttonPress}
            onClick={handleCreateList}
            disabled={isCreating}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 cursor-pointer"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Plus size={14} strokeWidth={2} />
            <span>{copy.listsDirectory.newListCta}</span>
          </motion.button>
          <button
            disabled
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-150 cursor-not-allowed opacity-50"
            style={{
              backgroundColor: 'var(--bg-pane-2)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
          >
            <Plus size={14} strokeWidth={2} />
            <span>{copy.listsDirectory.newMeetingCta}</span>
          </button>
        </div>
      </div>

      {/* Tip banner */}
      <div className="mb-5">
        <InfoBanner
          message={copy.listsDirectory.tipBanner}
          onDismiss={() => setTipDismissed(true)}
          visible={!tipDismissed}
        />
      </div>

      {/* Filter pills */}
      <div className="mb-4 flex items-center gap-1">
        {FILTERS.map((f) => {
          const active = activeFilter === f.key
          return (
            <motion.button
              key={f.key}
              {...buttonPress}
              onClick={() => setActiveFilter(f.key)}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
              style={{
                backgroundColor: active ? 'var(--accent)' : 'transparent',
                color: active ? '#FFFFFF' : 'var(--text-muted)',
                border: active ? 'none' : '1px solid var(--border)',
              }}
            >
              {f.label}
            </motion.button>
          )
        })}
      </div>

      {/* Search input */}
      <div
        className="mb-5 flex items-center gap-2 rounded-xl px-3 py-2.5"
        style={{
          backgroundColor: 'var(--bg-pane-2)',
          border: '1px solid var(--border)',
        }}
      >
        <Search size={16} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={copy.listsDirectory.searchPlaceholder}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* List rows */}
      <motion.div className="flex flex-col gap-0.5" {...stagger()}>
        <AnimatePresence mode="popLayout">
          {filteredLists.map((list) => (
            <motion.div
              key={list._id}
              {...fadeSlideUp}
              transition={ease.normal}
              layout
              onClick={() => router.push(`/lists/${list._id}`)}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150 cursor-pointer"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {/* Emoji */}
              <span className="flex-shrink-0 text-base">
                {list.icon || '\uD83D\uDCCB'}
              </span>

              {/* Title + privacy label */}
              <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                <span
                  className="text-[15px] font-medium truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {list.title || copy.list.untitled}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                  {list.isPrivate ? copy.listsDirectory.privateLabel : copy.listsDirectory.sharedLabel}
                </span>
              </div>

              {/* Star toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleStar(list._id, list.pinnedToFavorites)
                }}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
                style={{
                  color: list.pinnedToFavorites ? 'var(--accent)' : 'var(--text-faint)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <Star
                  size={16}
                  strokeWidth={1.5}
                  fill={list.pinnedToFavorites ? 'var(--accent)' : 'none'}
                />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredLists.length === 0 && (
          <motion.p
            {...fadeSlideUp}
            transition={ease.normal}
            className="py-8 text-center text-sm"
            style={{ color: 'var(--text-faint)' }}
          >
            {copy.listsDirectory.emptyState}
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}
