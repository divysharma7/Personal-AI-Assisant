# Phase 2: Empathy Deepening

**Working title:** Whose day is it, anyway?

> **Status, 11 Oct 2026 (India time).** Desk research, public voices and one synthetic dry run. We have run no interviews, field visits or participant bodystorming. Tags: **[E]** verified source, **[P]** public signal, **[S]** synthetic, **[H]** hypothesis.

> **Continuity checkpoint (unchanged from Phase 1).**
> **HMW:** How might we help self-managing knowledge workers in India turn scattered work and personal commitments into a realistic, adaptable daily plan that remains calm enough to use throughout the day?
> **Target user:** India-based, English-speaking knowledge workers who set their own priorities and keep a flexible or hybrid calendar, coordinating tasks, calendar, routines and focus across several tools.
> **Geography:** India first. **Team:** solo (Divy Sharma).

**Phase 2 opens the problem back up.** Phase 1 narrowed to one HMW. Here we widen it to everything and everyone around the plan, then look for what to carry forward.

**Finding in one line:** most of the day belongs to other people, and the tools on the market answer that only in part.

---

# Page 1

## The day has no edges (the scenario, revisited)

Phase 1 showed a strained, fragmented day. This phase asks where the day starts and stops.

| Number | What it says | Source |
|---|---|---|
| **40%** | Of people online at 6 am are reviewing email for the day's priorities | Microsoft, 17 Jun 2025 [E] |
| **29%** | Of active workers are back in their inboxes by 10 pm | Same report [E] |

*Pair type: prevalence plus persistence.* Both figures come from Microsoft 365 signals to 15 Feb 2025 and exclude education and EU tenants. They describe a global workforce, not India.

*Visual elements to design:* a 24-hour strip with a bar at 6 am and another at 10 pm, each carrying its percentage.

## Filtration funnel: where an intention gets lost

An intention passes through eight hand-offs before it becomes finished work. This is a behavioral model, not a measured conversion funnel.

| # | Hand-off | What leaks | Evidence |
|---|---|---|---|
| 1 | Intent to capture | A request in chat never becomes a task | [H] |
| 2 | Capture to clarify | Inboxes fill faster than they're processed | [H] |
| 3 | Clarify to prioritize | The newest request outranks the important one | [H] |
| 4 | Prioritize to time | The list is longer than the free hours | [H] (worked arithmetic on Page 4) |
| 5 | Time to protection | Meetings and pings override the block | [E] 2-minute ping gap for the top 20% of users |
| 6 | Protection to start | The next step is unclear, so people retreat to tidying | [P] quote below |
| 7 | Start to finish | App switching costs about 1,200 toggles a day | [E] HBR |
| 8 | Finish to close | Open loops carry into the evening | [E] Leroy (title only) |

**Intersectional widening (a recruitment hypothesis).** Four groups probably feel this harder: people in India and US overlap roles (30% of meetings now span time zones, Phase 1); people whose exercise, study or caregiving competes for the same hours; early-career workers building their first system; and heavy tool users with no single source of truth [H].

*Visual elements to design:* an eight-step funnel narrowing left to right, with a red notch where a leak has a verified source and a grey notch where it is a hypothesis.

## Three cultural scripts

**1. Responsiveness outranks intention.** 76% of Indian workers say they lack the time and energy to get work done, and 78% lack uninterrupted focus. 46% say their absence from half or more of their meetings would go unnoticed, which suggests part of the calendar could bend if the user could tell which part [E, stated attitudes]. Source: Microsoft India, 1 Jun 2023.

**2. The setup becomes the project.**

