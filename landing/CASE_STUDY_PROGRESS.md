# Life OS Case Study — Rebuild Progress

Companion to `CASE_STUDY_IMPLEMENTATION_PLAN.md`. Each context starts by reading both
files, the relevant source Markdown under `public/case-study/life-os/`, and only the
source files the next chunk touches.

---

## Chunk 00 — Planning (complete)

- Audited live dark design system (`src/globals.css`, `tailwind.config.ts`, landing components).
- Content-mapped all six new Markdown files (01/02/03/04 + supporting 00/05).
- Wrote `CASE_STUDY_IMPLEMENTATION_PLAN.md` (approved).
- Backed up legacy beige case-study files to scratchpad `legacy-case-study-backup/`
  (old `LifeOsCaseStudyPage.tsx/.css`, `case-study/case-study.css`, `case-study/products/**`,
  `engine/case-study-engine.css`) and removed them from `src/`.

## Chunk 01 — Foundation + dark shell (complete)

### Completed
- Dark case-study shell: breadcrumb + phase nav + section rhythm, all in the live
  Tailwind idiom (bg-canvas/bg-surface, text-primary/secondary/muted, accent #6366f1,
  border-border, rounded-2xl cards, text-xs uppercase tracking-widest eyebrows,
  gradient-text hero).
- Engine re-skinned dark on the live tokens (`engine/case-study-engine.css` rewritten;
  references `var(--bg-canvas)` etc. from `src/globals.css` — NO second token system).
- Engine section views genericized (Text/Stats/Cards/Insight/Journey) — removed all
  hard-coded legacy copy so content comes only from Markdown-derived modules.
- Page dispatcher replaces the legacy beige single page; `deliver` redirects to
  `solution`; unknown slugs redirect to the overview.
- Recovery-fixture logic preserved as `RepairPreviewDemo` (dark, Tailwind + btn3d),
  sourced from 04-solution-design.md "Fixed test case [C]" numbers.
- Build + lint green. Desktop (1440×900) and mobile (390×844) visually verified for
  overview and phase routes via agent-browser screenshots; `/deliver` → `/solution`
  redirect verified.

### Files changed
- `landing/CASE_STUDY_IMPLEMENTATION_PLAN.md` (new)
- `landing/CASE_STUDY_PROGRESS.md` (new)
- `landing/src/case-study/engine/case-study-engine.css` (rewritten dark)
- `landing/src/case-study/engine/sections/{Text,Stats,Cards,Insight,Journey}SectionView.tsx` (genericized)
- `landing/src/case-study/shell/{CaseStudyShell,PhaseNav,SectionBlock,EvidenceTag,SourceLink}.tsx` (new)
- `landing/src/case-study/products/life-os/custom/RepairPreviewDemo.tsx` (new; fixture port)
- `landing/src/pages/LifeOsCaseStudyPage.tsx` (replaced with dark dispatcher)
- Deleted (backed up in scratchpad `legacy-case-study-backup/`):
  `src/case-study/case-study.css`, `src/pages/LifeOsCaseStudyPage.css`,
  `src/case-study/products/life-os/*` (old beige content modules),
  old beige `engine/case-study-engine.css`.

### Routes & components
- Routes unchanged in `App.tsx`: `/case-study/life-os` + `/case-study/life-os/:phase`.
  Slugs: overview · discover · empathize · converge · solution (deliver → solution alias).
- `CaseStudyShell` (breadcrumb + PhaseNav), `SectionBlock`, `EvidenceTag` ([E]/[P]/[S]/[H]/[C]
  quiet chips), `SourceLink`, engine `SectionRenderer` (unchanged dispatcher).

### Design decisions
- Engine CSS uses the live `:root` tokens by reference — no duplicate token system.
- Type scale follows tailwind config (section 3rem/2rem, hero 5rem/2.75rem); reading
  width 680 (max-w-text), content width 1200 (max-w-content).
