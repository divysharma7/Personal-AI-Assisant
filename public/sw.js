// Service worker — PWA caching + Web Push notifications
const CACHE_VERSION = 'PIM-v2'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`

const PRECACHE_URLS = ['/', '/logo_new.png', '/sounds/chime.wav']

// ── Install: pre-cache static assets ─────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// ── Activate: clean old caches, claim clients ────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== STATIC_CACHE && k !== RUNTIME_CACHE).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// ── Fetch: cache-first for static, network-first for API ─────────────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET') return
  if (!url.origin.startsWith(self.location.origin)) return

  // API: network-first with cached fallback
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(RUNTIME_CACHE).then(c => c.put(e.request, clone))
          }
          return res
        })
        .catch(() => caches.match(e.request))
    )
    return
  }

  // Static assets: cache-first
  if (url.pathname.match(/\.(js|css|png|jpg|svg|gif|webp|woff2?|ttf|ico|wav|mp3)$/) || url.pathname.startsWith('/_next/static/')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(STATIC_CACHE).then(c => c.put(e.request, clone))
          }
          return res
        })
      })
    )
    return
  }

  // HTML pages: network-first, fall back to cached shell
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(RUNTIME_CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request).then(c => c || caches.match('/')))
  )
})

// ── Web Push ──────────────────────────────────────────────────────────────────
self.addEventListener('push', e => {
  let data = {}
  try { data = e.data?.json() ?? {} } catch { data = { title: 'PIM', body: e.data?.text() ?? '' } }

  const title = data.title ?? 'PIM'
  const options = {
    body: data.body ?? '',
    icon: '/logo_new.png',
    badge: '/logo_new.png',
    tag: data.tag ?? 'PIM-notification',
    data: { url: data.url ?? '/' },
    vibrate: [200, 100, 200],
  }
  e.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url ?? '/'
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url === url && 'focus' in c)
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    })
  )
})
