# Phase 2 — Empathy Deepening: Mapping the Daily-Orchestration Ecosystem

> **Finalised:** 10 October 2026 (India time). **Research status:** desk research and analyst synthesis complete; primary interviews, co-creation and usability testing have not been conducted. The numbered pages are narrative sections, not a promise of printed pagination.

> **Continuity checkpoint**  
> **HMW:** How might we help self-managing knowledge workers in India turn scattered work and personal commitments into a realistic, adaptable daily plan that remains calm enough to use throughout the day?  
> **Target user:** India-based, English-speaking individual knowledge workers in a self-managed/hybrid work phase who coordinate work tasks, calendar commitments, personal routines and focus across multiple digital tools.  
> **Geography:** India-first.  
> **Team:** Solo-builder working assumption; no additional research collaborators were supplied.  
> **Framework:** Cognitive Load, Time Control, Focus, Follow-through, Wellbeing, Trust & Agency.

> **Research integrity note**  
> Phase 2 normally requires fieldwork, stakeholder interviews, bodystorming and contrasting personas grounded in primary research. Those inputs were not provided. This draft therefore uses dated secondary research, official product/service documentation, public community discussions, and clearly labeled **provisional / synthetic empathy artifacts**. It does not pretend synthetic responses are real interviews.

---

# Page 1

## Filtration Funnel — Where an intention gets lost before execution

The Phase 1 journey suggested that the core problem is not capture alone; it is the number of translations required before a commitment becomes protected execution time. We therefore widened the problem space by mapping the **commitment-to-action filtration process**.

### Conceptual funnel — not a measured conversion funnel

1. **Intent exists** — “I need / want to do this.”
2. **Intent is captured** — task, message, note, reminder or mental memory.
3. **Intent is clarified** — user understands next action, deadline and importance.
4. **Intent is prioritized** — it competes with other work and personal commitments.
5. **Intent receives time** — a realistic slot exists in the calendar/day.
6. **Time is protected** — interruptions and new work do not immediately displace it.
7. **Work begins** — user transitions into execution with necessary context.
8. **Work closes** — completed, consciously deferred or re-planned with a clear next step.

### Where drop-off is likely

- **Capture → clarify:** inboxes grow faster than they are processed.
- **Prioritize → time:** a to-do list can exceed actual calendar capacity.
- **Time → protection:** meetings, messages and interruptions override the plan.
- **Execution → closure:** unfinished work leaves attention residue and creates tomorrow’s backlog.

This is a **behavioral filtration model**, not a claim that a specific percentage drops at each stage. Real diary studies should measure where participants lose items.

## Intersectional widening — who experiences harsher orchestration pressure?

Within the primary target group, the problem may be more intense for people who combine several of these conditions:

- hybrid/remote roles with high message and meeting volume;
- individual-contributor work requiring deep focus plus rapid responsiveness;
- side projects, caregiving, study or health routines competing with work time;
- cross-time-zone teams that expand the workday;
- early-career workers still building reliable planning habits;
- users who have adopted several productivity tools without a stable “source of truth.”

This is a recruitment hypothesis, not a demographic conclusion. It should guide purposive sampling for real interviews.

## Cultural / behavioral scenario

### Script 1 — **Responsiveness can outrank intentionality**
Microsoft’s India findings show substantial pressure on focus and time/energy, while global 2025 telemetry describes workdays fragmented by meetings, email and messages. The practical implication is that a carefully planned day can be socially overridden by incoming work.

### Script 2 — **Tool sophistication can become a proxy for control**
Public productivity communities frequently show users cycling through systems, adding tags, integrations and additional apps in search of a setup that finally “works.” The system itself can become a project. This suggests that perceived sophistication is not the same as reduced cognitive load.

### Script 3 — **AI is normal, but autonomy still matters**
Microsoft and LinkedIn reported that 92% of Indian knowledge workers used AI at work in 2024. That lowers the adoption barrier for AI-assisted planning, but it does not prove users want silent automation. The product must distinguish **AI availability** from **AI authority**.

