# Phase 1 — Foundation

> **Load with:** `00-overview.md` + `01-design-system.md` + `99-reference.md` + this file.
>
> **Goal:** ship the visual + structural foundation. Anyone opening LAIF after phase 1 should feel the Superlist polish on Inbox, navigate the new sidebar, complete the themed onboarding flow, and switch themes.
>
> **Effort:** ~5 days.
>
> **Depends on:** nothing.

---

## 1. Theme system

Add two new themes alongside LAIF's existing six:

- **Superlist Light** — new default for new signups.
- **Superlist Dark** — alternative.

Tokens are in `01-design-system.md §1`. Implement via `[data-theme="..."]` on `<html>`. The Settings → Appearance theme picker writes the choice to user preferences; existing users keep their saved theme on first load post-deploy.

On first login after the deploy, surface a one-time non-blocking toast: **"We have a new look — try the Superlist theme."** Tapping it opens Settings → Appearance. Dismissible.

---

## 2. Onboarding flow

Route: `/onboarding`. Used only when the authenticated user has no profile. Themed (see `01-design-system.md §1.3`).

### Common layout (all 3 steps)

- LAIF wordmark, centered, top of viewport.
- Three-dot step indicator beneath the brand. Active step = a wider white bar; inactive = short faint dashes. Progress visually as the user moves through.
- Card centered ~40% down. ~480px wide. Dark translucent + backdrop blur.

### Step 1 — Name

- Title: `copy.onboarding.step1.title`
- Body: `copy.onboarding.step1.body`
- Single input, placeholder `copy.onboarding.step1.placeholder`. Width ~360px.
- Trailing button inside the input: `copy.onboarding.step1.cta` ("Next").
- States:
  - Empty input: button disabled, muted.
  - Typing: an `×` clear button appears inside the input, "Next" becomes primary (white text on lighter pill).
  - Pressing Enter or clicking Next advances to step 2.

### Step 2 — Intent (multi-select)

- Title: `copy.onboarding.step2.title`
- Body: `copy.onboarding.step2.body`
- Three checkbox rows in this order:
  1. "Manage my personal tasks"
  2. "Collaborate with others"
  3. "Both"
- Checked state: filled coral circle (`--accent`) with white check inside.
- Auto-check logic: selecting "Both" → also checks rows 1 & 2 visually; selecting rows 1 + 2 → also checks "Both". Disabling "Both" leaves rows 1 & 2 checked.
- Footer button: `copy.onboarding.step2.cta`. Disabled until ≥1 selected. When active, full-width solid white pill with dark text.

### Step 3 — Terms

- Title: `copy.onboarding.step3.title`
- Two checkbox rows:
  1. **Required:** `copy.onboarding.step3.terms` — "Terms of Use" and "Privacy Policy" rendered as blue (`--info`) inline links.
  2. **Optional:** `copy.onboarding.step3.emails`.
- Footer button: `copy.onboarding.step3.cta`. Disabled until row 1 is checked.
- On click → button text replaces with `copy.onboarding.step3.ctaLoading` and becomes non-interactive while the create-account mutation runs.
- On success: navigate to `/` (Inbox) with the **Getting Started** starter List pre-seeded.

### Starter List seeding

After signup, create a List with:
- title = `copy.starter.gettingStartedTitle`
- icon = `👋`
- type = `standard`
- pinnedToFavorites = `true`
- body blocks (in order):
  1. Paragraph: `copy.starter.welcomeBody`
  2. (decorative line under title — uses the list color)
  3. Heading 2: `copy.starter.getSetUp`
  4. Paragraph: `copy.starter.firstTodoIntro`
  5. Tip: `copy.starter.openTaskHint`
  6. Six task blocks, titles from `copy.starter.starterTasks` array.

---

## 3. Sidebar component

Width 260px fixed. Reuses across every authenticated route.

### Structure (top to bottom)

