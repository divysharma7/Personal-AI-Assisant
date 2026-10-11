# Phase 3: Problem Convergence

**Working title:** Eight problems, one pick, and why it isn't the top scorer

> **Status, 11 Oct 2026 (India time).** Desk research plus one analyst's judgment. No interviews, no concept tests. Scores are one scorer's calls, not votes. Anything tagged **[S]** comes from a synthetic dry run with invented personas (`supporting/05-simulated-interviews.md`). It shapes hypotheses and is never evidence. No solution is named here. Existing services appear only as audit subjects.

> **Continuity checkpoint (unchanged from Phases 1 and 2).**
> **HMW:** How might we help self-managing knowledge workers in India turn scattered work and personal commitments into a realistic, adaptable daily plan that remains calm enough to use throughout the day?
> **Target user:** India-based, English-speaking knowledge workers who set their own priorities and keep a flexible or hybrid calendar, coordinating tasks, calendar, routines and focus across several tools.
> **Geography:** India first. **Team:** solo (Divy Sharma). **Changed since Phase 2?** No.

---

# Page 1

## The answer first

**Chosen problem: capacity-aware re-planning after disruption.** When the plan breaks, the user needs to see what still fits and what carries over, without rebuilding the day by hand.

*Synthetic scene [S].* A meeting moves, a morning block collapses, and the Deliberate Planner persona shuffles tasks for about 15 minutes, unsure the new plan is better. The 15 minutes is invented, not measured.

**Why it leads**
- Its supporting research is sourced, though indirect: HBR on app toggling, Leroy on attention residue (title only), Microsoft's 76% time-and-energy figure for India. The runner-up, "no plan, so a task gets lost," rests on the synthetic run alone.
- Four other candidates hang off it (section 1.4).
- Being wrong is cheap. Real interviews can promote the runner-up later (Page 4).

**Where it's weak**
- It doesn't win the scoreboard: 22 points, third behind execution switching (24) and priority ambiguity (23). It wins under none of the three sensitivity cuts.
- The user it fits, someone who already plans, is the user existing tools serve best.
- The open ground is narrower than "nobody does this." Motion, Akiflow and Sunsama document re-planning or overload previews (section 3.2). What none of the five feature pages we read describes is explaining why something moved.

*Visual elements to design:* the HMW as a full-width callout in coral; the chosen problem as a second callout beneath it; a "where it's weak" box in grey so the weakness is visible at a glance.

## 1.1 Candidates and criteria

Eight candidates, each traced to Phase 1 or 2.

| Candidate | Traces to |
|---|---|
| Execution switching | Phase 2 branch D |
| Priority ambiguity | Phase 2 branch B |
| Re-planning after disruption | Phase 2 branches C and E, merged |
| System maintenance | Phase 2 branch F |
| Opaque AI scheduling | Phase 1 opportunity 3 |
| Fragmented capture | Phase 2 branch A |
| Lost thread (no morning plan) | Phase 2 Adaptive Executor persona [S] |
| Routine and work disconnection | Phase 1 problem cluster |

| Criterion (1 to 5 each, 30 max) | 5 means | 1 means |
|---|---|---|
| Evidence | Fetched, dated sources speak to it directly | Only context, or nothing |
| Frequency | It plausibly happens daily | Rare |
| Severity | It hurts focus, follow-through or commitments | An annoyance |
| Differentiation | No vendor page we read claims it | Two or more do |
| Connectivity | Solving it eases several other candidates | Stands alone |
| Agency fit | A fix can leave consequential choices with the user | A fix needs silent automation |

## 1.2 Problem scoring

