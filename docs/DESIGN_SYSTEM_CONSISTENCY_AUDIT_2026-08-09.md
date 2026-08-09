# Life OS visual consistency audit and ticket plan

**Audit date:** 2026-08-09  
**Scope:** Font family, font size, font weight, text color, icon color, backgrounds, surfaces, borders, semantic state colors, and visual-state consistency across all routed pages. Feature behavior, information architecture, and product journeys are intentionally out of scope.  
**Reference direction:** The compact, neutral, work-first language established by Today / Next 7 Days / Tasks.  
**Method:** Three parallel source audits, route and token inventory, literal-style counts, contrast checks, rendered production review where authentication allowed, and comparison with the authenticated screenshots supplied by the product owner. Rules were checked against the current [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).

## 1. Executive diagnosis

Life OS does not have one visual system with a few inconsistent pages. It currently has several systems operating at once:

1. **Global legacy theme:** purple/navy canvas and panes in `globals.css`.
2. **Current compact workspace:** neutral charcoal surfaces defined privately by Today.
3. **Calendar system:** another neutral palette plus Aptos/Segoe instead of Inter.
4. **Focus system:** another almost-identical neutral palette remapped only inside the timer page.
5. **Page-local systems:** Agenda overrides, Habits mixes, and numerous legacy dashboard cards, headings, menus, and dialogs.

This is why navigation feels like moving between products even when each page is individually usable. The problem cannot be fixed sustainably by recoloring pages one at a time. Today must become the shared semantic system first, and pages must then migrate without losing features.

### Audit evidence

- 108 shared component files reviewed.
- 73 shared component files contain literal colors.
- 75 shared component files contain literal font sizes.
- 49 shared component files contain literal radii.
- At least 8 CSS variables are referenced without a complete global definition/fallback contract.
- Page titles currently range from 17px to the global 42px `h1`.
- Product metadata ranges from 8px to 13px.
- Weights such as 650, 690, and 750 are used even though only Inter 400/500/600/700 are loaded.
- Today alone contains 163 literal hex colors; Calendar contains 47 literal hex/RGB colors; Focus contains 32; Agenda uses 20 `!important` declarations to look aligned.

## 2. System-level findings

### 2.1 Competing backgrounds and surfaces

- `src/app/globals.css:20-30` defines the old purple dark palette: `#181824`, `#232233`, and `#2a293b`.
- `src/components/layout/AppShell.tsx:307-313` forces the main content to neutral `#19191a`, while child pages still consume the purple global pane tokens.
- `src/components/today/task-workspace.css:128-150` defines the preferred neutral palette privately as `--workspace-*`.
- `src/app/calendar/calendar.css:1-24`, `src/app/focus/focus.css:1-24`, and `src/app/agenda/agenda.css:1-7` independently recreate close but non-identical neutral palettes.
- Today and newer Habit surfaces hard-code dark colors, so the existing light theme cannot render them consistently.

### 2.2 Typography has no semantic contract

- `src/app/globals.css:131-161` makes body text 16px/500 and every raw `h1` 42px/700.
- Today uses a 17px/650 page title at `src/components/today/task-workspace.css:150`.
- Inbox uses 36px at `src/app/page.tsx:206-220`.
- Lists, List Detail, Matrix, Profile, and Habit Check-in use 32px titles.
- Plan/Shutdown use a 28px ritual title; Settings uses 24-28px; Focus auxiliary pages use 18px.
- Chat uses a 36px decorative gradient greeting rather than standard application chrome.
- Calendar switches the product font to Aptos/Segoe at `src/app/calendar/calendar.css:35`.

### 2.3 Current-reference text is sometimes too faint

Today is the visual reference, not a token set to copy blindly. Its smallest text needs correction during promotion:

| Current use | Pair | Contrast | Result |
|---|---|---:|---|
| Today/workspace muted | `#77777c` on `#19191a` | 3.94:1 | Fails normal-text AA |
| Calendar/Focus faint | `#65656a` on `#19191a` | 3.03:1 | Fails normal-text AA |
| Today sidebar label | `#69696d` on `#1b1b1c` | 3.15:1 | Fails normal-text AA |
| Global faint | `#908f9a` on `#181824` | 5.51:1 | Passes normal-text AA |

The new semantic palette must preserve Today's calm hierarchy while raising meaningful text to at least 4.5:1. Disabled/decorative marks may use lower contrast only when they do not carry information.

### 2.4 Equivalent elements look unrelated