1. **Primary nav** (4 items, no section label):
   - 📥 Inbox → `/`
   - 📅 Today → `/today`
   - ✅ Tasks → `/tasks`
   - 💬 AI Chat → `/chat`
   Each row: icon (lucide, 20px) + label (15px). Hover bg `--bg-hover`. Active state: 2px `--accent` left border flush with pane edge + row fill = `--bg-hover`. Badge (right-aligned pill, `--bg-pane-2` fill, muted text) when count > 0; hide when 0.

2. **Recent** (collapsible, default open):
   - Section label `copy.sidebar.sectionRecent` with a `›` chevron, click to toggle.
   - Auto-populated with the last 5 lists/tasks the user opened.

3. **Divider** (1px `--border`, 16px vertical margin).

4. **Lists** section header row:
   - Left: label `copy.sidebar.sectionLists` (uppercase, muted, small).
   - On hover: shows the muted helper text `copy.sidebar.browseAll` ("Browse all") next to the label, AND reveals two right-side icon buttons: `+` (new list, tooltip `copy.sidebar.newListTooltip`) and `⌃` (filter).
   - Clicking `+` creates an Untitled list (see phase 2) and navigates to it.

5. **Lists items:**
   - Pinned/favorite lists at the top (no special section header, just ordering).
   - Then ungrouped lists.
   - Then **groups** (Work, Personal, etc.) — each group is collapsible (`⌄`/`›`), and shows its child lists indented.
   - Each list row: emoji icon + name. Active state same as primary nav.

6. **Divider.**

7. **Tools** section (collapsible, default closed for new users; existing users keep their saved state):
   - Section label `copy.sidebar.sectionTools` with a `›` chevron.
   - Children:
     - ⏱ Focus Timer → `/tools/focus`
     - 📊 Stats → `/tools/stats`
     - 🗓 Calendar → `/tools/calendar`

8. **Sticky footer (bottom of sidebar):**
   - **Upgrade** pill button: full width minus padding. Lightning icon (`Zap`) + label `copy.sidebar.upgradeCta`. Ghost fill, subtle border.
   - Row beneath: `+` icon button on left (global quick-add — opens Inbox new-task focused), avatar on right (32px). Click avatar → small popover with "Settings" and "Sign out".

### Sidebar collapse

A toggle in the very top-left (when hovering the sidebar header area) collapses the sidebar to **icons only** (~64px wide). Collapsed state hides labels, section headers, and footer captions; tooltips on hover show the labels.

---

## 4. Page header (used on Inbox, Today, Tasks, Settings, Tools/*)

Shared component used by every center-pane view that isn't a List.

- Top row, right-aligned: ghost icon buttons for **filter** (`SlidersHorizontal`) and **overflow** (`MoreVertical`). 32px squares, 8px gap.
- Below: page title in `--text-page` (32px) weight 700. Uses the UI font, not the serif.

---

## 5. Inbox view reskin

Route: `/`. Center pane only — the Lists/blocks editor work comes in phase 2, but Inbox already exists in LAIF and just needs the new look + the new components.

### Layout

- Page header (`copy.inbox.title`).
- **Tip banner** (dismissible per session):
  - Background: `rgba(99, 91, 255, 0.08)`, 1px indigo border at 30% alpha.
  - Left: book icon (`BookOpen`) in indigo.
  - Text: `copy.inbox.tipBanner`, 14px, indigo.
  - Right: external-link arrow (no-op v1) + `×` close.
- **New task row:**
  - Leading `+` icon (24px, muted; white on hover).
  - Placeholder `copy.list.inlineNewTaskPlaceholder` ("Add a task, or type '/' to choose a different content type"). When unfocused, also show a `^N` chip on the right side as a shortcut hint.
  - Below the title text (only when row is focused or has metadata): a small icon strip — calendar (date), bar-chart (priority), tag (label). Each opens its respective popover.
  - Right cluster: assignee avatar (defaults to current user) + `↵` enter glyph.
  - Pressing Enter commits the task and resets the row. Esc clears.
- **Active tasks list** — render existing LAIF tasks here as `TaskRow` components (full anatomy in phase 3 doc, but in phase 1 you can render basic rows with checkbox + title + due date sub-text).
- **Done section** — collapsible, default closed. Header: "Done (N)".

---

## 6. Popovers needed in phase 1