| Candidate | Ev | Fr | Sv | Df | Cn | Ag | /30 | Why these numbers |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|
| Execution switching | 4 | 5 | 4 | 3 | 3 | 5 | **24** | HBR logged about 1,200 toggles a day (20 teams, 137 users, three Fortune 500 firms). Enterprise sample, not India |
| Priority ambiguity | 2 | 5 | 4 | 3 | 4 | 5 | **23** | Daily and consequential. Nothing we fetched measures it |
| **Re-planning after disruption** | 3 | 4 | 4 | 2 | 5 | 4 | **22** | Evidence is indirect. Df is 2 because Motion and Akiflow market re-planning and Motion and Sunsama show overload. Cn is 5 because four candidates hang off it |
| System maintenance | 2 | 4 | 4 | 4 | 3 | 5 | 22 | Its support was two forum threads. Reddit blocked a re-fetch, so we dropped them |
| Opaque AI scheduling | 4 | 3 | 4 | 4 | 3 | 4 | 22 | The CHI 2019 human-AI guidelines are direct design evidence, but 83% of Indian workers say they'd delegate as much work as possible to AI (stated attitude) |
| Fragmented capture | 3 | 4 | 3 | 2 | 3 | 5 | 20 | Pings are documented, capture loss isn't. Todoist and Akiflow ship inboxes |
| Lost thread (no plan) | 1 | 3 | 4 | 4 | 3 | 5 | 20 | Ev is 1 because only the synthetic run supports it. Frequency is a guess |
| Routine and work disconnection | 2 | 3 | 3 | 3 | 3 | 5 | 19 | TickTick pairs habits with a calendar; Reclaim lists habits |

**Sensitivity: what happens if one criterion goes**

| If we drop | Top of the table |
|---|---|
| Evidence | Priority 21; switching and maintenance 20; re-planning and lost thread tie at 19 |
| Differentiation | Switching 21; priority and re-planning 20 |
| Connectivity | Switching 21; priority, maintenance and opaque AI 19; re-planning 17 |

Re-planning leads under none of these. The pick rests on the causal case in 1.4 and on the low cost of being wrong, not on the totals.

**One scorer, not a team.** The playbook asks for per-member polygons. We have one scorer, so the radar shows one polygon. Two or three more scorers would be the cheapest way to test the pick.

*Visual elements to design:* a radar chart with six axes and one polygon in coral; a ranked bar list of the eight totals with the chosen problem outlined; a small three-row "if we drop" table beside it.

## 1.3 Narrowing down

**Shortlist by score:** execution switching (24), priority ambiguity (23), and re-planning after disruption (22).

### Ruled out as lead: the lost thread (20)
- **Why not:** it's real enough to name, but only the synthetic run supports it. That persona skipped planning, lost a task for most of a day and found it days later. It's a hypothesis. It also doesn't hang off the chosen problem. It sits upstream: no plan, nothing to re-plan.
- **What we keep:** a design constraint. The repair can't assume a morning plan exists. In the synthetic run the same persona wanted no daily screen. The value would come from noticing dropped threads.
- **What would promote it:** real interviews. If many say they lost a task for over a day recently, it moves up.

### Ruled out: execution switching (24)
- **Why not:** probably downstream. Switching spikes when a plan breaks, and one consolidated screen can rebuild the same complexity inside one product. Both points are hypotheses.
- **What would change our mind:** people who lose time switching during a plan that held.

### Ruled out: priority ambiguity (23)
- **Why not:** it answers what matters most, not what fits around today's constraints and what moves when they change. Ranking matters only when not everything fits.
- **What would change our mind:** users who say deciding is hard and fitting is easy.

### Carried forward, not led with

| Problem | Becomes |
|---|---|
| System maintenance | A constraint: the fix can't add upkeep |
| Opaque AI scheduling | A rule: every change is explained and reversible |
| Fragmented capture, routines | Supporting requirements |

## 1.4 Why re-planning: the causal case

| Candidate | How it hangs off the chosen problem | Basis |
|---|---|---|
| Priority ambiguity | You only rank because not everything fits | Logic |
| Execution switching | Broken plans send people hopping between list, calendar and timer | Hypothesis. HBR measured toggling, not its cause |
| System maintenance | Rebuilding the day by hand is the upkeep | Hypothesis |
| Opaque AI scheduling | Automation enters to cut re-planning, so trust matters once it does | Logic |
| Lost thread | Doesn't hang off it | Sits upstream |

Four of eight hang off it. The argument is structural, and nothing we fetched tests it.

*Visual elements to design:* a hub-and-spoke diagram with re-planning in the centre, four solid spokes and one dashed spoke for the lost thread.

---

# Page 2

## The ecosystem around the chosen problem

Rings are analyst judgment of closeness to the problem (1 is closest). No field data fed this map.

