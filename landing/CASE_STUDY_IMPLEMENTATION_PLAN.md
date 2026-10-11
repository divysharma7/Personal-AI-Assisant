# Life OS Case Study — Dark Rebuild from New Markdown (Implementation Plan)

Content source of truth: the six NEW Markdown files in `landing/public/case-study/life-os/`
(`01-discovery-brief.md`, `02-empathy-deepening.md`, `03-problem-convergence.md`,
`04-solution-design.md`, `00-market-scan.md`, `05-simulated-interviews.md`).
`backup-oct10/` holds the OLD versions — do not use. Visual source of truth: the
existing live DARK landing site (`src/globals.css`, `tailwind.config.ts`, landing components).
The Markdown controls WHAT is said; the live site controls HOW it looks.

---

## A. Current architecture

- Vite + React 18 + TypeScript + Tailwind 3 app under `landing/`; build = `tsc --noEmit && vite build`, lint = `eslint src/`.
- Routing (`landing/src/App.tsx`): `/` → HomePage; `/case-study/life-os` and `/case-study/life-os/:phase` → lazy `src/pages/LifeOsCaseStudyPage.tsx`.
- `LifeOsCaseStudyPage.tsx` (+ `.css`): legacy single-page case study in a **beige** theme (`--paper: #fbf1e6`…), chapters keyed off the `:phase` slug. It already mounts engine content via `<LifeOsDiscoverContent />`. This beige theme must disappear.
- **Engine** (keep and extend): `src/case-study/engine/` —
  - `types.ts`: `Section` union (`text | cards | stats | insight | journey | custom`), `Phase`, `CaseStudy` shapes; `CustomSection` = `{ component: string, data: unknown }` with a registry.
  - `SectionRenderer.tsx` + `sections/{Text,Stats,Cards,Insight,Journey,Custom}SectionView.tsx`.
  - `case-study-engine.css`: currently **beige** token system (`--cs-surface: #fbf1e6`, `--cs-ink: #261911`…). Must be rewritten onto the live dark tokens (see B). It already defines useful width/type scales (`--cs-width-reading/content/feature`, `--cs-text-hero/statement/h2/h3/lead/body/supporting/meta`) — keep the scale, swap the palette.
- **Product content**: `src/case-study/products/life-os/` — `discover.ts` (currently sourced from the OLD `src/data/lifeOsCaseStudy.ts` — must be re-authored from the NEW markdown), `LifeOsDiscoverContent.tsx`, `life-os-discover.css` (beige), `customSections.ts`, `custom/{FragmentationLandscape,SyntheticInterviewDisclosure,EvidenceRegister,AudienceActionLoop}.tsx`.
- Legacy beige to remove/re-skin: `src/pages/LifeOsCaseStudyPage.css`, `src/case-study/case-study.css` (Coinflo-editorial artifact from an earlier instruction — DELETE), `engine/case-study-engine.css`, `products/life-os/life-os-discover.css`.
- `src/data/lifeOsCaseStudy.ts` / `lifeOsCaseStudyContinuation.ts` / `sourceCoverage.ts`: previous copy — content source NO LONGER; may be deleted once nothing imports them (end of project), used only for wiring until then.

## B. Existing dark design system (reuse — do NOT create a second token system)

Tokens (`src/globals.css` `:root` and mirrored in `tailwind.config.ts`):

