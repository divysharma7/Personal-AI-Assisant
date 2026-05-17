import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LAIF — Your intelligent life manager',
    short_name: 'LAIF',
    description: 'Tasks, calendar, habits, journal — all in one premium workspace with AI.',
    start_url: '/',
    display: 'standalone',
    background_color: '#070b14',
    theme_color: '#6366f1',
    orientation: 'any',
    categories: ['productivity', 'lifestyle'],
    icons: [
      { src: '/logo_new.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/logo_new.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Tasks', short_name: 'Tasks', url: '/tasks', icons: [{ src: '/logo_new.png', sizes: '96x96' }] },
      { name: 'Calendar', short_name: 'Calendar', url: '/calendar', icons: [{ src: '/logo_new.png', sizes: '96x96' }] },
      { name: 'Journal', short_name: 'Journal', url: '/journal', icons: [{ src: '/logo_new.png', sizes: '96x96' }] },
    ],
  }
}