| Theme | Ring | Needs (closest first) | Touchpoints | Stakeholders |
|---|:-:|---|---|---|
| Recovery | 1 | Cheap repair after an overrun; see what moves; undo | Calendar edits, chat and email interrupts | Manager, teammates, clients |
| Capacity | 1 | See what fits; realistic durations; routines survive; know which commitments are firm *(hypothesis [S])* | Calendar, task list | Calendar providers, household |
| Trust and agency | 1 | Know why a change happened; dismiss or correct it | AI suggestions, notifications | AI vendors, the user |
| Priority | 2 | Decide what waits | Priority flags, labels | Manager, clients |
| Execution | 2 | A clear next action; context in one place | Timer, notes, chat | Teammates, notification layer |
| Capture and upkeep | 3 | Get items in; keep the system light | Inboxes, integrations | Messaging and email systems |

**Linkages (all hypotheses)**

| Strength | Pair | Mechanism |
|---|---|---|
| Strong | Capacity and Recovery | Recovery is capacity recomputed after a change |
| Strong | Recovery and Trust | Automatic repair is where AI acts on the user's day |
| Strong | Capacity and Priority | Ranking is needed only when work won't fit |
| Weak | Execution and Recovery | Interruptions break focus blocks |
| Weak | Capture and Priority | More items in, more ranking |
| Weak | Execution and Trust | Notifications reopen settled choices |

**Tensions the fix must respect:** control against relief, completeness against calm, structure against adaptability.

*Visual elements to design:* a concentric map with six themes; needs as dots placed by ring (closer means higher impact on the user); touchpoints as squares; thick lines for strong linkages and thin for weak; a legend that teaches the dot-and-square grammar.

---

# Page 3

## 3.1 Pain points in the current tool stack

Derived from product pages and Phases 1 and 2. None observed in users.

**Before the day**
1. "Today" has no capacity limit, so nothing says the list is too long.
2. Meeting load shows on the calendar, but lost focus time doesn't.
3. Tasks carry no duration, so a day can't be added up.
4. Routines sit in a separate tool and drop out of the arithmetic.
5. A priority flag says importance, not what it displaces.

**During work**
6. The next action is in one app and the timer in another.
7. Notifications reopen choices the user already made.
8. A finished block doesn't say what comes next.
9. Free time in small gaps is counted as usable focus time.

**When the day changes**
10. One late meeting breaks every later block.
11. The user rebuilds the calendar by hand, often across two tools.
12. Automatic moves arrive without a stated reason.
13. Undo is missing, partial, or unclear.
14. A priority that exists only in the user's head isn't on any calendar, so no tool can protect it *(hypothesis [S]: one persona quit an auto-scheduler after it moved a mentally pinned block)*.

**End of day**
15. Unfinished tasks roll forward undecided.
16. A missed plan reads as personal failure.
17. History never changes tomorrow's plan.

*Visual elements to design:* four swim-lane columns by moment; each pain point as a short card; a red outline on the six that sit in the re-planning moment.

## 3.2 Setbacks of existing tools

From each service's own pages, read 11 Oct 2026. Marketing pages, so what they leave out is weak evidence. Reclaim's feature pages and Akiflow's pricing detail come from pricing pages and `supporting/00-market-scan.md`.

| Service | The page says | Limit or gap |
|---|---|---|
| **Sunsama** | Five-step planning ritual; projections "spot overload before it happens"; a hand-placed task locks and the rest "auto-adjust" around it | The overload view is a preview, not a named warning. Shutdown is named but not described. $17 a month billed yearly, $22 monthly (its FAQ says $20 and $25) |
| **Motion** | "Automatically re-plans your day whenever something comes up"; "flags when you've scheduled more than you can handle" | Nothing on explaining a move; no manual lock or pin on the page. AI is credit-metered (7,500 a seat per month on Pro, extra credits sold). $19 and $29 per seat per month, billing basis unstated |
| **Akiflow** | Planning and shutdown rituals; lock time; "replan undone tasks"; imports from "3000+ tools" | The AI assistant is Beta. $19 a month yearly, $34 monthly, 7-day trial with a card. Mentions purchasing-power pricing but gives no numbers |
| **Todoist** | Calendar events beside tasks; time-block layout | Events are read-only and can't become tasks ("no plans"). One calendar provider at a time. The layout needs Pro |
| **TickTick** | Six calendar views, habit statistics, Pomodoro, Eisenhower matrix | Doesn't name time blocking; mentions no AI or auto-scheduling |
| **Reclaim** | Habits, task time-blocking, focus-time defense | A free tier exists, so price can't be the wedge. Its pricing cards and comparison table disagree on calendar-sync limits |