- Menus use different backgrounds, widths, radii, shadows, row sizes, and type sizes across Today, Task Context, Task Overflow, Date, Priority, Time, Habits, and Calendar.
- Modal backdrops range from black 30% to 70%, with several surface and shadow recipes.
- Priority has at least three different red/amber/blue palettes.
- Hover and selected states are frequently implemented through inline mouse mutations, so keyboard and pointer states differ.
- Settings tabs alternate between large dashboard cards and flat divider rows for equivalent preference groups.

### 2.5 Undefined and competing variables make fallback styling unpredictable

Examples include `--bg-base`, `--bg-elevated`, `--danger`, `--error`, `--font-sans`, `--text-on-dark`, and `--text-secondary`. Tailwind also defines old navy surfaces and references undefined accent variants in `tailwind.config.ts:15-33`.

## 3. Route consistency matrix

| Route / surface | Status | Primary visual gap |
|---|---|---|
| Today, Next 7 Days, Tasks | Reference with debt | Correct direction; private tokens, tiny/faint metadata, no light parity |
| Agenda | Near-current, override debt | Visually aligned through `!important` and duplicated colors |
| Calendar | Near-current, forked | Separate palette, separate font, local overlays |
| Focus timer | Near-current, forked | Immersive layout is valid; core colors/tokens are duplicated |
| Habits list | Partial-current | Mixes global, local, and hardcoded neutral surfaces |
| Inbox `/` | Legacy | 36px greeting, pills, old task/composer presentation |
| Lists / List Detail | Legacy | 32px titles, old pane cards, mixed pills and controls |
| Matrix | Legacy | 32px title, old pane quadrants, independent semantic colors |
| Plan / Shutdown | Legacy | 28px ritual hierarchy and large dashboard cards |
| Chat | Legacy | 36px gradient display, bespoke gradients and overlays |
| Statistics / Profile | Legacy | Dashboard-card visual language, 32-42px titles, 8-10px labels |
| Settings | Legacy/partial | 24-28px hierarchy, inconsistent card-vs-row grammar across tabs |
| Focus Settings / Statistics | Legacy | Falls back to purple global canvas; heavy `rounded-2xl` panels |
| Habit Check-in / Habit Detail | Legacy/partial | Different row, icon, check, title, card, and completion treatments |
| Task Detail and task popovers | Legacy/partial | 28px task title and multiple unrelated overlay systems |
| Workflows | Legacy/partial | Global pane colors and old task-card surfaces |
| Login / Signup / Onboarding | Controlled brand exception | Warm editorial identity is intentional; formalize tokens and keep it out of authenticated workspace CSS |

## 4. Target visual contract

### 4.1 Typography roles

Use named roles rather than styling raw HTML headings globally.

| Role | Target | Usage |
|---|---|---|
| Workspace title | 17px / 24px / 600 | Every authenticated page header |
| Section title | 14px / 20px / 600 | Panels, groups, card sections |
| Row/task title | 13px / 18px / 600 | Tasks, habits, list rows, menu emphasis |
| Body/control | 13px / 20px / 500 | Inputs, buttons, descriptions |
| Metadata | 12px / 18px / 500 | Dates, list names, durations, supporting labels |
| Micro | 11px / 16px / 500-600 | Counts, badges, chart axes; not long copy |
| Display | Explicit opt-in | Auth marketing, timer, celebration, large statistics only |

Inter 400/500/600/700 remains the authenticated-product font. Instrument Serif is allowed only in the controlled public/auth brand shell. Dense calendar labels may use a documented 10px exception if contrast and an accessible text equivalent are provided.

### 4.2 Semantic color roles

Promote the neutral Today direction into global dark/light roles. Exact values receive final visual QA, but implementation must expose these roles rather than feature prefixes:

- `canvas`, `rail`, `surface`, `surface-raised`, `card`
- `hover`, `active`, `selected`, `disabled-surface`
- `border-subtle`, `border-strong`, `focus-ring`
- `text-primary`, `text-secondary`, `text-muted`, `text-faint`, `text-disabled`, `text-inverse`
- `accent`, `accent-strong`, `accent-soft`
- `success`, `warning`, `danger`, `info`, and priority high/medium/low, each with foreground/soft/border variants
- `scrim` and elevation/shadow roles

Suggested dark seeds: canvas `#19191a`, rail `#1b1b1c`, surface `#202021`, raised/card `#222223`/`#252526`, hover `#2d2d2f`, selected `#303031`, subtle/strong borders `#303032`/`#3b3b3e`, primary text `#efeff0`, secondary `#b4b4b7`, muted `#96969b`. Faint text must be validated per receiving surface; `#85858a` passes on the canvas but not every raised surface. Use a stronger accent background such as `#5965e8` when white text is required; the current `#6472ff` is suitable as an accent mark/link on the dark canvas but does not give white text 4.5:1.

