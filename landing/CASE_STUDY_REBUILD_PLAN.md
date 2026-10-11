# Life OS Case Study — Coinflo-Exact Structure Rebuild

## Purpose

Rebuild the Life OS case study so its **information architecture, page sequence,
section order, navigation, table of contents, cards, and section shells match the
Coinflo reference exactly**. Keep Life OS as the subject matter.

This is not a visual inspiration exercise. Treat the Coinflo case-study routes and
their section order as the implementation contract. Where Life OS has supporting
content, place it into the corresponding Coinflo section. Where it does not,
render the section and mark its body as a clear placeholder for future content.

## Reference repository

- Repository: `https://github.com/divysharma7/coinflo-landing/tree/main`
- Reference commit reviewed: `cbe8e867f9bddc695bfc6572507d9710737886a6`
- Authoritative files:
  - `src/views/case-study/Layout.vue`
  - `src/views/case-study/Hub.vue`
  - `src/views/case-study/PhaseTOC.vue`
  - `src/views/case-study/PhaseFooterNav.vue`
  - `src/views/case-study/Phase1Discover.vue`
  - `src/views/case-study/Phase2Empathize.vue`
  - `src/views/case-study/Phase3Converge.vue`
  - `src/views/case-study/Phase4Deliver.vue`
  - `src/assets/case-study.css`
  - `src/assets/case-study-system.css`

The target application is React/Vite under `landing/`; do not port Vue code
literally. Recreate the route and component behaviour in React.

## Existing Life OS material

Use these as content inputs; do not invent research findings or present
placeholders as evidence.

- `landing/public/case-study/life-os/01-discovery-brief.md`
- `landing/public/case-study/life-os/02-empathy-deepening.md`
- `landing/public/case-study/life-os/03-problem-convergence.md`
- `landing/public/case-study/life-os/04-solution-delivery.md`
- `landing/src/data/lifeOsCaseStudy.ts`
- `landing/src/data/lifeOsCaseStudyContinuation.ts`
- `landing/src/pages/LifeOsCaseStudyPage.tsx`

The current implementation is a partial adaptation. It is useful for reusable
content and interactions, but it is **not** the target section structure.

## Required route structure

Mirror Coinflo’s case-study route topology:

| Life OS route | Reference equivalent | Required content |
| --- | --- | --- |
| `/case-study/life-os` | Case-study hub | Overview, short version, four phase cards, beyond-the-phases cards |
| `/case-study/life-os/discover` | Phase 1 — Discover | Exact Phase 1 section sequence below |
| `/case-study/life-os/empathize` | Phase 2 — Empathize | Exact Phase 2 section sequence below |
| `/case-study/life-os/converge` | Phase 3 — Converge | Exact Phase 3 section sequence below |
| `/case-study/life-os/deliver` | Phase 4 — Deliver | Exact Phase 4 section sequence below |

Every phase page needs, in this order:

1. Shared case-study shell and breadcrumb/progress treatment.
2. Phase header.
3. Expandable “Jump to” table of contents with every section in that phase.
4. The full required section sequence.
5. Previous/next phase cards matching `PhaseFooterNav.vue`.
6. Standard Life OS site footer.

## Exact section sequence and content mapping

Do not remove, merge, rename, or reorder these sections. Use the headings as
written below. If content is unavailable, retain the complete visual shell and use
the placeholder convention.

### Phase 1 — Discover

1. Numbers/statistics panel before the introduction.
2. `Introduction` — use the Life OS discovery question and initial framing.
3. `The Global Scenario` — use the fragmented-work / notifications / planning
   research that already exists.
4. `Problems Faced by Young Earners` — adapt to Life OS as the concrete daily
   orchestration problems. Keep the two-sided problem-card layout.
5. `The Indian Drop-off Funnel` — map the commitment-to-action funnel here.
6. `The Indian Perspective` — use the existing India-first research frame and
   sourced regional context.
