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

export const THEMES: ThemeDef[] = [
  {
    id: 'midnight', name: 'Midnight', mode: 'dark',
    accent: '#6366f1', accentHover: '#4f46e5',
    bg: '#070b14', surface: '#0c1220', card: '#111827', border: '#1a2744',
    text1: '#e2e8f0', text2: '#7b91ad', text3: '#3d5068',
  },
  {
    id: 'daylight', name: 'Daylight', mode: 'light',
    accent: '#6366f1', accentHover: '#4f46e5',
    bg: '#f4f6fb', surface: '#f9fafc', card: '#ffffff', border: '#e4e9f5',
    text1: '#0f172a', text2: '#4a5880', text3: '#9aa5c4',
  },
  {
    id: 'ocean', name: 'Ocean', mode: 'dark',
    accent: '#06b6d4', accentHover: '#0891b2',
    bg: '#0a1520', surface: '#0e1c2a', card: '#132635', border: '#1a3548',
    text1: '#e0f2fe', text2: '#7baacc', text3: '#3a6280',
  },
  {
    id: 'forest', name: 'Forest', mode: 'dark',
    accent: '#10b981', accentHover: '#059669',
    bg: '#0a1410', surface: '#0e1c15', card: '#132b1f', border: '#1a3d2a',
    text1: '#d1fae5', text2: '#6dba96', text3: '#325e47',
  },
  {
    id: 'sunset', name: 'Sunset', mode: 'light',
    accent: '#f59e0b', accentHover: '#d97706',
    bg: '#fefbf4', surface: '#fef7e8', card: '#ffffff', border: '#f0e0c0',
    text1: '#1c1208', text2: '#7a6530', text3: '#bba870',
  },
  {
    id: 'nord', name: 'Nord', mode: 'dark',
    accent: '#88c0d0', accentHover: '#5e81ac',
    bg: '#2e3440', surface: '#3b4252', card: '#434c5e', border: '#4c566a',
    text1: '#eceff4', text2: '#d8dee9', text3: '#81899c',
  },
]

export type DensityLevel = 'compact' | 'comfortable' | 'spacious'

export const DENSITY_SCALES: Record<DensityLevel, { padding: number; fontSize: number; gap: number }> = {
  compact:     { padding: 0.85, fontSize: 0.92, gap: 0.75 },
  comfortable: { padding: 1,    fontSize: 1,    gap: 1 },
  spacious:    { padding: 1.2,  fontSize: 1.05, gap: 1.3 },
}
