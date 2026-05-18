# LAIF Web — Design System & UX Copy

> Always loaded with `00-overview.md`. Cross-referenced from every phase doc.

---

## 1. Themes

Two new themes ship; everything else (the 6 existing LAIF themes) is preserved in Settings → Appearance.

### 1.1 Superlist Light (new default)

```css
[data-theme="superlist-light"] {
  --bg-canvas: #EDEAE6;
  --bg-pane: #F8F6F2;
  --bg-pane-2: #FFFFFF;
  --bg-hover: #EDEAE6;
  --bg-selected: #FFE9E5;     /* selected task row tint */
  --border: #E2DDD5;
  --text-primary: #1A1A1F;
  --text-muted: #6B6B75;
  --text-faint: #A0A0AA;
  --accent: #FF4D3D;          /* active nav, completion, brand */
  --accent-soft: #FFE9E5;
  --info: #3B82F6;            /* inline links */
  --priority-high: #FF4D3D;
  --priority-medium: #FFB23D;
  --priority-low: #5DA8FF;
}
```

### 1.2 Superlist Dark

```css
[data-theme="superlist-dark"] {
  --bg-canvas: #0E0E12;
  --bg-pane: #17171E;
  --bg-pane-2: #1E1E26;
  --bg-hover: #23232B;
  --bg-selected: rgba(255, 77, 61, 0.12);
  --border: #2A2A33;
  --text-primary: #F2F2F5;
  --text-muted: #A0A0AA;
  --text-faint: #6B6B75;
  --accent: #FF4D3D;
  --accent-soft: rgba(255, 77, 61, 0.12);
  --info: #5DA8FF;
  --priority-high: #FF4D3D;
  --priority-medium: #FFB23D;
  --priority-low: #5DA8FF;
}
```

### 1.3 Onboarding (separate, used only on `/onboarding/*`)

- Background: full-bleed dusk gradient (`#7C5E91` top → `#C28BA3` mid) over a static curated photograph (desert dunes + glowing moon + water with reflection). Ship one PNG asset.
- Card: `rgba(28, 24, 38, 0.75)`, `backdrop-filter: blur(20px)`, 24px radius, 24px padding, ~480px wide.
- Card text uses Superlist Dark `--text-primary`.
- Bottom 56px is a dark footer strip with the LAIF wordmark on the left.
- The onboarding theme does **not** participate in `data-theme` switching — it's hardcoded per route.

---

## 2. Typography

- **UI:** Inter (variable, weights 400/500/600/700).
- **List titles & page headings:** a soft humanist serif. Use **Source Serif** (free, Google Fonts) at weight 700/800. Superlist uses something similar to "PP Editorial Old" — Source Serif is the closest free analogue.
- Headings inside list body: Inter 700 (consistent with UI; only the page-level list title uses the serif).

Sizes (px):

| Token | Size | Use |
|---|---|---|
| `--text-meta` | 12 | metadata sub-rows, hints |
| `--text-body` | 14 | body, popovers, sidebar items |
| `--text-task` | 15 | task title in row |
| `--text-h3` | 18 | section heading inside list |
| `--text-h2` | 22 | section heading inside list |
| `--text-h1` | 28 | detail panel title, in-body H1 |
| `--text-page` | 32 | page heading (Inbox/Today/Tasks) |
| `--text-list` | 48 | list page title (serif) |

Weights: 400 body, 500 task titles, 600 chips/buttons, 700 headings, 800 list titles.

---

## 3. Spacing & radii

- **8px grid**. Pane outer padding 24px. Row vertical padding 12px. Block spacing 16–20px. Chip padding 6px × 10px. Popover padding 8px.
- **Radii:**
  - 8 — buttons, chips
  - 12 — popovers, dropdowns
  - 16 — panes (sidebar, main, right-pane)
  - 9999 (full) — avatars, the Complete pill, the Share pill, comment input

---

## 4. Iconography

`lucide-react` for all system UI. Sizes 14/16/18/20/24. Stroke 1.5.

Emoji is **allowed for user content only** — list icons (👋 Getting Started, 📅 This Week, 📝 Meeting Notes, 🍎 Groceries, 📚 Reading List, 🎯 Habits) and section headers inside a list body (✅ Get set up, 💡 To open this task…). Never use emoji for system UI like primary nav.