```
BACKGROUND   --bg-canvas #050810 · --bg-surface #0a0f1e · --bg-elevated #141b2d (tailwind adds bg-tertiary #0f1629)
TEXT         --text-primary #f0f2f5 · --text-secondary #8b95a9 · --text-muted #5a6478
ACCENT       --accent #6366f1 · --accent-light #818cf8 · --accent-dark #4338ca · --gold #e8b84f
             tailwind: accent-soft rgba(99,102,241,.12) · accent-glow rgba(99,102,241,.25)
BORDER       --border-color rgba(255,255,255,.1) · --border-hover rgba(255,255,255,.2) · --line-color rgba(255,255,255,.06)
             tailwind border: .06 / hover .12
TYPE         Inter everywhere. tailwind fontSize: hero 5rem/1.05 -0.03em · hero-mobile 2.75rem · section 3rem/1.15 · section-mobile 2rem
WIDTH        page-container = padding-inline clamp(24px,6vw,150px) · max-w-content 1200px · max-w-text 680px (reading) · hero layout 1200px
SPACING      section-padding 80px → 140px @768px (tailwind spacing.section 140/80)
SURFACES     .tile3d (bg-canvas, border, radius 6px, layered 0 4px 0 shadow, hover -2px) · --sunken · --accent variants
BUTTONS      .btn3d (accent bg, 0 4px 0 accent-dark, radius 6px, hover -2px / active +3px press) · --ghost · --sm
MOTION       fade-up 0.6s cubic-bezier(.16,1,.3,1) · fade-in 0.5s · transitions 160–250ms ease · prefers-reduced-motion honored
EXTRAS       .gradient-text · .accent-glow · .grid-bg (64px grid lines @3% white)
CARDS        landing idiom: bg-bg-secondary rounded-2xl p-6 md:p-8 border border-border hover:border-border-hover
EYEBROWS     text-xs font-medium uppercase tracking-widest text-accent (mb-4)
FOCUS        :focus-visible outline 2px #6366f1 offset 2px
BREAKPOINTS  767px mobile · 768–1023 tablet · 1024+ desktop
```

Rule for every chunk: an equivalent live-site token/class exists → reuse it. New
patterns extend this language (dark surfaces, hairline borders, indigo accent, gold
for evidence highlight, 3D press buttons). NO beige, no new palette, no new type system.

## C. Markdown content map (summary — full map produced during audit)