## Existing Services Audit

### Existing-service archetypes — audit of capabilities, not user satisfaction

To keep proposed solutions out of Phases 1–3, this section describes the service models. The named comparison and exact official links appear in Phase 4, Section 4.11. Official documentation establishes that capabilities are offered, not that users achieve the advertised outcomes.

| Service model | Documented mechanism | Research implication | Question requiring users |
|---|---|---|---|
| Broad personal organiser | Tasks, calendars, habits and focus in one system | Feature breadth already exists | Does consolidation actually lower maintenance for this user? |
| Guided daily planner | Planning and shutdown rituals; projected task durations around events | Realistic capacity is already addressed in the category | Is recovery still difficult, or does the existing product solve it? |
| Automatic scheduler | Task placement based on availability, duration, deadlines and priority | The category already supports rescheduling | What level of delegation is useful and understandable? |
| Consolidated planning workspace | Imported tasks, time blocking, rituals and focus | Importing commitments can lower copying effort | Does integration reduce work or add sync supervision? |
| Task manager with calendar integration | Scheduled tasks mirrored into external calendars | Task/time connections are familiar | What remaining decisions are still manual? |

**Service-space conclusion:** capacity-aware planning and recovery are not uncovered capabilities. Our question is whether a specific group still experiences unmet coordination friction and whether a simpler experience would improve it enough to justify adoption. We cannot infer demand, retention or a unique market gap from feature pages.

**Visual elements to design**
- 8-stage inverted filtration funnel.
- Three “behavioral scripts” cards.
- Competitor matrix with rows for Capture, Plan, Calendar, Focus, Habits, Rituals, AI, Auto-replan, User control.

---

# Page 2

## Stakeholder Map — The personal plan is not actually personal

Even an individual productivity product sits inside a dense ecosystem. The user’s day is shaped by people, systems and institutions that can create, constrain or interrupt commitments.

### CORE — directly shapes the daily plan
1. Target user / knowledge worker.
2. Manager or direct lead.
3. Immediate teammates.
4. Meeting organizers.
5. Partner / family / household members.
6. The user’s future self (the person who inherits deferred work).

### INVOLVED — creates or modifies commitments
7. Clients / external collaborators.
8. Cross-functional teams.
9. Calendar providers (calendar services).
10. Communication platforms (chat / email).
11. Task / project systems used by the organization.
12. Personal health / fitness / habit routines.
13. AI assistants and automation agents.
14. Notification systems on desktop/mobile.
15. Device ecosystem and OS-level reminders.

### INFORMED / governance layer
16. Employer IT / security policy.
17. Privacy / data-protection expectations.
18. App marketplaces and subscription ecosystems.
19. Productivity coaches / creators / communities shaping user expectations.
20. Integrations / API providers.
21. Family calendars or shared-event systems.

### Relationship tension

The user controls only a subset of the system. A planning tool can recommend priorities, but it cannot prevent a manager from moving a meeting, a client from escalating a deadline, or a family obligation from appearing. This makes **recovery from change** a first-class UX requirement.

## Public signals and missing stakeholder perspectives

No recruited stakeholder interviews occurred. We therefore paraphrase public leads and state what remains unknown rather than creating five interview quote cards.