## 5. Implementation tickets

Effort: **S** = up to 2 days, **M** = 3-5 days, **L** = 1-2 weeks.

### Foundation — complete before page reskins

#### DSC-001 — P0 — Promote the neutral workspace palette into global semantic tokens (M)

**Evidence:** `globals.css:20-30`, `AppShell.tsx:307-313`, `task-workspace.css:128-150`, `calendar.css:1-24`, `focus.css:1-24`.

**Acceptance criteria:**

- One dark/light token set owns neutral surfaces, text, borders, overlays, accent, focus, and status colors.
- `AppShell` and page roots contain no hardcoded neutral canvas color.
- No route locally redefines core `--bg-*`, `--text-*`, `--border`, or `--accent` roles.
- User-selected accent colors remain supported.
- Moving between Today, Calendar, Focus, Settings, and Profile produces no palette shift.

#### DSC-002 — P0 — Replace global tag typography with semantic product roles (M)

**Evidence:** `globals.css:131-161`; title drift documented in section 2.2.

**Acceptance criteria:**

- Implement the role scale in section 4.1 as CSS utilities/components.
- Authenticated page titles are 17px/24px/600 unless an approved display exception is named.
- Remove synthesized 650/690/750 weights or load a true variable-font range.
- Raw `h1/h2` elements do not silently impose display sizing in product workspaces.
- Timers, dates, counts, durations, and chart figures use tabular numerals.

#### DSC-003 — P0 — Resolve token names and Tailwind competition (S)

**Evidence:** `tailwind.config.ts:15-33`; unresolved variables in Calendar, Habits, Focus modal, and hidden-hours components.

**Acceptance criteria:**

- Zero unresolved CSS-variable references without an intentional fallback.
- Tailwind surface/accent/status entries reference canonical variables only.
- Old navy surface constants and undefined accent variants are removed.
- CI detects undefined tokens.

#### DSC-004 — P0 — Establish contrast-safe text and state colors (S)

**Acceptance criteria:**

- Meaningful normal text reaches 4.5:1 on every surface where it appears.
- Non-text controls, icons that carry meaning, borders, and focus indicators reach 3:1.
- Disabled/decorative colors are documented and never carry unique information.
- Automated contrast tests cover dark and light tokens plus status soft-background combinations.
- Current 8-10px informative labels are raised to the semantic minimum or given an accessible equivalent.

#### DSC-005 — P1 — Build canonical visual primitives (L)

Create shared `WorkspacePage`, `WorkspaceHeader`, `Surface/Card`, `Button`, `IconButton`, `Input`, `SegmentedControl`, `Menu/Popover`, and `Modal/Sheet` visual primitives.

**Acceptance criteria:**

- One recipe owns neutral background, border, text roles, shadow, and state colors for each primitive.
- Hover, active, selected, focus-visible, disabled, loading, and destructive states are consistent for pointer and keyboard use.
- Standard controls no longer mutate colors through `onMouseEnter/onMouseLeave`.
- One menu visual contract replaces Task Context, Overflow, Date, Priority, Time, Habit, and Calendar variants.
- One modal shell replaces the current 30%-70% backdrop range and surface drift.

### Page migrations

#### DSC-101 — P0 — Bring Inbox into the compact task workspace (M)

**Acceptance criteria:**

- Preserve greeting, weather, AI Brief, habits, Inbox capture, and every existing task action.
- Use the shared 49px workspace header, task rows/cards, composer, type roles, surfaces, and states.
- Remove the 36px page greeting as page chrome; retain any greeting as subordinate content.
- No purple fallback colors or one-off pills remain.

#### DSC-102 — P1 — Migrate Agenda, Calendar, and Focus core surfaces (L)

**Acceptance criteria:**

- Consume global tokens directly; feature CSS contains only layout/domain visualization styles.
- Agenda no longer needs `!important` for page typography or neutral surfaces.
- Calendar uses Inter and shared workspace/menu/control colors.
- Focus keeps its immersive layout but uses canonical canvas/text/border/accent roles.
- Timer ticks and calendar event colors remain legitimate domain visualization tokens.

#### DSC-103 — P1 — Unify Habits, Habit Detail, and Habit Check-in (M)

**Acceptance criteria:**

- Habit list/detail/check-in share the same row, icon, completion control, selected state, type scale, and surfaces.
- Selecting a habit never switches palette or typography.
- Undefined `--bg-base`/`--font-sans` usage is removed.
- Existing check-in, edit, archive, delete, and Focus actions remain unchanged.

