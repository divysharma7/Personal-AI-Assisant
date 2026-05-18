# Superlist Web — New Use Cases (Part 4)

> **Supplement to `superlist_ia.md`, `superlist_ia_part2.md`, and `superlist_ia_part3.md`.** Read those first.
>
> **Scope decision (per user request):** This build is **for individuals only — no Teams**. The following are explicitly **OUT OF SCOPE**:
>
> - Team workspaces (e.g. `Design Research`, `Mobbin` in screenshots)
> - The "Create team" full-screen flow documented in Part 3 → drop this
> - The `+ New team` item in the account menu → remove from Part 3's spec
> - Team-switcher toggles in the account menu → don't build
> - The "This list is hidden / Toggle Personal on" empty state (only relevant when multiple workspaces exist)
> - The Team's empty-state list view (`This is the place for your Team's lists`)
>
> The user has a single implicit workspace (their personal one) and that's it. Treat the existing sidebar as the entire universe.
>
> **Mobile reminder:** desktop ≥1280px only; Flutter app handles narrow.

---

## New Features Introduced (in scope)

1. **Invite friends modal** (referral flow — not team invites)
2. **Settings page** with four tabs: `Profile`, `Features`, `Subscriptions`, `Integrations`
3. **Profile management** (avatar upload, name fields, primary email display)
4. **Theme picker** (Light, Dark, Blackout, System preference)
5. **Recently viewed lists toggle** (sidebar feature flag)
6. **Subscription view** (Free plan summary + Upgrade to Pro CTA)
7. **Integrations directory** (Gmail, Google Calendar, Microsoft To Do, Email forwarding, plus Pro-gated Slack / GitHub / Linear / Figma)
8. **Account deletion** (two-step destructive flow with confirmation modal)
9. **Theme-aware wallpapers** (right-column images have dark variants)

---

## 1. Invite friends modal

**Trigger:** Account menu → `Invite friends`.

**Result:** A centered modal opens with a dimmed page behind.

### 1.1 Initial state

**Modal contents:**
- Top: gift-box illustration on the left
- Headline (two-line layout): `Invite [friends]` / `to Superlist`
  - The word `friends` is rendered as a small purple/lilac rounded pill — visually distinguished from the surrounding text
- Body label: `Send invitation to`
- Email input with placeholder `anna@example.com`
- `Send` button at the input's right edge — **disabled / greyed** until a valid email is entered

### 1.2 Email entered

- The placeholder is replaced with the typed email, e.g. `jsmith.mobbin@gmail.com|`
- A small `×` clear icon appears at the right edge of the input (between the text and the Send button)
- `Send` button is now **enabled** (filled, tappable)

### 1.3 After Send

- The input field clears (returns to `anna@example.com` placeholder)
- A success confirmation appears **below the input** in green: `✓ Invitation sent`
- Modal stays open so the user can send another invite

**Closing:** Click outside the modal or hit Escape.

**Build notes:**
- Single-recipient at a time. If multi-recipient is desired later, parse comma/space-separated emails.
- Backend should rate-limit and dedupe (don't email the same person twice in N hours).
- The `friends` styled pill is decorative — content, not chrome. It's part of the headline string.

---

## 2. Settings page (overview)

**Trigger:** Account menu → `Settings`.

**Layout:**
- Sidebar stays visible on the left (user can still navigate away)
- Main column shows `Settings` H1 title
- Top-right: `Sign out` pill button (always visible, all tabs)
- Tab row below title (segmented pills): `Profile` (default), `Features`, `Subscriptions`, `Integrations`
- Right column: keeps the standard wallpaper

The Settings page is a **single-page view with tab switching** — not a separate route per tab. The tab row is the same component used in Tasks filters.

---

## 3. Settings → Profile tab

### 3.1 Personal info card

A rounded section with light grey background:
- Section title: `Personal info`
- Subtitle: `Update your photo and personal details here`
- **Avatar** at the top-right of the card (large circle, e.g. yellow `J` initial or uploaded photo)
- **Form fields** (two columns):
  - Left: `First name` label + input (filled `Jane`)
  - Right: `Last name` label + input (placeholder `Last name`, empty by default)
- Full-width field below:
  - `Primary email` label + input (filled, **read-only**, muted styling — e.g. `jdoe.mobbin2@gmail.com`)

**Behavior:**
- Name fields autosave on blur
- Primary email is **not editable** here — users must go through a separate email-change flow (out of scope here)

### 3.2 Avatar — hover state

When the user hovers over the avatar:
- A pencil/edit icon overlays on top of the avatar (centered)
- Cursor becomes pointer
- Click → opens an image picker (likely the same one used for list/team customization)

### 3.3 Avatar — after upload

The yellow `J` initial is replaced with the uploaded photo (rounded crop).

### 3.4 Account deletion card

Below the Personal info card, a separate rounded section:
- Section title: `Account deletion`
- Subtitle: `This action is permanent and cannot be undone`
- Right side: `Delete account` button — text-only, **red** color
- Click → opens the Delete Account confirmation modal (see §7)

---

## 4. Settings → Features tab

Two cards stacked:

### 4.1 Appearance card

- Section title: `Appearance`
- Subtitle: `Customize your app interface`
- Setting row:
  - Left: label `Active theme`
  - Right: dropdown showing the current selection (e.g. `System preference`) with chevron

**Theme dropdown options** (when opened):
- `Light theme`
- `Dark theme`
- `Blackout theme` (true-black variant, distinct from regular dark)
- `System preference` (currently selected, marked with red dot indicator)

**Visual differences:**
- Light = white surfaces, dark text
- Dark = dark grey surfaces, light text
- Blackout = pure black `#000` background, slightly more contrast (visible in Image 18)
- System preference = follow OS dark/light mode setting

