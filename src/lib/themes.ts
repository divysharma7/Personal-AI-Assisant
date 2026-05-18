export type ThemeId = 'light' | 'dark' | 'blackout' | 'system'

export interface ThemeDef {
  id: ThemeId
  name: string
  mode: 'light' | 'dark'
  bg: string
  card: string
  accent: string
  text1: string
}

export const THEMES: ThemeDef[] = [
  { id: 'light', name: 'Light', mode: 'light', bg: '#F5F0EB', card: '#FFFFFF', accent: '#6366f1', text1: '#1A1A1A' },
  { id: 'dark', name: 'Dark', mode: 'dark', bg: '#0D0D0D', card: '#141414', accent: '#6366f1', text1: '#F0F0F0' },
  { id: 'blackout', name: 'Blackout', mode: 'dark', bg: '#000000', card: '#0A0A0A', accent: '#6366f1', text1: '#F0F0F0' },
  { id: 'system', name: 'System', mode: 'light', bg: '#F5F0EB', card: '#FFFFFF', accent: '#6366f1', text1: '#1A1A1A' },
]

export type DensityLevel = 'compact' | 'comfortable' | 'spacious'

export const DENSITY_SCALES: Record<DensityLevel, { padding: number; fontSize: number; gap: number }> = {
  compact:     { padding: 0.85, fontSize: 0.93, gap: 0.75 },
  comfortable: { padding: 1,    fontSize: 1,    gap: 1 },
  spacious:    { padding: 1.2,  fontSize: 1.05, gap: 1.3 },
}
