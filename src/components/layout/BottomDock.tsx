'use client'

// Bottom dock is no longer shown. The app uses a sidebar-based navigation
// and shows a "desktop only" notice on viewports < 1024px.
// Keeping the component as a no-op to avoid breaking imports.
export default function BottomDock() {
  return null
}
