# Superlist Design Rebuild — Definitive Plan

Based on 159 actual Superlist screenshots (Mobbin capture, March 2024).

---

## What Superlist ACTUALLY Looks Like

### Three-Column Layout
- **Left sidebar** (~180px): Flat, no background distinction from main — same bg color
- **Center content** (~520px): The list/document area, white/light card with subtle rounded corners
- **Right panel**: Beautiful full-bleed landscape artwork (Unsplash), acts as ambient wallpaper

### Sidebar Anatomy (exact)
```
Inbox          (red/orange icon)
Today          (yellow icon)  
Tasks          (orange/red icon)
Messages       (red icon)

Recent         (section label — tiny gray text)

Lists          (section label)
📄 User Interview Prep    |  (red accent bar on active)
👋 Getting Started
  ∨ Work
      📊 This Week
      📝 Meeting Notes
  > Personal
      🍎 Groceries
      📖 Reading List  
      🎯 Habits

[Avatar at bottom-left]
```

Key observations:
- NO borders on sidebar — separator is the content card's left edge
- Active item has a red/accent vertical bar on the RIGHT side of the text
- Section labels ("Lists", "Recent") are tiny, gray, uppercase
- List items have emoji icons, not Lucide icons
- Nested lists with expand/collapse chevrons
- User avatar at very bottom of sidebar

### Content Area
- White/light card with very subtle rounded corners (16px)
- Title is HUGE — 36-40px, serif-feeling bold weight
- "Share" button + "This list is private" label at top
- Star (favorite) + three-dot menu at top right
- Task rows: circle checkbox → title → right side actions
- Inline add: "Add a task, or type '/' to choose a different content type"
- Rich text notes mixed with tasks (block-based editor)
- Subtask indicator: "0/2" with icon
- Due dates shown as small muted text: "in 2 days, 11 AM"
- Tags shown as tiny text with tag icon

### Task Detail Panel (right side)
- Opens as a RIGHT panel overlay (NOT full page, NOT bottom sheet)
- Header: X close + "Complete" button + avatar + three-dot menu  
- Task title is large and bold (~24px)
- Metadata row: due date icon, subtask count, tag, list name
- Subtask checkboxes below
- "Created by Jane · 21 min ago" footer
- "Leave a message..." input at bottom (per-task discussion)
- Clean white background, no borders between sections

### Settings Page
- Same three-column layout
- "Settings" title is 36px bold
- Tab pills: Profile | Features | Subscriptions | Integrations
- Content in rounded cards with subtle gray background
- "Sign out" link at top right — not a button
- Toggle switches are green when on (iOS-style)
- Blackout theme turns EVERYTHING pure black

### Onboarding
- Full-screen dramatic landscape background (moon over desert/ocean)
- Glass-morphism card floating in center (frosted dark glass)
- Step progress: two thin lines at top (step 1 of 2)
- "What should we call you?" → single input + Next button
- "How do you want to use Superlist?" → radio buttons
- Red/orange accent checkbox when selected

### Color Palette (extracted from screenshots)
```
Light mode:
  bg:        #F5F0EB (warm cream, NOT pure white)
  sidebar:   Same as bg — no visual separation
  card:      #FFFFFF (white) with 1px border rgba(0,0,0,0.06)
  text-1:    #1A1A1A (near black)
  text-2:    #777777 (medium gray)
  text-3:    #AAAAAA (light gray)
  accent:    #E85D40 (warm red-orange — Superlist brand)
  
Dark/Blackout mode:
  bg:        #0D0D0D (pure black)
  card:      #1A1A1A
  text-1:    #F0F0F0
  accent:    Same red-orange

Icons:
  Inbox:     Red/orange tones
  Today:     Yellow
  Tasks:     Orange  
  Messages:  Red
```

### Typography (from screenshots)
- List/page titles: ~36px, bold, likely Inter or a serif (letter-spacing tight)
- Section headers ("Get set up"): ~18px bold with emoji prefix
- Task titles: ~15px, regular weight
- Metadata (dates, tags): ~12px, gray
- Section labels ("Lists", "Recent"): ~11px, uppercase, tracking wide, gray

---

## LAIF Rebuild Plan — Superlist-Inspired

### What to BUILD (mapping Superlist → LAIF)

| Superlist | LAIF Equivalent |
|---|---|
| Inbox | Home / Today view |
| Today | Today view (merged with home) |
| Tasks | Tasks page (already exists) |
| Messages | AI Chat (FloatingChat → promote to sidebar) |
| Lists | Umbrellas / Projects |
| Settings | Settings (already exists) |
| Task detail panel | TaskDetailPage (right panel) |
| Onboarding | Signup flow (redesign) |

### What to SKIP (Superlist team features LAIF doesn't need)
- Team sharing, invite members
- Team messages/chat threads per task
- "Share" button / privacy labels

### What LAIF ADDS (not in Superlist)
- Calendar views (Week/Month/Day/Agenda)
- Pomodoro timer
- Habits tracker
- Statistics dashboard  
- Journal
- AI Brief
- Voice-to-task
- PKMS / Notes

---

## Execution Blocks (2-hour session)

### Block 1: Warm Background + Three-Column Layout (30 min)
- [ ] Change bg from cool gray (#FAFAFA) to warm cream (#F5F0EB) for light mode
- [ ] Add the right-side artwork panel (Unsplash ambient wallpaper)
- [ ] Content area becomes a white card floating between sidebar and artwork
- [ ] Sidebar loses its border — same bg as the page
- [ ] Active sidebar item gets a colored vertical bar on the right (not background fill)

### Block 2: Sidebar Overhaul (20 min)
- [ ] Match Superlist's exact nav structure: Inbox, Today, Tasks, then Lists section
- [ ] Map LAIF features into Superlist-style sections
- [ ] Emoji icons on list items (not Lucide icons for lists)
- [ ] Section labels: tiny uppercase gray ("LISTS", "WORKSPACE")
- [ ] User avatar at bottom-left
- [ ] Remove settings/logout from sidebar bottom — move to settings page

### Block 3: Content Card + Page Titles (20 min)
- [ ] All pages render inside a white rounded card
- [ ] Page titles: 36px bold (like "Tasks", "Settings", "Getting Started")
- [ ] Remove per-page headers with borders — title IS the content
- [ ] Add inline task input: "Add a task, or type '/' to choose a different content type"

### Block 4: Task List Redesign (20 min)
- [ ] Task rows: larger checkboxes (22px), more vertical space (52px rows)
- [ ] No borders between tasks — spacing only
- [ ] Metadata: subtask count, due date, list name — all tiny gray text below title
- [ ] Tab filters at top: "Tasks for me" | "Upcoming" | "Done"
- [ ] Completed tasks: strikethrough + gray, checkbox filled with green check

### Block 5: Task Detail + Settings (20 min)
- [ ] Task detail opens as RIGHT panel (already does on desktop)
- [ ] Match Superlist's detail layout: title large, metadata row, subtasks, message input
- [ ] Settings: large title, tab pills (Profile/Features/Subscriptions), card sections
- [ ] Login/Signup: clean centered design matching Superlist welcome screen

### Block 6: Polish + Commit (10 min)
- [ ] Build check
- [ ] Visual consistency pass
- [ ] Commit + push
