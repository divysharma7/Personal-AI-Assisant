import mongoose, { Schema, models } from 'mongoose'

const TaskSchema = new Schema({
  type: { type: String, default: 'task' },
  title: { type: String, required: true },
  description: String,
  notes: { type: mongoose.Schema.Types.Mixed, default: null },
  dueDate: Date,
  priority: { type: String, enum: ['low', 'medium', 'high', null], default: 'medium' },
  status: { type: String, enum: ['backlog', 'todo', 'in-progress', 'done', 'dropped'], default: 'backlog' },
  color: { type: String, default: '#34d399' },
  umbrellas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Umbrella' }],
  comments: [{ text: { type: String, required: true }, createdAt: { type: Date, default: Date.now }, authorName: String, authorAvatar: String }],
  tags: [{ type: String }],
  // Phase 3: enhanced task fields
  labelIds: [{ type: String }],
  assigneeId: { type: String, default: null },
  repeat: { type: String, enum: ['daily', 'weekdays', 'weekly', 'monthly', 'yearly', null], default: null },
  completedAt: { type: Date, default: null },
  listId: { type: String, default: null },
  createdBy: { type: String, default: null },
  // Calendar & scheduling fields
  scheduledStart: { type: Date, default: null },
  scheduledEnd: { type: Date, default: null },
  estimatedEffort: { type: Number, default: null },
  actualEffort: { type: Number, default: 0 },
  googleEventId: { type: String, default: null },
  calendarSynced: { type: Boolean, default: false },
  // Nested task fields
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  depth: { type: Number, default: 0 },
  path: { type: String, default: '/' },
  order: { type: Number, default: 0 },
}, { timestamps: true })

TaskSchema.index({ parentId: 1, order: 1 })

export default models.Task || mongoose.model('Task', TaskSchema)
