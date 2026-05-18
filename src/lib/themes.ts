export interface ThemeDef {
  id: string
  name: string
  mode: 'dark' | 'light'
  accent: string
  accentHover: string
  bg: string
  surface: string
  card: string
  border: string
  text1: string
  text2: string
  text3: string
}

// Superlist-inspired themes — flat, minimal, no shadows
export const THEMES: ThemeDef[] = [
  {
    id: 'midnight', name: 'Midnight', mode: 'dark',
    accent: '#6366f1', accentHover: '#5558e8',
    bg: '#0D0D0D', surface: '#141414', card: '#141414', border: 'rgba(255,255,255,0.06)',
    text1: '#F0F0F0', text2: '#888888', text3: '#555555',
  },
  {
    id: 'daylight', name: 'Daylight', mode: 'light',
    accent: '#6366f1', accentHover: '#5558e8',
    bg: '#FAFAFA', surface: '#F5F5F5', card: '#FFFFFF', border: 'rgba(0,0,0,0.06)',
    text1: '#1A1A1A', text2: '#777777', text3: '#AAAAAA',
  },
  {
    id: 'ocean', name: 'Ocean', mode: 'dark',
    accent: '#22d3ee', accentHover: '#06b6d4',
    bg: '#0A0F14', surface: '#101820', card: '#101820', border: 'rgba(255,255,255,0.06)',
    text1: '#E8F4F8', text2: '#6B9DB5', text3: '#3A6070',
  },
  {
    id: 'forest', name: 'Forest', mode: 'dark',
    accent: '#34d399', accentHover: '#10b981',
    bg: '#0A0F0A', surface: '#101810', card: '#101810', border: 'rgba(255,255,255,0.06)',
    text1: '#E8F5E8', text2: '#6BB580', text3: '#3A6048',
  },
  {
    id: 'sunset', name: 'Sunset', mode: 'light',
    accent: '#F59E0B', accentHover: '#D97706',
    bg: '#FDFAF5', surface: '#F8F3EA', card: '#FFFFFF', border: 'rgba(0,0,0,0.06)',
    text1: '#1A1408', text2: '#8A7550', text3: '#BBA880',
  },
  {
    id: 'nord', name: 'Nord', mode: 'dark',
    accent: '#88C0D0', accentHover: '#81A1C1',
    bg: '#242933', surface: '#2E3440', card: '#2E3440', border: 'rgba(255,255,255,0.06)',
    text1: '#ECEFF4', text2: '#8893A5', text3: '#5C6678',
  },
]

export type DensityLevel = 'compact' | 'comfortable' | 'spacious'

export const DENSITY_SCALES: Record<DensityLevel, { padding: number; fontSize: number; gap: number }> = {
  compact:     { padding: 0.85, fontSize: 0.93, gap: 0.75 },
  comfortable: { padding: 1,    fontSize: 1,    gap: 1 },
  spacious:    { padding: 1.2,  fontSize: 1.05, gap: 1.3 },
}