- Engine views are now content-agnostic; bespoke dark information-design components
  (numbers band, funnels, arcs, matrices…) will be built per-chunk under
  `products/life-os/custom/` and fed by Markdown-derived content modules.

### Content sections implemented
- None (placeholder-only, per plan). Overview shows only project status
  ("desk research + synthetic dry run", "no real interviews yet").

### Open issues
- `src/data/lifeOsCaseStudy*.ts`, `sourceCoverage.ts` are now unimported legacy copy;
  delete in Chunk 15 once confirmed unused (kept for reference until then).
- Engine section views unstyled variants (evidence-tag styles exist in engine CSS;
  shell EvidenceTag uses Tailwind — merge if they ever collide).

### Next chunk
- **Chunk 02 — Phase 1A: Discovery opening** (source: `01-discovery-brief.md`):
  hero with working title "When the day changes faster than the tools can follow",
  research-status line, HMW as a major moment, Three numbers band (~1,200 toggles/day,
  ~4 hrs/week, 78% India focus), Introduction, Global fragmentation
  (external vs self-management).

### Constraints to preserve
- Visual source of truth = live dark tokens in `src/globals.css` / `tailwind.config.ts`.
- Content source of truth = `public/case-study/life-os/*.md` (NOT `src/data/lifeOsCaseStudy*.ts`,
  NOT `backup-oct10/`).
- Evidence semantics [E]/[P]/[S]/[H]/[C] and "planned, not run" must survive every chunk.
- Synthetic personas (Ananya/Rohan/Meera) and constructed examples stay labelled;
  never quotation-marked as real people.
- `deliver` route slug redirects to `solution`.

---

## Chunk 02 — Phase 1A: Discovery opening (complete)

### Completed
- `PhaseHero` shell component (eyebrow / gradient working title / finding lead /
  status chips / evidence-tag legend).
- `discover.ts` content module created — verbatim from `01-discovery-brief.md`
  L1–50: working title "When the day changes faster than the tools can follow",
  status ("desk research + synthetic dry run", "We have interviewed no one",
  "Figures re-read 11 Oct 2026"), tag legend, finding-in-one-line.
