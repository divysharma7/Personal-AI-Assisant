import { z } from 'zod'

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(500),
  priority: z.enum(['low', 'medium', 'high']).optional().nullable(),
  status: z.enum(['backlog', 'todo', 'in-progress', 'done', 'dropped']).optional(),
  dueDate: z.string().optional().nullable(),
  scheduledStart: z.string().optional().nullable(),
  scheduledEnd: z.string().optional().nullable(),
  listId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  estimatedEffort: z.number().optional().nullable(),
  parentId: z.string().optional().nullable(),
  labelIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  kanbanOrder: z.number().optional(),
  sectionId: z.string().optional().nullable(),
  workflowId: z.string().optional().nullable(),
  reminders: z.array(z.object({
    id: z.string(),
    type: z.enum(['before-start', 'on-day-at', 'absolute']),
    offsetMinutes: z.number().optional(),
    timeOfDay: z.string().nullable().optional(),
    absoluteTime: z.string().nullable().optional(),
    sent: z.boolean().optional(),
  })).optional(),
  repeat: z.string().nullable().optional(),
})

export const UpdateTaskSchema = CreateTaskSchema.partial()

// ── Workflow schemas ───────────────────────────────────────────────────────

export const WorkflowColumnSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(100),
  order: z.number().int().min(0),
  color: z.string().nullable().optional(),
  wipLimit: z.number().int().min(1).nullable().optional(),
})

export const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  icon: z.string().max(10).optional(),
  color: z.string().max(20).optional(),
  templateType: z.enum(['kanban', 'sprint', 'sales', 'content', 'matrix', 'custom']),
  columns: z.array(WorkflowColumnSchema).optional(),
  labelIds: z.array(z.string()).optional(),
  order: z.number().optional(),
})

export const UpdateWorkflowSchema = CreateWorkflowSchema.partial().extend({
  archived: z.boolean().optional(),
})

// ── Helpers ────────────────────────────────────────────────────────────────

export function parseBody<T>(schema: z.ZodType<T>, body: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(body)
  if (!result.success) return { success: false, error: result.error.issues.map(i => i.message).join(', ') }
  return { success: true, data: result.data }
}
