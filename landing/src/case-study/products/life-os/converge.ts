// src/case-study/products/life-os/converge.ts
//
// Phase 3 content — sourced verbatim from
// public/case-study/life-os/03-problem-convergence.md (read 11 Oct 2026).
// The chosen problem (22/30, third place) and its weakness are honest.

import type { Section } from "../../engine/types";
import type { PhaseHeroProps } from "../../shell/PhaseHero";

export const convergeHero: PhaseHeroProps = {
  eyebrow: "Phase 3 · Converge",
  title: "Eight problems, one pick, and why it isn't the top scorer",
  lead: "Finding in one line: capacity-aware re-planning after disruption was chosen despite placing third on the scoreboard, because four other problems hang off it and being wrong is cheap.",
  status: [
    "Desk research plus one analyst's judgment",
    "No interviews, no concept tests",
    "Scores are one scorer's calls, not votes",
  ],
  legend:
    "Tags: [E] verified source · [P] public signal · [S] synthetic (never evidence) · [H] hypothesis.",
};

export const convergeSections: Section[] = [
  {
    id: "converge-answer",
    type: "custom",
    component: "ConvergenceAnswer",
    title: "The answer first",
    data: {
      hmw:
        "How might we help self-managing knowledge workers in India turn scattered work and personal commitments into a realistic, adaptable daily plan that remains calm enough to use throughout the day?",
      chosenProblem:
        "capacity-aware re-planning after disruption. When the plan breaks, the user needs to see what still fits and what carries over, without rebuilding the day by hand.",
      scene: {
        label: "Synthetic scene [S]",
        text:
          "A meeting moves, a morning block collapses, and the Deliberate Planner persona shuffles tasks for about 15 minutes, unsure the new plan is better. The 15 minutes is invented, not measured.",
      },
      whyLeads: [
        "Its supporting research is sourced, though indirect: HBR on app toggling, Leroy on attention residue (title only), Microsoft's 76% time-and-energy figure for India. The runner-up, \u201cno plan, so a task gets lost,\u201d rests on the synthetic run alone.",
        "Four other candidates hang off it (section 1.4).",
        "Being wrong is cheap. Real interviews can promote the runner-up later (Page 4).",
      ],
      whereWeak: [
        "It doesn't win the scoreboard: 22 points, third behind execution switching (24) and priority ambiguity (23). It wins under none of the three sensitivity cuts.",
        "The user it fits, someone who already plans, is the user existing tools serve best.",
        "The open ground is narrower than \u201cnobody does this.\u201d Motion, Akiflow and Sunsama document re-planning or overload previews (section 3.2). What none of the five feature pages we read describes is explaining why something moved.",
      ],
    },
  },
  {
    id: "converge-candidates",
    type: "custom",
    component: "CandidatesCriteria",
    title: "Candidates and criteria",
    data: {
      intro: "Eight candidates, each traced to Phase 1 or 2.",
      candidates: [
        { name: "Execution switching", traces: "Phase 2 branch D" },
        { name: "Priority ambiguity", traces: "Phase 2 branch B" },
        {
          name: "Re-planning after disruption",
          traces: "Phase 2 branches C and E, merged",
        },
        { name: "System maintenance", traces: "Phase 2 branch F" },
        { name: "Opaque AI scheduling", traces: "Phase 1 opportunity 3" },
        { name: "Fragmented capture", traces: "Phase 2 branch A" },
        {
          name: "Lost thread (no morning plan)",
          traces: "Phase 2 Adaptive Executor persona [S]",
        },
        {
          name: "Routine and work disconnection",
          traces: "Phase 1 problem cluster",
        },
      ],
      criteria: [
        {
          name: "Evidence",
          five: "Fetched, dated sources speak to it directly",
          one: "Only context, or nothing",
        },
        { name: "Frequency", five: "It plausibly happens daily", one: "Rare" },
        {
          name: "Severity",
          five: "It hurts focus, follow-through or commitments",
          one: "An annoyance",
        },
        {
          name: "Differentiation",
          five: "No vendor page we read claims it",
          one: "Two or more do",
        },
        {
          name: "Connectivity",
          five: "Solving it eases several other candidates",
          one: "Stands alone",
        },
        {
          name: "Agency fit",
          five: "A fix can leave consequential choices with the user",
          one: "A fix needs silent automation",
        },
      ],
    },
  },
  {
    id: "converge-scoring",
    type: "custom",
    component: "ScoringMatrix",
    title: "Problem scoring",
    data: {
      intro: "Scores are one scorer's calls, not votes.",
      criteriaShort: ["Ev", "Fr", "Sv", "Df", "Cn", "Ag"],
      candidates: [
        {
          name: "Execution switching",
          scores: [4, 5, 4, 3, 3, 5],
          total: 24,
          why:
            "HBR logged about 1,200 toggles a day (20 teams, 137 users, three Fortune 500 firms). Enterprise sample, not India",
        },
        {
          name: "Priority ambiguity",
          scores: [2, 5, 4, 3, 4, 5],
          total: 23,
          why: "Daily and consequential. Nothing we fetched measures it",
        },
        {
          name: "Re-planning after disruption",
          scores: [3, 4, 4, 2, 5, 4],
          total: 22,
          why:
            "Evidence is indirect. Df is 2 because Motion and Akiflow market re-planning and Motion and Sunsama show overload. Cn is 5 because four candidates hang off it",
          chosen: true,
        },
        {
          name: "System maintenance",
          scores: [2, 4, 4, 4, 3, 5],
          total: 22,
          why:
            "Its support was two forum threads. Reddit blocked a re-fetch, so we dropped them",
        },
        {
          name: "Opaque AI scheduling",
          scores: [4, 3, 4, 4, 3, 4],
          total: 22,
          why:
            "The CHI 2019 human-AI guidelines are direct design evidence, but 83% of Indian workers say they'd delegate as much work as possible to AI (stated attitude)",
        },
        {
          name: "Fragmented capture",
          scores: [3, 4, 3, 2, 3, 5],
          total: 20,
          why: "Pings are documented, capture loss isn't. Todoist and Akiflow ship inboxes",
        },
        {
          name: "Lost thread (no plan)",
          scores: [1, 3, 4, 4, 3, 5],
          total: 20,
          why:
            "Ev is 1 because only the synthetic run supports it. Frequency is a guess",
        },
        {
          name: "Routine and work disconnection",
          scores: [2, 3, 3, 3, 3, 5],
          total: 19,
          why: "TickTick pairs habits with a calendar; Reclaim lists habits",
        },
      ],
      sensitivity: [
        {
          drop: "Evidence",
          top:
            "Priority 21; switching and maintenance 20; re-planning and lost thread tie at 19",
        },
        {
          drop: "Differentiation",
          top: "Switching 21; priority and re-planning 20",
        },
        {
          drop: "Connectivity",
          top:
            "Switching 21; priority, maintenance and opaque AI 19; re-planning 17",
        },
      ],
      sensitivityNote:
        "Re-planning leads under none of these. The pick rests on the causal case in 1.4 and on the low cost of being wrong, not on the totals.",
      oneScorerNote:
        "One scorer, not a team. The playbook asks for per-member polygons. We have one scorer, so the radar shows one polygon. Two or three more scorers would be the cheapest way to test the pick.",
      chosenRadar: {
        label: "Re-planning after disruption",
        axes: [
          "Evidence",
          "Frequency",
          "Severity",
          "Differentiation",
          "Connectivity",
          "Agency fit",
        ],
        scores: [3, 4, 4, 2, 5, 4],
      },
    },
  },
  {
    id: "converge-narrowing",
    type: "custom",
    component: "NarrowingDown",
    title: "Narrowing down",
    data: {
      shortlist:
        "Shortlist by score: execution switching (24), priority ambiguity (23), and re-planning after disruption (22).",
      ruledOut: [
        {
          name: "Lost thread (20)",
          label: "Ruled out as lead",
          whyNot:
            "it\u2019s real enough to name, but only the synthetic run supports it. That persona skipped planning, lost a task for most of a day and found it days later. It\u2019s a hypothesis. It also doesn\u2019t hang off the chosen problem. It sits upstream: no plan, nothing to re-plan.",
          whatWeKeep:
            "a design constraint. The repair can\u2019t assume a morning plan exists. In the synthetic run the same persona wanted no daily screen. The value would come from noticing dropped threads.",
          whatWouldPromote:
            "real interviews. If many say they lost a task for over a day recently, it moves up.",
          upstream: true,
        },
        {
          name: "Execution switching (24)",
          label: "Ruled out",
          whyNot:
            "probably downstream. Switching spikes when a plan breaks, and one consolidated screen can rebuild the same complexity inside one product. Both points are hypotheses.",
          whatWouldChangeMind:
            "people who lose time switching during a plan that held.",
        },
        {
          name: "Priority ambiguity (23)",
          label: "Ruled out",
          whyNot:
            "it answers what matters most, not what fits around today\u2019s constraints and what moves when they change. Ranking matters only when not everything fits.",
          whatWouldChangeMind:
            "users who say deciding is hard and fitting is easy.",
        },
      ],
      carriedForward: [
        {
          problem: "System maintenance",
          becomes: "A constraint: the fix can\u2019t add upkeep",
        },
        {
          problem: "Opaque AI scheduling",
          becomes: "A rule: every change is explained and reversible",
        },
        {
          problem: "Fragmented capture, routines",
          becomes: "Supporting requirements",
        },
      ],
    },
  },
  {
    id: "converge-causal",
    type: "custom",
    component: "CausalCase",
    title: "Why re-planning: the causal case",
    data: {
      candidates: [
        {
          name: "Priority ambiguity",
          how: "You only rank because not everything fits",
          basis: "Logic",
        },
        {
          name: "Execution switching",
          how:
            "Broken plans send people hopping between list, calendar and timer",
          basis: "Hypothesis. HBR measured toggling, not its cause",
        },
        {
          name: "System maintenance",
          how: "Rebuilding the day by hand is the upkeep",
          basis: "Hypothesis",
        },
        {
          name: "Opaque AI scheduling",
          how:
            "Automation enters to cut re-planning, so trust matters once it does",
          basis: "Logic",
        },
        {
          name: "Lost thread",
          how: "Doesn\u2019t hang off it",
          basis: "Sits upstream",
          dashed: true,
        },
      ],
      note:
        "Four of eight hang off it. The argument is structural, and nothing we fetched tests it.",
    },
  },
];