7. `Impact on Young Earners` — map Life OS’s potential impact dimensions.
8. `Existing Services Audit` — use the existing competitor/service capability
   audit.
9. `Interview Insights` — placeholder. Do not fabricate participant quotes,
   participants, counts, or results.
10. `Emotional Arc of a Young Earner` — adapt the provisional daily journey into
    the reference’s emotional-arc chart format and label it as provisional.
11. `Types of Wellbeing Affected` — use available impact dimensions; fill any
    unsupported dimension with a placeholder.
12. `Opportunities Identified` — use the current Life OS opportunity directions.
13. `Expected Impact` — use conditional Life OS impact statements only.

### Phase 2 — Empathize

1. `The Indian Scenario` — use recruitment hypotheses and contexts.
2. `Cultural Scenario` — placeholder.
3. `Existing Services` — use the documented service capability audit.
4. `Other Policies and Services` — placeholder cards.
5. `Who All Are Involved?` — use the current stakeholder model.
6. `What Our Stakeholders Said` — use only public-signal cards and explicitly
   distinguish them from primary research. Add placeholder interview cards where
   the reference expects direct voices.
7. `Problem Mapping` — use the six-branch Life OS problem-space map.
8. `Experience Map` — use the provisional Life OS day-in-the-life map.
9. `Two Different Worlds` — use the two fictional, clearly labelled personas.
10. `Discoveries` — use the current three discoveries with their evidence
    boundaries.
11. `Assumptions Invalidated` — use the current “assumptions challenged” data;
    preserve the qualification that they are not empirically invalidated.

### Phase 3 — Converge

1. `Introduction` — reuse the HMW and convergence framing.
2. `Problem Scoring` — reuse the interactive 1–5 matrix and scoring criteria.
3. `Narrowing Down` — explain the selected capacity-aware planning + recovery
   scope and why it differs from the highest individual score.
4. `Ecosystem Map` — reuse the daily coordination ecosystem diagram.
5. `Pain Points` — reuse the four groups / 20 pain points.
6. `Indian Scenario` — use only the currently supported regional implications.
7. `Setbacks of Existing Trackers` — adapt the competitor limitations section.
8. `Impact` — use conditional impact only.
9. `Business Viability` — use the existing risk/viability conditions; do not add
   market-size claims that are not sourced.
10. `How might we?` — use the preserved Life OS HMW statement.
11. `Need Statement` — use the preserved Life OS need statement.

### Phase 4 — Deliver

1. `Introduction` — use the proposed-experience status and validation boundary.
2. `Cause & Effect Tree` — use the current cause tree.
3. `Design Principles` — map the Life OS experience pillars and agency rules.
4. `Reactivated Statistic` — placeholder. Do not create an unsupported statistic.
5. `Ideation: 18 How-to Questions` — use the existing ideation questions and add
   visibly numbered placeholder question cards until the structure contains 18.
6. `Concept Variants Explored` — placeholder variant cards.
7. `Co-creation Insights` — placeholder; no fake workshop outcomes.
8. `Information Architecture` — use the existing proposed IA.
9. `A/B Testing Results` — placeholder; no fake results or conversion data.
10. `Feature Deep-dives` — use the Today concept, capacity model and recovery
    fixture as the feature deep dives.
11. `Service Blueprint` — adapt the 12-step daily service flow to the reference
    blueprint layout.
12. `Expected Impact` — use conditional impact statements.
13. `Success Metrics` — use the existing measures and validation guardrails.
14. `Roadmap` — use validation stages A–D as the roadmap.
15. `Reflection` — placeholder.
16. `Closing` — use the current next-step statement: test the problem before
    designing the answer.
17. `Talk to me` — replace with a neutral Life OS “Read the source material”
    block linking to the four original Markdown files; do not add personal contact
    information unless it is supplied.

## Placeholder contract

Every missing-content section must look complete structurally, but must say:

