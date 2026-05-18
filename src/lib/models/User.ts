import mongoose, { Schema, models } from 'mongoose'

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, default: '' },
  passwordHash: { type: String, required: true },
}, { timestamps: true })

export default models.User || mongoose.model('User', UserSchema)
