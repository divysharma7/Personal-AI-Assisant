import mongoose, { Schema, models } from 'mongoose'

const TaskSchema = new Schema({
  type: { type: String, default: 'task' },
  title: { type: String, required: true },
  description: String,
  notes: { type: mongoose.Schema.Types.Mixed, default: null },
  dueDate: Date,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  color: { type: String, default: '#34d399' },
  umbrellas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Umbrella' }],
  comments: [{ text: { type: String, required: true }, createdAt: { type: Date, default: Date.now } }],
  tags: [{ type: String }],
  // Nested task fields
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  depth: { type: Number, default: 0 },
  path: { type: String, default: '/' },
  order: { type: Number, default: 0 },
}, { timestamps: true })

TaskSchema.index({ parentId: 1, order: 1 })

export default models.Task || mongoose.model('Task', TaskSchema)
