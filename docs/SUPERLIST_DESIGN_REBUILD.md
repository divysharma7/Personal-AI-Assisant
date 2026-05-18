# Superlist Design Rebuild — Roadmap

## Superlist's Design DNA (extracted from research)

### Visual Principles
1. **Flat, not elevated** — No card shadows, no glass morphism, no border-heavy cards
2. **Space IS the design** — Generous padding (16-24px), breathing room between items
3. **Typography hierarchy does the work** — Large bold titles, subtle secondary text, no decorative elements
4. **Borders barely exist** — Single pixel, very low opacity, or none at all
5. **Color is rare and intentional** — Accent only on interactive elements, priorities, and list identifiers
6. **Content constrained** — Max-width ~720px on main content, never stretches full-width
7. **Sound and motion** — Completion sounds change each time, spring animations, playful micro-interactions

### Color System
- Dark: Deep black (#0D0D0D bg, #1A1A1A surfaces, #2A2A2A borders at 30% opacity)
- Light: Pure white (#FFFFFF cards, #F7F7F7 bg, #EEEEEE borders)
- Text: High contrast primary (#F5F5F5 dark / #1A1A1A light), muted secondary (#888)
- Accent: Per-theme (9 themes), default warm
- Priority: Red (#FF3B30), Yellow (#FFCC00), Blue (#007AFF), Gray (default)

### Typography
- Font: Inter (already loaded)
- Title: 28-32px, -0.02em tracking, font-weight 700
- Section header: 11-12px, uppercase, letter-spacing 0.08em, muted color
- Task title: 15px, font-weight 500, primary color
- Secondary: 13px, font-weight 400, muted color
- Line height: 1.5 body, 1.2 headings

### Sidebar
- Width: 240px desktop, hidden on mobile
- Sections: Today, Inbox, Upcoming, then user lists
- Items: text-based with small icon, 40px row height
- Active: subtle background fill, bold text, accent dot
- Bottom: settings, theme toggle, logout — minimal

### Task Row
- 48px minimum height
- Round checkbox 20px, border 2px, fills with accent on complete
- Title is dominant — 15px medium weight
- Due date small badge, right-aligned, appears on hover
- NO visible row borders — spacing alone separates
- Hover: very subtle bg change (2-4% opacity)

### Empty States
- Centered text, muted color, encouraging message
- No illustrations (Superlist is text-minimal)

---

## Execution Plan (2 hours)

### Block 1: CSS Foundation (30 min)
- [ ] Rewrite CSS variables for Superlist palette
- [ ] Remove all box-shadow from cards
- [ ] Soften all borders (opacity 0.06-0.1)
- [ ] Typography scale (Inter, proper sizes)
- [ ] Add --content-max-width: 720px
- [ ] Button/input redesign (rounder, softer)

### Block 2: Sidebar + AppShell (20 min)
- [ ] Polish SuperlistSidebar spacing and colors
- [ ] Proper active states (subtle, not loud)
- [ ] Section headers (Today/Inbox/Workspace)
- [ ] Bottom zone (settings/theme/logout)

### Block 3: Dashboard Home (20 min)
- [ ] Clean Today view with proper spacing
- [ ] Section headers: tiny uppercase muted
- [ ] Task rows: flat, spacious, clean checkboxes
- [ ] Content max-width centered
- [ ] Soft empty states

### Block 4: Tasks Page (20 min)
- [ ] Task list rows match Superlist style
- [ ] View switcher softer
- [ ] QuickAddBar cleaner
- [ ] TaskDetailPage: more space, less borders

### Block 5: Calendar + Other Pages (20 min)
- [ ] Calendar header simplified
- [ ] Reduce border weight throughout
- [ ] Settings page match new aesthetic
- [ ] Habits/Stats pages consistent

### Block 6: Final Polish (10 min)
- [ ] Build check
- [ ] Commit
- [ ] Visual consistency audit