Phase 1 includes the two popovers used by the new-task row. Full popover spec lives in `04-phase-3-tasks-details.md`, but the **Date** and **Priority** popovers are needed early because they're on the new task row.

### Date popover (anchored to calendar icon, 280px)

Sections top to bottom:
1. **Quick options** — three rows, each with a small calendar glyph: "Today" / "Tomorrow" / "Next week".
2. **Month grid** — header `[Month] [Year]` with `‹` / `›` chevrons. Weekday row `M T W T F S S` (12px, muted). 6×7 grid. Out-of-month days muted. **Today** = thin circular outline. **Selected** = filled `--accent` circle. Today + selected = filled with extra ring.
3. **Time** row — clock icon + "Time"; when set, shows the value (e.g. "11 AM") with right-aligned `×` to clear. Click opens Time sub-popover.
4. **Remind me** row — bell + "Remind me". **Disabled in v1** (muted, non-interactive).
5. **Repeat** row — refresh icon + "Repeat". Opens sub-popover with: Daily / Weekdays / Weekly / Monthly / Yearly.
6. **Footer:** *Clear* (ghost) and *Done* (primary), shown only when there are unsaved changes.

### Time sub-popover (220px, anchored right of date popover)

- Top: calendar icon + "No due date" — selecting clears the date and closes both popovers.
- Editable time input (highlighted band) — selects all on focus.
- Scrollable list of times in 30-minute increments starting from the typed/selected hour (9 AM, 9:30 AM, 10 AM, …). Selected item gets a coral dot.
- Footer: *Clear* (ghost), *Done* (primary).

### Priority popover (160px)

Three rows, each: colored bars icon + label + right-aligned shortcut chip.
- High — red — `1`
- Medium — amber — `2`
- Low — blue — `3`

Selecting again clears. When the popover is open, pressing `1`/`2`/`3` selects without click.

---

## 7. Keyboard shortcuts (phase 1 surface)

| Shortcut | Action |
|---|---|
| `^N` / `Ctrl+N` | Focus the new task row |
| `Enter` | Commit task (when new task focused) |
| `Esc` | Close popover / blur |
| `1` / `2` / `3` | Set priority (when priority popover open) |

Full shortcut list is in `99-reference.md`.

---

## 8. Acceptance criteria for phase 1

Reviewer can verify all of these without code-diving:

1. New signup lands on `/onboarding` → completes 3 steps with exact copy → lands on `/` → sees Superlist Light theme + Getting Started List in sidebar Lists.
2. Sidebar shows: Inbox / Today / Tasks / AI Chat at top, Recent collapsible, Lists with `Browse all` on hover and `+` `⌃` buttons revealed, Tools section collapsed by default for new users.
3. Selecting any sidebar item shows a 2px coral left border on it and the row fills with `--bg-hover`.
4. Sidebar collapse toggle reduces sidebar to icons only; tooltips work on hover.
5. Inbox page header renders with serif page title and right-side filter/overflow icons.
6. Tip banner appears under the heading with the exact `copy.inbox.tipBanner` string; `×` dismisses it for the session.
7. New task row shows `^N` chip when unfocused; focusing changes placeholder weight; pressing Enter commits and resets.
8. Clicking the calendar icon on the new task row opens the date popover with quick options + month grid + Time/Remind me/Repeat in that exact order. Today is circled; "Remind me" is muted/disabled.
9. Clicking Time opens the sub-popover with "No due date" at top, editable input, 30-min increment list, Clear/Done footer.
10. Clicking the priority icon opens a popover with `1`/`2`/`3` chips that work as keyboard shortcuts.
11. Theme toggle in Settings → Appearance switches between Superlist Light / Superlist Dark / 6 existing LAIF themes — all still functional.
12. On existing users' first login post-deploy, the "new look" toast appears once, dismissible.
13. AI Chat sidebar item still routes to the existing LAIF chat surface (visual reskin only, no functional change).
14. Mobile / narrow viewports (<1024px) show a "best on desktop" notice — no responsive collapse attempted.

---

**End of phase 1.** Next: `03-phase-2-lists-editor.md` for the rich editor, share, and customize.
