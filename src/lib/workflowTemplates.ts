import { v4 as uuidv4 } from 'uuid'

export interface TemplateColumn {
  id: string
  title: string
  order: number
  color: string | null
  wipLimit: number | null
}

export interface WorkflowTemplate {
  type: string
  name: string
  icon: string
  color: string
  columns: Array<{ title: string; color: string | null }>
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    type: 'kanban',
    name: 'Kanban',
    icon: '📋',
    color: '#0f62fe',
    columns: [
      { title: 'Todo', color: '#94a3b8' },
      { title: 'In Progress', color: '#3b82f6' },
      { title: 'Done', color: '#22c55e' },
    ],
  },
  {
    type: 'sprint',
    name: 'Sprint',
    icon: '🏃',
    color: '#8b5cf6',
    columns: [
      { title: 'Backlog', color: '#94a3b8' },
      { title: 'Sprint', color: '#f59e0b' },
      { title: 'In Review', color: '#3b82f6' },
      { title: 'Done', color: '#22c55e' },
    ],
  },
  {
    type: 'sales',
    name: 'Sales Pipeline',
    icon: '💰',
    color: '#10b981',
    columns: [
      { title: 'Lead', color: '#94a3b8' },
      { title: 'Contacted', color: '#f59e0b' },
      { title: 'Proposal', color: '#3b82f6' },
      { title: 'Negotiation', color: '#8b5cf6' },
      { title: 'Closed', color: '#22c55e' },
    ],
  },
  {
    type: 'content',
    name: 'Content Pipeline',
    icon: '✍️',
    color: '#ec4899',
    columns: [
      { title: 'Idea', color: '#94a3b8' },
      { title: 'Draft', color: '#f59e0b' },
      { title: 'Review', color: '#3b82f6' },
      { title: 'Published', color: '#22c55e' },
    ],
  },
  {
    type: 'matrix',
    name: 'Eisenhower Matrix',
    icon: '🎯',
    color: '#ef4444',
    columns: [
      { title: 'Urgent + Important', color: '#ef4444' },
      { title: 'Important', color: '#f59e0b' },
      { title: 'Urgent', color: '#3b82f6' },
      { title: 'Neither', color: '#94a3b8' },
    ],
  },
  {
    type: 'custom',
    name: 'Custom',
    icon: '⚙️',
    color: '#6b7280',
    columns: [],
  },
]

export function getTemplateColumns(type: string): TemplateColumn[] {
  const template = WORKFLOW_TEMPLATES.find((t) => t.type === type)
  if (!template) return []

  return template.columns.map((col, index) => ({
    id: uuidv4(),
    title: col.title,
    order: index,
    color: col.color,
    wipLimit: null,
  }))
}