**Suggested mappings:**

| Use | lucide-react |
|---|---|
| Inbox | `Inbox` |
| Today | `CalendarDays` |
| Tasks | `CheckCircle2` |
| AI Chat | `MessageCircleMore` |
| Filter | `SlidersHorizontal` |
| Overflow | `MoreVertical` |
| Plus / New | `Plus` |
| Close | `X` |
| Forward arrow | `ArrowRight` |
| Back arrow | `ChevronLeft` |
| Drag handle | `GripVertical` |
| Enter glyph | `CornerDownLeft` |
| Calendar (date) | `Calendar` |
| Time | `Clock` |
| Bell (remind me) | `Bell` |
| Repeat | `Repeat` |
| Priority bars | `BarChart3` |
| Tag (label) | `Tag` |
| Assignee | `User` |
| List (entity) | `List` |
| Link | `Link2` |
| Bold | `Bold` |
| Italic | `Italic` |
| Strikethrough | `Strikethrough` |
| Image | `Image` |
| Attachment | `Paperclip` |
| Download | `Download` |
| Replace | `RefreshCw` |
| Trash | `Trash2` |
| Search | `Search` |
| Star (favorite) | `Star` |
| Star filled | `Star` with `fill="currentColor"` |
| Lightning (Upgrade) | `Zap` |
| Hide completed | `EyeOff` |
| Mark incomplete | `CircleCheck` |

---

## 5. UX copy constants

Every string below is **verbatim from the Superlist screens**. Put all of this in a single `copy.ts` so iteration doesn't require code-hunting. Brand name LAIF replaces Superlist; everything else is exact.