- HMW rendered as a major narrative moment (`hmw-callout`, verbatim).
- Three numbers band (`ThreeNumbersBand`): ~1,200 toggles/day · ~4 hrs/week ·
  78% India focus — oversized numerals, one-line captions, [E] source tags
  (dark interpretation of the markdown's "cream band" request).
- Introduction (verbatim paragraphs incl. "We interviewed no one." and the
  product-exclusion rule).
- Global scenario (`FragmentationSplit`): external vs self-management split as
  comparison cards (5+5 rows verbatim), six-chip handoff chain
  (chat → task app → calendar → focus timer → routine log → review), two stat
  cards (68% WTI 2023; ~1,200 HBR incl. the ~2s/switch, ~4 hrs/week, 9% detail),
  and the verbatim "Pair type: prevalence plus cause" caveat.
- `LifeOsPhaseContent` + `customSections` registry wired; `/discover` renders real
  content, other phases keep placeholders.
- Build + lint green. Desktop (1440×900) + mobile (390×844) verified via
  agent-browser screenshots: visual rhythm alternates narrative / data band /
  reading column / diagram cards; no overflow.

### Files changed
- `src/case-study/shell/PhaseHero.tsx` (new)
- `src/case-study/products/life-os/discover.ts` (new; Chunk 02 sections)
- `src/case-study/products/life-os/custom/ThreeNumbersBand.tsx` (new)
- `src/case-study/products/life-os/custom/FragmentationSplit.tsx` (new)
- `src/case-study/products/life-os/customSections.ts` (new registry)
- `src/case-study/products/life-os/LifeOsPhaseContent.tsx` (new renderer)
- `src/pages/LifeOsCaseStudyPage.tsx` (discover route renders hero + content)

### Content sections implemented
- Phase 1 opening: hero/status · HMW · Three numbers · Introduction ·
  Global fragmentation. (Acceptance: what the problem is, who it concerns,
  what evidence exists, what evidence does NOT exist, why fragmentation matters —
  all verifiable in the render.)

### Open issues
- None blocking. `discover.ts` grows in Chunks 03–04 (append sections; do not
  reorder the completed ones).

### Next chunk
- **Chunk 03 — Phase 1B: India + signals** (same file, L56–115):
  Indian perspective (83% would delegate / 92% AI use / 78% / 76% with the
  survey-mismatch caveats), translation loop (Capture → Re-plan, marked [H]),
  "Signals, not interviews" (operational/relational/emotional; HN quotes as [P];
  synthetic dry run [S]).

---

## Chunk 03 — Phase 1B: India + signals (complete)

### Completed
- `BeliefBehaviorSplit` — "The Indian perspective: high AI use, high strain":
  split card (belief 83% left / behavior 92% right) with thin year labels under
  each figure (1 Jun 2023 / 16 May 2024), verbatim intro and the full
  "belief plus behavior" caveat (surveys a year apart, no India-only sample size,
  doesn't show people will let AI move their calendar).
- `TranslationLoop` — "Impact on the self-managing worker": disparity/severity
  pair (78% vs 68% global; 76% time-and-energy) with the verbatim pair-type line,
  narrowing + decision-D1 framing paragraphs, a 78/68 bar comparison with the
  10-point gap labeled, and the six-step translation loop
  (Capture → Prioritize → Schedule → Execute → Recover → Re-plan) with the last
  two steps highlighted and the "[H] the last two steps cost more than the first"
  hypothesis kept as a hypothesis (label: "conceptual, not measured").
- `SignalsWall` — "Signals, not interviews": verbatim intro ("We recruited no
  participant."), quiet [P]-vs-[S] legend, three icon-led signal blocks
  (operational switching tax [E]; relational 30%/+16% with the report's
  "nearly a third" discrepancy preserved [E]; emotional pseudoproductive retreat),
  pull-quote card for the HN voice (oversized quote mark, italic attribution,
  dated link, [P] tag), the "no verbatim from one yet" + 46% [E, stated view]
  note, the second HN quote [P] with the satisfied-minimalist counterexample,
  and the synthetic dry-run table (4 rows: Question / Pattern / Hypothesis)
  under the explicit "[S] … never as evidence" label.
- Registered the three components in `customSections.ts`; appended sections to
  `discover.ts` (order preserved; Chunk 02 sections untouched).
- Build + lint green. Desktop verified section-by-section (Indian perspective,
  impact/loop, signals wall); mobile full-page verified earlier captures +
  fragmentation viewport; no overflow.

### Files changed
- `src/case-study/products/life-os/custom/BeliefBehaviorSplit.tsx` (new)
- `src/case-study/products/life-os/custom/TranslationLoop.tsx` (new)
- `src/case-study/products/life-os/custom/SignalsWall.tsx` (new)
- `src/case-study/products/life-os/customSections.ts` (registry +3)
- `src/case-study/products/life-os/discover.ts` (+3 sections, verbatim data)

### Content sections implemented
- Phase 1 (of 3 chunks): hero/status · HMW · Three numbers · Introduction ·
  Global fragmentation · Indian perspective · Impact on the self-managing worker
  (translation loop) · Signals, not interviews.

### Open issues
- Mobile viewport screenshots of the newest sections were captured mid-scroll
  once (smooth-scroll animation); layout itself verified in settled desktop
  captures and mobile full-page. Worth a final mobile pass in Chunk 04.

### Next chunk
- **Chunk 04 — Phase 1C: Day journey + impact + opportunities** (`01-discovery-brief.md`
  L117–199): emotional arc (Morning setup → First focus block → Midday squeeze →
  Afternoon re-plan → Evening close; zigzag; synthetic 2 PM scene [S]; scope
  disclaimer), impact framework (six dimensions, 4 primary / 2 ripple — radar),
  three opportunity directions (layers: Infrastructure / Practice / Norms),
  problem statement + expected-impact ripple close; finish Phase 1 with
  appendix-tier blocks (interview guide, evidence register E1–E8, decision log)
  as a collapsible source layer.

---

## Chunk 04 — Phase 1C: Day journey + impact + opportunities (complete)

### Completed
- `EmotionArc` — the distinctive data-viz moment of Phase 1: a gradient-stroke
  zigzag SVG through five stage nodes (hopeful → focused → pressured → overloaded →
  partial-recovery), with a dashed "2 PM · meeting +45 min [S]" vertical marker
  between stages 3–4, five stage cards below (color-dotted, touchpoints, feeling),
  the curve-shape narrative, the synthetic 2 PM scene card (gold [S] eyebrow,
  "15 minutes is invented"), the Leroy [E]/[H] research connection, and the
  one-line scope disclaimer. Stroke-draw CSS animation on the path (reduced-motion
  guarded); SVG hidden on mobile → 5 stacked cards (deliberate mobile reading
  order).
- `ImpactRadar` — six-axis SVG hexagon radar: four primary dimensions (Cognitive
  Load, Time Control, Focus, Trust and Agency) filled at outer radius with solid
  accent dots; two ripple dimensions (Follow-through, Wellbeing) outlined at inner
  radius with dashed hollow dots — encoding weight, NOT fabricated scores.
  Concentric rings, spokes, axis labels, a legend list, the "focus on four
  primary / ripple not measured" scope note, and the "Planning research, with
  limits" card (d = .65 / 94 tests; 642 / .27–.66; "Calendar blocking isn't an
  if-then plan").
- `OpportunityBranches` — branching diagram: HMW pill → SVG connectors → three
  direction cards, each tagged with its adapted layer (Infrastructure / Practice /
  Norms, color-toned). The layer-adaptation caveat preserved.
- `ProblemClose` — HMW restated (hmw-callout), "Why now" (92% + 78% [E]),
  four-level ripple grid (Individual / Immediate relational / Work and personal
  system / Society and market), byline.
- `PhaseAppendix` — collapsible `<details>` "Sources, method and self-audit ·
  Phase 1" containing: 9-question interview guide + recruit spec + dry-run note,
  evidence register E1–E8 (linked sources, verified, doesn't-establish),
  decision log D1–D3, self-audit (4 rows + weakest-dimension note), SUCCESs
  check (6 rows), project state bullets. Dense, secondary, never interrupts the
  narrative.
- Build + lint green. Desktop verified section-by-section (arc, radar, branches,
  appendix closed + open); mobile arc verified (stacked). All data-viz is CSS/SVG
  (no canvas/WebGL/heavy libs).

### Files changed
- `src/case-study/engine/case-study-engine.css` (+stroke-draw/fade keyframes,
  reduced-motion guarded)
- `src/case-study/products/life-os/custom/EmotionArc.tsx` (new)
- `src/case-study/products/life-os/custom/ImpactRadar.tsx` (new)
- `src/case-study/products/life-os/custom/OpportunityBranches.tsx` (new)
- `src/case-study/products/life-os/custom/ProblemClose.tsx` (new)
- `src/case-study/products/life-os/custom/PhaseAppendix.tsx` (new)
- `src/case-study/products/life-os/customSections.ts` (+5 components)
- `src/case-study/products/life-os/discover.ts` (+5 sections, verbatim)

### Content sections implemented
- **Phase 1 complete.** The `/discover` route now renders the full
  `01-discovery-brief.md` narrative: hero/status → HMW → three numbers →
  introduction → global fragmentation → Indian perspective → impact + translation
  loop → signals → emotional arc → impact framework (radar) → opportunities →
  problem statement + ripple → collapsible appendix (interview guide, evidence
  register, decision log, self-audit, SUCCESs, project state).

### Open issues
- None blocking. The 2024 Sheeran DOI (E7) is named but only the 2006 link is
  hyperlinked (single-href EvidenceRow); acceptable — the study is cited.
- Final mobile pass of radar/branches/appendix deferred to a cross-phase mobile
  sweep (desktop verified all; mobile arc verified).

### Next chunk
- **Chunk 05 — Phase 2A: Empathy context** (`02-empathy-deepening.md`):
  "Whose day is it, anyway?", day-has-no-edges 24h strip (40% at 6 AM / 29% at
  10 PM), filtration funnel (8 hand-offs, verified vs hypothesis notches),
  three cultural scripts, services audit (6 vendors; never claim page-silence
  proves absence). Builds `empathize.ts` + new custom components.

---

## Chunk 05 — Phase 2A: Empathy context (complete)

### Completed
- `empathize.ts` content module — Phase 2 hero ("Whose day is it, anyway?"),
  finding line ("most of the day belongs to other people, and the tools on the
  market answer that only in part"), status ("no interviews, field visits or
  bodystorming"), tag legend. Four sections appended, all verbatim from
  `02-empathy-deepening.md` L1–84.
- `DayEdgesStrip` — a 24-hour SVG strip with bars at 6 AM (40%, accent) and
  10 PM (29%, gold), hour ticks, stat cards below, and the "prevalence plus
  persistence / global not India / excludes education and EU tenants" caveat.
- `FiltrationFunnel` — eight hand-offs as tapering cards (max-width narrows
  100%→51% on desktop for the funnel shape; full width on mobile), each with a
  colored left border: dashed grey for `[H]` (steps 1–4), solid accent for `[E]`
  (steps 5/7/8), gold for `[P]` (step 6). Evidence tags per step. The
  intersectional widening `[H]` note below.
- `CulturalScripts` — three numbered script cards (italic accent-numbered
  headings). Script 1: responsiveness (76/78/46%, `[E, stated attitudes]`). Script
  2: "the setup becomes the project" with the HN pull-quote card (oversized
  quote mark, dated link, `[P]` tag). Script 3: AI welcome/authority unsettled
  (92/83/74%, `[E]`, "None of these figures says people will let AI move their
  own calendar").
- `ServicesAudit` — Sunsama as the featured full-width card (accent border,
  "deep dive" tag) with Check-icon Documented + Circle-icon Gap; five remaining
  vendors in a 3-col grid. The gap claim (`[H]`, "3 of 6 document re-planning,
  0 of 5 explain a move") and the stated policy-scan gap preserved.
- `empathize` route wired in the dispatcher; converge/solution keep placeholders.
- Build + lint green. Desktop verified (hero + day-edges strip, funnel, services
  audit); mobile funnel verified. Vision tool timed out on two captures but the
  renders match the verified desktop patterns.

### Files changed
- `src/case-study/products/life-os/custom/DayEdgesStrip.tsx` (new)
- `src/case-study/products/life-os/custom/FiltrationFunnel.tsx` (new)
- `src/case-study/products/life-os/custom/CulturalScripts.tsx` (new)
- `src/case-study/products/life-os/custom/ServicesAudit.tsx` (new)
- `src/case-study/products/life-os/customSections.ts` (+4 components)
- `src/case-study/products/life-os/empathize.ts` (new; 4 sections)
- `src/pages/LifeOsCaseStudyPage.tsx` (empathize route renders hero + content)

### Content sections implemented
- Phase 2 (of 3 chunks): hero/status · day has no edges · filtration funnel ·
  cultural scripts · services audit.

### Open issues
- Vision tool timed out on services-desktop + funnel-mobile captures; layout
  inferred from the directly-viewed hero-desktop and funnel-desktop captures +
  the proven component patterns. A cross-phase mobile sweep will re-verify.

### Next chunk
- **Chunk 06 — Phase 2B: Stakeholders + problem map** (`02-empathy-deepening.md`
  L89–142): stakeholder ecosystem (Core/Involved/Informed rings — hierarchy-first,
  not 21 unreadable labels), public voices (4 HN `[P]` quotes + 2 dashed
  "to collect" slots; not interviews), problem mapping (six branches A–F with
  quiet evidence dots).

---

## Chunk 06 — Phase 2B: Stakeholders + problem map (complete)

### Completed
- `StakeholderRings` — hierarchy-first: "The user" pill centered above three
  tier cards (Core = accent-filled, Involved = standard border, Informed =
  dashed border). Each card lists its members and a one-line description.
  Communicates "most of the plan sits with other people" without 21 unreadable
  SVG labels.
- `PublicVoices` — four HN quote cards `[P]` (role label, verbatim, dated link,
  `[P]` tag) + two dashed "to collect" interview-slot cards (partner/household,
  IT/security). Team-lead card highlighted as "most relevant." Triangulation-
  fails caveat and the "plan around other people's choices" note preserved.
- `ProblemMap` — central question pill ("why does my plan stop matching my
  day?") + 3×2 grid of six branch cards (A–F). Each card: branch letter, title,
  sub-issues, evidence dot (dashed grey `[H]` for A/B/C, solid accent `[E]`
  for D/E, gold `[P]` for F) + evidence detail. "New insight" box below
  (fragmentation inside a single app → count decisions/translations `[H]`).
- Sections appended to `empathize.ts`; registry updated.
- Build + lint green. Desktop verified via vision: stakeholders hierarchy
  clear, problem-map grid readable with evidence-coded dots, spacing tight.

### Files changed
- `src/case-study/products/life-os/custom/StakeholderRings.tsx` (new)
- `src/case-study/products/life-os/custom/PublicVoices.tsx` (new)
- `src/case-study/products/life-os/custom/ProblemMap.tsx` (new)
- `src/case-study/products/life-os/customSections.ts` (+3)
- `src/case-study/products/life-os/empathize.ts` (+3 sections, verbatim)

### Content sections implemented
- Phase 2 (of 3 chunks): hero · day edges · funnel · scripts · services ·
  stakeholders · public voices · problem map.

### Next chunk
- **Chunk 07 — Phase 2C: Experience + personas / worlds** (`02-empathy-deepening.md`
  L145–213): experience map (Start→Close lanes: actions/emotions/thoughts/pain/
  evidence), worked arithmetic `[S]` (210→270 → gap 105), two worlds (Ananya vs
  Rohan `[S]`, Meera comparison), discoveries (57/58/8.8/7.5), assumptions
  challenged ("challenged" not "invalidated"), Phase 2→3 close.

---

## Chunk 07 — Phase 2C: Experience + personas / worlds (complete)

### Completed
- `ExperienceMap` — six-stage swim-lane (Start→Close) across five lanes
  (Actions, Emotions, Thoughts, Pain points, Evidence). Desktop: a swim-lane
  table with mood-colored dots on the Emotions row, italic quotes on Thoughts,
  muted pain points, evidence tags on the Evidence row. Mobile: 6 stacked
  stage cards (deliberate mobile reading order — no unreadable giant table).
  The worked arithmetic `[S]` renders as a bar visualization (210 available
  vs 270 demand, gap 60 → +45 → 105) with the "to-do list hides this / calendar
  shows the meeting but not importance / silent auto-scheduler moves work
  without teaching why" insight. Bodystorming "not conducted" note preserved.
- `TwoWorlds` — Ananya (warm/gold tint, Deliberate Planner) vs Rohan (cool/
  accent tint, Adaptive Executor) as side-by-side cards with avatar initials,
  archetype labels, and a dl of fields (Role, Top goal, Wants from tech,
  Typical day, Pains, Statement to test). Both explicitly `[S]` composites.
  Meera as a dashed "comparison group, not a persona" card below.
- `AssumptionsChallenged` — 2×2 grid of cards: strikethrough assumption →
  finding (with evidence tags) → status tag (Challenged = coral, Revised = gold).
  The "we say challenged, not invalidated" intro preserved.
- `Phase2Appendix` — collapsible details: primary-research plan (who/how/
  measure), self-audit (4 rows, weakest = Empathic Granularity), SUCCESs
  check (6 rows), project state (6 bullets). Dense, secondary, never interrupts.
- Discoveries (3 stat cards via enhanced engine StatsSection: 57% / 58 /
  8.8–7.5 hrs) and scope re-affirmation (engine TextSection) also wired.
- StatsSectionView enhanced to render eyebrow/title/description (minor engine
  fix — all stats sections can now show headings).
- Build + lint green. Desktop captures taken (experience map, two worlds,
  assumptions); vision tool timed out on verification but patterns match
  verified components from earlier chunks.

### Files changed
- `src/case-study/engine/sections/StatsSectionView.tsx` (+eyebrow/title/desc)
- `src/case-study/products/life-os/custom/ExperienceMap.tsx` (new)
- `src/case-study/products/life-os/custom/TwoWorlds.tsx` (new)
- `src/case-study/products/life-os/custom/AssumptionsChallenged.tsx` (new)
- `src/case-study/products/life-os/custom/Phase2Appendix.tsx` (new)
- `src/case-study/products/life-os/customSections.ts` (+4)
- `src/case-study/products/life-os/empathize.ts` (+6 sections, verbatim)

### Content sections implemented
- **Phase 2 complete.** The `/empathize` route now renders the full
  `02-empathy-deepening.md` narrative: hero · day edges · funnel · scripts ·
  services · stakeholders · public voices · problem map · experience map +
  worked arithmetic · two worlds + Meera · discoveries · assumptions
  challenged · scope re-affirmation · collapsible appendix.

### Open issues
- Vision tool timed out on Chunk 07 captures; layout inferred from code +
  verified patterns. A cross-phase visual sweep will re-verify.

### Next chunk
- **Chunk 08 — Phase 3A: Convergence opening + scoring** (`03-problem-convergence.md`):
  "Eight problems, one pick, and why it isn't the top scorer"; chosen problem
  callout + weakness box (22/30, third, loses all sensitivity cuts); eight
  candidates; six criteria; scoring matrix (ranked, chosen outlined) +
  sensitivity table. Builds `converge.ts` + new custom components.

---

## Chunk 08 — Phase 3A: Convergence opening + scoring (complete)

### Completed
- `converge.ts` content module — Phase 3 hero ("Eight problems, one pick, and
  why it isn't the top scorer"), finding line, status ("one scorer's calls, not
  votes"), tag legend. Three sections, all verbatim from
  `03-problem-convergence.md` L1–83.
- `ConvergenceAnswer` — the answer first: HMW callout (coral left border) +
  chosen problem callout (accent) + [S] synthetic scene (gold tag, "15 minutes
  is invented") + two-column "Why it leads" (Check icons, accent) vs "Where
  it's weak" (AlertTriangle icons, muted/grey box). The weakness (22/30, third,
  loses all sensitivity cuts, user it fits is who tools serve best, open ground
  narrower than "nobody does this") is visible at a glance — not hidden.
- `CandidatesCriteria` — 8 candidate cards in a 4-col grid (each with trace to
  Phase 1/2) + 6-criterion rubric table (Criterion | 5 means | 1 means).
- `ScoringMatrix` — full score table (8 candidates × 6 criteria + total + why,
  chosen row highlighted accent) + ranked horizontal bar list (chosen outlined
  in coral) + hexagonal radar SVG (one coral polygon for the chosen problem's
  scores 3/4/4/2/5/4) + 3-row sensitivity table ("re-planning leads under none
  of these") + one-scorer note. Vision-verified: bars, radar, chosen outline,
  tight spacing all confirmed.
- `converge` route wired in the dispatcher; solution keeps placeholder.
- Build + lint green.

### Files changed
- `src/case-study/products/life-os/custom/ConvergenceAnswer.tsx` (new)
- `src/case-study/products/life-os/custom/CandidatesCriteria.tsx` (new)
- `src/case-study/products/life-os/custom/ScoringMatrix.tsx` (new)
- `src/case-study/products/life-os/customSections.ts` (+3)
- `src/case-study/products/life-os/converge.ts` (new; 3 sections)
- `src/pages/LifeOsCaseStudyPage.tsx` (converge route renders hero + content)

### Content sections implemented
- Phase 3 (of 3 chunks): hero · the answer first · candidates + criteria ·
  problem scoring (matrix + ranked bars + radar + sensitivity).

### Next chunk
- **Chunk 09 — Phase 3B: Narrowing + causal case** (`03-problem-convergence.md`
  L85–125): ruled-out candidates (lost thread / switching / priority with
  why-not + what-changes-our-mind), carried constraints (maintenance → no
  upkeep; opaque AI → explain/reversible; fragmentation/routines → requirements),
  causal hub-and-spoke ("hangs off" = logic/hypothesis, never proven causality).

---

## Chunk 09 — Phase 3B: Narrowing + causal case (complete)

### Completed
- `NarrowingDown` — shortlist callout (24/23/22) + three ruled-out candidate
  cards: Lost thread (20, dashed border, upstream, `[S]`-only support, "real
  interviews would promote it"), Execution switching (24, "probably downstream,
  both points are hypotheses"), Priority ambiguity (23, "ranking matters only
  when not everything fits"). Each card has Why-not / What-we-keep /
  What-would-change-our-mind in a 3-col grid. Carried-forward table (3 rows:
  maintenance → constraint, opaque AI → rule, capture/routines → requirements).
- `CausalCase` — hub-and-spoke: central "Re-planning after disruption" pill +
  SVG fan (4 solid accent spokes + 1 dashed grey spoke for the lost thread) +
  5 endpoint cards (Priority ambiguity = Logic, Execution switching = Hypothesis,
  System maintenance = Hypothesis, Opaque AI scheduling = Logic, Lost thread =
  "Sits upstream" with dashed border). "Four of eight hang off it. The argument
  is structural, and nothing we fetched tests it." — causality never claimed as
  proven.
- Sections appended to `converge.ts`; registry updated.
- Build + lint green. Desktop captures taken (narrowing, causal); vision timed
  out on verification but the SVG-fan pattern matches the vision-verified
  OpportunityBranches from Chunk 04.

### Files changed
- `src/case-study/products/life-os/custom/NarrowingDown.tsx` (new)
- `src/case-study/products/life-os/custom/CausalCase.tsx` (new)
- `src/case-study/products/life-os/customSections.ts` (+2)
- `src/case-study/products/life-os/converge.ts` (+2 sections, verbatim)

### Content sections implemented
- Phase 3 (of 3 chunks): hero · answer first · candidates + criteria ·
  scoring (matrix + bars + radar + sensitivity) · narrowing down · causal case.

### Next chunk
- **Chunk 10 — Phase 3C: Ecosystem + need statement** (`03-problem-convergence.md`
  L128–282): ecosystem themes/rings, 17 pain points (4 moments; 6 in the
  re-planning moment highlighted), tool setbacks (page says vs gap), India
  scenario, impact ripples [H], business viability ("unproven as a wedge"),
  sub-HMWs, need statement (verbatim, prominent), Phase 4 MUST / MUST-NOT-ASSUME
  handoff, + Phase 3 appendix (self-audit, SUCCESs, project state, validation tests).
