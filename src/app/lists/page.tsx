'use client'

import { useCallback, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Star,
  SlidersHorizontal,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Lock,
  Globe,
  Users,
  Calendar,
  Clock,
  Folder,
  Trash2,
} from 'lucide-react'
import { copy } from '@/lib/copy'
import { useLists } from '@/hooks/useLists'
import { useFolders } from '@/hooks/useFolders'
import { fadeSlideUp, collapse, stagger, buttonPress, ease, fade } from '@/lib/motion'
import InfoBanner from '@/components/shared/InfoBanner'

type ListFilter = 'all' | 'shared' | 'private' | 'meetings'

const FILTERS: { key: ListFilter; label: string }[] = [
  { key: 'all', label: copy.listsDirectory.filters.all },
  { key: 'shared', label: copy.listsDirectory.filters.shared },
  { key: 'private', label: copy.listsDirectory.filters.private },
  { key: 'meetings', label: copy.listsDirectory.filters.meetings },
]

function formatRelativeDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ListsDirectoryPage() {
  const router = useRouter()
  const { lists, createList, updateList, isCreating } = useLists()
  const { deleteFolder } = useFolders()
  const [activeFilter, setActiveFilter] = useState<ListFilter>('all')
  const [tipDismissed, setTipDismissed] = useState(false)
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    favorites: true,
    recent: true,
    all: true,
  })
  const [hoveredListId, setHoveredListId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Group lists
  const favoriteLists = useMemo(
    () => lists.filter((l) => l.pinnedToFavorites),
    [lists]
  )

  const filteredLists = useMemo(() => {
    let result = lists.filter((l) => !l.isInbox)

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

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((l) => (l.title || '').toLowerCase().includes(q))
    }

    return result
  }, [lists, activeFilter, search])

  // Recent = last 5 modified
  const recentLists = useMemo(() => {
    return [...lists]
      .filter((l) => !l.isInbox)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .slice(0, 5)
  }, [lists])

  const handleCreateList = useCallback(async () => {
    if (isCreating) return
    try {
      const newList = await createList({ title: '', icon: '' })
      router.push(`/lists/${newList._id}`)
    } catch {}
  }, [createList, isCreating, router])

  const handleToggleStar = useCallback(
    (e: React.MouseEvent, listId: string, currentValue: boolean) => {
      e.stopPropagation()
      updateList({ id: listId, pinnedToFavorites: !currentValue })
    },
    [updateList]
  )

  const handleDelete = useCallback(
    async (e: React.MouseEvent, listId: string) => {
      e.stopPropagation()
      setDeletingId(listId)
      setTimeout(async () => {
        await deleteFolder(listId)
        setDeletingId(null)
      }, 300)
    },
    [deleteFolder]
  )

  const toggleGroup = (key: string) =>
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }))

  const renderListRow = (list: typeof lists[0], showMeta = true) => {
    const isHovered = hoveredListId === list._id
    const isDeleting = deletingId === list._id

    return (
      <motion.div
        key={list._id}
        layout
        {...fadeSlideUp}
        transition={ease.normal}
        animate={isDeleting ? { opacity: 0, x: -20, height: 0 } : { opacity: 1, x: 0 }}
        onClick={() => router.push(`/lists/${list._id}`)}
        onMouseEnter={() => setHoveredListId(list._id)}
        onMouseLeave={() => setHoveredListId(null)}
        className="group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-150 cursor-pointer"
        style={{
          backgroundColor: isHovered ? 'var(--bg-hover)' : 'transparent',
        }}
      >
        {/* Emoji icon — larger, with subtle bg */}
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-lg"
          style={{ backgroundColor: 'var(--bg-pane-2)' }}
        >
          {list.icon || '📋'}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
          <span
            className="text-[15px] font-medium truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {list.title || copy.list.untitled}
          </span>

          {showMeta && (
            <div className="flex items-center gap-3">
              {/* Privacy */}
              <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-faint)' }}>
                {list.isPrivate ? (
                  <>
                    <Lock size={10} strokeWidth={1.5} />
                    Private
                  </>
                ) : (
                  <>
                    <Globe size={10} strokeWidth={1.5} />
                    Shared
                  </>
                )}
              </span>

              {/* Collaborator count */}
              {list.collaborators && list.collaborators.length > 0 && (
                <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-faint)' }}>
                  <Users size={10} strokeWidth={1.5} />
                  {list.collaborators.length}
                </span>
              )}

              {/* Last modified */}
              {(list.updatedAt || list.createdAt) && (
                <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-faint)' }}>
                  <Clock size={10} strokeWidth={1.5} />
                  {formatRelativeDate(list.updatedAt || list.createdAt)}
                </span>
              )}

              {/* Type badge */}
              {list.type && list.type !== 'standard' && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize"
                  style={{
                    backgroundColor: 'var(--accent-soft)',
                    color: 'var(--accent)',
                  }}
                >
                  {list.type}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right actions — visible on hover */}
        <div className="flex items-center gap-1">
          {/* Delete */}
          <motion.button
            {...buttonPress}
            onClick={(e) => handleDelete(e, list._id)}
            aria-label="Delete list"
            className="flex h-7 w-7 items-center justify-center rounded-md transition-all duration-150 cursor-pointer"
            style={{
              opacity: isHovered ? 0.6 : 0,
              color: 'var(--text-faint)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              e.currentTarget.style.color = '#FF4D3D'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--text-faint)'
            }}
          >
            <Trash2 size={14} strokeWidth={1.5} />
          </motion.button>

          {/* Star */}
          <motion.button
            {...buttonPress}
            onClick={(e) => handleToggleStar(e, list._id, list.pinnedToFavorites)}
            aria-label="Toggle favorite"
            className="flex h-7 w-7 items-center justify-center rounded-md transition-all duration-150 cursor-pointer"
            style={{
              color: list.pinnedToFavorites ? 'var(--accent)' : isHovered ? 'var(--text-faint)' : 'transparent',
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
          </motion.button>

          {/* Arrow */}
          <ChevronRight
            size={16}
            strokeWidth={1.5}
            className="transition-opacity duration-150"
            style={{
              color: 'var(--text-faint)',
              opacity: isHovered ? 0.6 : 0,
            }}
          />
        </div>
      </motion.div>
    )
  }

  const renderGroup = (
    title: string,
    groupKey: string,
    groupLists: typeof lists,
    showMeta = true,
    emptyText = 'No lists',
    icon?: React.ReactNode,
  ) => {
    const isOpen = expandedGroups[groupKey] ?? true
    return (
      <div className="mb-6">
        <button
          onClick={() => toggleGroup(groupKey)}
          className="mb-1.5 flex items-center gap-2 px-2 py-1 cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={ease.fast}>
            <ChevronDown size={14} strokeWidth={1.5} />
          </motion.div>
          {icon}
          <span className="text-sm font-semibold">{title}</span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
            style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-faint)' }}
          >
            {groupLists.length}
          </span>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              {...collapse}
              transition={ease.normal}
              className="flex flex-col gap-0.5 overflow-hidden"
            >
              {groupLists.length === 0 ? (
                <p className="px-4 py-3 text-xs" style={{ color: 'var(--text-faint)' }}>
                  {emptyText}
                </p>
              ) : (
                groupLists.map((list) => renderListRow(list, showMeta))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="flex flex-col px-6 py-5">
      {/* Header row */}
      <div className="mb-1 flex items-start justify-between">
        <div />
        <div className="flex items-center gap-2">
          <motion.button
            {...buttonPress}
            aria-label="Filter"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <SlidersHorizontal size={18} strokeWidth={1.5} />
          </motion.button>
          <motion.button
            {...buttonPress}
            aria-label="More options"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <MoreVertical size={18} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>

      {/* Title */}
      <h1 className="mb-5 text-[32px]" style={{ color: 'var(--text-primary)' }}>
        {copy.listsDirectory.title}
      </h1>

      {/* Tip banner */}
      <div className="mb-5">
        <InfoBanner
          message={copy.listsDirectory.tipBanner}
          onDismiss={() => setTipDismissed(true)}
          visible={!tipDismissed}
        />
      </div>

      {/* New list button + filters row */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => {
            const active = activeFilter === f.key
            return (
              <motion.button
                key={f.key}
                {...buttonPress}
                onClick={() => setActiveFilter(f.key)}
                className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer"
                style={{
                  backgroundColor: active ? 'var(--text-primary)' : 'transparent',
                  color: active ? 'var(--bg-pane)' : 'var(--text-muted)',
                  border: active ? 'none' : '1px solid var(--border)',
                }}
              >
                {f.label}
              </motion.button>
            )
          })}
        </div>
        <motion.button
          {...buttonPress}
          onClick={handleCreateList}
          disabled={isCreating}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <Plus size={14} strokeWidth={2} />
          {copy.listsDirectory.newListCta}
        </motion.button>
      </div>

      {/* Search */}
      <div
        className="mb-6 flex items-center gap-2.5 rounded-xl px-4 py-3 transition-all duration-150"
        style={{
          backgroundColor: searchFocused ? 'var(--bg-pane-2)' : 'transparent',
          border: searchFocused ? '1px solid var(--accent)' : '1px solid var(--border)',
          boxShadow: searchFocused ? '0 0 0 3px var(--accent-soft)' : 'none',
        }}
      >
        <Search
          size={16}
          strokeWidth={1.5}
          style={{ color: searchFocused ? 'var(--accent)' : 'var(--text-faint)' }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder={copy.listsDirectory.searchPlaceholder}
          aria-label="Search lists"
          className="flex-1 bg-transparent text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          style={{ color: 'var(--text-primary)' }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs cursor-pointer"
            style={{ color: 'var(--text-faint)' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* List groups */}
      {search ? (
        /* Search results — flat */
        <motion.div className="flex flex-col gap-0.5" {...stagger()}>
          <AnimatePresence mode="popLayout">
            {filteredLists.length === 0 ? (
              <motion.p
                {...fadeSlideUp}
                transition={ease.normal}
                className="py-12 text-center text-sm"
                style={{ color: 'var(--text-faint)' }}
              >
                No lists matching &ldquo;{search}&rdquo;
              </motion.p>
            ) : (
              filteredLists.map((list) => renderListRow(list))
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Grouped view */
        <>
          {favoriteLists.length > 0 &&
            renderGroup(
              'Favorites',
              'favorites',
              favoriteLists,
              true,
              'No starred lists',
              <Star size={13} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />,
            )}

          {recentLists.length > 0 &&
            renderGroup(
              'Recent',
              'recent',
              recentLists,
              true,
              'No recent lists',
              <Clock size={13} strokeWidth={1.5} />,
            )}

          {renderGroup(
            activeFilter === 'all' ? 'All Lists' : FILTERS.find((f) => f.key === activeFilter)?.label || 'Lists',
            'all',
            filteredLists,
            true,
            copy.listsDirectory.emptyState,
            <Folder size={13} strokeWidth={1.5} />,
          )}
        </>
      )}
    </div>
  )
}