```ts
export const copy = {
  // ───────── Onboarding ─────────
  onboarding: {
    step1: {
      title: "What should we call you?",
      body: "Let's get to know each other — tell us your first and last name.",
      placeholder: "Full name",
      cta: "Next",
    },
    step2: {
      title: "How do you want to use LAIF?",
      body: "Help us personalize your experience. Select all that apply.",
      options: ["Manage my personal tasks", "Collaborate with others", "Both"],
      cta: "Next",
    },
    step3: {
      title: "You're almost there",
      terms: "I agree to the LAIF Terms of Use and Privacy Policy.",
      emails: "I want to receive occasional emails with best practices, tips and tricks, and other news.",
      cta: "Continue",
      ctaLoading: "Creating account...",
    },
  },

  // ───────── Sidebar ─────────
  sidebar: {
    sectionRecent: "Recent",
    sectionLists: "Lists",
    sectionTools: "Tools",
    browseAll: "Browse all",
    newListTooltip: "New list",
    upgradeCta: "Upgrade",
  },

  // ───────── Inbox / Today / Tasks ─────────
  inbox: {
    title: "Inbox",
    tipBanner: "Manage all new and incoming tasks — create, move, schedule, and more",
  },
  today: {
    title: "Today",
    tipBanner: "See your schedule, track habits, and stay on top of what's due today.",
    groups: { overdue: "Overdue", today: "Today", tomorrow: "Tomorrow" },
  },
  tasks: {
    title: "Tasks",
    filters: { forMe: "Tasks for me", upcoming: "Upcoming", done: "Done" },
    viewModes: ["List", "Board", "Matrix"],
  },

  // ───────── Lists ─────────
  list: {
    untitled: "Untitled",
    privateLabel: "This list is private",
    sharedWithLabel: (names: string[]) =>
      names.length === 1 ? `Shared with ${names[0]}` : `Shared with ${names.length} people`,
    shareCta: "Share",
    emptyBlockPlaceholder: "Click here to add a task, or type '/' to choose a different content type",
    inlineNewTaskPlaceholder: "Add a task, or type '/' to choose a different content type",
    emptyParagraphPlaceholder: "Start typing, or type '/' to choose a different content type",
    overflowMenu: {
      hideCompleted: "Hide completed tasks",
      showCompleted: "Show completed tasks",
      markAllIncomplete: "Mark all incomplete",
      deleteList: "Delete list",
    },
  },

  // ───────── Task ─────────
  task: {
    completeCta: "Complete",
    completedCta: "Completed",
    leaveMessagePlaceholder: "Leave a message...",
    createdBy: (name: string, when: string) => `Created by ${name} • ${when}`,
    overflowMenu: {
      unsubscribe: "Unsubscribe",
      copyLink: "Copy link",
      markAllIncomplete: "Mark all incomplete",
      deleteTask: "Delete task",
    },
  },

  // ───────── Popovers ─────────
  popovers: {
    date: {
      today: "Today",
      tomorrow: "Tomorrow",
      nextWeek: "Next week",
      time: "Time",
      remindMe: "Remind me",
      repeat: "Repeat",
      clear: "Clear",
      done: "Done",
    },
    time: {
      noDueDate: "No due date",
      clear: "Clear",
      done: "Done",
    },
    label: {
      searchPlaceholder: "Search or create label",
    },
    assignee: {
      searchPlaceholder: "Search for name",
      pendingLabel: "Pending",
    },
    link: {
      placeholder: "Enter a URL",
      done: "Done",
    },
  },

  // ───────── Slash menu ─────────
  slashMenu: {
    items: [
      "Task",
      "Paragraph",
      "Heading 1",
      "Heading 2",
      "Heading 3",
      "Divider",
      "Bullet list",
      "Numbered list",
      "Image",
      "Attachment",
    ],
  },

  // ───────── Share modal ─────────
  share: {
    title: "Share",
    searchPlaceholder: "Search people, teams, or emails",
    inviteCta: "Invite",
    copyLinkCta: "Copy link",
    copiedConfirmation: "Copied",
    removeCta: "Remove",
    roles: { creator: "Creator", collaborator: "Collaborator" },
    toastShared: (listTitle: string, name: string) =>
      `${listTitle} has been shared with ${name}`,
    accountContext: "Personal", // dropdown label at bottom of modal
  },

  // ───────── Customize list ─────────
  customizeList: {
    title: "Customize list",
    sectionEmoji: "Emoji",
    sectionImage: "Image",
    uploadCta: "Upload",
    searchUnsplashCta: "Search Unsplash",
    doneCta: "Done",
  },

  // ───────── Starter content seeded on signup ─────────
  starter: {
    gettingStartedTitle: "Getting Started",
    welcomeBody:
      "With LAIF, you can manage what matters — from daily tasks to project planning with your team — in one place. It gives you the flexibility to organize tasks, notes, images, and attachments however you want. It's not just a list. It's a LAIF list.",
    getSetUp: "✅ Get set up",
    firstTodoIntro: "Ready to dig in? Here's your very first to-do list.",
    openTaskHint: "💡 To open this task, click on the task row.",
    starterTasks: [
      "Watch Welcome Video",
      "Create your first list",
      "Create your team",
      "Connect your first integration",
      "Stay connected across all your devices",
      "Share your feedback with the LAIF team",
    ],
  },
};
```

---

## 6. Interaction tokens

- **Hover bg:** `var(--bg-hover)` on rows, buttons, chips.
- **Focus ring:** 2px `var(--accent)` at 60% alpha, 2px offset, on any keyboard-focused control.
- **Animations:** 150–200ms ease-out for hover and popover open (fade + 4px slide up). Detail panel slide-in 200ms ease-out. No bouncing.
- **Reduce motion:** when `prefers-reduced-motion: reduce` is set OR the user enables it in Settings → Display, replace springs with 150ms fades, no slide-in.

---

## 7. Component sizing reference

| Component | Width / size |
|---|---|
| Sidebar | 260px fixed |
| Main pane | flex-1, min 540px |
| Right pane (idle artwork) | 380px |
| Right pane (detail panel) | 420px |
| Right pane (customize list panel) | 420px |
| Date popover | 280px |
| Time sub-popover | 220px |
| Priority popover | 160px |
| Label popover | 240px |
| Assignee popover | 260px |
| Link sub-popover | 360px |
| Slash menu | 240px |
| Selection toolbar | ~150px (4 icons) |
| Share modal | 480px |
| Avatar (small) | 24px |
| Avatar (default) | 32px |
| Avatar (header) | 40px |
| Icon button (ghost) | 32px |

---

**End of design system.** Next: phase docs reference these tokens and copy constants without redefining them.
