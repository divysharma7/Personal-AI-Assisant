import mongoose, { Schema, models } from 'mongoose'

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, default: '' },
  passwordHash: { type: String, required: true },
  // Google Calendar integration
  googleAccessToken: { type: String, default: null },
  googleRefreshToken: { type: String, default: null },
  googleCalendarId: { type: String, default: 'primary' },
  googleCalendarConnected: { type: Boolean, default: false },
}, { timestamps: true })

export default models.User || mongoose.model('User', UserSchema)
