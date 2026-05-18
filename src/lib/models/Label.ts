import mongoose, { Schema, models } from 'mongoose'

const LabelSchema = new Schema({
  name: { type: String, required: true },
  ownerId: { type: String, required: true },
  color: { type: String, default: null },
}, { timestamps: true })

LabelSchema.index({ ownerId: 1, name: 1 }, { unique: true })

export default models.Label || mongoose.model('Label', LabelSchema)