### 4.2 Recently viewed lists card

A toggle row:
- Left: label `Recently viewed lists`
- Sub-label: `See your most recently viewed lists in a dedicated section in the sidebar`
- Right: toggle switch (on by default — green when on)

When on → the `Recent` section in the sidebar populates with recently-opened lists. When off → the `Recent` section is hidden entirely.

---

## 5. Settings → Subscriptions tab

A single card with the current plan summary:

- **Header row:**
  - User avatar + `Personal` label + `Free` badge (small pill)
  - Right side: `Upgrade to Pro` button (purple-filled, prominent)
- **Sub-line:** `$0 /month`
- **Description paragraph:** `Unlimited private lists, up to 25MB file uploads, AI email summarization, Gmail and Gcal integrations and...` (truncates with `...`)
- **Feature checklist** with `✓` icons:
  - `0 / 5 shared lists`
  - `5 collaborators per list`
  - `0 B / 500 MB storage`

**Notes:**
- The checklist shows **current usage** against plan limits (`0 / 5 shared lists` = used / cap)
- Storage shows actual bytes used as well as the cap
- Free plan limits per the screenshot: **5 shared lists, 5 collaborators per list, 500 MB storage**
- Upgrade to Pro routes to a pricing/checkout flow (out of scope here — but design the card so it links somewhere)

---

## 6. Settings → Integrations tab

A list of integration cards. Top of the tab:
- Section title: `Integrations`
- Subtitle: `Supercharge your workflow and connect the tools you use every day`
- `Learn more ↗` link below the subtitle

### 6.1 Integration row anatomy

Each integration is a clickable row:
- Left: branded icon in a rounded square (color logos: Gmail red/yellow/blue, Google Calendar multi-color, Microsoft To Do blue, etc.)
- Title (bold)
- Optional `Pro` badge next to the title (small purple pill) for Pro-tier integrations
- Subtitle / description below the title

### 6.2 Integration states

- **Not connected:** subtitle is the marketing description (e.g. `Convert emails into Superlist tasks`)
- **Connected:** subtitle is replaced with a green status line (e.g. `1 account connected`)

