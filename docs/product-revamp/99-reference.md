# LAIF Web — Reference

> Always loaded alongside `00-overview.md` and `01-design-system.md`. Phase docs reference into this file rather than redefining types.

---

## 1. Data model (full)

```ts
// ───────── Enums ─────────

type ListType =
  | "standard"
  | "habit"
  | "journal"
  | "notes"
  | "reading"
  | "contacts";

type Priority = "high" | "medium" | "low" | null;

type Role = "creator" | "collaborator";

type Repeat =
  | "daily"
  | "weekdays"
  | "weekly"
  | "monthly"
  | "yearly";

// ───────── User / Org ─────────

type User = {
  id: string;
  email: string;
  name: string;             // "Jane Doe"
  avatarUrl?: string;
  intent: ("personal" | "collaborate")[];  // from onboarding step 2
  acceptedTermsAt: Date;
  optInMarketing: boolean;
  themePreference?: string; // "superlist-light" | "superlist-dark" | ...
  createdAt: Date;
};

// ───────── Sidebar grouping ─────────

type ListGroup = {
  id: string;
  ownerId: string;
  title: string;            // "Work" / "Personal"
  order: number;
  collapsed?: boolean;      // per-user persisted state
};

// ───────── List ─────────

type Collaborator = {
  userId: string;           // null for pending email-only invites
  email?: string;           // when pending
  role: Role;
  pending?: boolean;
  invitedAt: Date;
  acceptedAt?: Date;
};

type List = {
  id: string;
  type: ListType;
  title: string;
  icon?: string;                    // emoji
  coverImageUrl?: string;           // selected cover (preset, upload, or Unsplash)
  groupId?: string;                 // ListGroup.id for sidebar nesting
  ownerId: string;
  isPrivate: boolean;               // computed: true when collaborators.length === 0
  collaborators: Collaborator[];
  pinnedToFavorites?: boolean;
  hideCompletedTasks?: boolean;
  blocks: Block[];                  // editor document (Tiptap JSON)
  isInbox?: boolean;                // true for the special Inbox list
  createdAt: Date;
};

// ───────── Block ─────────

type Block =
  | { id: string; type: "heading"; level: 1 | 2 | 3; text: RichText }
  | { id: string; type: "paragraph"; text: RichText }
  | { id: string; type: "bullet"; items: RichText[] }
  | { id: string; type: "numbered"; items: RichText[] }
  | { id: string; type: "divider" }
  | { id: string; type: "tip"; text: RichText }
  | { id: string; type: "image"; url: string; caption?: string; source?: "upload" | "unsplash" }
  | { id: string; type: "attachment"; url: string; filename: string; size: number; mime: string }
  | { id: string; type: "task"; taskId: string };

// RichText is Tiptap-flavored inline JSON with bold/italic/strike/link marks.
type RichText = unknown;

// ───────── Task ─────────

type Task = {
  id: string;
  listId: string;              // Inbox.id for unsorted
  parentTaskId?: string;       // for sub-tasks
  title: string;
  blocks: Block[];             // body — same block editor as a List
  completed: boolean;
  completedAt?: Date;
  dueAt?: Date;                // null if no due date
  repeat?: Repeat;
  priority: Priority;
  labelIds: string[];
  assigneeId?: string;
  comments: Comment[];
  createdBy: string;
  createdAt: Date;
};

type Comment = {
  id: string;
  taskId: string;
  authorId: string;
  body: RichText;
  createdAt: Date;
};

// ───────── Label ─────────

type Label = {
  id: string;
  ownerId: string;             // per-user, not per-list
  name: string;
  color?: string;              // optional accent
};

// ───────── Habit (specialization layer) ─────────

type HabitCompletion = {
  id: string;
  taskId: string;              // points to the recurring task
  date: string;                // YYYY-MM-DD
  completedAt: Date;
};

// ───────── Tools (preserved from existing LAIF) ─────────

type PomodoroSession = {
  id: string;
  userId: string;
  taskId?: string;
  startedAt: Date;
  endedAt?: Date;
  mode: "work" | "break";
  completed: boolean;
};

type AiBrief = {
  id: string;
  userId: string;
  forDate: string;             // YYYY-MM-DD
  markdown: string;
  createdAt: Date;
};
```

---

## 2. API routes

