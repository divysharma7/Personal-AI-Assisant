'use client'

import {
  AlarmClock,
  CalendarDays,
  CalendarX2,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  Copy,
  FileText,
  Flag,
  FolderInput,
  Inbox,
  Link2,
  ListPlus,
  Pin,
  PinOff,
  Search,
  Tag,
  Trash2,
  XSquare,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import type { ListDoc } from '@/hooks/useLists'
import type { TaskRecord } from '@/hooks/useTasks'
import type { WorkflowDoc } from '@/hooks/useWorkflows'

type Priority = 'high' | 'medium' | 'low' | null
type FocusMode = 'POMO' | 'STOPWATCH'

interface TodayTaskContextMenuProps {
  task: TaskRecord
  position: { x: number; y: number }
  lists: ListDoc[]
  workflows: WorkflowDoc[]
  allTags: string[]
  pinned: boolean
  onClose: () => void
  onDateChange: (date: string | null) => void
  onPriorityChange: (priority: Priority) => void
  onAddSubtask: () => void
  onTogglePin: () => void
  onWontDo: () => void
  onMoveToList: (listId: string | null) => void
  onMoveToWorkflow: (workflowId: string, sectionId: string | null) => void
  onTagsChange: (tags: string[]) => void
  onStartFocus: (mode: FocusMode) => void
  onDuplicate: () => void
  onCopyLink: () => void
  onConvertToNote: () => void
  onDelete: () => void
}

function toLocalDueDate(daysFromToday: number) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)
  date.setHours(12, 0, 0, 0)
  return date.toISOString()
}