### 6.3 Integrations list (in order shown)

| Integration | Tier | Description | State in screens |
|---|---|---|---|
| Gmail | Free | `Convert emails into Superlist tasks` | Not connected |
| Google Calendar | Free | `Create calendar events from Superlist tasks with due dates` | Not connected |
| Microsoft To Do | Free | `Keep Microsoft To Do lists and tasks in sync with Superlist.` | Not connected |
| Email forwarding | Free | (when connected) `1 account connected` | **Connected** in screen |
| Slack | **Pro** | `Create Superlist tasks from Slack messages` | Not connected |
| GitHub | **Pro** | `Receive pull requests and issues in Superlist as tasks` | Not connected |
| Linear | **Pro** | `Turn Linear issues into Superlist tasks` | Not connected |
| Figma | **Pro** | `Create Superlist tasks in Figma widget` (partial) | Not connected |

Free-tier integrations (top group) are usable by Free-plan users. Pro-tier integrations are locked behind the Pro upgrade — clicking them should prompt the upgrade flow rather than the connection flow.

**Build notes:**
- Each integration row click opens that integration's connection flow (OAuth-style for most, paste-an-API-key for Linear/GitHub, email-address forwarding for Email forwarding).
- These flows are not screenshotted here — model them per integration's API.

---

## 7. Account deletion modal

**Trigger:** `Delete account` clicked in Profile tab.

### 7.1 Initial state

Centered modal over a dimmed page:
- Headline: `Delete your account?`
- Body: `This will permanently delete all your tasks and lists and any Pro subscription will be cancelled. This action cannot be undone.`
- Checkbox row: empty circular checkbox + label `Yes, I want to delete my account`
- Bottom buttons:
  - `Cancel` (left, neutral pill)
  - `Delete Account` (right, red text, **disabled / muted** until checkbox is checked)

### 7.2 Checkbox checked

- The checkbox fills with a **green checkmark**
- The `Delete Account` button becomes **enabled** (solid red background, white text — bold destructive styling)
- `Cancel` remains neutral

### 7.3 On confirm

- Backend deletes all user data
- Pro subscription (if any) is cancelled
- User is signed out and redirected to a goodbye / auth page (out of scope)

**Pattern:** This is the canonical destructive-action confirmation pattern — required checkbox + red filled button. Reuse it for any other irreversible action.

---

## 8. Theme system in depth

### 8.1 Three explicit themes + auto

- `Light theme` — default light surfaces
- `Dark theme` — dark grey surfaces (standard dark mode)
- `Blackout theme` — pure black `#000` backgrounds. Visibly different from Dark in side-by-side comparison; intended for OLED screens or extreme low-light environments.
- `System preference` — follows the OS-level appearance setting. If user has macOS/Windows/Linux in dark mode, app uses Dark theme; if light, Light theme. (Blackout is **not** an auto target — only manually selectable.)

### 8.2 Theme-aware wallpapers

The wallpaper images in the right column have **dark variants**. Examples from the screenshots:

- Light-mode default Tasks wallpaper: warm purple/orange sphere with sunny lavender field
- Dark/Blackout-mode equivalent: same composition rendered at night — deep blue, magenta water droplets, glistening surfaces (Image 18)
- Another example: a desert/portal scene that's serene-daytime in light mode and golden-dusk in dark mode (Image 19)

**Implication:** Either:
- Each Unsplash/default image has two variants stored (`image_light.jpg` and `image_dark.jpg`), OR
- We use distinct curated image sets per theme

**Build approach:** For the curated/default wallpapers, ship light+dark pairs. For user-uploaded or Unsplash-searched images, do **not** auto-darken — display as-is in both themes (users picked them deliberately).

### 8.3 What changes with theme

- All surface backgrounds (sidebar, main column, right panel chrome)
- Text colors (auto-invert)
- Borders, dividers
- Wallpaper image variant (for curated wallpapers)
- The `Superlist` footer logo strip stays consistent (or also has a dark variant — confirm with brand)

