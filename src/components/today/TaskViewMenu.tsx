'use client'

import {
  Columns3,
  Eye,
  EyeOff,
  List,
  ListFilter,
  PanelTop,
  Printer,
  SlidersHorizontal,
} from 'lucide-react'

export type WorkspaceView = 'list' | 'columns'

interface TaskViewMenuProps {
  view: WorkspaceView
  showCompleted: boolean
  showDetails: boolean
  compact: boolean
  optionsOpen: boolean
  onViewChange: (view: WorkspaceView) => void
  onToggleCompleted: () => void
  onToggleDetails: () => void
  onToggleOptions: () => void
  onToggleCompact: () => void
  onPrint: () => void
}

export default function TaskViewMenu({
  view,
  showCompleted,
  showDetails,
  compact,
  optionsOpen,
  onViewChange,
  onToggleCompleted,
  onToggleDetails,
  onToggleOptions,
  onToggleCompact,
  onPrint,
}: TaskViewMenuProps) {
  return (
    <div className="task-view-menu" role="menu" aria-label="View options">
      <p className="task-view-menu-label">View</p>
      <div className="task-view-choices" role="group" aria-label="Layout">
        <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => onViewChange('list')} aria-label="List view">
          <List size={19} />
        </button>
        <button type="button" className={view === 'columns' ? 'is-active' : ''} onClick={() => onViewChange('columns')} aria-label="Column view">
          <Columns3 size={19} />
        </button>
        <button type="button" disabled aria-label="Timeline view unavailable"><PanelTop size={19} /></button>
      </div>

      <div className="task-view-menu-rule" />
      <button type="button" className="task-view-menu-row" onClick={onToggleCompleted} role="menuitem">
        {showCompleted ? <EyeOff size={16} /> : <Eye size={16} />}
        <span>{showCompleted ? 'Hide Completed' : 'Show Completed'}</span>
      </button>
      <button type="button" className="task-view-menu-row" onClick={onToggleDetails} role="menuitem">
        <ListFilter size={16} />
        <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
      </button>
      <button type="button" className={`task-view-menu-row${optionsOpen ? ' is-active' : ''}`} onClick={onToggleOptions} role="menuitem" aria-expanded={optionsOpen}>
        <SlidersHorizontal size={16} />
        <span>View Options</span>
      </button>
      {optionsOpen && (
        <button type="button" className="task-view-menu-subrow" onClick={onToggleCompact} role="menuitemcheckbox" aria-checked={compact}>
          <span>Compact cards</span><span className={`task-view-check${compact ? ' is-checked' : ''}`}>{compact ? '✓' : ''}</span>
        </button>
      )}
      <div className="task-view-menu-rule" />
      <button type="button" className="task-view-menu-row" onClick={onPrint} role="menuitem">
        <Printer size={16} /><span>Print</span>
      </button>
    </div>
  )
}