Prices are in US dollars. For an India-first user, $10 to $34 a month is a real barrier, and we didn't check rupee pricing.

*Visual elements to design:* a six-row card set; each card gets a "page says" strip in green and a "gap" strip in amber.

## 3.3 The India scenario (revisited)

Microsoft Work Trend Index, India release, 1 June 2023; 31,000 people across 31 countries, no India sample count given.

| Prevalence | Cause or stance |
|---|---|
| **76%** lack the time and energy to get work done. **78%** lack uninterrupted focus | **46%** say their absence from half or more of their meetings would go unnoticed |
| **74%** worry AI will replace their jobs | **83%** would delegate as much work as possible to AI |

The second row shows both a worry and a wish, held at once. All four are stated attitudes, not scheduling behavior. The 46% hints that part of the calendar could bend, so a capacity view would have to separate fixed from flexible. We haven't tested that.

**Still open:** employer limits on calendar access, device and language preferences, and rupee price sensitivity.

*Visual elements to design:* a 2 by 2 card grid of the four figures with the pairing drawn as a thin bracket on each row.

---

# Page 4

## 4.1 Impact: five ripples (all hypotheses)

| Layer | What changes | Mechanism |
|---|---|---|
| Individual | Fewer reopened decisions | The trade-off is made once, early |
| Focus | Fewer unplanned switches | HBR's sample lost just under four hours a week to reorienting. Context, not a promised gain |
| Follow-through | Less overbooking | Visible capacity forces defer, shorten or decline |
| Self-perception | "Did I trade well with the time I had?" replaces "why did I fail my list?" | A realistic plan changes what failure means |
| Society and market | Automation that explains itself becomes the norm for personal tools | Needs separate validation. The target is one person |

*Visual elements to design:* five concentric ripples from "individual" outward to "market".

## 4.2 Business viability

- **People pay.** Vendors charge $17 to $29 a month, and Reclaim gives a free tier. India willingness to pay is unknown, and price isn't a wedge.
- **The gap is effort and explainability,** not features. Differentiation is the weak spot.
- **Tailwind.** Microsoft's 2025 survey: 48% of employees and 52% of leaders say work feels chaotic and fragmented (31,000 workers, 31 markets, published 17 June 2025).

**Market data (Grand View Research, publisher estimates)**

| Market | Figure | Dates |
|---|---|---|
| Productivity management software | $59.9B in 2023; $149.7B by 2030; 14.1% CAGR 2024 to 2030; Asia Pacific 15.8% | Published June 2024; "last updated July 2026" with the 2023 base year unchanged |
| AI productivity tools | $11.1B in 2025; $14.1B in 2026; $36.4B by 2033; 14.5% CAGR | Published June 2026; last updated September 2026. A chart caption says "million"; the body says billion |

The two markets overlap, so don't add them. Neither is India-first or proves demand. Verdict: viable as a research question, unproven as a wedge.

## 4.3 Sub-HMWs

1. **Repair.** How might we help people recover from an overrun or interruption without rebuilding the rest of the day by hand?
2. **Visibility.** How might we make the trade-off between priorities and available time visible, including what only the user knows is firm?
3. **Trust.** How might AI recommend what to move, defer or protect while making its reasoning understandable and every change easy to accept, edit or reject?

The CHI 2019 human-AI guidelines back the third: efficient dismissal (8), efficient correction (9), scope services when in doubt (10), and make clear why the system did what it did (11).

## 4.4 Need statement

> **Self-managing knowledge workers in India** need **a low-effort way to repair their day when it breaks, seeing what still fits, what carries over and what only they know is firm, with every consequential change explained and theirs to accept, edit or reject,** so that **they can stop rebuilding the day by hand and end it knowing what comes next.**

It names qualities, not a form. The "so that" has two parts: relief from rebuilding, and a day that ends with a clear next step.

**Handoff to Phase 4.**
- **Must:** tie tasks to real available time; show what still fits after a change; make repair cheaper than a manual rebuild; explain every AI move; work without a daily ritual.
- **Must not assume:** that auto-scheduling is wanted, that estimates will be perfect, that the calendar shows everything firm, or that streaks and dashboards add value.