The accent colors (red active-indicator, green checkmarks, purple Pro badges, blue links) **do not** change with theme — they remain saturated for emphasis.

---

## 9. Updated component inventory (additions)

### 9.1 Centered modal
- Used for: Invite friends, Delete account confirmation
- Dimmed backdrop, rounded card centered in viewport
- Closable via outside-click, Escape, or explicit Cancel
- Sized to content (not full-screen)

### 9.2 Avatar with edit hover
- Default: avatar (initial or photo)
- On hover: pencil overlay icon + slight scrim
- On click: opens image picker

### 9.3 Disabled button state
- Same shape as enabled, but muted text color, no fill, non-interactive cursor
- Visible in: `Send` (Invite Friends, before email entered), `Delete Account` (before checkbox checked), `Create team` from Part 3 (but team is out of scope, so ignore)

### 9.4 Status text below input
- Small text below an input showing operation result
- Green for success (`✓ Invitation sent`), red for errors (presumed)

### 9.5 Settings tabs (segmented control)
- Identical visual treatment to the Tasks filter tabs
- Active tab: darker background pill
- Non-active: text-only

### 9.6 Plan card
- Used in Subscriptions tab
- Header row with avatar + plan name + badge + primary CTA
- Body description
- Feature checklist with `✓` icons and usage / limit format `[used] / [cap] [unit]`

### 9.7 Integration row
- Branded icon + title + optional Pro badge + description / status
- Whole row is clickable
- Pro badge gates click → upgrade flow vs connect flow

### 9.8 Theme dropdown
- Standard select-style dropdown
- Current selection shown in trigger
- Options list with a red dot on the active item

### 9.9 Destructive confirmation modal
- Headline ending in `?`
- Body explaining the consequence
- Required acknowledgment checkbox
- Cancel (neutral) + Confirm (red, disabled until checkbox)

---

## 10. Updated account menu (with teams removed)

Per the scope decision, the account menu from Part 3 should be **revised** to drop team-related items. The final, in-scope account menu is:

```
🎁 Invite friends            → opens §1 modal
⚡ Upgrade to Pro             → opens pricing flow (out of scope here)
─────
⚙ Settings                  → opens Settings page (§2)
🗄 Integrations              → jumps directly to Settings → Integrations tab
─────
🎧 Get support               → external link / help center
📱 Get mobile app            → external link / app store
⚡ See what's new            → changelog / what's new page

[bottom of menu — implicit]
Sign out                     → already accessible from Settings page header
```

**Removed (vs Part 3):**
- `+ New team` (and the entire workspace-switcher block of toggles above it)

**Kept:** Everything else from Part 3's account menu spec.

---

## 11. Updated IA tree

```
Superlist Web (individual-only)
│
├── System Views                  (top, fixed order)
│   ├── Inbox
│   ├── Today
│   ├── Tasks
│   └── Messages
│
├── Recent  (toggleable via Settings → Features)
│
├── Lists (header + Lists directory)
│   ├── [pinned lists]
│   └── [sections + child lists, user-managed]
│
└── Avatar menu (bottom-left)
    ├── Invite friends          → modal
    ├── Upgrade to Pro          → pricing flow
    ├── Settings                → §2
    │   ├── Profile             → §3
    │   ├── Features            → §4
    │   ├── Subscriptions       → §5
    │   └── Integrations        → §6
    ├── Integrations            → Settings → Integrations
    ├── Get support
    ├── Get mobile app
    └── See what's new

Theme system: Light / Dark / Blackout / System preference
   ↳ affects all surfaces + curated wallpapers
```

---

## 12. Build notes (additions)

1. **Theme implementation.** Use CSS variables on `:root` and a `[data-theme="light|dark|blackout"]` attribute on `<html>`. `System preference` reads `prefers-color-scheme` and binds to dark/light dynamically. Persist explicit choice in localStorage + sync to user account.