Evidence schemes to preserve exactly: **[E] verified · [P] public signal · [S] synthetic ·
[H] hypothesis** (01/02), 03 uses **[S] + prose qualifiers** ("Logic", "Hypothesis", "stated
attitude"), 04 adds **[C] constructed example** + status tags *"planned, not run"*,
*"targets, not achievements"*, *"[unaudited]"*. 05 is wholly synthetic by declaration;
never quote Ananya/Rohan/Meera as real people (no quotation marks next to names).
00 is vendor pages only (Fact/Inference/Caveats) — never user satisfaction.

Numeric anchors (do not alter): ~1,200 toggles/day · ~4 hrs/week (9%) · 78% India vs 68%
global focus · 83% would delegate to AI · 92% AI use · 76% lack time/energy · 46% meeting
absence · 40% at 6 AM / 29% at 10 PM · 57/43 communicate/create · 8 hand-off funnel ·
21 stakeholder nodes · 6 branches / 36 sub-issues · worked arithmetic 210→270 → 45-min
overrun → gap 105 [S] · 8 candidates, 6 criteria, chosen **22/30 third place**, loses all
3 sensitivity cuts · 17 pain points · capacity budget 540→185, demand 170, +60 task = 45
over · fixed test case 150/150 → 105/150 = 45 over [C] · gates 10/12, 9/12, 10/12, 11/12,
20% faster, 4/5, zero Firm-moves.

Per-file section inventories (implement in this order, mapping to chunks):

- **01 Discovery**: Three numbers → Introduction → Global scenario (external vs self-management) → Indian perspective (belief/behavior split) → Impact on self-managing worker (disparity/severity + translation loop) → Signals, not interviews (operational/relational/emotional + HN quotes + synthetic dry-run table) → Emotional arc (5 stages, zigzag) → Impact framework (6 dims: 4 primary / 2 ripple, radar) → Opportunities (3, layered) → Problem statement + ripple → (appendix-tier: interview guide, evidence register E1–E8, decision log, self-audit).
- **02 Empathy**: Day has no edges (40/29 strip) → Filtration funnel (8 hand-offs, evidence notches) → Three cultural scripts → Existing services audit (6 vendors, documented vs gap) → Stakeholder rings (core/involved/informed, 21 nodes) → Public voices (4 HN quotes + 2 "to collect" slots) → Problem mapping (A–F branches) → Experience map (Start→Close lanes + worked arithmetic [S]) → Two different worlds (Ananya vs Rohan [S], Meera comparison) → Discoveries (57/58/8.8/7.5) → Assumptions challenged → Next: primary research.
- **03 Convergence**: The answer first (chosen + weakness) → Candidates & criteria → Scoring matrix + sensitivity → Narrowing down (lost thread / switching / priority ruled out; carried constraints) → Why re-planning (causal case, hub-and-spoke) → Ecosystem (6 themes, rings) → Pain points (17, four moments) → Setbacks of existing tools → India scenario → Impact ripples (5, hypotheses) → Business viability → Sub-HMWs (3) → Need statement (verbatim) + MUST / MUST-NOT-ASSUME → Validation (8–12 users).
- **04 Solution**: Background → Cause & effect tree → Reactivated evidence → Need statement → Current/Challenge/Vision → Design principles (6) → Ideation questions → Concept variants (worksheet baseline / reviewed proposal preferred / optional auto-adjust / everything-app rejected) → Co-creation status "not conducted" → Concept description → Five features (Repair Preview [C]; Mark What's Firm; Capacity View + arithmetic [C]; Light Capture + One-Tap Start; Optional Close) → AI rules (6) → IA (Now first) → Service flow (10 steps) → Service blueprint → Edge/error states (8) → FAQs → Benefits/Framework return/Impact → Competitive reality check → Validation plan "planned, not run" + gates → Success metrics (8) + event names → Roadmap (5) + don't-build-first → Reflection (5 gaps) → Closing.
- **Supporting**: 00 market scan appendix (prices, caveats) · 05 synthetic-test disclosure + guide fixes (appendix, never in main narrative).

## D. Routes (preserve current architecture)

```
/case-study/life-os                 → Overview / case-study home
/case-study/life-os/discover        → Phase 1
/case-study/life-os/empathize       → Phase 2
/case-study/life-os/converge        → Phase 3
/case-study/life-os/solution        → Phase 4  ("/deliver" kept as redirect alias)
```

Keep the existing `/case-study/life-os/:phase` route shape in `App.tsx`; the page
component dispatches on slug. No router rewrite.

## E. Proposed component structure

```
src/case-study/
  engine/                      # keep; re-skin to dark
    types.ts                   # extend union: table, quote, funnel, figure/custom stays
    SectionRenderer.tsx        # extend switch
    case-study-engine.css      # REWRITE: live dark tokens (globals.css), keep width/type scale
    sections/*SectionView.tsx  # re-skin; add TableSectionView, QuoteSectionView as needed
  shell/                       # NEW (Chunk 01)
    CaseStudyShell.tsx         # dark page shell: header strip, phase nav, breadcrumb, footer links
    PhaseNav.tsx               # phase tabs (Overview · Discover · Empathize · Converge · Solution)
    SectionBlock.tsx           # eyebrow/title/lead rhythm (dark)
    EvidenceTag.tsx            # [E]/[P]/[S]/[H]/[C] chips in live chip idiom (quiet)
    SourceLink.tsx             # source-link styling
  products/life-os/
    overview.ts                # NEW overview content module (from markdown status/HMW blocks)
    discover.ts                # RE-AUTHOR from 01-discovery-brief.md (stop importing old data)
    empathize.ts               # NEW from 02-empathy-deepening.md
    converge.ts                # NEW from 03-problem-convergence.md
    solution.ts                # NEW from 04-solution-design.md
    custom/                    # chunk-scoped custom views (dark), e.g.
      ThreeNumbersBand.tsx · FragmentationSplit.tsx · TranslationLoop.tsx · EmotionArc.tsx
      ImpactRadar.tsx · FiltrationFunnel.tsx · StakeholderRings.tsx · ExperienceLanes.tsx
      ScoringMatrix.tsx · SensitivityTable.tsx · CausalHub.tsx · RepairPreviewDemo.tsx
      CapacityLedger.tsx · ServiceBlueprint.tsx · ValidationGates.tsx …
    LifeOsPhaseContent.tsx     # renders a phase's sections via SectionRenderer + registry
src/pages/LifeOsCaseStudyPage.tsx   # REPLACE body: dispatcher (overview|discover|empathize|converge|solution) on dark shell
```

Interactive demo reused conceptually from legacy page: the meeting-overrun recovery
fixture becomes `RepairPreviewDemo` (Feature 1) — logic preserved, visuals dark.

## F. Phase-by-phase tasks (execution chunks — each: inspect → implement → build → lint → desktop/mobile check → update CASE_STUDY_PROGRESS.md → STOP)

Pre-chunk (first implementation action): write `CASE_STUDY_IMPLEMENTATION_PLAN.md`
(this plan) and seed `CASE_STUDY_PROGRESS.md` in `landing/`.

- **Chunk 01 — Foundation + dark shell** (no research content beyond a verify-placeholder):
  delete `src/case-study/case-study.css`; rewrite `engine/case-study-engine.css` on dark
  tokens; build `shell/` components; replace `LifeOsCaseStudyPage.tsx` with the dark
  dispatcher + PhaseNav + placeholder phase pages; retire `LifeOsCaseStudyPage.css`
  beige (keep only what shell needs, dark). Acceptance: page indistinguishable in
  system from live site; no beige anywhere; build+lint green. STOP.
- **Chunk 02 — Phase 1A**: hero/phase intro (working title "When the day changes faster
  than the tools can follow"), research status ("desk research + synthetic dry run, no
  real interviews yet"), HMW as major moment, Three numbers band (~1,200 / ~4 hrs / 78%),
  Introduction, Global fragmentation (external vs self-management split — not generic
  equal cards). STOP.
- **Chunk 03 — Phase 1B**: Indian perspective (83/92/78/76 + survey caveats), translation
  loop (Capture→Re-plan, [H]), Signals (operational/relational/emotional; HN quotes as
  [P]; synthetic dry run [S]). STOP.
- **Chunk 04 — Phase 1C**: emotional arc (5 stages, zigzag), impact framework (4 primary
  + 2 ripple radar), 3 opportunity directions, problem statement/ripple close.
  **Finish Phase 1**: appendix-tier blocks (evidence register E1–E8, decision log) as a
  collapsible source layer at page end. STOP.
- **Chunk 05 — Phase 2A**: "Whose day is it, anyway?", day-has-no-edges 24h strip (40/29),
  filtration funnel (8 hand-offs, verified vs hypothesis notches), three cultural scripts,
  services audit (6 vendors; never claim page-silence proves absence). STOP.
- **Chunk 06 — Phase 2B**: stakeholder rings (hierarchy-first, readable), public voices
  (4 HN [P] + 2 dashed "to collect" slots; not interviews), problem mapping (A–F, quiet
  evidence dots). STOP.
- **Chunk 07 — Phase 2C**: experience map (responsive narrative, not a giant table),
  worked arithmetic [S] (210/270 → 105), two worlds (Ananya/Rohan [S], Meera comparison),
  discoveries, assumptions challenged ("challenged" not "invalidated"), Phase 2→3 close. STOP.
- **Chunk 08 — Phase 3A**: "Eight problems, one pick, and why it isn't the top scorer";
  chosen problem callout + weakness box (22/30, third, loses all sensitivity cuts); eight
  candidates; six criteria; scoring matrix (ranked, chosen outlined) + sensitivity table. STOP.
- **Chunk 09 — Phase 3B**: ruled-out candidates (lost thread / switching / priority with
  why-not + what-changes-our-mind), carried constraints (maintenance → no added upkeep;
  opaque AI → explain/reversible; fragmentation/routines → requirements), causal
  hub-and-spoke ("hangs off" = logic/hypothesis, never proven causality). STOP.
- **Chunk 10 — Phase 3C**: ecosystem themes/rings, 17 pain points (4 moments; 6 in the
  re-planning moment highlighted), tool setbacks (page says vs gap), India scenario,
  impact ripples [H], business viability ("unproven as a wedge"), sub-HMWs, need statement
  (verbatim, prominent), Phase 4 MUST / MUST-NOT-ASSUME handoff. STOP.
- **Chunk 11 — Phase 4A**: "Life OS, the day that repairs itself with your say-so",
  solution statement, phase transition strip, cause/effect tree (re-plan node highlighted;
  structural model), reactivated evidence (secondary), Current/Challenge/Vision, six design
  principles, four concept variants (worksheet baseline NOT visually deprioritized vs AI). STOP.
- **Chunk 12 — Phase 4B**: five features in existing dark PRODUCT UI style (reconstructed
  Life OS surfaces, not marketing cards): 1 Repair Preview (Trigger/Reason/Consequence/
  Control incl. accept/edit/dismiss/undo — constructed example [C], interactive
  RepairPreviewDemo ported from legacy fixture), 2 Mark What's Firm (Firm/Flexible;
  invisible-commitment), 3 Capacity View (visible arithmetic 540→185→…; explain, not
  dashboard), 4 Light Capture + One-Tap Start (duration buckets 15/30/60/90/90+/not sure),
  5 Optional Close (keep/defer/drop; no streaks/guilt). Each: research trace + before +
  interaction + after + limitations. STOP.
- **Chunk 13 — Phase 4C**: IA (Now/Inbox/Plan/Focus/Routines/Workspaces/Assistant; Now
  primary), ten-step service flow, service blueprint (dark visual; no unnecessary eng
  internals), edge/error states (8 incl. AI unavailable), AI rules (6, say/avoid). STOP.
- **Chunk 14 — Phase 4D**: validation "NOT RUN / PLANNED" wall, stages A–D, gates as
  proposed gates (never results), success metrics (targets), event instrumentation
  (privacy note: never log titles; not implied live), roadmap (5 steps), don't-build-first,
  reflection (5 honest gaps prominent), closing thesis. STOP.
- **Chunk 15 — Supporting evidence layer**: optional appendices from 00-market-scan and
  05-simulated-interviews (evidence drawer / source registry / synthetic-test disclosure /
  competitor appendix) — never interrupting the main narrative. Also: remove now-dead
  old data modules if nothing imports them. STOP.

## G. Dependencies

- Chunk 01 (dark shell + engine re-skin) blocks everything.
- Phase chunks are strictly ordered within a phase (shared content modules), phases are
  independent of each other after 01 (02–04 → 05–07 → 08–10 → 11–14 is the narrative
  order; progress-file handoff makes each resumable in a fresh context).
- Chunk 12 reuses the recovery-fixture logic from the legacy page before that code is
  deleted; if the legacy page is replaced in Chunk 01, port the fixture logic into
  `custom/RepairPreviewDemo.tsx` first (it is the one interactive piece worth preserving).
- Chunk 15 depends on all four phases existing.

## H. Acceptance criteria (global)

1. The case study feels like the live dark Life OS site expanded — never a separate
   portfolio template. No beige/light theme remnants anywhere.
2. All tokens/styles come from the existing system; no second token set.
3. Content comes from the NEW markdown; claims never strengthened; [E]/[P]/[S]/[H]/[C]
   and "planned, not run" semantics preserved; synthetic personas never presented as
   real; market scan never as satisfaction evidence.
4. Visual rhythm: alternate narrative / data / diagram / product UI / quote / comparison
   / timeline / interactive demo — no uniform card-grid repetition.
5. Phase 3's weakness (22/30, third place, loses sensitivity cuts) is visibly honest.
6. Responsive at mobile/tablet/desktop with deliberate mobile reading order for diagrams;
   keyboard accessible, semantic headings, reduced-motion, visible focus.
7. `npm.cmd run build` and `npm.cmd run lint` green after every chunk.

## I. Build/lint validation & context-limit protocol

Every chunk: `npm.cmd run build` + `npm.cmd run lint` in `landing/` (plus targeted tests
if any exist for changed components), desktop + mobile visual check (agent-browser
screenshot), then update `landing/CASE_STUDY_PROGRESS.md` (Completed / Files changed /
Routes & components / Design decisions / Content implemented / Open issues / Next chunk /
Constraints to preserve) and STOP. Next context starts by reading
`CASE_STUDY_IMPLEMENTATION_PLAN.md`, `CASE_STUDY_PROGRESS.md`, the relevant Markdown
file, and only the source files that chunk touches. Completed chunks are not redesigned
unless a shared dependency forces it (state why).
