// src/case-study/products/life-os/overview.ts
//
// Overview page content for the Life OS Case Study.

import type { Section } from "../../engine/types";
import type { PhaseHeroProps } from "../../shell/PhaseHero";

export const overviewHero: PhaseHeroProps = {
  eyebrow: "A research-led product case study",
  title: "Life OS: Your Daily Operating System",
  lead: "Research → Empathy → Convergence → Solution. Four phases of product thinking applied to one question: how might self-managing knowledge workers turn scattered work and personal commitments into a realistic, adaptable day?",
  status: [
    "Desk research + synthetic dry run",
    "No real interviews yet",
  ],
};

export const overviewSections: Section[] = [
  {
    id: "overview-execution-paradox",
    type: "custom",
    component: "ExecutionParadox",
    data: {
      eyebrow: "Behavioral Reality",
      promptText: "You have goals. You make plans. You know what needs to be done.",
      questionText: "But if we know what matters, why do we keep putting it off?",
      stats: [
        {
          value: "15–20%",
          leadText: "of adults are estimated to ",
          highlightedText: "chronically procrastinate",
          source: "Steel, 2007",
        },
        {
          value: "~30%",
          leadText: "of students in one study ",
          highlightedText: "finished their thesis by their predicted date",
          source: "Buehler et al., 1994",
        },
        {
          value: "46.9%",
          leadText: "of waking hours were spent ",
          highlightedText: "thinking about something other than the current activity",
          source: "Killingsworth & Gilbert, 2010",
        },
      ],
    },
  },
  {
    id: "overview-execution-gap",
    type: "custom",
    component: "ExecutionGapOverview",
    data: {
      eyebrow: "Product Framing",
      overviewTitle: "Overview",
      overviewBody:
        "Life OS is a personal productivity system designed to help ambitious people turn their intentions into meaningful action. It aims to bridge the gap between knowing what needs to be done and actually getting it done, helping people manage commitments, focus on what matters, and make consistent progress toward their goals.",
      gapTitle: "The execution gap",
      gapParagraphs: [
        "We often know what we need to do, but knowing doesn't always lead to action. Ideas appear in the middle of other tasks, commitments get buried, and to-do lists keep growing. As everything starts to feel important, deciding what deserves attention becomes a task in itself.",
        "This is made worse by vague goals, unrealistic plans, constant distractions, and the difficulty of getting started. People can spend an entire day feeling busy without making progress on what truly matters. Over time, this creates a cycle of postponement, mental overload, and frustration, widening the gap between what people intend to achieve and what they actually accomplish.",
      ],
      dominoSteps: [
        { label: "Scattered Intentions" },
        { label: "Overwhelming Priorities" },
        { label: "Delayed Action" },
        { label: "Stalled Progress", isCulmination: true },
      ],
      opportunitiesTitle: "Opportunities",
      opportunities: [
        "Reduce mental clutter",
        "Make priorities clearer",
        "Make starting easier",
        "Turn plans into progress",
      ],
    },
  },
  {
    id: "overview-the-process",
    type: "custom",
    component: "ProcessTimeline",
    data: {
      eyebrow: "Methodology",
      title: "The Process",
      lead: "From understanding why people struggle to follow through on their intentions to designing a system that makes everyday action feel simpler.",
      steps: [
        {
          number: "1",
          name: "Empathize",
          items: [
            "Behavioral Psychology Research",
            "Secondary Research",
            "Competitive Analysis",
            "Productivity Pain Points",
          ],
        },
        {
          number: "2",
          name: "Define",
          items: [
            "Problem Framing",
            "Jobs-to-be-Done",
            "User Journey Mapping",
            "Opportunity Areas",
            "How Might We Questions",
          ],
        },
        {
          number: "3",
          name: "Ideate",
          items: [
            "Concept Exploration",
            "Feature Prioritization",
            "Information Architecture",
            "User Flows",
            "Low-Fidelity Wireframes",
          ],
        },
        {
          number: "4",
          name: "Design",
          items: [
            "Visual Language",
            "Design System",
            "High-Fidelity Screens",
            "Interactive Prototype",
          ],
        },
        {
          number: "5",
          name: "Evaluate",
          items: [
            "Usability Evaluation",
            "Feedback Analysis",
            "Design Iterations",
            "Key Learnings",
          ],
        },
      ],
    },
  },
  {
    id: "overview-information-architecture",
    type: "custom",
    component: "InformationArchitectureMap",
    data: {
      eyebrow: "System Design",
      title: "Information Architecture",
      lead: "The structural blueprint of Life OS: unifying daily capacity, dynamic repair, scheduled commitments, and deep focus into a cohesive operating system.",
      footnote: "*Adaptive repair and capacity arithmetic operate across all modules with complete non-destructive undo.",
    },
  },
];