2. **Email read-only.** Primary email field is intentionally not editable in Profile. If the user wants to change it, that's a separate verification flow (out of scope but should exist eventually — design a `Change email` link beside the field for the future).

3. **Plan limits enforcement.** Free tier limits (5 shared lists, 5 collaborators, 500 MB storage) should be enforced server-side as hard caps. UI should show usage progress in Subscriptions tab and gracefully error when limits are hit elsewhere (e.g. "You've reached your 5-list sharing limit. Upgrade to Pro for unlimited shared lists.").

4. **Pro-gated integrations.** Clicking a Pro-badged integration on a Free plan should open the upgrade flow, not the connection flow. After upgrade, return to the same integration tile and start the connection.

5. **Email forwarding integration.** This one is interesting — it gives users a unique forwarding address (something like `you-abc123@mail.superlist.com`) that turns forwarded emails into tasks. Implementation: provision a unique address per user, set up SMTP receive, parse subject + body into task, drop into Inbox.

6. **Account deletion is true delete.** Hard-delete the user row, lists owned by them, tasks they created, comments, etc. Cancel Stripe subscription before deleting auth record. Email the user a confirmation. No grace period (per the modal copy: "permanent and cannot be undone").

7. **Invitation tracking.** Successful invitations from §1 should generate referral attribution if there's a referral program. At minimum, log who invited whom for analytics.

8. **Wallpaper pairs.** For built-in/default wallpapers, ship both light and dark variants under matching IDs (`wallpaper_001_light.jpg`, `wallpaper_001_dark.jpg`). Client picks the variant based on active theme. User-uploaded images don't get auto-darkened — render as-is.

9. **`Sign out` button.** Always shown in the Settings page top-right. Clicking signs the user out and redirects to auth.

---

## 13. New UX copy reference (verbatim from screens)

**Invite friends modal:**
- Headline: `Invite [friends] to Superlist` (where `friends` is a styled pill)
- Label: `Send invitation to`
- Placeholder: `anna@example.com`
- CTA: `Send`
- Success: `✓ Invitation sent`

**Settings — global:**
- Page title: `Settings`
- Header action: `Sign out`
- Tabs: `Profile`, `Features`, `Subscriptions`, `Integrations`

**Profile tab:**
- Card title: `Personal info`
- Card subtitle: `Update your photo and personal details here`
- Field labels: `First name`, `Last name`, `Primary email`
- Empty-state field placeholder: `Last name`
- Card title: `Account deletion`
- Card subtitle: `This action is permanent and cannot be undone`
- CTA: `Delete account`

**Features tab:**
- Card title: `Appearance`
- Card subtitle: `Customize your app interface`
- Setting label: `Active theme`
- Dropdown options: `Light theme`, `Dark theme`, `Blackout theme`, `System preference`
- Card title: `Recently viewed lists`
- Card subtitle: `See your most recently viewed lists in a dedicated section in the sidebar`

**Subscriptions tab:**
- Plan name: `Personal`
- Plan badge: `Free`
- Price: `$0 /month`
- CTA: `Upgrade to Pro`
- Description: `Unlimited private lists, up to 25MB file uploads, AI email summarization, Gmail and Gcal integrations and...`
- Stats format: `0 / 5 shared lists`, `5 collaborators per list`, `0 B / 500 MB storage`

**Integrations tab:**
- Section title: `Integrations`
- Subtitle: `Supercharge your workflow and connect the tools you use every day`
- Link: `Learn more ↗`
- Connected status: `1 account connected` (green)
- Pro badge: `Pro`
- Integration descriptions (verbatim per §6.3 table)

**Delete account modal:**
- Headline: `Delete your account?`
- Body: `This will permanently delete all your tasks and lists and any Pro subscription will be cancelled. This action cannot be undone.`
- Checkbox label: `Yes, I want to delete my account`
- Buttons: `Cancel`, `Delete Account`
