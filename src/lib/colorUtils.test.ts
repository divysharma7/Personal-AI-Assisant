import { hexToRgba } from './colorUtils'

describe('hexToRgba', () => {
  it('converts a valid 6-char hex to rgba', () => {
    expect(hexToRgba('FF0000', 1)).toBe('rgba(255,0,0,1)')
    expect(hexToRgba('00FF00', 0.5)).toBe('rgba(0,255,0,0.5)')
    expect(hexToRgba('0000FF', 0.8)).toBe('rgba(0,0,255,0.8)')
  })

  it('handles # prefix correctly', () => {
    expect(hexToRgba('#FF0000', 1)).toBe('rgba(255,0,0,1)')
    expect(hexToRgba('#3b82f6', 0.5)).toBe('rgba(59,130,246,0.5)')
  })

  it('returns fallback for short/invalid hex', () => {
    expect(hexToRgba('FFF', 1)).toBe('rgba(120,120,140,1)')
    expect(hexToRgba('AB', 0.5)).toBe('rgba(120,120,140,0.5)')
    expect(hexToRgba('', 1)).toBe('rgba(120,120,140,1)')
  })

  it('returns fallback for short hex with # prefix', () => {
    // '#FFF' -> clean = 'FFF' -> length 3 < 6 -> fallback
    expect(hexToRgba('#FFF', 0.7)).toBe('rgba(120,120,140,0.7)')
  })

  it('handles alpha 0 (fully transparent)', () => {
    expect(hexToRgba('#000000', 0)).toBe('rgba(0,0,0,0)')
  })

  it('handles alpha 1 (fully opaque)', () => {
    expect(hexToRgba('#FFFFFF', 1)).toBe('rgba(255,255,255,1)')
  })
})