| Perspective | Evidence actually available | Interpretation limit |
|---|---|---|
| Original productivity-app poster | Reports upkeep, feature overload and stopping use; [accessible discussion](https://www.reddit.com/r/ProductivityApps/comments/1u0bi0x/ive_tried_multiple_productivity_and_habittracking/) | Motivation and cost may explain abandonment as well as usability |
| Tool-builder commenter | Describes maintenance and promotes their own product in the same thread | Commercial interest; not independent triangulation |
| Simple-tool users | Some replies favour a small existing stack | Counterexample to assuming consolidation is required |
| Fewer-tools discussion | [Public thread](https://www.reddit.com/r/ProductivityApps/comments/1sxzf5h/unpopular_opinion_most_people_need_fewer/) challenges tool proliferation | Self-selected discussion; no population estimate |
| Manager, partner, IT/security stakeholder | No primary evidence collected | Interview questions below remain hypotheses |

Neither a self-described job title nor a community membership verifies identity or diagnosis. These sources should not be used to claim that Indian managers, caregivers or people with ADHD prefer the proposed concept. Prior-draft quotes from inaccessible threads have been removed.

## Stakeholder hypotheses for real interviews

- **Manager hypothesis:** Focus time may need to be visible as unavailable without exposing private task details.
- **Partner/family hypothesis:** Shared commitments matter, while work-task details may need to remain private.
- **IT/security hypothesis:** Calendar and AI integrations require explicit permissions and clear data boundaries.
- **User hypothesis:** Help recovering from change may be valued more than unexplained autonomous decisions.

These four statements are synthetic stakeholder hypotheses and must be validated.

**Visual elements to design**
- Three-ring stakeholder map with 21 entities.
- Evidence cards showing public signal, commercial-interest flag and missing stakeholder perspective.
- Highlight line: “A daily plan is a negotiation between personal priorities and shared time.”

---

# Page 3

## Problem-Space Mind Map — The orchestration problem has six branches

### Branch A — Capture fragmentation
- tasks arrive through chat, email, meetings, notes and memory;
- duplicate capture across personal and work systems;
- source context gets lost when copied;
- inboxes are not processed consistently;
- tasks may lack duration, deadline or next action.

### Branch B — Priority ambiguity
- urgency competes with importance;
- personal routines are easier to drop than visible meetings;
- long backlogs flatten meaningful differences;
- users may over-prioritize the newest request;
- priority labels are often disconnected from calendar reality.

### Branch C — Capacity blindness
- task list has no hard relationship to available hours;
- optimistic duration estimates make plans impossible;
- meetings consume peak-focus windows;
- users discover overcommitment too late;
- deferred work accumulates without a recovery strategy.

### Branch D — Execution friction
- switching to another app breaks context;
- setup overhead delays starting;
- unfinished tasks leave attention residue;
- notifications interrupt deep work;
- users cannot always tell the single next action.

### Branch E — Re-planning burden
- one meeting change can invalidate several time blocks;
- manual drag-and-drop becomes calendar Tetris;
- automated re-planning may feel too controlling;
- users need to understand why one task moves ahead of another;
- “today” can become stale by afternoon.

### Branch F — System sustainability
- too many features become visual noise;
- streaks can create guilt rather than support;
- maintaining tags, statuses and integrations becomes admin;
- users abandon systems after novelty fades;
- privacy concerns can limit cross-tool context and AI usefulness.

## Newly surfaced insight

Phase 1 framed fragmentation as “too many apps.” Phase 2 broadens it: **fragmentation also happens inside a single app** when the user must reconcile too many representations, rules and modules. Therefore the unit of simplification is not “number of apps.” It is **number of decisions and translations required to move from intention to action**.

## Discoveries from deeper research

### Discovery 1 — Interruption is structural, not an edge case
Microsoft’s 2025 telemetry found average interruption intervals of roughly two minutes for the high-ping cohort used in its methodology. A resilient product should expect the plan to change.

### Discovery 2 — Planning specificity can improve follow-through
Implementation-intention research consistently finds benefit from specifying when, where and how action will occur. This motivates questions about explicit next actions and disruption responses. A calendar block alone is not equivalent to the tested if-then intervention.

### Discovery 3 — Existing services already address the proposed job
Official documentation shows projected capacity, locked task blocks, adaptive scheduling and correction mechanisms in the category. That weakens a uniqueness claim. Any advantage must be established through a target-user comparison, including a competent current competitor.

**Visual elements to design**
- Central node: “Daily Orchestration Friction.”
- Six branches, 5 sub-issues each.
- Tag each sub-issue as Evidence-backed / Public-signal / Hypothesis.

---

# Page 4

## Experience Map — A day in the life

> **Status:** Provisional synthesis from secondary research and public signals. Not a substitute for contextual observation.

| Stage | What the user does | What the user thinks/feels | Friction / evidence | Design opportunity direction |
|---|---|---|---|---|
| **1. Start day** | Checks messages, calendar, overdue tasks, habits | “What actually matters today?” | Several sources of truth; priorities may not fit calendar | Understand priorities in relation to finite time |
| **2. Commit** | Chooses top tasks, estimates time, blocks focus | “This looks doable.” | Estimation + manual timeboxing overhead | Understand estimation effort and uncertainty |
| **3. Execute** | Works on priority task, uses timer/focus mode | “Let me stay with this.” | Notifications and context switches | Understand effort to begin the selected task |
| **4. Disruption** | Meeting overruns; new request arrives | “My plan no longer fits.” | Re-planning cost; attention residue | Identify information needed for recovery decisions |
| **5. Recover** | Defers/moves tasks, drops habit, reshuffles | “What can I safely move?” | User may rebuild plan manually or give up | Reduce the effort of choosing what can change |
| **6. Close day** | Reviews completed/unfinished work and tomorrow | “Did I actually make progress?” | Open loops carry forward mentally | Understand which open decisions need closure |

### Four layers to observe in real fieldwork

For each stage, a real diary/context study should record:
1. **Action:** clicks, tools, transitions and workarounds.
2. **Context:** location, meeting density, device and social demands.
3. **Cognition:** decisions, memory burden, uncertainty and trust.
4. **Emotion:** confidence, pressure, relief, guilt, control.

## Bodystorming / enactment record

**NOT CONDUCTED with participants.**  
A useful real session would ask participants to recreate a recent “plan broke at 2 PM” episode with their actual tools open. The facilitator should introduce one interruption at a time—meeting extension, urgent request, low-energy state, personal obligation—and observe:

- which screen they open first;
- what they edit versus ignore;
- whether they preserve or abandon focus blocks;
- what information they need to decide what moves;
- whether they want automation, suggestion or manual control;
- when the tool starts feeling like extra work.

### Synthetic scenario walkthrough

**Scenario:** A user has 3.5 free hours, four planned tasks totaling 4 hours, a 30-minute protected workout inside that same free-time budget, and a separate 30-minute meeting that becomes 75 minutes. Before disruption, demand is 270 minutes against 210 available minutes; the additional 45-minute overrun increases the gap from 60 to 105 minutes. These are constructed scenario values, not observed user data.

**Reasoned scenario hypothesis:** A static to-do list does not expose the capacity contradiction; a calendar-only view does not explain task importance; aggressive auto-scheduling can move work without teaching the user why. The scenario suggests investigating **constraint + consequence + choice**; it does not establish that a particular interaction would work.

**Visual elements to design**
- Six-stage horizontal experience map.
- Emotional line beneath the stages.
- Callout showing a 30-minute meeting expanding to 75 minutes and cascading through the plan.

---

# Page 5

## Provisional Persona A — The Deliberate Planner

> **Hypothesis persona, not interview-derived.**

**Scenario name:** Ananya; fictional identifier, no measured demographic claim  
**Role:** Product designer in a hybrid team  
**Life phase:** Has moved into a role with more autonomy and cross-functional work; also maintains exercise and learning routines.  
**Current stack:** task/project tool + calendar + notes + focus timer + occasional AI; invented scenario, not a verified participant stack.

### Goals
- protect 1–2 meaningful focus blocks per day;
- know what realistically fits before committing;
- maintain personal routines without micromanaging them;
- end the day with clear closure.

### Motivations
- values control and intentionality;
- likes planning because it reduces anxiety;
- wants technology to remove admin, not make decisions invisibly.

### Pain points
- manual reconciliation after meetings change;
- duplicate tasks across personal/work systems;
- dashboards that show too much at once;
- distrusts auto-schedulers that move everything without explanation.

### Statement to test in research
The user may want the system to surface a better plan while keeping final control over what moves.

## Provisional Persona B — The Adaptive Executor

> **Hypothesis persona, not interview-derived.**

**Scenario name:** Rohan; fictional identifier, no measured demographic claim  
**Role:** Software engineer working across India and US time zones  
**Life phase:** Early-career, increasingly responsible for self-directed project work; schedule changes frequently.

### Goals
- avoid spending morning energy on planning;
- always know the next useful action;
- recover quickly when the day changes;
- keep work from expanding indefinitely into the evening.

### Motivations
- values speed and low ceremony;
- is comfortable with AI and automation;
- wants the system to infer routine patterns over time.

### Pain points
- forgets to update plans after interruptions;
- lets personal routines disappear when work grows;
- resents metadata-heavy task setup;
- abandons systems that require daily grooming.

### Statement to test in research
The user may value ongoing orientation more than maintaining a detailed productivity system.

## Persona contrast axis

**Control-seeking deliberate planning ←→ Assistance-seeking adaptive execution**

The contrast suggests testing whether the same daily model can serve different planning preferences. Neither persona establishes that adjustable automation is required.

## Working assumptions challenged — not empirically invalidated

### Assumption 1 — Consolidation guarantees less overwhelm → **Challenged**
Public abandonment accounts challenge this proposition, but no recruited comparison establishes causality. Consolidation is neither necessary nor sufficient; satisfied multi-tool users are an important comparison group.

### Assumption 2 — “The main pain is capturing tasks.” → **Revised**
Official service documentation shows that fast capture is common. The higher-leverage pain appears after capture: prioritization, capacity allocation, disruption and re-planning.

### Assumption 3 — “AI differentiation means more automation.” → **Revised**
India’s high AI adoption makes AI assistance plausible, but automatic-scheduling services already offer this capability. A promising differentiation hypothesis is **transparent, user-controlled orchestration**—AI that explains constraints and proposes changes instead of making invisible calendar decisions.

## Closing scope re-affirmation

This project is not trying to solve all causes of distraction, motivation, burnout or organizational overload. It cannot control meeting culture, manager behavior, message volume or personal life shocks. The scope remains: **help the individual make, execute and recover a realistic daily plan across tasks, time, routines and focus with lower cognitive overhead.**

---

## Primary Research Plan Required to Upgrade These Artifacts

### Sample
- 8–12 target users.
- At least 3 heavy manual planners.
- At least 3 automation/AI-positive users.
- Include people who abandoned an integrated tool and people satisfied with their current system; categories may overlap with planning preferences.
- Mix of roles: design/product, engineering, operations/consulting, independent/freelance.

### Methods
1. 45-minute contextual interview with current tools open.
2. 3-day lightweight diary: morning plan, first disruption, evening close.
3. 30-minute “plan broke” reconstruction / bodystorming session.
4. Explore the acceptable delegation boundary; designed concept variants are specified in Phase 4.

### Key measures
- number of tools touched during morning planning;
- time to produce a realistic daily plan;
- number of mid-day manual plan edits;
- percentage of planned focus blocks disrupted;
- self-rated clarity: “I know what to do next”;
- self-rated control/trust after AI suggestion;
- number of personal routines dropped when work expands.

---

## Self-Audit Scores

Editorial judgments, not measured quality scores. **AI-Likeness: lower is better; all other dimensions: higher is better.**

| Dimension | Score | Justification |
|---|---:|---|
| AI-Likeness | 3/10 | The brief uses specific mechanisms, explicit evidence levels and meaningful trade-offs rather than generic empathy language. |
| Ecosystem Breadth | 9/10 | 21 stakeholders, 5 competitors, six problem branches and a commitment-to-action funnel materially expand Phase 1. |
| Empathic Granularity | 6/10 | Strong provisional journey detail, but no real contextual observation, field visit or recruited stakeholder quotes. |
| Persona Contrast & Humility | 8/10 | Personas differ on control/automation preference and are clearly marked as hypotheses; assumptions are revised rather than defended. |

**Weakest dimension:** Empathic Granularity. Real screen-share interviews and diary observation are the next highest-value research activity.

---

## Project State — Phase 2 Complete

- **Phase completed:** 2 — Empathy Deepening
- **HMW:** How might we help self-managing knowledge workers in India turn scattered work and personal commitments into a realistic, adaptable daily plan that remains calm enough to use throughout the day?
- **Target user:** India-based, English-speaking individual knowledge workers in a self-managed/hybrid work phase who coordinate work tasks, calendar commitments, personal routines and focus across multiple digital tools.
- **Geography:** India-first.
- **Team:** Solo-builder working assumption; no additional research collaborators were supplied.
- **Framework:** Cognitive Load, Time Control, Focus, Follow-through, Wellbeing, Trust & Agency.
- **Problem categories:** Capture Fragmentation; Priority Ambiguity; Capacity Blindness; Execution Friction; Re-planning Burden; System Sustainability.
- **Personas:** Deliberate Planner vs Adaptive Executor — contrast axis is desired degree of automation / control.
- **Existing-service insight:** Feature integration is common; differentiation must be calm orchestration and user agency.
- **Key artifacts:** filtration funnel, service audit, 21-entity stakeholder map, proxy qualitative voices, six-branch problem map, experience map, provisional personas, challenged working assumptions.
- **Continuity note:** Primary fieldwork remains missing. Personas and synthetic stakeholder statements are provisional.

---

## Sources

### Method + product
1. [Source](<https://github.com/divysharma7/ux-case-study-writer>)
2. Builder-supplied product README (held as a Phase 4 feasibility constraint; solution details intentionally omitted from Phases 1–3).

### Work / behavior research
3. Microsoft India Work Trend Index 2023: [Source](<https://news.microsoft.com/en-in/microsoft-work-trend-index-2023-releases-new-insights-on-how-ai-will-change-the-way-we-work-in-india/>)
4. Microsoft / LinkedIn India Work Trend Index 2024: [Source](<https://news.microsoft.com/en-in/92-of-indian-knowledge-workers-use-ai-in-the-workplace-finds-microsoft-and-linkedin-2024-work-trend-index/>)
5. Microsoft, “Breaking down the infinite workday,” 2025: [Source](<https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday>)
6. HBR app switching study: [Source](<https://hbr.org/2022/08/how-much-time-and-energy-do-we-waste-toggling-between-applications>)
7. Leroy (2009), attention residue: [Source](<https://doi.org/10.1016/j.obhdp.2009.04.002>)
8. Gollwitzer & Sheeran (2006), implementation intentions: [Source](<https://doi.org/10.1016/S0065-2601(06)38002-1>)

### Competitor / service audit
9. TickTick features: [Source](<https://ticktick.com/features>)
10. Sunsama daily planning / shutdown: [Source](<https://www.sunsama.com/features/daily-planning-and-shutdown>)
11. Sunsama timeboxing: [Source](<https://www.sunsama.com/features/timeboxing>)
12. Motion AI Calendar: [Source](<https://www.usemotion.com/features/ai-calendar>)
13. Motion auto-scheduling reference: [Source](<https://www.usemotion.com/help/time-management/auto-scheduling/reference-auto-scheduling>)
14. Akiflow features: [Source](<https://akiflow.com/features>)
15. Todoist calendar integration: [Source](<https://www.todoist.com/help/articles/use-the-calendar-integration-rCqwLCt3G>)

### Public qualitative signals
16. Maintenance / sync tax: [Source](<https://www.reddit.com/r/ProductivityApps/comments/1u0bi0x/ive_tried_multiple_productivity_and_habittracking/>)
17. Fewer apps / sync complexity: [Source](<https://www.reddit.com/r/ProductivityApps/comments/1sxzf5h/unpopular_opinion_most_people_need_fewer/>)
