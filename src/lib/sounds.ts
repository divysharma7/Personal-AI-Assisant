/**
 * Shared audio utilities — completion chime, etc.
 * Extracted from page.tsx so all task surfaces can play the same sound.
 */

const TONES = [523.25, 587.33, 659.25, 783.99, 880.0]

export function playCompletionSound() {
  try {
    const ctx = new AudioContext()
    const freq = TONES[Math.floor(Math.random() * TONES.length)]
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.value = 0.12
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  } catch {
    // Audio not available
  }
}
