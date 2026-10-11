// src/case-study/products/life-os/empathize.ts
//
// Phase 2 content — sourced verbatim from
// public/case-study/life-os/02-empathy-deepening.md (read 11 Oct 2026).
// Do not strengthen claims; keep [E]/[P]/[S]/[H] semantics.

import type { Section } from "../../engine/types";
import type { PhaseHeroProps } from "../../shell/PhaseHero";

export const empathizeHero: PhaseHeroProps = {
  eyebrow: "Phase 2 · Empathize",
  title: "Whose day is it, anyway?",
  lead: "Finding in one line: most of the day belongs to other people, and the tools on the market answer that only in part.",
  status: [
    "Desk research, public voices, synthetic dry run",
    "No interviews, field visits or bodystorming",
    "Figures re-read 11 Oct 2026",
  ],
  legend:
    "Tags: [E] verified source · [P] public signal · [S] synthetic · [H] hypothesis.",
};

export const empathizeSections: Section[] = [
  {
    id: "empathize-day-edges",
    type: "custom",
    component: "DayEdgesStrip",
    title: "The day has no edges (the scenario, revisited)",
    data: {
      intro:
        "Phase 1 showed a strained, fragmented day. This phase asks where the day starts and stops.",
      stats: [
        {
          value: "40%",
          label:
            "Of people online at 6 am are reviewing email for the day's priorities",
          source: "Microsoft, 17 Jun 2025 [E]",
          position: 25,
          tone: "accent",
        },
        {
          value: "29%",
          label: "Of active workers are back in their inboxes by 10 pm",
          source: "Same report [E]",
          position: 91.67,
          tone: "gold",
        },
      ],
      caveat:
        "Pair type: prevalence plus persistence. Both figures come from Microsoft 365 signals to 15 Feb 2025 and exclude education and EU tenants. They describe a global workforce, not India.",
    },
  },
  {
    id: "empathize-funnel",
    type: "custom",
    component: "FiltrationFunnel",
    title: "Filtration funnel: where an intention gets lost",
    data: {
      intro:
        "An intention passes through eight hand-offs before it becomes finished work. This is a behavioral model, not a measured conversion funnel.",
      steps: [
        {
          n: "1",
          handoff: "Intent to capture",
          leak: "A request in chat never becomes a task",
          evidence: "H",
        },
        {
          n: "2",
          handoff: "Capture to clarify",
          leak: "Inboxes fill faster than they're processed",
          evidence: "H",
        },
        {
          n: "3",
          handoff: "Clarify to prioritize",
          leak: "The newest request outranks the important one",
          evidence: "H",
        },
        {
          n: "4",
          handoff: "Prioritize to time",
          leak: "The list is longer than the free hours",
          evidence: "H",
          evidenceDetail: "worked arithmetic on Page 4",
        },
        {
          n: "5",
          handoff: "Time to protection",
          leak: "Meetings and pings override the block",
          evidence: "E",
          evidenceDetail: "2-minute ping gap for the top 20% of users",
        },
        {
          n: "6",
          handoff: "Protection to start",
          leak: "The next step is unclear, so people retreat to tidying",
          evidence: "P",
          evidenceDetail: "quote below",
        },
        {
          n: "7",
          handoff: "Start to finish",
          leak: "App switching costs about 1,200 toggles a day",
          evidence: "E",
          evidenceDetail: "HBR",
        },
        {
          n: "8",
          handoff: "Finish to close",
          leak: "Open loops carry into the evening",
          evidence: "E",
          evidenceDetail: "Leroy (title only)",
        },
      ],
      widening:
        "Intersectional widening (a recruitment hypothesis). Four groups probably feel this harder: people in India and US overlap roles (30% of meetings now span time zones, Phase 1); people whose exercise, study or caregiving competes for the same hours; early-career workers building their first system; and heavy tool users with no single source of truth.",
    },
  },
  {
    id: "empathize-scripts",
    type: "custom",
    component: "CulturalScripts",
    title: "Three cultural scripts",
    data: {
      scripts: [
        {
          n: "1",
          title: "Responsiveness outranks intention",
          body:
            "76% of Indian workers say they lack the time and energy to get work done, and 78% lack uninterrupted focus. 46% say their absence from half or more of their meetings would go unnoticed, which suggests part of the calendar could bend if the user could tell which part [E, stated attitudes]. Source: Microsoft India, 1 Jun 2023.",
          tag: "[E, stated attitudes]",
        },
        {
          n: "2",
          title: "The setup becomes the project",
          quote: {
            text:
              "My goodness there are so so SO many of these productivity apps. Even in the comments here, there are multiple people saying they too are building their own productivity tools.",
            attribution: "Hacker News commenter",
            date: "13 Nov 2022",
            href: "https://news.ycombinator.com/item?id=33585501",
          },
        },
        {
          n: "3",
          title: "AI is welcome, authority is unsettled",
          body:
            "92% of Indian knowledge workers use AI at work. 83% would delegate as much work as possible to it, yet 74% worry it will replace their jobs (Microsoft India 2023 and Microsoft/LinkedIn 2024) [E]. Use and delegation are stated attitudes. None of these figures says people will let AI move their own calendar.",
          tag: "[E]",
        },
      ],
    },
  },
  {
    id: "empathize-services",
    type: "custom",
    component: "ServicesAudit",
    title: "Existing services audit",
    data: {
      intro:
        "We read each vendor's own pages on 11 Oct 2026. Pages show what is offered, not how it feels to use, and silence on a page is weak evidence of absence.",
      services: [
        {
          name: "Sunsama",
          tag: "deep dive",
          documented:
            'Five-step planning ritual: Process, Plan, Prioritize, Prepare, Publish. Task projections "spot overload before it happens." A task placed by hand locks in and the others "auto-adjust" around it.',
          gap:
            "The page describes no shutdown steps. Overload shows as a preview, not a named warning.",
        },
        {
          name: "Motion",
          documented:
            '"Automatically re-plans your day whenever something comes up." "Flags when you\'ve scheduled more than you can handle"',
          gap:
            "Says nothing on explaining why a task moved, and mentions no manual lock or pin",
        },
        {
          name: "Akiflow",
          documented:
            'Daily planning and shutdown rituals; lock time; a "replan undone tasks" button; an inbox that imports from "3000+ tools"',
          gap: "The AI assistant, Aki, carries a Beta label. No claim about explaining a move",
        },
        {
          name: "Todoist",
          documented:
            'Calendar events beside tasks; time-block layout',
          gap:
            'Events are read-only and can\'t become tasks ("no plans"); one calendar provider at a time; the layout needs Pro',
        },
        {
          name: "TickTick",
          documented: "Six calendar views, habit statistics, Pomodoro, Eisenhower matrix",
          gap:
            "Doesn't name time blocking and mentions no AI or auto-scheduling",
        },
        {
          name: "Reclaim",
          documented: "Habits, task time-blocking, focus-time defense, free tier (pricing page only)",
          gap: "We didn't read its feature pages",
        },
      ],
      gapClaim:
        "The gap claim. Of the six, three document some form of re-planning (Motion, Akiflow, Sunsama's auto-adjust). None of the five feature pages we read says it explains why something moved. That is the thin spot we carry forward, and a hands-on trial would have to confirm it [H]. The six were hand-picked, so this isn't a market sample.",
      policiesGap:
        "Other policies and services. We didn't scan India-specific data-protection rules or employer calendar-access policies. That is a stated gap, and the manager and IT slots on Page 2 mark where it matters.",
    },
  },
  {
    id: "empathize-stakeholders",
    type: "custom",
    component: "StakeholderRings",
    title: "Who all is involved",
    data: {
      intro: "Most of the plan sits with other people. The user controls a small slice of it.",
      rings: [
        {
          name: "Core",
          who: "The user, manager, teammates, meeting organizers, partner or household, the user's future self",
          line: "They move meetings, add work, and inherit whatever gets deferred",
          tone: "core",
        },
        {
          name: "Involved",
          who: "Clients, cross-functional teams, calendar providers, chat and email systems, org task systems, AI assistants, the notification layer, device reminders, health and fitness routines",
          line: "They create, move or interrupt commitments",
          tone: "involved",
        },
        {
          name: "Informed",
          who: "Employer IT and security, data-protection expectations, app marketplaces, productivity writers and forums, API providers, shared family calendars",
          line: "They never touch the plan but decide what tools may see",
          tone: "informed",
        },
      ],
    },
  },
  {
    id: "empathize-voices",
    type: "custom",
    component: "PublicVoices",
    title: "What our stakeholders said",
    data: {
      intro:
        "Real public voices only, retrieved 11 Oct 2026 and checked against the original thread. Each is a single comment, not a representative view.",
      quotes: [
        {
          role: "Tool user",
          verbatim:
            "if something isn't either obviously urgent or scheduled on a calendar, it never gets done.",
          date: "13 Mar 2017",
          href: "https://news.ycombinator.com/item?id=13856322",
        },
        {
          role: "Team lead",
          verbatim:
            "I put \u201cfocus time\u201d after lunch to end of day to force all of the meetings into the morning. Unfortunately project managers still put time in my calendar as as a lead it\u2019s harder to say no.",
          date: "23 Jun 2023",
          href: "https://news.ycombinator.com/item?id=36453185",
          highlight: true,
        },
        {
          role: "Tool builder",
          verbatim:
            "too many productivity apps (todos, calendar, recipes, shopping, budget, etc), no integrations",
          date: "23 Dec 2021",
          href: "https://news.ycombinator.com/item?id=29664239",
          caveat: "The commenter promotes their own product, so this isn't independent",
        },
        {
          role: "Tool user",
          verbatim: "so so SO many of these productivity apps",
          date: "13 Nov 2022",
          href: "https://news.ycombinator.com/item?id=33585501",
        },
      ],
      slots: [
        {
          role: "Partner or household",
          question: "which shared commitments matter, and which work details stay private?",
        },
        {
          role: "IT and security",
          question: "what permissions would calendar and AI access need?",
        },
      ],
      triangulation:
        "Triangulation fails today. Four voices come from three roles, and Hacker News likely skews technical. Commenters don't state where they live, so we can't say any speaks for India. Two roles are empty slots.",
      teamLeadNote:
        "The team lead's comment matters most for our scope. A person with authority over a calendar still can't defend it, which means a personal planning tool must plan around other people's choices.",
    },
  },
  {
    id: "empathize-problem-map",
    type: "custom",
    component: "ProblemMap",
    title: "Problem mapping",
    data: {
      intro:
        "Every branch traces back to one question: why does my plan stop matching my day? Evidence tags show which branches rest on a source and which are our reasoning.",
      centralQuestion: "why does my plan stop matching my day?",
      branches: [
        {
          letter: "A",
          title: "Capture fragmentation",
          subIssues:
            "Work arrives by chat, email, meetings and memory; duplicates across tools; source context lost on copy; items lack a next action; capture happens in the wrong app; inbox grows unseen",
          evidence: "H",
        },
        {
          letter: "B",
          title: "Priority ambiguity",
          subIssues:
            "Urgent beats important; the newest request wins; routines drop before visible meetings; labels ignore calendar reality; priorities stay in people's heads; no way to mark what's firm",
          evidence: "H",
        },
        {
          letter: "C",
          title: "Capacity blindness",
          subIssues:
            "The list has no tie to free hours; estimates run optimistic; meetings eat peak-focus windows; overcommitment shows late; free time sits in small gaps; transitions cost time nobody counts",
          evidence: "H",
        },
        {
          letter: "D",
          title: "Execution friction",
          subIssues:
            "App switching breaks context; setup delays starting; unfinished tasks leave residue; no single next action; the timer lives apart from the task; notes live elsewhere",
          evidence: "E",
          evidenceDetail: "HBR: ~1,200 toggles a day",
        },
        {
          letter: "E",
          title: "Re-planning burden",
          subIssues:
            "One meeting change breaks several blocks; dragging becomes calendar Tetris; automatic re-plans can feel controlling; no stated reason for a move; undo is missing or unclear; the user can't tell safe moves from risky ones",
          evidence: "E",
          evidenceDetail: "Motion, Akiflow and Sunsama document re-planning, none explains moves",
        },
        {
          letter: "F",
          title: "System sustainability",
          subIssues:
            "Feature noise; streak guilt; tags and statuses become admin; integrations add supervision; novelty fades and use drops; the system must be kept current to stay useful",
          evidence: "P",
          evidenceDetail: "quotes above",
        },
      ],
      newInsight:
        "Fragmentation also happens inside a single app, so the unit worth counting is the number of decisions and translations between intention and action [H].",
    },
  },
  {
    id: "empathize-experience-map",
    type: "custom",
    component: "ExperienceMap",
    title: "Experience map: a day in the life",
    data: {
      intro: "A synthetic composite built from the sources above, not a record of observed users.",
      stages: ["Start", "Commit", "Execute", "Disrupt", "Recover", "Close"],
      lanes: [
        {
          label: "Actions",
          cells: [
            "Scan chat, calendar and overdue items",
            "Pick tasks, estimate, block time",
            "Work the top task with a timer on",
            "A meeting overruns; a request lands",
            "Move or drop tasks; skip the habit",
            "Review done against open; eyeball tomorrow",
          ],
        },
        {
          label: "Emotions",
          type: "emotion",
          cells: ["Hopeful", "Confident", "Fragile focus", "Pressured", "Overloaded", "Mixed relief"],
        },
        {
          label: "Thoughts",
          type: "thought",
          cells: [
            "What actually matters today?",
            "This looks doable.",
            "Stay with this.",
            "This no longer fits.",
            "What can I safely move?",
            "Did I make progress?",
          ],
        },
        {
          label: "Pain points",
          type: "pain",
          cells: [
            "Several sources of truth",
            "Estimating is admin",
            "Pings and app switches",
            "Re-plan cost",
            "Rebuild by hand or give up",
            "Open loops reach the evening",
          ],
        },
        {
          label: "Evidence",
          type: "evidence",
          cells: ["[H]", "[H]", "[E] pings", "[E] residue", "[H]", "[E] residue"],
        },
      ],
      bodystorming:
        "Bodystorming: not conducted. A real session would recreate a recent \u201cmy plan broke at 2 PM\u201d episode with the person\u2019s own tools open. The facilitator adds one interruption at a time and watches which screen the person opens first.",
      arithmetic: {
        label: "Worked arithmetic [S]",
        text:
          "Say 3.5 free hours is 210 minutes. Four tasks (240 minutes) plus a 30-minute workout make 270, so the plan starts 60 minutes over. A 30-minute meeting that runs to 75 adds 45 more, and the gap becomes 105.",
        insight:
          "A to-do list hides this. A calendar shows the meeting but not task importance. A silent auto-scheduler moves work without teaching the user why. The three needs that follow are a constraint, a consequence and a choice.",
      },
    },
  },
  {
    id: "empathize-two-worlds",
    type: "custom",
    component: "TwoWorlds",
    title: "Two different worlds",
    data: {
      axis: "control-seeking planner versus assistance-seeking executor",
      caveat:
        "Both are [S] composites with fictional names, drawn from a dry run of the Phase 1 interview guide (05-simulated-interviews.md).",
      personas: [
        {
          name: "Ananya",
          archetype: "the Deliberate Planner",
          tint: "warm",
          fields: [
            { label: "Role", value: "Product designer, hybrid team" },
            { label: "Top goal", value: "Know what fits before committing" },
            {
              label: "Wants from tech",
              value: "Less admin, no invisible decisions",
            },
            {
              label: "Typical day",
              value: "Plans in the morning, patches by hand when it breaks",
            },
            {
              label: "Pains",
              value:
                "Manual re-planning after meetings move; duplicate lists; distrusts schedulers that move work unexplained",
            },
            {
              label: "Statement to test",
              value: "Wants a better plan surfaced and the final say on what moves",
            },
          ],
        },
        {
          name: "Rohan",
          archetype: "the Adaptive Executor",
          tint: "cool",
          fields: [
            {
              label: "Role",
              value: "Software engineer across India and US time zones",
            },
            { label: "Top goal", value: "Always know the next useful action" },
            {
              label: "Wants from tech",
              value: "Routines inferred over time; comfortable with AI",
            },
            {
              label: "Typical day",
              value: "Often has no morning plan; loses a task for days in a stale tab",
            },
            {
              label: "Pains",
              value:
                "Forgets to update plans; routines vanish when work grows; hates metadata-heavy setup",
            },
            {
              label: "Statement to test",
              value: "Values constant orientation over a detailed system",
            },
          ],
        },
      ],
      meera: {
        label: "A comparison group, not a persona",
        body:
          "Meera, a satisfied minimalist with a calendar and one short list, reports no problem. She reminds us the pain may not reach everyone, and real recruiting must include people like her [S].",
      },
    },
  },
  {
    id: "empathize-discoveries",
    type: "stats",
    eyebrow: "Three figures new in this phase",
    title: "Discoveries",
    description:
      "Pair type: share of the week plus the heavy tail. All three describe Microsoft 365 users worldwide, not India.",
    items: [
      {
        id: "d-57",
        value: "57%",
        label:
          "Share of the average employee\u2019s time spent communicating (meetings, email, chat), against 43% creating",
        context: "Microsoft Work Trend Index, 9 May 2023 [E]",
      },
      {
        id: "d-58",
        value: "58",
        label:
          "Messages arriving per user before or after hours. The report\u2019s body says \u201cmore than 50\u201d sent or received",
        context: "Microsoft, 17 Jun 2025, methodology section [E]",
      },
      {
        id: "d-88",
        value: "8.8 / 7.5 hrs",
        label:
          "Weekly hours the top quarter of email users spend on email, and the top quarter of meeting users spend in meetings",
        context: "Microsoft Work Trend Index, 9 May 2023 [E]",
      },
    ],
  },
  {
    id: "empathize-assumptions",
    type: "custom",
    component: "AssumptionsChallenged",
    title: "Assumptions challenged",
    data: {
      intro:
        "We say \u201cchallenged,\u201d not \u201cinvalidated,\u201d because we hold no primary data.",
      rows: [
        {
          assumed: "Fewer apps means less overwhelm",
          found:
            "Integration adds its own supervision: Todoist events are read-only and limited to one provider, and one commenter solved it with a calendar alone [E][P]",
          status: "Challenged",
        },
        {
          assumed: "The main pain is capturing tasks",
          found:
            "Capture is a commodity, with Akiflow importing from \u201c3000+ tools.\u201d The stall comes after capture, when the next step is unclear [E][P]",
          status: "Revised",
        },
        {
          assumed: "Better AI means more automation",
          found:
            "Automation already ships (Motion \u201creshuffles your entire day\u201d). Indian workers both want to delegate (83%) and fear replacement (74%). The open space is changes that are explained and reversible [E][H]",
          status: "Revised",
        },
        {
          assumed: "Everyone starts the day with a plan",
          found:
            "A synthetic persona often doesn\u2019t, and loses tasks instead. If real interviews confirm it, \u201cre-planning\u201d covers only part of the audience [S][H]",
          status: "Challenged",
        },
      ],
    },
  },
  {
    id: "empathize-scope",
    type: "text",
    eyebrow: "Scope re-affirmation",
    body: [
      "We can\u2019t change meeting culture, a manager\u2019s behavior, message volume or a household\u2019s needs. Our scope stays the same: help one person make, protect and recover a realistic day across tasks, time, routines and focus, with less mental effort.",
    ],
  },
  {
    id: "empathize-appendix",
    type: "custom",
    component: "Phase2Appendix",
    eyebrow: "Sources and method",
    title: "Phase 2 self-audit and project state",
    data: {
      summaryLabel: "Self-audit, SUCCESs and project state \u00b7 Phase 2",
      primaryResearch: {
        title: "Next: primary research (needed before Phase 3 can claim anything)",
        who:
          "8 to 12 target users (3 manual planners, 3 AI-positive, some who left an all-in-one tool, some happy with theirs), plus a manager, a partner and an IT contact.",
        how:
          "a 45-minute interview with tools open, a three-day diary, and a 30-minute \u201cplan broke\u201d reconstruction.",
        measure:
          "tools touched while planning, minutes to a realistic plan, manual mid-day edits, trust after an AI suggestion.",
      },
      selfAudit: {
        title: "Self-Audit Scores",
        weakest:
          "Weakest dimension: Empathic Granularity. Six to ten screen-share interviews would lift it most.",
        rows: [
          {
            dimension: "AI-Likeness",
            score: "3/10",
            justification:
              "Specific mechanisms, dated sources and visible uncertainty; a few tables read formulaic",
          },
          {
            dimension: "Ecosystem Breadth",
            score: "7/10",
            justification:
              "Funnel, scripts, six-service audit, 21 stakeholders, 36 sub-issues; no India policy scan",
          },
          {
            dimension: "Empathic Granularity",
            score: "4/10",
            justification:
              "Four real voices from three roles, none from India; no fieldwork; the experience map is synthetic",
          },
          {
            dimension: "Persona Contrast and Humility",
            score: "6/10",
            justification:
              "A sharp control-versus-assistance axis and four honest revisions, but both personas are synthetic",
          },
        ],
      },
      success: {
        title: "SUCCESs check",
        rows: [
          { principle: "Simple", where: "One finding line; each section opens on one point" },
          {
            principle: "Unexpected",
            where:
              "A team lead can\u2019t defend his own calendar; the gap is explanation, not features",
          },
          {
            principle: "Concrete",
            where: "Named services, exact percentages, a 210-minute worked example",
          },
          {
            principle: "Credible",
            where:
              "Every figure carries source, date and tag; the audit says what pages can\u2019t show",
          },
          { principle: "Emotional", where: "The 2 PM \u201cthis no longer fits\u201d moment" },
          {
            principle: "Story",
            where: "One composite day, and two people who split on who decides",
          },
        ],
      },
      projectState: {
        title: "Project State, Phase 2 complete",
        items: [
          "HMW / target user / geography / team: unchanged from the checkpoint above.",
          "Framework: Cognitive Load, Time Control, Focus, Trust and Agency (primary); Follow-through, Wellbeing (ripple).",
          "Problem branches: capture, priority, capacity, execution, re-planning, sustainability (36 sub-issues).",
          "Personas: Deliberate Planner and Adaptive Executor [S], plus a satisfied-minimalist comparison.",
          "Service insight: re-planning documented in 3 of 6 services; explanation of a move on 0 of the 5 feature pages read (Reclaim\u2019s feature pages unread).",
          "Continuity note: no primary research; two stakeholder slots empty; the synthetic run suggests some users never plan in the morning.",
        ],
      },
    },
  },
];