## 4.5 What would validate this (8 to 12 target users)

| Test | What it settles |
|---|---|
| Screener: plans most mornings, or never? | Sizes both segments. A synthetic persona content with a calendar and one list suggests some users don't feel this at all |
| "When did you last lose a task for over a day?" | Whether the lost thread gets promoted to lead |
| Inject a 45-minute overrun into yesterday's plan | What people change and what they need to see |
| "What's firm that isn't on your calendar?" | Whether the invisible-commitment hypothesis holds |
| One-week diary | Whether plans break daily or only feel that way in interviews |

---

## Self-Audit Scores

| Dimension | Score | Justification |
|---|---|---|
| AI-Likeness | 3/10 | Quoted vendor claims, open flaws, no invented quotes; synthetic material tagged each time |
| Convergence Rigor | 5/10 | HMW callout, rubric, sensitivity and structured rejections are present, but one scorer and the pick wins under no tested weighting |
| Theme-Ecosystem Depth | 6/10 | Six themes, six linkages, rings, and 17 service-specific pain points, but no fieldwork behind any of it |
| Refinement Sharpness | 7/10 | Five ripples, dated market data with caveats, three distinct sub-HMWs and a two-part need statement; the market data isn't India-first |

**Weakest dimension:** Convergence Rigor. Two or three more scorers, or ten interviews, would fix it.

## SUCCESs check

| Principle | Where it shows |
|---|---|
| Simple | One sentence: when the plan breaks, show what still fits |
| Unexpected | The pick comes third on the scoreboard, and its user is the best-served one |
| Concrete | Named vendors, quoted claims, prices, dated figures |
| Credible | Sources dated, one scorer labeled, every link tagged logic or hypothesis |
| Emotional | The weakest dimension. One synthetic scene, and real interviews would supply voices |
| Story | Eight candidates, three shortlisted, three ruled out of the lead, one that four others hang off |

## Project State, Phase 3 complete

- **HMW / target user / geography / team:** as in the checkpoint; India first; solo.
- **Chosen problem:** capacity-aware re-planning after disruption (capacity blindness merged with re-planning burden).
- **Ruled out as lead:** the lost thread, execution switching, priority ambiguity.
- **Constraints carried:** works without a daily ritual; adds no upkeep; explained, reversible changes; the calendar isn't the whole truth.
- **Sub-HMWs:** repair, visibility, trust. **Need statement:** section 4.4, verbatim.
- **Open flags:** the pick wins under no tested weighting; the chosen user is the one existing tools serve best.
- **Evidence limit:** no interviews or concept tests; Reddit threads dropped; Leroy read at title level only.

## Sources (all read 11 Oct 2026)

- Microsoft: [infinite workday](https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday) (17 Jun 2025); [India WTI](https://news.microsoft.com/en-in/microsoft-work-trend-index-2023-releases-new-insights-on-how-ai-will-change-the-way-we-work-in-india/) (1 Jun 2023); [Guidelines for Human-AI Interaction](https://www.microsoft.com/en-us/research/articles/guidelines-for-human-ai-interaction-eighteen-best-practices-for-human-centered-ai-design/) (Microsoft Research, validated in a CHI 2019 study; items 8 to 11 read on the page).
- HBR 2022 via the [authors' republished article](https://www.physicianleaders.org/articles/how-much-time-and-energy-do-we-waste-toggling-between-applications).
- Grand View Research: [productivity software](https://www.grandviewresearch.com/industry-analysis/productivity-management-software-market), [AI productivity tools](https://www.grandviewresearch.com/industry-analysis/ai-productivity-tools-market-report).
- Vendors: [Motion](https://www.usemotion.com/features/ai-calendar) and [pricing](https://www.usemotion.com/pricing), [Sunsama](https://www.sunsama.com/features/daily-planning-and-shutdown), [timeboxing](https://www.sunsama.com/features/timeboxing) and [pricing](https://www.sunsama.com/pricing), [Akiflow](https://akiflow.com/features) and [pricing](https://akiflow.com/pricing), [Todoist](https://www.todoist.com/help/articles/use-the-calendar-integration-rCqwLCt3G), [TickTick](https://ticktick.com/features), [Reclaim pricing](https://reclaim.ai/pricing).
- Synthetic dry run: `supporting/05-simulated-interviews.md` (hypothesis input only).
