// src/case-study/products/life-os/discover.ts
//
// Phase 1 content — sourced verbatim from
// public/case-study/life-os/01-discovery-brief.md (read 11 Oct 2026).
// Do not strengthen claims; keep [E]/[P]/[S]/[H] semantics.

import type { Section } from "../../engine/types";
import type { PhaseHeroProps } from "../../shell/PhaseHero";

export const discoverHero: PhaseHeroProps = {
  eyebrow: "Phase 1 · Discover",
  title: "When the day changes faster than the tools can follow",
  lead: "Finding in one line: the day changes faster than three or four tools can be reconciled, and every change adds work.",
  status: [
    "Desk research + synthetic dry run",
    "We have interviewed no one",
    "Figures re-read 11 Oct 2026",
  ],
  legend:
    "Tags used throughout: [E] verified source · [P] public signal · [S] synthetic · [H] hypothesis.",
};

export const discoverSections: Section[] = [
  {
    id: "discover-hmw",
    type: "insight",
    eyebrow: "How might we",
    text: "How might we help self-managing knowledge workers in India turn scattered work and personal commitments into a realistic, adaptable daily plan that remains calm enough to use throughout the day?",
    description: "Status, 11 Oct 2026 (India time).",
  },
  {
    id: "discover-three-numbers",
    type: "custom",
    component: "ThreeNumbersBand",
    data: {
      numbers: [
        {
          value: "~1,200",
          caption: "App or website toggles per user, per day",
          source: "HBR, 137 users, 2022",
        },
        {
          value: "~4 hrs a week",
          caption: "Spent reorienting after those toggles",
          source: "Same study",
        },
        {
          value: "78%",
          caption: "Of Indian workers lack uninterrupted focus",
          source: "Microsoft India, 1 Jun 2023",
        },
      ],
    },
  },
  {
    id: "discover-introduction",
    type: "text",
    eyebrow: "Introduction",
    body: [
      "We started with a builder's question: why do people who own several good tools still rebuild their day by hand? We read three years of Microsoft Work Trend Index data, re-read the HBR app-toggling study, traced three academic sources, and ran one synthetic dry run to test our interview questions. We interviewed no one.",
      "Our objective is to design a daily-planning approach that addresses the reconciliation burden of self-managing knowledge workers in India and improves how calmly they move through a day. The builder's existing product stays out of Phases 1 to 3.",
    ],
  },
  {
    id: "discover-global-scenario",
    type: "custom",
    component: "FragmentationSplit",
    eyebrow: "The global scenario",
    title: "Work is fragmented before the app opens",
    data: {
      intro: [
        "Work software has never been richer. Chat, meetings, documents, calendars, task apps and AI assistants all sit one click apart.",
        "The people using them describe something else. In Microsoft's 2025 survey, 48% of employees and 52% of leaders said their work feels chaotic and fragmented [E]. The same report found that the top 20% of users by ping volume get a meeting, email or chat ping about every two minutes in an eight-hour day. That is a high-volume cohort, not every worker.",
      ],
      external: [
        "Meetings interrupt planned work",
        "Chat and email create reactive queues",
        "Calendar and task priority live in different systems",
        "Work arrives through many channels",
        "Notifications reopen settled choices",
      ],
      internal: [
        "A backlog isn't a realistic plan",
        "Habits and routines compete with work",
        "Focus sessions sit apart from the task plan",
        "People re-prioritize after every disruption",
        "Keeping the system current becomes work",
      ],
      stats: [
        {
          value: "68%",
          label:
            "of people say they don't have enough uninterrupted focus time during the workday.",
          source: "Microsoft Work Trend Index, 9 May 2023; 31,000 people in 31 countries [E]",
        },
        {
          value: "~1,200",
          label: "toggles per user per day.",
          detail:
            "HBR (Murty, Dadlani and Das): 20 teams, 137 users, three Fortune 500 companies, up to five weeks. Each switch cost a little over two seconds, adding up to just under four hours a week, about 9% of annual work time [E].",
          source: "HBR, 2022",
        },
      ],
      chain: ["chat", "task app", "calendar", "focus timer", "routine log", "review"],
      chainCaption: "One task changing hands",
      caveat:
        "Pair type: prevalence plus cause. The HBR sample is enterprise staff outside India, and it measures toggling, not personal planning.",
    },
  },
  {
    id: "discover-indian-perspective",
    type: "custom",
    component: "BeliefBehaviorSplit",
    title: "The Indian perspective: high AI use, high strain",
    data: {
      intro:
        "Indian knowledge workers report more AI use and more strain than the global sample at the same time. We don't read that as a failure. High adoption means the appetite for help already exists.",
      belief: {
        value: "83%",
        label: "would delegate as much work as possible to AI to lessen their workloads",
        source: "Microsoft India",
        year: "1 Jun 2023",
      },
      behavior: {
        value: "92%",
        label: "use AI at work, against 75% globally",
        source: "Microsoft and LinkedIn · 31,000 respondents, 31 countries",
        year: "16 May 2024",
      },
      caveat:
        "Pair type: belief plus behavior. The pairing suggests openness to AI help is already common. It doesn't show that people will let AI move their own calendar. The surveys sit a year apart and cover different people, and the India release gives no India-only sample size.",
    },
  },
  {
    id: "discover-impact-worker",
    type: "custom",
    component: "TranslationLoop",
    title: "Impact on the self-managing worker",
    data: {
      pair: [
        {
          value: "78%",
          label: "of Indian workers lack uninterrupted focus, against 68% globally.",
          note: "Both come from the 2023 Work Trend Index [E]",
        },
        {
          value: "76%",
          label: "say they lack the time and energy to get their work done",
          note: "Microsoft India, 1 Jun 2023 [E]",
        },
      ],
      pairType: "Pair type: disparity plus severity.",
      narrowing:
        "We narrow to people who set their own priorities, receive work from several channels, and keep a flexible or hybrid calendar. Their life moment is the shift from being handed a plan to owning one.",
      framingNote:
        "Our HMW names a role plus a working phase. A tighter life-phase wording is available, such as early-to-mid career people whose calendar became their own. We kept the broader framing by choice (decision D1, end of this file).",
      loopLabel: "The translation loop (conceptual, not measured)",
      loopSteps: ["Capture", "Prioritize", "Schedule", "Execute", "Recover", "Re-plan"],
      loopNote: "Our hypothesis is that the last two steps cost more than the first [H].",
      bars: [
        {
          label: "Indian workers lacking uninterrupted focus",
          value: 78,
          caption: "78%",
        },
        {
          label: "Global sample lacking uninterrupted focus",
          value: 68,
          caption: "68%",
        },
      ],
      gapLabel:
        "Gap: 10 points between the India and global samples. Both figures come from the 2023 Work Trend Index [E].",
    },
  },
  {
    id: "discover-signals",
    type: "custom",
    component: "SignalsWall",
    title: "Signals, not interviews",
    data: {
      intro:
        "Three kinds of evidence stand in for interviews: telemetry and surveys (Microsoft, HBR), public voices (Hacker News commenters), and a synthetic dry run with three invented personas. We recruited no participant.",
      legend: [
        {
          kind: "[P]",
          text: "public signal: one Hacker News comment, not a representative view",
        },
        {
          kind: "[S]",
          text: "synthetic: invented personas answering our guide; hypotheses only, never evidence",
        },
      ],
      signals: [
        {
          title: "Operational signal: switching tax",
          body:
            "Roughly 1,200 toggles a day at a little over two seconds each is a cost nobody sees on a calendar [E].",
          icon: "switch",
        },
        {
          title: "Relational signal: other people's calendars",
          body:
            "30% of meetings now span multiple time zones, and meetings starting after 8 pm are up 16% year on year (Microsoft, 17 Jun 2025; the report's body says \u201cnearly a third\u201d) [E].",
          icon: "clock",
        },
        {
          title: "Emotional signal: the pseudoproductive retreat",
          body:
            "A Hacker News commenter describes defaulting to pseudoproductive work when the next step is unclear. Quoted below.",
          icon: "chat",
        },
      ],
      quote: {
        text:
          "If my next steps/actions are unclear, it's easier to just take a break or default to doing something pseudoproductive (e.g. organizing my calendar, todo list) rather than take on a meaningful new project.",
        attribution: "Hacker News commenter, tool user",
        date: "3 Jan 2021",
        href: "https://news.ycombinator.com/item?id=25623395",
      },
      meetingNote:
        "Meeting organizers and managers set much of the calendar, and we have no verbatim from one yet. Microsoft's India data hints that part of that calendar bends: 46% of Indian workers say their absence from half or more of their meetings would go unnoticed [E, stated view].",
      secondQuote: {
        text:
          "After trying various todo lists and kanban boards I finally settled on using my google calendar which works perfectly as both my todo list and scheduler",
        attribution: "Hacker News commenter, tool user",
        date: "8 Feb 2016",
        href: "https://news.ycombinator.com/item?id=11061933",
        caption:
          "Consolidation is optional, and a satisfied minimalist is a real comparison group.",
      },
      syntheticLabel:
        "Synthetic dry run [S], hypotheses only. Three invented personas answered our interview guide. We use it to fix the guide, never as evidence.",
      dryRun: [
        {
          question: "What happens when the day changes at 2 PM?",
          pattern: "The plan goes stale and the user patches it by hand",
          hypothesis: "Re-planning is the failure moment",
        },
        {
          question: "Would you let AI rearrange your day?",
          pattern: "Yes if it shows what moved, why, and offers undo",
          hypothesis: "Advisory beats silent",
        },
        {
          question: "Where do habits live?",
          pattern: "Outside the work calendar, dropped first",
          hypothesis: "Routines lose to visible meetings",
        },
        {
          question: "Do you plan most mornings?",
          pattern: "One persona never does and loses tasks for days",
          hypothesis: "Two problems may sit under one HMW",
        },
      ],
    },
  },
  {
    id: "discover-emotional-arc",
    type: "custom",
    component: "EmotionArc",
    title: "Emotional arc: a day that starts intentional and turns reactive",
    data: {
      caption:
        "one weekday, first check to last, for a knowledge worker who plans in the morning. Scope: one plausible path, not a universal one.",
      stages: [
        {
          n: "1",
          name: "Morning setup",
          touchpoints:
            "Reviews inbox, calendar and overdue work; picks two priorities",
          feeling: "Hopeful, in control",
          color: "hopeful",
        },
        {
          n: "2",
          name: "First focus block",
          touchpoints:
            "Starts the top task; a chat request lands; opens another app to capture it",
          feeling: "Focused but fragile",
          color: "focused",
        },
        {
          n: "3",
          name: "Midday squeeze",
          touchpoints:
            "A meeting overruns; planned tasks no longer fit; the personal routine slips first",
          feeling: "Pressured",
          color: "pressured",
        },
        {
          n: "4",
          name: "Afternoon re-plan",
          touchpoints:
            "Drags blocks between list and calendar; stops updating the plan accurately",
          feeling: "Overloaded",
          color: "overloaded",
        },
        {
          n: "5",
          name: "Evening close",
          touchpoints: "Some real work done; open items with no next slot",
          feeling: "Relief mixed with unfinished",
          color: "relief",
        },
      ],
      curveShape:
        "a descending zigzag with a partial recovery at shutdown. Small wins happen all day. Each unplanned change adds a coordination cost, and the costs pile up.",
      scene: {
        label: "Synthetic scene [S]",
        text:
          "At 2 PM a meeting runs 45 minutes over and three afternoon blocks no longer fit. The user drags tasks between a list and a calendar for about 15 minutes and still isn't sure the new plan is better. The 15 minutes is invented.",
      },
      research: {
        text:
          "Leroy (2009) studied attention residue when switching between work tasks [E; title and venue confirmed, abstract not retrieved]. If the residue effect holds for daily planning, cleaner transitions and a clear close would matter as much as faster task entry [H].",
      },
      scopeDisclaimer: "One plausible weekday, not a universal journey.",
    },
  },
  {
    id: "discover-impact-framework",
    type: "custom",
    component: "ImpactRadar",
    title: "Impact framework: what a calmer day should improve",
    data: {
      intro:
        "We focus on the four primary dimensions. If users spend less effort maintaining the system and keep control of how the day changes, we would expect follow-through and wellbeing to improve as a ripple effect. We don't measure either here.",
      planningNote:
        "Gollwitzer and Sheeran (2006) found a medium-to-large effect of if-then plans on goal attainment across 94 tests (d = .65) [E]. Sheeran, Listrom and Gollwitzer (2024) found effects across 642 tests (.27 to .66), larger when plans had an if-then format [E]. Calendar blocking isn't an if-then plan, and neither effect size predicts a product result.",
      scopeNote:
        "Ripple dimensions (Follow-through, Wellbeing) are not measured in this phase.",
    },
  },
  {
    id: "discover-opportunities",
    type: "custom",
    component: "OpportunityBranches",
    title: "Opportunities identified: directions, not solutions",
    data: {
      hmw:
        "How might we help self-managing knowledge workers in India turn scattered work and personal commitments into a realistic, adaptable daily plan that remains calm enough to use throughout the day?",
      directions: [
        {
          n: "01",
          direction: "Reduce cross-system reconciliation",
          layer: "Infrastructure (tools)",
        },
        {
          n: "02",
          direction: "Reduce recovery effort after a disruption",
          layer: "Practice (personal routine)",
        },
        {
          n: "03",
          direction: "Preserve attention and agency",
          layer: "Norms (how automation treats people)",
        },
      ],
      caption:
        "The usual policy, community and infrastructure layers suit a social-care topic. We adapted them to tools, practice and norms for a personal-productivity topic.",
    },
  },
  {
    id: "discover-problem-statement",
    type: "custom",
    component: "ProblemClose",
    title: "Problem statement and expected impact",
    data: {
      hmw:
        "How might we help self-managing knowledge workers in India turn scattered work and personal commitments into a realistic, adaptable daily plan that remains calm enough to use throughout the day?",
      whyNow:
        "Tools are adding automation and integrations faster than people learn to trust them. India pairs 92% AI use with 78% reporting focus scarcity [E]. The opening is a single, understandable daily decision loop.",
      ripple: [
        { level: "Individual", ifAnswered: "Less effort deciding what to do next" },
        {
          level: "Immediate relational",
          ifAnswered:
            "Fewer missed or conflicting commitments with teammates and household",
        },
        {
          level: "Work and personal system",
          ifAnswered: "Better follow-through on priority work and on routines",
        },
        {
          level: "Society and market",
          ifAnswered:
            "Automation that recommends and explains instead of acting silently",
        },
      ],
      byline: "Researched and written by Divy Sharma, solo.",
    },
  },
  {
    id: "discover-appendix",
    type: "custom",
    component: "PhaseAppendix",
    eyebrow: "Sources and method",
    title: "Phase 1 sources, method and self-audit",
    data: {
      summaryLabel: "Sources, method and self-audit · Phase 1",
      interview: {
        title: "Interview guide for the next phase (6 to 10 participants)",
        questions: [
          "Walk me through yesterday, from first work check to last.",
          "Which apps did you use to capture, plan, schedule, focus and reflect?",
          "Show me the last time a task became a calendar slot or a work session.",
          "When the day changes, what do you drop first, and why?",
          "Which parts of your system do you maintain only because another tool requires it?",
          "When did an automation or AI suggestion feel useful? When did it feel wrong?",
          "What would you never want an assistant to infer or change on its own?",
          "When did you last lose a task for more than a day? What happened?",
          "Which commitments exist only in your head, not on any calendar or list?",
        ],
        recruit:
          "Recruit: people using at least two of task manager, calendar, habit tracker, focus timer and AI assistant. Screen with \u201cDo you plan your day most mornings?\u201d and recruit both yes and no. Include satisfied calendar-only users and both manual and auto-schedule fans.",
        note:
          "Questions 8, 9 and the screen came from the dry run. They fix the guide and prove nothing.",
      },
      evidence: {
        title: "Evidence register (all re-read 11 Oct 2026)",
        note: "Two Reddit threads from the earlier draft were dropped. The site blocked a re-fetch.",
        rows: [
          {
            id: "E1",
            sourceText:
              "Microsoft WTI global, 9 May 2023; 31,000 people, 31 countries, fieldwork 1 Feb to 14 Mar 2023",
            href: "https://www.microsoft.com/en-us/worklab/work-trend-index/will-ai-fix-work",
            verified: "68% lack uninterrupted focus",
            doesntEstablish: "Demand for a personal planner",
          },
          {
            id: "E2",
            sourceText: "Microsoft India WTI, 1 Jun 2023",
            href: "https://news.microsoft.com/en-in/microsoft-work-trend-index-2023-releases-new-insights-on-how-ai-will-change-the-way-we-work-in-india/",
            verified: "76%, 78%, 46%, 74%, 83%",
            doesntEstablish: "An India-only sample (none given)",
          },
          {
            id: "E3",
            sourceText: "Microsoft and LinkedIn India, 16 May 2024",
            href: "https://news.microsoft.com/en-in/92-of-indian-knowledge-workers-use-ai-in-the-workplace-finds-microsoft-and-linkedin-2024-work-trend-index/",
            verified: "92% against 75%",
            doesntEstablish: "Willingness to share a calendar",
          },
          {
            id: "E4",
            sourceText: "Microsoft infinite workday, 17 Jun 2025; telemetry to 15 Feb 2025",
            href: "https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday",
            verified:
              "48% and 52%; 2-minute ping gap (top 20%); 30% cross-time-zone; +16% after 8 pm",
            doesntEstablish:
              "Every worker's interruption rate; telemetry excludes education and EU tenants",
          },
          {
            id: "E5",
            sourceText:
              "Murty, Dadlani and Das, HBR (authors' republished text, 15 Oct 2022; hbr.org shows 29 Aug 2022)",
            href: "https://www.physicianleaders.org/articles/how-much-time-and-energy-do-we-waste-toggling-between-applications",
            verified:
              "20 teams, 137 users, ~1,200 toggles, just under 4 hrs a week, 9%",
            doesntEstablish: "Hours a personal tool would save",
          },
          {
            id: "E6",
            sourceText: "Leroy, 2009",
            href: "https://doi.org/10.1016/j.obhdp.2009.04.002",
            verified: "Title and venue only",
            doesntEstablish: "Any planning outcome",
          },
          {
            id: "E7",
            sourceText: "Gollwitzer and Sheeran, 2006; Sheeran et al., 2024",
            href: "https://doi.org/10.1016/S0065-2601(06)38002-1",
            verified: "94 tests, d = .65; 642 tests, .27 to .66 (abstracts read)",
            doesntEstablish: "An equal effect from scheduling or AI planning",
          },
          {
            id: "E8",
            sourceText: "Hacker News comments 25623395, 11061933",
            href: "https://news.ycombinator.com/item?id=25623395",
            verified: "Wording matches the thread",
            doesntEstablish: "Prevalence, identity, geography",
          },
        ],
      },
      decisions: {
        title: "Decision log (grill-me run, 11 Oct 2026)",
        rows: [
          {
            n: "D1",
            question: "Narrow to a Cohere-style cohort, or keep the broad India framing?",
            decision: "Keep the broad India framing",
            by: "Divy",
          },
          {
            n: "D2",
            question: "Run real interviews now, or simulate?",
            decision:
              "Simulate with personas now, plan real interviews as the validation stage",
            by: "Divy",
          },
          {
            n: "D3",
            question: "Which problem leads Phase 3?",
            decision:
              "Re-planning after disruption leads; the \u201cno plan, lost thread\u201d problem becomes a constraint. Reversible after real interviews",
            by: "Claude, at Divy's request",
          },
        ],
      },
      selfAudit: {
        title: "Self-Audit Scores",
        weakest: "Weakest dimension: Evidence Rigor. Six real interviews would fix it fastest.",
        rows: [
          {
            dimension: "AI-Likeness",
            score: "3/10",
            justification:
              "First-person plural, specific numbers and a verbatim quote; some table-heavy phrasing remains",
          },
          {
            dimension: "Funnel Discipline",
            score: "9/10",
            justification:
              "Global work, India, self-managing worker, signals, arc, framework, HMW",
          },
          {
            dimension: "Evidence Rigor",
            score: "6/10",
            justification:
              "Every figure re-read and paired, but no India-only sample, no interviews, and Leroy not read past the title",
          },
          {
            dimension: "Synthesis Sharpness",
            score: "7/10",
            justification:
              "Three layered directions and a ripple of four impacts, but the HMW names a role, not a life phase",
          },
        ],
      },
      success: {
        title: "SUCCESs check",
        rows: [
          { principle: "Simple", where: "One finding line under the HMW" },
          { principle: "Unexpected", where: "High AI use and high strain sit together in India" },
          {
            principle: "Concrete",
            where: "~1,200 toggles, 78% against 68%, a 12-touchpoint day",
          },
          {
            principle: "Credible",
            where: "Dates, sample sizes and limits beside every figure; synthetic material fenced off",
          },
          { principle: "Emotional", where: "The 2 PM overrun and the pseudoproductive retreat" },
          { principle: "Story", where: "Five stages from a hopeful morning to an unfinished evening" },
        ],
      },
      projectState: {
        title: "Project State, Phase 1 complete",
        items: [
          "HMW: How might we help self-managing knowledge workers in India turn scattered work and personal commitments into a realistic, adaptable daily plan that remains calm enough to use throughout the day?",
          "Target user: India-based, English-speaking knowledge workers who set their own priorities and keep a flexible or hybrid calendar, coordinating tasks, calendar, routines and focus across several tools.",
          "Geography: India first, with global evidence where India data is missing.",
          "Team: Solo (Divy Sharma).",
          "Framework: six dimensions; primary Cognitive Load, Time Control, Focus, Trust and Agency.",
          "Artifacts: 3-number hero band, two-bucket cluster, belief-behavior and disparity-severity pairs, conceptual funnel, 5-stage arc with 12 touchpoints, 3 directions, interview guide, decision log.",
          "Continuity note: no primary research. The synthetic dry run informs the guide only.",
        ],
      },
    },
  },
];