All routes follow the existing LAIF pattern: REST-ish, JWT-auth via cookie, optimistic mutations on the client with TanStack Query invalidation.

### Auth & user

```
POST   /api/auth/login                       email/password → JWT cookie
POST   /api/auth/signup                      email/password + name → JWT cookie + create User
POST   /api/auth/logout                      clear cookie
GET    /api/users/me                         current user profile
PATCH  /api/users/me                         update name, intent, optInMarketing, themePreference
POST   /api/users/me/accept-terms            sets acceptedTermsAt
```

### Lists

```
GET    /api/lists                            user's lists (includes Inbox)
POST   /api/lists                            create
GET    /api/lists/:id                        read (with blocks)
PATCH  /api/lists/:id                        title, icon, coverImageUrl, pinnedToFavorites, hideCompletedTasks, groupId
DELETE /api/lists/:id                        soft delete (10s undo grace)
PATCH  /api/lists/:id/blocks                 replace block document
POST   /api/lists/:id/duplicate              clone a list
POST   /api/lists/:id/mark-all-incomplete    bulk uncheck all tasks
```

### List sharing

```
POST   /api/lists/:id/collaborators          invite (body: email or userId, role)
DELETE /api/lists/:id/collaborators/:userId  remove (or revoke pending invite)
POST   /api/lists/:id/share-link             generate/rotate share link
GET    /api/lists/:id/share-link             read current link
```

### List groups (sidebar folders)

```
GET    /api/list-groups
POST   /api/list-groups                      create
PATCH  /api/list-groups/:id                  rename, reorder, collapse
DELETE /api/list-groups/:id                  un-groups child lists
```

### Tasks

```
GET    /api/tasks?listId=...                 by list (or omitted for all)
GET    /api/tasks?dueBefore=...&assignee=... for Today/Tasks views
POST   /api/tasks                            create
GET    /api/tasks/:id                        read
PATCH  /api/tasks/:id                        update any field
DELETE /api/tasks/:id                        soft delete
POST   /api/tasks/:id/mark-all-incomplete    uncheck this + all sub-tasks
POST   /api/tasks/:id/subscribe              re-subscribe to notifications
POST   /api/tasks/:id/unsubscribe            stop notifications
```

### Comments

```
GET    /api/tasks/:id/comments
POST   /api/tasks/:id/comments
PATCH  /api/comments/:id
DELETE /api/comments/:id
```

### Labels

```
GET    /api/labels                           user's labels
POST   /api/labels                           create (also used by "Create '[query]'" inline)
PATCH  /api/labels/:id
DELETE /api/labels/:id
```

### Habits (preserved)

```
POST   /api/habits/:taskId/completions       record a completion event
GET    /api/habits/:taskId/completions?from=&to=
```

### Tools (preserved)

```
GET    /api/pomodoro/sessions
POST   /api/pomodoro/sessions
PATCH  /api/pomodoro/sessions/:id

GET    /api/stats?range=7d|30d|90d
GET    /api/calendar/events

GET    /api/ai/brief?date=YYYY-MM-DD
POST   /api/ai/brief/regenerate
```

### AI Chat (preserved — no behavioral change)

```
POST   /api/chat                             agentic stream
GET    /api/chat/threads
```

### Unsplash proxy (for Customize panel)

```
GET    /api/unsplash/search?q=...            proxy to Unsplash API
```

---

## 3. Component tree (suggested)

```
<App>
  <ThemeProvider />
  <RouteShell>
    <Sidebar />
    <MainPane>
      {/* per-route */}
      <PageHeader />
      <TipBanner />
      <NewTaskRow />          {/* Inbox, Today, anywhere */}
      <BlockEditor />         {/* Lists, Task detail body */}
      <TaskList />            {/* Inbox, Today, Tasks */}
    </MainPane>
    <RightPane>
      {/* one of these at a time, stackable */}
      <ArtworkPane />
      <DetailPanelStack>
        <DetailPanel />       {/* up to 3 stacked */}
      </DetailPanelStack>
      <CustomizeListPanel />
    </RightPane>
  </RouteShell>

  {/* Portals */}
  <DatePopover />
  <TimeSubPopover />
  <PriorityPopover />
  <LabelPopover />
  <AssigneePopover />
  <LinkSubPopover />
  <SlashMenu />
  <SelectionToolbar />
  <ShareModal />
  <Toasts />
</App>
```

