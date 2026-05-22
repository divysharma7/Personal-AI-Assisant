import { WORKFLOW_TEMPLATES, getTemplateColumns } from './workflowTemplates'

describe('WORKFLOW_TEMPLATES', () => {
  it('has 6 entries', () => {
    expect(WORKFLOW_TEMPLATES).toHaveLength(6)
  })

  it('each template has type, name, icon, color, and columns', () => {
    for (const template of WORKFLOW_TEMPLATES) {
      expect(typeof template.type).toBe('string')
      expect(template.type.length).toBeGreaterThan(0)
      expect(typeof template.name).toBe('string')
      expect(template.name.length).toBeGreaterThan(0)
      expect(typeof template.icon).toBe('string')
      expect(typeof template.color).toBe('string')
      expect(Array.isArray(template.columns)).toBe(true)
    }
  })

  it('has expected template types', () => {
    const types = WORKFLOW_TEMPLATES.map((t) => t.type)
    expect(types).toEqual(['kanban', 'sprint', 'sales', 'content', 'matrix', 'custom'])
  })
})

describe('getTemplateColumns', () => {
  it('returns 3 columns for kanban', () => {
    const cols = getTemplateColumns('kanban')
    expect(cols).toHaveLength(3)
    expect(cols.map((c) => c.title)).toEqual(['Todo', 'In Progress', 'Done'])
  })

  it('returns 4 columns for sprint', () => {
    const cols = getTemplateColumns('sprint')
    expect(cols).toHaveLength(4)
  })

  it('returns 5 columns for sales', () => {
    const cols = getTemplateColumns('sales')
    expect(cols).toHaveLength(5)
  })

  it('returns 4 columns for content', () => {
    const cols = getTemplateColumns('content')
    expect(cols).toHaveLength(4)
  })

  it('returns 4 columns for matrix', () => {
    const cols = getTemplateColumns('matrix')
    expect(cols).toHaveLength(4)
  })

  it('returns empty array for custom', () => {
    const cols = getTemplateColumns('custom')
    expect(cols).toHaveLength(0)
  })

  it('returns empty array for unknown template type', () => {
    const cols = getTemplateColumns('nonexistent')
    expect(cols).toHaveLength(0)
  })

  it('generates columns with UUIDs as ids', () => {
    const cols = getTemplateColumns('kanban')
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    for (const col of cols) {
      expect(col.id).toMatch(uuidRegex)
    }
  })

  it('generates unique column IDs', () => {
    const cols = getTemplateColumns('kanban')
    const ids = cols.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('generates unique IDs across multiple calls', () => {
    const cols1 = getTemplateColumns('kanban')
    const cols2 = getTemplateColumns('kanban')
    const allIds = [...cols1.map((c) => c.id), ...cols2.map((c) => c.id)]
    expect(new Set(allIds).size).toBe(allIds.length)
  })

  it('sets correct order on columns', () => {
    const cols = getTemplateColumns('sales')
    cols.forEach((col, index) => {
      expect(col.order).toBe(index)
    })
  })

  it('sets wipLimit to null for all template columns', () => {
    const cols = getTemplateColumns('sprint')
    for (const col of cols) {
      expect(col.wipLimit).toBeNull()
    }
  })
})