> "My goodness there are so so SO many of these productivity apps. Even in the comments here, there are multiple people saying they too are building their own productivity tools."
>
> Hacker News commenter, [13 Nov 2022](https://news.ycombinator.com/item?id=33585501) [P]

**3. AI is welcome, authority is unsettled.** 92% of Indian knowledge workers use AI at work. 83% would delegate as much work as possible to it, yet 74% worry it will replace their jobs (Microsoft India 2023 and Microsoft/LinkedIn 2024) [E]. Use and delegation are stated attitudes. None of these figures says people will let AI move their own calendar.

*Visual elements to design:* three script cards with a handwritten-style heading; the pull quote as an oversized quotation mark with italic attribution.

## Existing services audit

We read each vendor's own pages on 11 Oct 2026. Pages show what is offered, not how it feels to use, and silence on a page is weak evidence of absence.

| Service | Documented | Gap on the page |
|---|---|---|
| **Sunsama** (deep dive) | Five-step planning ritual: Process, Plan, Prioritize, Prepare, Publish. Task projections "spot overload before it happens." A task placed by hand locks in and the others "auto-adjust" around it | The page describes no shutdown steps. Overload shows as a preview, not a named warning |
| **Motion** | "Automatically re-plans your day whenever something comes up." "Flags when you've scheduled more than you can handle" | Says nothing on explaining why a task moved, and mentions no manual lock or pin |
| **Akiflow** | Daily planning and shutdown rituals; lock time; a "replan undone tasks" button; an inbox that imports from "3000+ tools" | The AI assistant, Aki, carries a Beta label. No claim about explaining a move |
| **Todoist** | Calendar events beside tasks; time-block layout | Events are read-only and can't become tasks ("no plans"); one calendar provider at a time; the layout needs Pro |
| **TickTick** | Six calendar views, habit statistics, Pomodoro, Eisenhower matrix | Doesn't name time blocking and mentions no AI or auto-scheduling |
| **Reclaim** | Habits, task time-blocking, focus-time defense, free tier (pricing page only) | We didn't read its feature pages |

**The gap claim.** Of the six, three document some form of re-planning (Motion, Akiflow, Sunsama's auto-adjust). None of the five feature pages we read says it explains why something moved. That is the thin spot we carry forward, and a hands-on trial would have to confirm it [H]. The six were hand-picked, so this isn't a market sample.

**Other policies and services.** We didn't scan India-specific data-protection rules or employer calendar-access policies. That is a stated gap, and the manager and IT slots on Page 2 mark where it matters.

*Visual elements to design:* a six-row comparison card set with a green tick for "documented" and a hollow circle for "not on the page"; the Sunsama row enlarged.

---

# Page 2

## Who all are involved

**Most of the plan sits with other people.** The user controls a small slice of it.

| Ring | Who | In one line |
|---|---|---|
| **Core** | The user, manager, teammates, meeting organizers, partner or household, the user's future self | They move meetings, add work, and inherit whatever gets deferred |
| **Involved** | Clients, cross-functional teams, calendar providers, chat and email systems, org task systems, AI assistants, the notification layer, device reminders, health and fitness routines | They create, move or interrupt commitments |
| **Informed** | Employer IT and security, data-protection expectations, app marketplaces, productivity writers and forums, API providers, shared family calendars | They never touch the plan but decide what tools may see |

*Visual elements to design:* three concentric rings, the user in the centre, 21 labeled nodes, line weight showing how often each stakeholder changes the plan.

## What our stakeholders said

Real public voices only, retrieved 11 Oct 2026 and checked against the original thread. Each is a single comment, not a representative view.

| Role | Verbatim | Source |
|---|---|---|
| Tool user | "if something isn't either obviously urgent or scheduled on a calendar, it never gets done." | [HN, 13 Mar 2017](https://news.ycombinator.com/item?id=13856322) |
| Team lead | "I put “focus time” after lunch to end of day to force all of the meetings into the morning. Unfortunately project managers still put time in my calendar as as a lead it’s harder to say no." | [HN, 23 Jun 2023](https://news.ycombinator.com/item?id=36453185) |
| Tool builder | "too many productivity apps (todos, calendar, recipes, shopping, budget, etc), no integrations" | [HN, 23 Dec 2021](https://news.ycombinator.com/item?id=29664239). The commenter promotes their own product, so this isn't independent |
| Tool user | "so so SO many of these productivity apps" | [HN, 13 Nov 2022](https://news.ycombinator.com/item?id=33585501) |
| Partner or household | *To collect:* which shared commitments matter, and which work details stay private? | Interview slot |
| IT and security | *To collect:* what permissions would calendar and AI access need? | Interview slot |

**Triangulation fails today.** Four voices come from three roles, and Hacker News likely skews technical. Commenters don't state where they live, so we can't say any speaks for India. Two roles are empty slots.

The team lead's comment matters most for our scope. A person with authority over a calendar still can't defend it, which means a personal planning tool must plan around other people's choices.

*Visual elements to design:* a quote wall of four cards with role labels, plus two dashed "to collect" cards.

---

# Page 3

## Problem mapping

Every branch traces back to one question: *why does my plan stop matching my day?* Evidence tags show which branches rest on a source and which are our reasoning.

| Branch | Sub-issues | Evidence |
|---|---|---|
| **A. Capture fragmentation** | Work arrives by chat, email, meetings and memory; duplicates across tools; source context lost on copy; items lack a next action; capture happens in the wrong app; inbox grows unseen | [H] |
| **B. Priority ambiguity** | Urgent beats important; the newest request wins; routines drop before visible meetings; labels ignore calendar reality; priorities stay in people's heads; no way to mark what's firm | [H] |
| **C. Capacity blindness** | The list has no tie to free hours; estimates run optimistic; meetings eat peak-focus windows; overcommitment shows late; free time sits in small gaps; transitions cost time nobody counts | [H] |
| **D. Execution friction** | App switching breaks context; setup delays starting; unfinished tasks leave residue; no single next action; the timer lives apart from the task; notes live elsewhere | [E] HBR: ~1,200 toggles a day |
| **E. Re-planning burden** | One meeting change breaks several blocks; dragging becomes calendar Tetris; automatic re-plans can feel controlling; no stated reason for a move; undo is missing or unclear; the user can't tell safe moves from risky ones | [E] Motion, Akiflow and Sunsama document re-planning, none explains moves |
| **F. System sustainability** | Feature noise; streak guilt; tags and statuses become admin; integrations add supervision; novelty fades and use drops; the system must be kept current to stay useful | [P] quotes above |

**New insight.** Fragmentation also happens inside a single app, so the unit worth counting is the number of decisions and translations between intention and action [H].

*Visual elements to design:* a mind-map with the HMW at the centre and six branches; evidence tags as small coloured dots on each branch.

---

# Page 4

## Experience map: a day in the life

A synthetic composite built from the sources above, not a record of observed users.

| | Start | Commit | Execute | Disrupt | Recover | Close |
|---|---|---|---|---|---|---|
| **Actions** | Scan chat, calendar and overdue items | Pick tasks, estimate, block time | Work the top task with a timer on | A meeting overruns; a request lands | Move or drop tasks; skip the habit | Review done against open; eyeball tomorrow |
| **Emotions** | Hopeful | Confident | Fragile focus | Pressured | Overloaded | Mixed relief |
| **Thoughts** | "What actually matters today?" | "This looks doable." | "Stay with this." | "This no longer fits." | "What can I safely move?" | "Did I make progress?" |
| **Pain points** | Several sources of truth | Estimating is admin | Pings and app switches | Re-plan cost | Rebuild by hand or give up | Open loops reach the evening |
| **Evidence** | [H] | [H] | [E] pings | [E] residue | [H] | [E] residue |

**Bodystorming: not conducted.** A real session would recreate a recent "my plan broke at 2 PM" episode with the person's own tools open. The facilitator adds one interruption at a time and watches which screen the person opens first.

**Worked arithmetic [S].** Say 3.5 free hours is 210 minutes. Four tasks (240 minutes) plus a 30-minute workout make 270, so the plan starts 60 minutes over. A 30-minute meeting that runs to 75 adds 45 more, and the gap becomes 105. A to-do list hides this. A calendar shows the meeting but not task importance. A silent auto-scheduler moves work without teaching the user why. The three needs that follow are a constraint, a consequence and a choice.

*Visual elements to design:* a six-column swim lane with the emotion row drawn as a line; face icons on each emotion cell; the arithmetic as a small bar that overflows its container.

---

# Page 5

## Two different worlds

**Axis: control-seeking planner versus assistance-seeking executor.** Both are [S] composites with fictional names, drawn from a dry run of the Phase 1 interview guide (`05-simulated-interviews.md`).

| | **Ananya, the Deliberate Planner** | **Rohan, the Adaptive Executor** |
|---|---|---|
| Role | Product designer, hybrid team | Software engineer across India and US time zones |
| Top goal | Know what fits before committing | Always know the next useful action |
| Wants from tech | Less admin, no invisible decisions | Routines inferred over time; comfortable with AI |
| Typical day | Plans in the morning, patches by hand when it breaks | Often has no morning plan; loses a task for days in a stale tab |
| Pains | Manual re-planning after meetings move; duplicate lists; distrusts schedulers that move work unexplained | Forgets to update plans; routines vanish when work grows; hates metadata-heavy setup |
| Statement to test | Wants a better plan surfaced and the final say on what moves | Values constant orientation over a detailed system |

**A comparison group, not a persona.** Meera, a satisfied minimalist with a calendar and one short list, reports no problem. She reminds us the pain may not reach everyone, and real recruiting must include people like her [S].

*Visual elements to design:* two portrait cards facing each other with the axis drawn between them, each card in a different tint, and a small dashed card for Meera.

## Discoveries

Three figures that are new in this phase.

| Number | What it says | Source |
|---|---|---|
| **57%** | Share of the average employee's time spent communicating (meetings, email, chat), against 43% creating | Microsoft Work Trend Index, 9 May 2023 [E] |
| **58** | Messages arriving per user before or after hours. The report's body says "more than 50" sent or received | Microsoft, 17 Jun 2025, methodology section [E] |
| **8.8 hrs and 7.5 hrs** | Weekly hours the top quarter of email users spend on email, and the top quarter of meeting users spend in meetings | Microsoft Work Trend Index, 9 May 2023 [E] |

*Pair type: share of the week plus the heavy tail.* All three describe Microsoft 365 users worldwide, not India.

## Assumptions challenged

We say "challenged," not "invalidated," because we hold no primary data.

| We assumed | What we found | Status |
|---|---|---|
| Fewer apps means less overwhelm | Integration adds its own supervision: Todoist events are read-only and limited to one provider, and one commenter solved it with a calendar alone [E][P] | Challenged |
| The main pain is capturing tasks | Capture is a commodity, with Akiflow importing from "3000+ tools." The stall comes after capture, when the next step is unclear [E][P] | Revised |
| Better AI means more automation | Automation already ships (Motion "reshuffles your entire day"). Indian workers both want to delegate (83%) and fear replacement (74%). The open space is changes that are explained and reversible [E][H] | Revised |
| Everyone starts the day with a plan | A synthetic persona often doesn't, and loses tasks instead. If real interviews confirm it, "re-planning" covers only part of the audience [S][H] | Challenged |

## Scope re-affirmation

We can't change meeting culture, a manager's behavior, message volume or a household's needs. Our scope stays the same: help one person make, protect and recover a realistic day across tasks, time, routines and focus, with less mental effort.

---

## Next: primary research (needed before Phase 3 can claim anything)

- **Who:** 8 to 12 target users (3 manual planners, 3 AI-positive, some who left an all-in-one tool, some happy with theirs), plus a manager, a partner and an IT contact.
- **How:** a 45-minute interview with tools open, a three-day diary, and a 30-minute "plan broke" reconstruction.
- **Measure:** tools touched while planning, minutes to a realistic plan, manual mid-day edits, trust after an AI suggestion.

## Self-Audit Scores

| Dimension | Score | Justification |
|---|---|---|
| AI-Likeness | 3/10 | Specific mechanisms, dated sources and visible uncertainty; a few tables read formulaic |
| Ecosystem Breadth | 7/10 | Funnel, scripts, six-service audit, 21 stakeholders, 36 sub-issues; no India policy scan |
| Empathic Granularity | 4/10 | Four real voices from three roles, none from India; no fieldwork; the experience map is synthetic |
| Persona Contrast and Humility | 6/10 | A sharp control-versus-assistance axis and four honest revisions, but both personas are synthetic |

**Weakest dimension:** Empathic Granularity. Six to ten screen-share interviews would lift it most.

## SUCCESs check

| Principle | Where it shows |
|---|---|
| Simple | One finding line; each section opens on one point |
| Unexpected | A team lead can't defend his own calendar; the gap is explanation, not features |
| Concrete | Named services, exact percentages, a 210-minute worked example |
| Credible | Every figure carries source, date and tag; the audit says what pages can't show |
| Emotional | The 2 PM "this no longer fits" moment |
| Story | One composite day, and two people who split on who decides |

## Project State, Phase 2 complete

- **HMW / target user / geography / team:** unchanged from the checkpoint above.
- **Framework:** Cognitive Load, Time Control, Focus, Trust and Agency (primary); Follow-through, Wellbeing (ripple).
- **Problem branches:** capture, priority, capacity, execution, re-planning, sustainability (36 sub-issues).
- **Personas:** Deliberate Planner and Adaptive Executor [S], plus a satisfied-minimalist comparison.
- **Service insight:** re-planning documented in 3 of 6 services; explanation of a move on 0 of the 5 feature pages read (Reclaim's feature pages unread).
- **Continuity note:** no primary research; two stakeholder slots empty; the synthetic run suggests some users never plan in the morning.