export default function TodayTaskContextMenu({
  task,
  position,
  lists,
  workflows,
  allTags,
  pinned,
  onClose,
  onDateChange,
  onPriorityChange,
  onAddSubtask,
  onTogglePin,
  onWontDo,
  onMoveToList,
  onMoveToWorkflow,
  onTagsChange,
  onStartFocus,
  onDuplicate,
  onCopyLink,
  onConvertToNote,
  onDelete,
}: TodayTaskContextMenuProps) {
  const [panel, setPanel] = useState<'move' | 'tags' | 'focus' | null>(null)
  const [search, setSearch] = useState('')
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)

  const visibleLists = useMemo(() => lists.filter((list) => !list.deletedAt && !list.isInbox), [lists])
  const visibleWorkflows = useMemo(() => workflows.filter((workflow) => !workflow.archived), [workflows])
  const normalizedSearch = search.trim().toLowerCase()
  const filteredLists = visibleLists.filter((list) => list.title.toLowerCase().includes(normalizedSearch))
  const filteredWorkflows = visibleWorkflows.filter((workflow) => workflow.name.toLowerCase().includes(normalizedSearch))
  const filteredTags = allTags.filter((tag) => tag.toLowerCase().includes(normalizedSearch))
  const activeWorkflow = visibleWorkflows.find((workflow) => workflow._id === activeWorkflowId)

  const openPanel = (next: Exclude<typeof panel, null>) => {
    if (panel === next) return
    setPanel(next)
    setSearch('')
    setActiveWorkflowId(null)
  }

  const togglePanel = (next: Exclude<typeof panel, null>) => {
    setPanel((current) => current === next ? null : next)
    setSearch('')
    setActiveWorkflowId(null)
  }

  const applyAndClose = (action: () => void) => {
    action()
    onClose()
  }

  const toggleTag = (tag: string) => {
    const next = task.tags?.includes(tag)
      ? (task.tags ?? []).filter((item) => item !== tag)
      : [...(task.tags ?? []), tag]
    onTagsChange(next)
  }

  const addTypedTag = () => {
    const tag = search.trim().replace(/^#/, '')
    if (!tag || task.tags?.includes(tag)) return
    onTagsChange([...(task.tags ?? []), tag])
    setSearch('')
  }

  return (
    <div
      className="workspace-task-context-menu"
      style={{ left: position.x, top: position.y }}
      role="menu"
      aria-label={`${task.title} actions`}
      onContextMenu={(event) => event.preventDefault()}
    >
      <p className="workspace-context-label">Date</p>
      <div className="workspace-task-quick-actions workspace-date-actions">
        <button type="button" title="Today" aria-label="Set date to today" onClick={() => applyAndClose(() => onDateChange(toLocalDueDate(0)))}><CalendarDays size={17} /></button>
        <button type="button" title="Tomorrow" aria-label="Set date to tomorrow" onClick={() => applyAndClose(() => onDateChange(toLocalDueDate(1)))}><AlarmClock size={17} /></button>
        <button type="button" title="Next week" aria-label="Set date to next week" onClick={() => applyAndClose(() => onDateChange(toLocalDueDate(7)))}><span className="workspace-calendar-seven">7</span></button>
        <button type="button" title="Choose date" aria-label="Choose a date" onClick={() => {
          const input = dateInputRef.current
          if (!input) return
          if (typeof input.showPicker === 'function') input.showPicker()
          else input.click()
        }}><CalendarDays size={17} /></button>
        <button type="button" title="No date" aria-label="Remove due date" onClick={() => applyAndClose(() => onDateChange(null))}><CalendarX2 size={17} /></button>
        <input
          ref={dateInputRef}
          className="workspace-context-date-input"
          type="date"
          tabIndex={-1}
          onChange={(event) => {
            if (!event.target.value) return
            applyAndClose(() => onDateChange(new Date(`${event.target.value}T12:00:00`).toISOString()))
          }}
        />
      </div>

      <p className="workspace-context-label">Priority</p>
      <div className="workspace-task-quick-actions workspace-priority-actions">
        {([
          ['high', '#db5147', 'High priority'],
          ['medium', '#d8ad42', 'Medium priority'],
          ['low', '#6874ed', 'Low priority'],
          [null, '#96969b', 'No priority'],
        ] as const).map(([priority, color, label]) => (
          <button
            key={priority ?? 'none'}
            type="button"
            title={label}
            aria-label={label}
            className={task.priority === priority || (!task.priority && priority === null) ? 'is-active' : ''}
            onClick={() => applyAndClose(() => onPriorityChange(priority))}
          >
            <Flag size={17} fill={color} color={color} />
          </button>
        ))}
      </div>

      <div className="workspace-context-rule" />
      <button type="button" role="menuitem" onClick={() => applyAndClose(onAddSubtask)}><ListPlus size={16} /><span>Add Subtask</span></button>
      <button type="button" role="menuitem" onClick={() => applyAndClose(onTogglePin)}>{pinned ? <PinOff size={16} /> : <Pin size={16} />}<span>{pinned ? 'Unpin' : 'Pin'}</span></button>
      <button type="button" role="menuitem" onClick={() => applyAndClose(onWontDo)}><XSquare size={16} /><span>Won&apos;t Do</span></button>

      <div className="workspace-context-cascade">
        <button type="button" role="menuitem" onMouseEnter={() => openPanel('move')} onClick={() => togglePanel('move')} className={panel === 'move' ? 'is-active' : ''}><FolderInput size={16} /><span>Move to</span><ChevronRight size={14} className="workspace-menu-trailing" /></button>
        {panel === 'move' && (
          <div className="workspace-task-submenu workspace-move-submenu" role="menu" aria-label="Move task">
            <label className="workspace-context-search"><Search size={14} /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" /></label>
            <div className="workspace-submenu-scroll">
              {!normalizedSearch && (
                <button type="button" role="menuitem" onClick={() => applyAndClose(() => onMoveToList(null))}><Inbox size={15} /><span>Inbox</span>{!task.listId && !task.workflowId ? <Check size={14} /> : null}</button>
              )}
              {filteredLists.map((list) => (
                <button key={list._id} type="button" role="menuitem" onClick={() => applyAndClose(() => onMoveToList(list._id))}>
                  <span className="workspace-destination-icon">{list.icon || '•'}</span><span>{list.title}</span>{task.listId === list._id ? <Check size={14} /> : null}
                </button>
              ))}
              {filteredWorkflows.length > 0 && <p className="workspace-submenu-label">Workflows</p>}
              {filteredWorkflows.map((workflow) => (
                <div className="workspace-workflow-destination" key={workflow._id} onMouseEnter={() => setActiveWorkflowId(workflow._id)}>
                  <button type="button" role="menuitem" onClick={() => applyAndClose(() => onMoveToWorkflow(workflow._id, workflow.columns[0]?.id ?? null))}>
                    <span className="workspace-destination-icon">{workflow.icon || '◆'}</span><span>{workflow.name}</span><ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
            {activeWorkflow && activeWorkflow.columns.length > 0 && (
              <div className="workspace-task-submenu workspace-workflow-columns" role="menu" aria-label={`${activeWorkflow.name} columns`}>
                <p className="workspace-submenu-label">{activeWorkflow.name}</p>
                {activeWorkflow.columns.map((column) => (
                  <button key={column.id} type="button" role="menuitem" onClick={() => applyAndClose(() => onMoveToWorkflow(activeWorkflow._id, column.id))}>
                    <span className="workspace-column-dot" style={{ backgroundColor: column.color || activeWorkflow.color }} /><span>{column.title}</span>{task.workflowId === activeWorkflow._id && task.sectionId === column.id ? <Check size={14} /> : null}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="workspace-context-cascade">
        <button type="button" role="menuitem" onMouseEnter={() => openPanel('tags')} onClick={() => togglePanel('tags')} className={panel === 'tags' ? 'is-active' : ''}><Tag size={16} /><span>Tags</span><ChevronRight size={14} className="workspace-menu-trailing" /></button>
        {panel === 'tags' && (
          <div className="workspace-task-submenu workspace-tags-submenu" role="menu" aria-label="Task tags">
            <label className="workspace-context-search"><Search size={14} /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addTypedTag() }} placeholder="Search or add tag" /></label>
            <div className="workspace-submenu-scroll">
              {filteredTags.map((tag) => <button key={tag} type="button" role="menuitemcheckbox" aria-checked={task.tags?.includes(tag)} onClick={() => toggleTag(tag)}><Tag size={14} /><span>{tag}</span>{task.tags?.includes(tag) ? <Check size={14} /> : null}</button>)}
              {normalizedSearch && !allTags.some((tag) => tag.toLowerCase() === normalizedSearch) && <button type="button" onClick={addTypedTag}><Tag size={14} /><span>Add “{search.trim()}”</span></button>}
              {!normalizedSearch && allTags.length === 0 && <p className="workspace-submenu-empty">Type to create a tag</p>}
            </div>
          </div>
        )}
      </div>

      <div className="workspace-context-rule" />
      <div className="workspace-context-cascade">
        <button type="button" role="menuitem" onMouseEnter={() => openPanel('focus')} onClick={() => togglePanel('focus')} className={panel === 'focus' ? 'is-active' : ''}><CircleDot size={16} /><span>Start Focus</span><ChevronRight size={14} className="workspace-menu-trailing" /></button>
        {panel === 'focus' && (
          <div className="workspace-task-submenu workspace-focus-submenu" role="menu" aria-label="Focus mode">
            <button type="button" role="menuitem" onClick={() => applyAndClose(() => onStartFocus('POMO'))}><CircleDot size={15} /><span>Pomodoro</span></button>
            <button type="button" role="menuitem" onClick={() => applyAndClose(() => onStartFocus('STOPWATCH'))}><Clock3 size={15} /><span>Stopwatch</span></button>
          </div>
        )}
      </div>

      <div className="workspace-context-rule" />
      <button type="button" role="menuitem" onClick={() => applyAndClose(onDuplicate)}><Copy size={16} /><span>Duplicate</span></button>
      <button type="button" role="menuitem" onClick={() => applyAndClose(onCopyLink)}><Link2 size={16} /><span>Copy Link</span></button>
      <button type="button" role="menuitem" onClick={() => applyAndClose(onConvertToNote)}><FileText size={16} /><span>Convert to Note</span></button>
      <button type="button" role="menuitem" className="is-danger" onClick={() => applyAndClose(onDelete)}><Trash2 size={16} /><span>Delete</span></button>
    </div>
  )
}