#### DSC-104 — P1 — Migrate Lists, List Detail, Matrix, and Workflows (L)

**Acceptance criteria:**

- Use the shared workspace header and compact task/card primitives.
- Replace 32px page titles and old `bg-pane` dashboard panels.
- Task presentation, menu, selected, completed, and empty-state colors match Today.
- User-generated list/workflow colors stay data-driven; neutral chrome uses tokens.

#### DSC-105 — P1 — Migrate Morning Plan and Evening Shutdown (M)

**Acceptance criteria:**

- Preserve every ritual stage and action.
- Ritual page title, supporting copy, cards, status chips, warnings, and actions use shared roles.
- Replace raw amber/red values with semantic state variants.
- Completion may use an explicit display role, but normal ritual pages use compact workspace chrome.

#### DSC-106 — P1 — Migrate Settings and Focus auxiliary pages (L)

**Acceptance criteria:**

- Settings has one compact parent header; tabs do not repeat large nested page titles.
- Every preference group uses a documented flat row or compact section primitive.
- Focus Settings and Focus Statistics inherit the same palette as Focus, with no purple flash.
- Connected, success, warning, danger, selected, and disabled colors use semantic variants.

#### DSC-107 — P1 — Migrate Profile and Statistics (M)

**Acceptance criteria:**

- Replace 32-42px product headings and heavy dashboard-card surfaces.
- Charts/cards use shared compact surfaces and metadata roles.
- Chart axes and legends meet minimum type/contrast rules and use tabular numerals.
- Semantic chart colors are shared with Matrix and Focus Statistics where meaning overlaps.

#### DSC-108 — P1 — Align Task Detail and every task overlay (L)

**Acceptance criteria:**

- The same task has identical visual treatment from Inbox, Today, Agenda, Calendar, Lists, Matrix, and Workflows.
- Task title, metadata chips, composer, workflow popover, subtasks, and habit statistics use shared roles.
- All menus/popovers use the canonical overlay primitive and state colors.
- No task functionality is removed.

#### DSC-109 — P2 — Migrate Chat and Getting Started (M)

**Acceptance criteria:**

- Chat uses standard page chrome, input, message surfaces, icon states, and neutral backgrounds.
- A display greeting may remain only as content, not as the page-title system.
- Decorative gradients are restricted to assistant/brand moments and never replace semantic state colors.
- Getting Started uses the same authenticated workspace type and surfaces.

#### DSC-110 — P2 — Formalize the public/auth brand exception (S)

The warm cream + Instrument Serif login/signup shell is polished and intentionally distinct; consistency does not require making marketing/auth look like a dense task workspace.

**Acceptance criteria:**

- Public/auth brand tokens live in a bounded shell and never leak into authenticated pages.
- Login, signup, and onboarding share the same brand palette and typography rules.
- Form controls retain consistent semantic error, disabled, loading, and focus behavior.
- The exception is documented; new authenticated routes cannot opt into it.

### Governance

#### DSC-201 — P2 — Add design-token linting and route visual regression (M)

**Acceptance criteria:**

- CI rejects new unapproved neutral color literals, arbitrary page-title sizes, undefined variables, page-local core token remaps, and `transition: all`.
- Brand artwork, user-generated colors, and documented visualization palettes are allowlisted.
- Desktop/mobile dark/light baselines cover every route.
- State baselines cover default, hover, focus, selected, disabled, empty, loading, error, and modal/menu states.
- A migration report tracks remaining literals to zero or an explicit waiver.

## 6. Recommended execution sequence

1. **Sprint 1:** DSC-001 through DSC-004. Lock tokens, typography, contrast, and Tailwind names.
2. **Sprint 2:** DSC-005, DSC-101, and DSC-108. Build primitives, migrate Inbox, and unify task detail/overlays.
3. **Sprint 3:** DSC-102 and DSC-103. Normalize Agenda/Calendar/Focus/Habits without changing their layouts.
4. **Sprint 4:** DSC-104 through DSC-107. Migrate the remaining authenticated legacy pages.
5. **Sprint 5:** DSC-109, DSC-110, and DSC-201. Close secondary surfaces and enforce the system in CI.

## 7. Definition of visual consistency complete

- Every authenticated route uses the same semantic canvas, type roles, neutral surface hierarchy, border hierarchy, and interaction-state colors.
- The same task, habit, menu, modal, button, input, badge, or status communicates the same visual meaning everywhere.
- Dark and light themes preserve equivalent hierarchy.
- No feature or action is removed during visual migration.
- Remaining literal colors belong only to documented brand art, user data, or visualization palettes.
- Screenshots can differ by content and layout, but not by the design language of shared elements.
