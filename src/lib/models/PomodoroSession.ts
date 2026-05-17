import mongoose, { Schema, models } from 'mongoose'

const PomodoroSessionSchema = new Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  taskTitle: { type: String, default: '' },
  type: { type: String, enum: ['focus', 'break'], required: true },
  duration: { type: Number, required: true },  // seconds
  startedAt: { type: Date, required: true },
  completedAt: { type: Date, default: null },  // null if interrupted
  completed: { type: Boolean, default: false },
}, { timestamps: true })

PomodoroSessionSchema.index({ startedAt: -1 })

export default models.PomodoroSession || mongoose.model('PomodoroSession', PomodoroSessionSchema)