State: a single Zustand store (or one root `useReducer`) with slices:
- `auth` (user, session)
- `ui` (sidebar collapsed, theme, popovers open, detail-panel stack, customize-panel open)
- `data` (TanStack Query — lists, tasks, labels, comments, etc.)

Popovers and modals open via a single `openOverlay({ type, anchorEl, payload })` action so only one popover is open at a time and click-outside closes consistently.

---

## 4. Keyboard shortcuts (master list)

| Scope | Shortcut | Action |
|---|---|---|
| Global | `Ctrl/Cmd+K` | Open command palette (defer to v2 — not built in phases 1-4) |
| Global | `Ctrl/Cmd+N` | Focus the active view's New Task row (Inbox/Today/Tasks/List) |
| Global | `Esc` | Close topmost: popover → detail panel → modal |
| Sidebar | `Ctrl/Cmd+\` | Toggle sidebar collapse |
| New task row | `Enter` | Commit task and reset row |
| New task row | `Esc` | Clear input, blur |
| Task row (selected) | `↑` / `↓` | Move selection between rows |
| Task row (selected) | `Space` | Toggle completion |
| Task row (selected) | `Enter` | Open detail panel |
| Task row (selected) | `1` / `2` / `3` | Set priority High / Medium / Low |
| Task row (selected) | `Delete` | Soft-delete with undo toast |
| Editor | `/` (at start of empty block) | Open slash menu |
| Editor | `Cmd/Ctrl+B/I/S` | Bold / Italic / Strikethrough |
| Editor | `Cmd/Ctrl+K` | Open link sub-popover for selection |
| Editor | `Tab` / `Shift+Tab` | Indent / dedent inside list blocks |
| Date popover (open) | `←` / `→` | Prev/next month |
| Date popover (open) | `Enter` | Select highlighted day |
| Priority popover (open) | `1` / `2` / `3` | Select |
| Label/Assignee popover | `↑` / `↓` | Move highlight |
| Label/Assignee popover | `Enter` | Select highlighted |

---

## 5. URL conventions

- Deep-linkable: `/lists/[id]/tasks/[taskId]` opens the list with the task detail panel pre-opened.
- Nested sub-task panels are **not** deep-linked in v1 (too complex to encode the stack). Opening a sub-task from the detail panel updates the URL with a `?sub=[subTaskId]` query param so a refresh restores 2 levels.
- Group expansion state in the sidebar is per-user persisted, not URL.
- Filter state in `/tasks` and view-mode (List/Board/Matrix) are URL params: `/tasks?filter=for-me&view=list`.

---

## 6. Notifications & toasts

Toast container at bottom-left, max 3 visible, FIFO.

Standard toasts:
- **Action confirmations**: "Task completed" with Undo, 5s.
- **Destructive with undo**: "List deleted" / "Task deleted" with Undo, 10s.
- **Share confirmations**: `[List title] has been shared with [Name]`, 5s, no undo.
- **Copy link**: inline button state ("✓ Copied") for 1.5s — no toast.

Z-index: 9000 (above modals and popovers).

---

## 7. Persistence & migrations

- Theme preference saved on User. Existing users keep their theme on first login post-deploy.
- "Onboarding complete" flag: `User.acceptedTermsAt != null`.
- Sidebar group collapse states: stored on `ListGroup.collapsed` (per-user).
- "Tools section collapsed" preference: new field on User; default `true` for new users, `false` for existing users (so they don't lose their accustomed surface).
- The migration from Habits/Journal/Notes/Memories/Contacts entities into Lists runs as a one-shot script on deploy. Old routes 301-redirect to the migrated Lists for 30 days, then 404.

---

## 8. Out-of-scope reminders

Don't build:
- Mobile responsive layout (Flutter app covers it).
- Real-time multi-cursor / presence.
- CRDT/full offline edit-and-sync.
- Meetings or Updates as first-class entities (punt).
- Calendar integrations (Google/Outlook).

Service worker caching, voice-to-task, completion sounds, AI Daily Brief, AI Chat, PWA install — **keep all of these**, they're preserved as-is with just a visual reskin.

---

**End of reference.** This file plus `00-overview.md` and `01-design-system.md` are enough to onboard a new engineer to the project.