> Placeholder — content pending

Use this exact label in a visible eyebrow/tag and include a short neutral sentence
such as “This section is reserved for future research material.”

Rules:

- Never fabricate a source, statistic, interview quote, participant count,
  workshop finding, A/B result, or product outcome.
- For numerical visualisations without data, show `—` or empty outlined states;
  do not use plausible-looking fake numbers.
- Keep the exact Coinflo layout primitive for that section: chart, card grid,
  comparison block, quote shell, or diagram canvas as appropriate.

## Visual and interaction requirements

- Match Coinflo’s warm editorial system: cream background, warm ink, sage/mint
  accent, highlighter washes, large display type, soft card elevation, dashed
  dividers, and restrained rounded cards.
- Recreate the reference component hierarchy, not only its colors:
  hero/header, metadata strip, statistics panel, block titles, two-column and
  diagram sections, expandable phase TOC, and previous/next navigation cards.
- Keep the Life OS global site header and footer compatible with the landing site.
- Maintain mobile horizontal scrolling for wide diagrams/tables and provide a
  clear focusable wrapper.
- Preserve the functional problem-sorting matrix and recovery fixture.
- Keep reduced-motion and keyboard focus states.
- Do not edit unrelated landing-page components or overwrite the user’s existing
  uncommitted work.

## Implementation order

1. Clone or inspect the Coinflo reference and map each route/component listed
   above before changing Life OS UI.
2. Create reusable React equivalents for the case-study shell, phase header,
   phase TOC, section block, placeholder block, and phase footer navigation.
3. Replace the current simplified phase pages one phase at a time, starting with
   Discover. Do not hide unrelated content with CSS; render only the selected
   phase’s sections for its route.
4. Use the supplied Life OS source data where it maps to the reference structure.
5. Add complete placeholder sections for every unmatched Coinflo section.
6. Update the hub so its cards and metadata correspond to the four new pages.
7. Verify desktop and mobile renderings, every TOC link, all phase navigation,
   the matrix controls, and recovery controls.
8. Run `npm run build` and `npm run lint` from `landing/`.

## Acceptance checklist

- [ ] Hub and four phase routes mirror Coinflo’s route and navigation structure.
- [ ] Each phase contains every Coinflo section, in the exact order above.
- [ ] Every section appears in the phase’s expandable TOC.
- [ ] Existing Life OS evidence is preserved and still accurately qualified.
- [ ] Missing content is visibly marked `Placeholder — content pending`.
- [ ] No fabricated research or metrics are introduced.
- [ ] Previous/next cards match the reference pattern.
- [ ] Desktop and mobile have no horizontal page overflow.
- [ ] `npm run build` and `npm run lint` pass in `landing/`.

## Copy-and-run implementation prompt

```text
Rebuild the Life OS case study in C:\Users\divys\Personal-AI-Assisant\landing according to the complete implementation contract in C:\Users\divys\Personal-AI-Assisant\landing\CASE_STUDY_REBUILD_PLAN.md.

This is a structural rebuild, not a visual approximation. The Coinflo case study at https://github.com/divysharma7/coinflo-landing/tree/main is the authority for route topology, page anatomy, section order, table of contents, phase navigation, and editorial layout primitives. Recreate that structure in the existing React/Vite landing app while keeping Life OS as the subject matter.

Read the plan fully before editing. Preserve existing Life OS evidence and interactions where they map to the reference. Render every unmatched reference section with the exact visible label “Placeholder — content pending”; never fabricate statistics, quotes, interviews, workshop outcomes, A/B results, or sources. Do not hide a single long page with CSS—render the selected phase route with only its own section components.

Implement the full work, then verify all five case-study routes, TOC anchors, previous/next cards, the scoring matrix, recovery fixture, desktop/mobile overflow, and run npm run build plus npm run lint in landing. Report changed files, verification results, and any remaining placeholders.
```
