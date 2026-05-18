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
  // Timezone & push devices
  timezone: { type: String, default: 'UTC' },
  pushDevices: [{
    type: { type: String, enum: ['web', 'ios', 'android'] },
    token: String,
    deviceName: String,
    addedAt: { type: Date, default: Date.now },
    lastSeenAt: Date,
    isActive: { type: Boolean, default: true },
  }],
  // Habit settings
  habitSettings: {
    checkinNudgeTime: { type: String, default: '21:00' },
    quietHoursStart: { type: String, default: '22:00' },
    quietHoursEnd: { type: String, default: '07:00' },
    streakFreezeEnabled: { type: Boolean, default: true },
    celebrationEnabled: { type: Boolean, default: true },
  },
}, { timestamps: true })

export default models.User || mongoose.model('User', UserSchema)
