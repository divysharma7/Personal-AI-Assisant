// src/case-study/products/life-os/empathize.ts
//
// Phase 2 content: sourced verbatim from
// public/case-study/life-os/02-empathy-deepening.md (read 11 Oct 2026).
// Do not strengthen claims; keep [E]/[P]/[S]/[H] semantics.

import type { Section } from "../../engine/types";
import type { PhaseHeroProps } from "../../shell/PhaseHero";

export const empathizeHero: PhaseHeroProps = {
  eyebrow: "Phase 2 · Empathize",
  title: "From Intention to Meaningful Action",
  lead: "Deepening empathy into how ambitious professionals navigate task overload, conflicting priorities, attention residue, and unexpected daily disruptions.",
  status: [
    "Primary Qualitative Research · 8 In-Depth Interviews",
    "Cognitive & Behavioral Science Literature Benchmark",
    "Analogous Inspiration & Cross-Domain Problem Reframing",
  ],
  legend:
    "Design Methodology: Research Inquiries · Affinity Synthesis · Personas · Daily Journey · Prioritization Continuum · Competitor Audit · Pyramid Search · Core Values · Redesigned Brief & HMW Ideation",
};

export const empathizeSections: Section[] = [
  {
    id: "empathize-secondary-research",
    type: "custom",
    component: "SecondaryResearchEmpathy",
    data: {
      badge: "Empathize",
      eyebrow: "Secondary Research",
      title: "So we tried to understand why getting things done feels so hard...",
      lead: "We explored research on procrastination, attention, planning, and human behavior to understand why people struggle to follow through on their intentions.",
      challengesTitle: "What makes taking action difficult?",
      challengesCol1: [
        { text: "Procrastination and task avoidance", isBold: true },
        { text: "Overwhelming to-do lists" },
        { text: "Unclear priorities" },
        { text: "Difficulty getting started" },
      ],
      challengesCol2: [
        { text: "Constant distractions" },
        { text: "Frequent context switching" },
        { text: "Forgetting commitments" },
        { text: "Struggling to maintain focus" },
      ],
      worseningTitle: "What makes these struggles worse?",
      worseningCol1: [
        { text: "Unrealistic daily planning", isBold: true },
        { text: "Overestimating available time" },
        { text: "Perfectionism and fear of failure" },
        { text: "Vague or overwhelming goals" },
      ],
      worseningCol2: [
        { text: "Decision fatigue" },
        { text: "Competing responsibilities" },
        { text: "Lack of visible progress" },
        { text: "Relying on motivation alone" },
      ],
      consequencesTitle: "*Consequences of ignoring these challenges*",
      consequences: [
        "Wasted Time",
        "Unfinished Goals",
        "Mental Overload",
        "Stalled Personal Growth",
      ],
      quotePrompt: "A behavioral study cited that",
      quoteText: "“A technological intervention is the simplest solution”",
    },
  },
  {
    id: "empathize-primary-research",
    type: "custom",
    component: "PrimaryResearchEmpathy",
    data: {
      badge: "Empathize",
      eyebrow: "Primary Research",
      title: "We listened to how people navigate their everyday chaos...",
      whoTitle: "Who did we talk to?",
      whoIntro:
        "We conducted 8 semi-structured interviews with people balancing different goals, responsibilities, and routines to understand how they organize their lives, prioritize tasks, and turn intentions into action.",
      profilesTitle: "Participant Profiles",
      profiles: [
        {
          role: "Students",
          description: "Managing academics, coursework, and personal growth goals.",
        },
        {
          role: "Working Professionals",
          description: "Balancing strict work deadlines, meetings, and daily responsibilities.",
        },
        {
          role: "Freelancers",
          description: "Juggling multiple clients, non-linear schedules, and variable energy.",
        },
        {
          role: "Tool Power Users",
          description: "Actively using Notion, calendars, and to-do apps seeking lower upkeep.",
        },
      ],
      inquiriesHeading1: "How do people manage their tasks today?",
      inquiriesHeading2: "What happens when their plans fall apart?",
      inquiriesIntro: "We explored:",
      inquiries: [
        {
          topic: "Task capture",
          question: "Where do they record ideas, tasks, and commitments?",
        },
        {
          topic: "Prioritization",
          question: "How do they decide what deserves attention?",
        },
        {
          topic: "Planning",
          question: "How do they organize their day and estimate time?",
        },
        {
          topic: "Task initiation",
          question: "What makes starting difficult?",
        },
        {
          topic: "Follow-through",
          question: "What causes tasks to get postponed or abandoned?",
        },
        {
          topic: "Existing tools",
          question: "How do they use notes, calendars, reminders, and to-do apps?",
        },
        {
          topic: "Recovery",
          question: "How do they respond when they fall behind?",
        },
      ],
    },
  },
  {
    id: "empathize-understanding-synthesis",
    type: "custom",
    component: "UnderstandingSynthesis",
    data: {
      badge: "Empathize",
      eyebrow: "Understanding",
      title: "studied, a lot..",
      whyTitle: "Why do we struggle to get things done?",
      bridgingTitle: "Bridging the intention–action gap",
      capabilities: [
        {
          verb: "Capture",
          description: "commitments before they are forgotten",
        },
        {
          verb: "Clarify",
          description: "vague intentions into actionable next steps",
        },
        {
          verb: "Prioritize",
          description: "what deserves attention",
        },
        {
          verb: "Plan",
          description: "when and how to begin",
        },
        {
          verb: "Focus",
          description: "on one manageable action at a time",
        },
        {
          verb: "Review",
          description: "progress and adapt when plans change",
        },
      ],
      designOpportunity:
        "Move beyond storing tasks to helping people translate intentions into action.",
      imageSrc: "/case-study/cognitive_focus_study.jpg",
      imageAlt: "Knowledge worker in deep, intentional focus in a minimalist studio",
      citationText:
        "76% higher goal completion reported when implementation intentions ('if-then' execution planning) are formulated. (Gollwitzer & Sheeran, 2006)",
    },
  },
  {
    id: "empathize-affinity-mapping",
    type: "custom",
    component: "AffinityMappingGrid",
    data: {
      badge: "Empathize",
      eyebrow: "Affinity Mapping",
      title: "Connecting the dots...",
      lead: "We grouped recurring challenges from productivity and behavioral research to understand where people struggle between planning what they want to do and actually doing it.",
      clusters: [
        {
          id: "task-overload",
          number: "01",
          title: "Task Overload",
          items: [
            "Too many tasks competing for attention.",
            "Commitments scattered across different apps.",
            "Difficulty remembering everything.",
            "Feeling overwhelmed by growing to-do lists.",
          ],
        },
        {
          id: "prioritization",
          number: "02",
          title: "Prioritization",
          items: [
            "Everything feels equally important.",
            "Urgent tasks overshadow meaningful goals.",
            "Spending too much time deciding what to do.",
            "Choosing easy tasks over important ones.",
          ],
        },
        {
          id: "planning-time",
          number: "03",
          title: "Planning & Time",
          items: [
            "Underestimating how long tasks take.",
            "Scheduling more work than the day allows.",
            "Plans disrupted by unexpected meetings.",
            "Repeatedly moving unfinished tasks to tomorrow.",
          ],
        },
        {
          id: "procrastination",
          number: "04",
          title: "Procrastination",
          items: [
            "Delaying tasks that feel difficult or unclear.",
            "Waiting to feel motivated before starting.",
            "Avoiding work with uncertain outcomes.",
            "Getting stuck thinking instead of acting.",
          ],
        },
        {
          id: "focus-distractions",
          number: "05",
          title: "Focus & Distractions",
          items: [
            "Constant notifications interrupting work.",
            "Switching between multiple unfinished tasks.",
            "Difficulty returning to work after interruptions.",
            "Losing productive time to digital distractions.",
          ],
        },
        {
          id: "goals-consistency",
          number: "06",
          title: "Goals & Consistency",
          items: [
            "Long-term goals forgotten in daily routines.",
            "Difficulty maintaining habits.",
            "Starting projects with enthusiasm but losing momentum.",
            "Struggling to connect daily tasks to bigger goals.",
          ],
        },
        {
          id: "progress-reflection",
          number: "07",
          title: "Progress & Reflection",
          items: [
            "Feeling busy without meaningful progress.",
            "No clear picture of where time goes.",
            "Difficulty recognizing recurring procrastination.",
            "Feeling guilty about unfinished work.",
          ],
        },
        {
          id: "tools-workflows",
          number: "08",
          title: "Tools & Workflows",
          items: [
            "Tasks spread across notes, calendars, and apps.",
            "Spending too much time organizing productivity tools.",
            "Complicated systems that are hard to maintain.",
            "Reminders becoming easy to ignore.",
          ],
        },
      ],
      footnote:
        "*Affinity clusters synthesized across 8 participant interviews and empirical behavioral literature.",
    },
  },
  {
    id: "empathize-pattern-emergence",
    type: "custom",
    component: "PatternEmergence",
    data: {
      badge: "Empathize",
      eyebrow: "Pattern Synthesis",
      title: "As we connected the dots, a pattern began to emerge.",
      paragraphs: [
        "At first, this looked like a time-management problem. It was not. People often knew what mattered. They just struggled to make it fit into a real day. Tasks pile up, priorities blur, and even important goals get pushed aside by everyday distractions.",
        "Organizing tasks is not the same as completing them. Traditional productivity tools help people remember what needs to be done, but remembering is only one part of the challenge. The real difficulty lies in deciding what matters, knowing where to start, and consistently following through.",
        "Instead of creating another place to manage endless to-do lists, Life OS reduces the friction required to take action. The goal is to help people build clarity, consistency, and a genuine sense of control over their time.",
      ],
      imageSrc: "/case-study/affinity_pattern_analysis.jpg",
      imageAlt:
        "Design researchers analyzing qualitative interview data and affinity notes",
      imageCaption:
        "Synthesis Workshop · Mapping 32 interview observations to identify the core execution bottleneck",
      paradigmShift: {
        from: "Passive task organization & endless list management",
        to: "Active friction reduction & execution follow-through",
      },
    },
  },
  {
    id: "empathize-primary-persona",
    type: "custom",
    component: "PrimaryUserPersona",
    data: {
      badge: "Empathize",
      eyebrow: "Personas",
      title: "Who are my primary users?",
      personas: [
        {
          id: "aarav-mehta",
          archetype: "Ambitious but Overwhelmed",
          name: "Aarav Mehta",
          age: "28 years",
          role: "Software Engineer",
          experience: "5 Years of Experience",
          context: "Full-time Professional · Building Side Projects",
          location: "Bengaluru, India",
          avatarSrc: "/case-study/persona_aarav_mehta.jpg",
          quotes: [
            "“I know exactly what I want to achieve. But by the end of the day, I've been busy with everything except the things that actually matter to me.”",
            "“I don't need another app to remind me how much I haven't done. I need something that helps me get started.”",
          ],
          traits: [
            { name: "Ambition & Growth Mindset", level: "High", percentage: 92 },
            { name: "Awareness of Productivity Challenges", level: "High", percentage: 88 },
            { name: "Consistency in Execution", level: "Inconsistent", percentage: 42 },
            { name: "Ability to Prioritize", level: "Needs Support", percentage: 36 },
            { name: "Willingness to Improve", level: "High", percentage: 96 },
          ],
          painPoints: [
            "Struggles to prioritize when multiple tasks feel equally important.",
            "Overplans his day, often underestimating how long work takes.",
            "Procrastinates on important goals when tasks feel too large or unclear.",
            "Gets distracted by meetings, notifications, and unexpected work.",
            "Keeps switching between productivity tools without finding a sustainable routine.",
            "Feels frustrated when a busy day doesn't translate into meaningful progress.",
          ],
          goals: [
            "Make consistent progress on personal and professional goals.",
            "Spend less time organizing tasks and more time completing them.",
            "Know what to work on next without constantly rethinking priorities.",
            "Build a realistic daily routine that accommodates unexpected work.",
            "Improve focus and reduce procrastination.",
            "Feel in control of his time without sacrificing rest or personal life.",
          ],
          feels: [
            "Overwhelmed when his to-do list keeps growing.",
            "Guilty about repeatedly postponing important tasks.",
            "Frustrated when distractions interrupt his plans.",
            "Motivated by visible progress and small wins.",
            "Anxious about falling behind on personal ambitions.",
            "Fulfilled when he completes meaningful work.",
          ],
          does: [
            "Uses task managers, calendars, and notes to organize responsibilities.",
            "Creates ambitious daily plans but frequently carries tasks forward.",
            "Completes quick, urgent tasks before difficult, high-impact work.",
            "Saves ideas and learning resources to revisit later.",
            "Tries different productivity techniques when his routine breaks down.",
            "Works on personal goals whenever he finds spare time, rather than consistently making room for them.",
          ],
        },
        {
          id: "rohan-sharma",
          archetype: "Ambitious but Unaware",
          name: "Rohan Sharma",
          age: "26 years",
          role: "Associate Product Manager",
          experience: "2 Years of Experience",
          context: "Full-time Professional · Aspiring Entrepreneur",
          location: "Mumbai, India",
          avatarSrc: "/case-study/persona_rohan_sharma.jpg",
          quotes: [
            "“I make a to-do list every morning, but somehow the important things keep getting pushed to tomorrow.”",
            "“I think I just need to be more disciplined. I've tried productivity apps before, but I always stop using them.”",
          ],
          traits: [
            { name: "Ambition & Career Growth", level: "High", percentage: 90 },
            { name: "Awareness of Productivity Challenges", level: "Low", percentage: 25 },
            { name: "Consistency in Execution", level: "Low", percentage: 28 },
            { name: "Ability to Prioritize", level: "Inconsistent", percentage: 40 },
            { name: "Willingness to Improve", level: "High", percentage: 92 },
          ],
          painPoints: [
            "Confuses being busy with being productive, spending most of his day reacting to messages, meetings, and requests.",
            "Struggles to identify priorities when multiple responsibilities compete for attention.",
            "Makes unrealistic daily plans and feels disappointed when he cannot finish them.",
            "Postpones difficult tasks because they feel overwhelming or require too much thinking.",
            "Relies on memory, scattered notes, and reminders to manage commitments.",
            "Abandons productivity apps when maintaining them starts feeling like additional work.",
          ],
          goals: [
            "Feel more in control of his daily responsibilities.",
            "Make consistent progress toward career and personal goals.",
            "Spend less time planning and more time executing.",
            "Build better habits without following a complicated routine.",
            "Manage work commitments without sacrificing personal time.",
            "Become more reliable in following through on what he promises.",
          ],
          feels: [
            "Overwhelmed when unexpected work disrupts his plans.",
            "Frustrated when another day passes without meaningful progress.",
            "Guilty about delaying personal projects.",
            "Motivated when he completes something important.",
            "Uncertain about why his productivity systems never last.",
            "Hopeful that better routines could help him achieve more.",
          ],
          does: [
            "Creates daily to-do lists but rarely reviews unfinished tasks.",
            "Responds to urgent requests first, even when other work is more important.",
            "Uses WhatsApp messages, notes, and memory to remember commitments.",
            "Starts multiple personal projects but struggles to finish them.",
            "Watches productivity videos and tries new techniques occasionally.",
            "Waits for free time or motivation before working on long-term goals.",
          ],
        },
        {
          id: "neha-kapoor",
          archetype: "Aware but Resistant",
          name: "Neha Kapoor",
          age: "34 years",
          role: "Senior Product Manager",
          experience: "9 Years of Experience",
          context: "Full-time Professional · Managing Multiple Priorities",
          location: "Gurugram, India",
          avatarSrc: "/case-study/persona_neha_kapoor.jpg",
          quotes: [
            "“I already have a calendar, notes, and three different task lists. Why would I need another app to manage my work?”",
            "“I know I take on too much, but spending more time planning isn't going to help me finish things faster.”",
          ],
          traits: [
            { name: "Ambition & Career Growth", level: "High", percentage: 94 },
            { name: "Awareness of Productivity Challenges", level: "High", percentage: 88 },
            { name: "Openness to New Productivity Tools", level: "Low", percentage: 22 },
            { name: "Consistency in Execution", level: "Moderate", percentage: 60 },
            { name: "Willingness to Change Existing Habits", level: "Low", percentage: 30 },
          ],
          painPoints: [
            "Constantly switches between responsibilities, leaving little time for focused work.",
            "Feels overwhelmed by competing priorities from meetings, stakeholders, and personal commitments.",
            "Struggles to make realistic plans because unexpected work frequently disrupts her schedule.",
            "Finds maintaining task managers exhausting, especially when tasks need constant updating.",
            "Relies on memory and existing tools, causing occasional commitments to slip through.",
            "Feels frustrated by productivity advice that doesn't account for the unpredictability of her workday.",
          ],
          goals: [
            "Stay on top of responsibilities without spending additional time managing them.",
            "Protect time for meaningful, high-impact work.",
            "Reduce unnecessary decisions throughout the day.",
            "Maintain a reliable overview of commitments across different areas of life.",
            "Adapt quickly when priorities change without rebuilding her entire schedule.",
            "Feel more in control of work while maintaining a healthy personal life.",
          ],
          feels: [
            "Skeptical about productivity apps that promise to change everything.",
            "Frustrated by complicated workflows and excessive notifications.",
            "Mentally drained after days filled with constant decisions.",
            "Confident in her professional abilities but dissatisfied with how her time is spent.",
            "Protective of her existing routines and working style.",
            "Relieved when she can make progress without additional planning.",
          ],
          does: [
            "Uses her calendar, Slack, and notes to manage daily responsibilities.",
            "Prioritizes urgent stakeholder requests over planned deep work.",
            "Keeps important commitments in her head rather than maintaining a separate task system.",
            "Abandons new productivity tools when setup and maintenance become time-consuming.",
            "Frequently adjusts her plans to accommodate unexpected work.",
            "Relies on experience and intuition to decide what needs attention next.",
          ],
        },
      ],
    },
  },
  {
    id: "empathize-user-journey",
    type: "custom",
    component: "UserJourneyMap",
    data: {
      badge: "Empathize",
      eyebrow: "User Journey",
      title: "Zooming into my User’s Journey",
      lead: "To understand the everyday friction between planning and actually getting things done, we mapped how an ambitious professional manages tasks, makes decisions, responds to distractions, and reflects on unfinished work. The journey highlights the moments where good intentions turn into overwhelm, procrastination, and frustration, and the opportunities to make taking action easier.",
      stages: [
        {
          id: "stage-01",
          number: "01",
          emoji: "😌",
          emotion: "Motivated",
          activityPrimary: "Starts the day with good intentions.",
          activityDetails:
            "Opens a to-do list, reviews deadlines, and plans to finish several important tasks.",
          activityIcons: "📋 ☀️",
          obstacleKeyword: "Overestimates available time.",
          obstacleText:
            "Plans around an ideal day without accounting for meetings, interruptions, or unexpected work.",
          participantIds: ["aarav", "rohan"],
          opportunityKeyword: "Realistic daily planning.",
          opportunityText:
            "Help users select a manageable number of priorities based on available time.",
        },
        {
          id: "stage-02",
          number: "02",
          emoji: "🤔",
          emotion: "Confused",
          activityPrimary: "Tries to decide what to work on first.",
          activityDetails:
            "Reviews tasks from notes, messages, calendars, and different projects.",
          activityIcons: "🔀 📱 📅",
          obstacleKeyword: "Everything feels important.",
          obstacleText:
            "Unclear priorities make deciding what to do almost as exhausting as doing it.",
          participantIds: ["aarav", "neha", "rohan"],
          opportunityKeyword: "Clear next actions.",
          opportunityText:
            "Bring commitments together and help users identify what deserves attention now.",
        },
        {
          id: "stage-03",
          number: "03",
          emoji: "😵",
          emotion: "Overwhelmed",
          activityPrimary: "Attempts to organize scattered commitments.",
          activityDetails:
            "Remembers follow-ups, personal errands, and unfinished tasks while planning the day.",
          activityIcons: "📥 🧠",
          obstacleKeyword: "Information is scattered.",
          obstacleText:
            "Tasks are stored in different places, and remembering everything creates mental clutter.",
          participantIds: ["aarav", "neha"],
          opportunityKeyword: "Effortless task capture.",
          opportunityText:
            "Provide a simple way to collect and clarify commitments without interrupting ongoing work.",
        },
        {
          id: "stage-04",
          number: "04",
          emoji: "😟",
          emotion: "Hesitant",
          activityPrimary: "Attempts to begin an important task.",
          activityDetails:
            "Opens a project that has been postponed for several days.",
          activityIcons: "🧱 ⏳",
          obstacleKeyword: "The task feels too big.",
          obstacleText:
            "Vague goals and uncertainty about where to begin make postponement more appealing.",
          participantIds: ["aarav", "rohan"],
          opportunityKeyword: "Break down the first step.",
          opportunityText:
            "Turn overwhelming tasks into small, specific actions that feel easier to start.",
        },
        {
          id: "stage-05",
          number: "05",
          emoji: "😣",
          emotion: "Distracted",
          activityPrimary: "Finally starts working.",
          activityDetails:
            "Tries to focus but receives messages, meeting requests, and notifications.",
          activityIcons: "🔔 💬",
          obstacleKeyword: "Constant interruptions.",
          obstacleText:
            "Switching attention makes it difficult to maintain momentum and return to unfinished work.",
          participantIds: ["neha", "rohan", "aarav"],
          opportunityKeyword: "Support focused execution.",
          opportunityText:
            "Keep the current action visible and make it easy to resume after interruptions.",
        },
        {
          id: "stage-06",
          number: "06",
          emoji: "😕",
          emotion: "Frustrated",
          activityPrimary: "Responds to urgent requests.",
          activityDetails:
            "Handles unexpected bugs, stakeholder questions, and last-minute responsibilities.",
          activityIcons: "🚨 ⚡",
          obstacleKeyword: "Priorities keep changing.",
          obstacleText:
            "The original plan becomes unrealistic, and important personal work gets pushed aside.",
          participantIds: ["neha", "aarav"],
          opportunityKeyword: "Flexible replanning.",
          opportunityText:
            "Help users adjust their remaining tasks without rebuilding the entire day.",
        },
        {
          id: "stage-07",
          number: "07",
          emoji: "😞",
          emotion: "Disappointed",
          activityPrimary: "Reviews what remains unfinished.",
          activityDetails:
            "Notices that several planned tasks were never started despite being busy all day.",
          activityIcons: "📝 🕰️",
          obstacleKeyword: "Activity doesn't equal progress.",
          obstacleText:
            "Small urgent tasks were completed, while meaningful goals received little attention.",
          participantIds: ["aarav", "rohan", "neha"],
          opportunityKeyword: "Meaningful progress tracking.",
          opportunityText:
            "Show progress toward important goals, not just the number of completed tasks.",
        },
        {
          id: "stage-08",
          number: "08",
          emoji: "😔",
          emotion: "Guilty",
          activityPrimary: "Moves unfinished tasks to tomorrow.",
          activityDetails:
            "Carries forward the same difficult tasks and promises to do better the next day.",
          activityIcons: "🗓️ 🔄",
          obstacleKeyword: "A cycle of postponement.",
          obstacleText:
            "Repeatedly rescheduling tasks creates frustration without addressing why they remain unfinished.",
          participantIds: ["aarav", "rohan"],
          opportunityKeyword: "Identify recurring friction.",
          opportunityText:
            "Surface repeatedly postponed tasks and help users reconsider their size, priority, or timing.",
        },
        {
          id: "stage-09",
          number: "09",
          emoji: "😩",
          emotion: "Drained",
          activityPrimary: "Tries to work on personal goals after office hours.",
          activityDetails:
            "Wants to learn, exercise, build a side project, or spend time on a passion.",
          activityIcons: "🌙 🔋",
          obstacleKeyword: "Limited energy and time.",
          obstacleText:
            "Personal ambitions compete with work demands, rest, and everyday responsibilities.",
          participantIds: ["aarav", "neha"],
          opportunityKeyword: "Progress that fits real life.",
          opportunityText:
            "Suggest manageable next steps that fit the time and energy users actually have.",
        },
        {
          id: "stage-10",
          number: "10",
          emoji: "🙂",
          emotion: "Hopeful",
          activityPrimary: "Reflects and prepares for another day.",
          activityDetails:
            "Reviews what worked, what didn't, and what deserves attention tomorrow.",
          activityIcons: "📓 ✨",
          obstacleKeyword: "Little learning from previous days.",
          obstacleText:
            "Without reflection, the same unrealistic plans and avoidance patterns repeat.",
          participantIds: ["aarav", "rohan", "neha"],
          opportunityKeyword: "Simple reflection and adjustment.",
          opportunityText:
            "Help users learn from their routines, celebrate meaningful progress, and plan more realistically.",
        },
      ],
      patternTitle: "The pattern we identified",
      patternTakeaways: [
        {
          tag: "Morning Optimism vs. Day Friction",
          text: "The user begins the day motivated and optimistic, but gradually loses clarity as tasks accumulate, priorities shift, and interruptions take over.",
          accentColor: "#6366f1",
        },
        {
          tag: "The Busyness Illusion",
          text: "By evening, they may have completed several tasks yet still feel that the work that mattered most was left undone.",
          accentColor: "#f59e0b",
        },
        {
          tag: "The Core Execution Bottleneck",
          text: "The problem isn't simply forgetting tasks. It's the repeated effort required to decide what matters, find a starting point, protect attention, and adapt when reality doesn't match the plan.",
          accentColor: "#ec4899",
        },
      ],
      patternConclusion:
        "This creates an opportunity for Life OS to support the entire journey, from capturing intentions to making meaningful progress, without becoming another system the user has to constantly manage.",
    },
  },
  {
    id: "empathize-pain-point-analysis",
    type: "custom",
    component: "PainPointAnalysis",
    data: {
      badge: "Empathize",
      eyebrow: "Pain Point Analysis",
      title: "Finding the real blockers",
      patternsTitle: "Identifying pain point patterns",
      patternsBody: [
        "After mapping the everyday challenges of managing tasks, time, and personal goals, we began connecting the recurring patterns.",
        "While people experience several productivity struggles, not every problem has the same impact on their ability to get things done.",
        "The goal was to identify the friction points that most directly prevent people from turning their intentions into action.",
      ],
      prioritizationTitle: "Problem Prioritization",
      prioritizationBody: [
        "We organized the identified pain points based on two factors to determine which problems Life OS should explore first.",
        "By considering both factors, we developed an initial, hypothesis-based priority order to guide product exploration.",
      ],
      criteria: {
        severityTitle: "Severity & Impact",
        severitySubtitle: "Qualitative Ranking (QR)",
        severityDescription:
          "Rank the severity and impact of a particular problem: How much does the problem interfere with meaningful progress, increase mental effort, or prevent someone from completing important work?",
        frequencyTitle: "Frequency of Occurrence",
        frequencySubtitle: "Daily Rhythm",
        frequencyDescription:
          "Gauge the frequency of occurrence: How often is someone likely to experience this problem during their everyday routine?",
      },
      painPoints: [
        {
          id: "tool-customization",
          rank: 1,
          title: "Productivity Tool Customization",
          severity: 2,
          frequency: 2,
          impactLevel: "Low",
          rationale:
            "Tinkering with Notion layouts, plugins, and custom views consumes time, but is often a symptom rather than the root cause of stalled execution.",
          category: "Workflow Admin",
        },
        {
          id: "progress-visibility",
          rank: 2,
          title: "Limited Progress Visibility",
          severity: 2.5,
          frequency: 3,
          impactLevel: "Low",
          rationale:
            "Not seeing cumulative daily achievements dampens motivation over weeks, though it primarily surfaces during evening reflection rather than mid-work.",
          category: "Feedback & Motivation",
        },
        {
          id: "habit-tracking",
          rank: 3,
          title: "Inconsistent Habit Tracking",
          severity: 3,
          frequency: 3,
          impactLevel: "Moderate",
          rationale:
            "Skipping personal routines (reading, exercise, side projects) causes mild guilt, but rarely blocks immediate professional commitments.",
          category: "Personal Growth",
        },
        {
          id: "scattered-tasks",
          rank: 4,
          title: "Scattered Tasks & Commitments",
          severity: 3.5,
          frequency: 4,
          impactLevel: "Moderate",
          rationale:
            "Commitments spread across Slack, WhatsApp, email, and scratchpads create mental clutter and the constant fear of forgetting something important.",
          category: "Information Capture",
        },
        {
          id: "frequent-distractions",
          rank: 5,
          title: "Frequent Distractions",
          severity: 4,
          frequency: 4.5,
          impactLevel: "High",
          rationale:
            "Constant pinging notifications and incoming requests derail deep focus, requiring continuous mental energy to resume interrupted work.",
          category: "Focus & Attention",
        },
        {
          id: "unrealistic-planning",
          rank: 6,
          title: "Unrealistic Daily Planning",
          severity: 4,
          frequency: 4,
          impactLevel: "High",
          rationale:
            "Scheduling ideal days without buffer time makes schedules brittle; a single delayed meeting causes the entire day's plan to collapse.",
          category: "Time Estimation",
        },
        {
          id: "overwhelming-lists",
          rank: 7,
          title: "Overwhelming Task Lists",
          severity: 4.5,
          frequency: 4.5,
          impactLevel: "Critical",
          rationale:
            "Endless backlogs trigger decision paralysis. Seeing 30 open items makes everything feel urgent and creates anxiety before work even begins.",
          category: "Cognitive Load",
        },
        {
          id: "unclear-priorities",
          rank: 8,
          title: "Unclear Priorities",
          severity: 4.5,
          frequency: 5,
          impactLevel: "Critical",
          rationale:
            "When everything feels equally important, deciding what deserves attention right now becomes as exhausting as doing the actual work.",
          category: "Decision Fatigue",
        },
        {
          id: "starting-friction",
          rank: 9,
          title: "Difficulty Starting Important Tasks",
          severity: 5,
          frequency: 5,
          impactLevel: "Severe",
          rationale:
            "The definitive friction point between intention and action. Vague goals and task intimidation lead to avoidance and repeated postponement.",
          category: "Task Initiation",
        },
      ],
      takeawayTitle: "The Core Insight",
      takeawayText:
        "The real bottleneck is not managing task lists or tracking habits. It is the psychological friction of unclear priorities and difficult task initiation. Life OS focuses its core mechanics on getting started, not just keeping lists.",
    },
  },
  {
    id: "empathize-competitor-analysis",
    type: "custom",
    component: "CompetitorAnalysisMatrix",
    data: {
      badge: "Empathize",
      eyebrow: "Competitor Analysis",
      title: "Who are we up against?",
      lead: "With a clearer understanding of the challenges people face, we explored existing productivity tools to understand how they help users organize tasks, plan their time, and get work done.",
      coreQuestion:
        "If we already have so many productivity tools, why do we still struggle to follow through on our plans?",
      sublead:
        "We looked beyond feature lists to explore the effort users must invest in maintaining these systems, and where Life OS could make the journey from intention to action easier.",
      domains: [
        {
          id: "capture",
          number: "01",
          title: "Capture & Organize",
          question: "How do existing tools help people remember and organize commitments?",
        },
        {
          id: "plan",
          number: "02",
          title: "Plan & Prioritize",
          question: "How do they help people decide what matters and make realistic plans?",
        },
        {
          id: "start",
          number: "03",
          title: "Start & Follow Through",
          question:
            "How do they support taking action, maintaining focus, and adapting when plans change?",
        },
      ],
      competitors: [
        {
          id: "todoist",
          name: "Todoist",
          tagline: "Structured task lists & project hierarchy",
          domain: "capture",
          domainLabel: "CAPTURE & ORGANIZE",
          logoBg: "bg-[#E44332]",
          logoTextColor: "text-white",
          logoLetter: "T",
          means: [
            "Task capture with natural language parsing",
            "Project nesting, labels & priority flags",
            "Recurring tasks & customizable filter views",
          ],
          painsKeyword: "A well-organized list",
          painsText: "can still leave users deciding what to tackle first when energy is low.",
          gainsKeyword: "Fast capture",
          gainsText: "and structured task management with flexible multi-level organization.",
          opportunityKeyword: "One clear next action",
          opportunityText:
            "Help users move from an intimidating list of possibilities to a single immediate start.",
        },
        {
          id: "ticktick",
          name: "TickTick",
          tagline: "All-in-one tasks, calendar & focus timers",
          domain: "capture",
          domainLabel: "CAPTURE & ORGANIZE",
          logoBg: "bg-[#3A7AFE]",
          logoTextColor: "text-white",
          logoLetter: "✓",
          means: [
            "Tasks & calendar views in a single screen",
            "Built-in Pomodoro timers & white noise",
            "Habit tracking streaks & Eisenhower matrix",
          ],
          painsKeyword: "Multiple productivity features",
          painsText:
            "may require users to manage several routines, adding cognitive maintenance overhead.",
          gainsKeyword: "Integrated workspace",
          gainsText: "unifying planning, time management, and habit tracking into one client.",
          opportunityKeyword: "A simpler daily flow",
          opportunityText:
            "Connect planning and execution seamlessly without demanding multi-tab routine upkeep.",
        },
        {
          id: "notion",
          name: "Notion",
          tagline: "Modular block workspace & relational databases",
          domain: "plan",
          domainLabel: "PLAN & PRIORITIZE",
          logoBg: "bg-[#000000] dark:bg-white dark:text-black",
          logoTextColor: "text-white dark:text-neutral-900",
          logoLetter: "N",
          means: [
            "Flexible documents, Kanban boards & linked databases",
            "Rich templates, properties & custom workflow views",
            "Full personalization of layout and data models",
          ],
          painsKeyword: "Building and maintaining",
          painsText:
            "a personal productivity system can become work of its own, distracting from actual tasks.",
          gainsKeyword: "Adaptable workspace",
          gainsText: "tailorable to any knowledge domain, creative project, or life wiki structure.",
          opportunityKeyword: "Structure without configuration",
          opportunityText:
            "Offer opinionated, ready-to-run structure without requiring hours of database crafting.",
        },
        {
          id: "sunsama",
          name: "Sunsama",
          tagline: "Intentional daily planning & calendar timeboxing",
          domain: "plan",
          domainLabel: "PLAN & PRIORITIZE",
          logoBg: "bg-[#FA8C16]",
          logoTextColor: "text-white",
          logoLetter: "S",
          means: [
            "Guided morning planning ritual & end-of-day shutdown",
            "Task consolidation from Slack, Jira, GitHub & Trello",
            "Direct calendar timeboxing with daily work-hour caps",
          ],
          painsKeyword: "Rigid planning routines",
          painsText:
            "can feel demanding on high-chaos days when unexpected emergencies break the schedule.",
          gainsKeyword: "Intentional workload planning",
          gainsText: "and visual awareness of daily capacity to prevent chronic overcommitment.",
          opportunityKeyword: "Flexible replanning",
          opportunityText:
            "Support quick mid-day adjustments and frictionless recovery when reality breaks the plan.",
        },
        {
          id: "motion",
          name: "Motion",
          tagline: "Algorithmic auto-scheduling & calendar AI",
          domain: "start",
          domainLabel: "START & FOLLOW THROUGH",
          logoBg: "bg-[#06B6D4]",
          logoTextColor: "text-neutral-950",
          logoLetter: "M",
          means: [
            "Automatic algorithm-driven task scheduling on calendars",
            "Real-time schedule shuffling when meetings overrun",
            "Capacity warnings when scheduled work exceeds hours",
          ],
          painsKeyword: "Automated schedules",
          painsText:
            "may feel robotic or controlling, failing to reflect subjective human energy and mood.",
          gainsKeyword: "Zero manual scheduling",
          gainsText: "saving mental effort otherwise spent playing manual calendar Tetris.",
          opportunityKeyword: "Human-in-the-loop agency",
          opportunityText:
            "Balance intelligent suggestions with user autonomy and intuitive, forgiving control.",
        },
        {
          id: "google-calendar",
          name: "Google Calendar",
          tagline: "Time blocking & appointment availability",
          domain: "start",
          domainLabel: "START & FOLLOW THROUGH",
          logoBg: "bg-[#4285F4]",
          logoTextColor: "text-white",
          logoLetter: "31",
          means: [
            "Universal event scheduling & shared calendars",
            "Time blocking slots for meetings & personal holds",
            "Notifications & cross-device synchronicity",
          ],
          painsKeyword: "Reserving calendar blocks",
          painsText:
            "does not automatically make a daunting, vaguely defined task easier to start.",
          gainsKeyword: "Clear visibility",
          gainsText: "into commitments, hard boundaries, and total free time across the work week.",
          opportunityKeyword: "Bridge time with action",
          opportunityText:
            "Turn empty time blocks into micro-step starting points that dissolve initial friction.",
        },
      ],
      fitTitle: "Where does Life OS fit?",
      fitLead: [
        "Existing tools demonstrate that people have many ways to capture, organize, and schedule work.",
        "But completing meaningful work involves more than knowing what is on the list or when it is scheduled.",
        "People still need to choose what matters, overcome the difficulty of starting, manage interruptions, and adjust when their plans fall apart.",
      ],
      fitConclusion:
        "Move beyond helping people manage what they need to do toward helping them take meaningful action on what matters most.",
    },
  },
  {
    id: "empathize-pyramid-search",
    type: "custom",
    component: "PyramidSearchAnalogy",
    data: {
      badge: "Empathize",
      eyebrow: "Leveraging Analogies",
      title: "Pyramid Search",
      lead: "To move beyond familiar productivity patterns, we looked at how completely different systems help people make decisions under changing conditions.",
      coreQuestion:
        "What could Life OS learn from systems designed to decide, focus, and adapt under pressure?",
      sublead:
        "Instead of asking only how other task managers work, we explored analogous domains that deal with similar underlying challenges: too many competing demands, limited capacity, and constantly changing priorities.",
      methodExplanation:
        "This technique was utilized as a quest for more. It avoids recycling existing ideas and discovers novel solutions by studying how experts in distant, high-stakes fields tackle analogous bottlenecks.",
      sectors: [
        {
          id: "triage",
          pyramidIndex: 2,
          domainName: "High-Stakes Decision Systems",
          domainTier: "Distant Domain",
          title: "Emergency Triage",
          icon: "🚑",
          colorAccent: "#f43f5e",
          tagline: "Prioritize by need, not by order.",
          hook: "Prioritize what matters now",
          contextText:
            "Emergency triage systems classify and prioritize patients according to medical urgency rather than chronological arrival order. Acuity-based protocols ensure clinical attention immediately targets the highest life risk.",
          lessons: [
            "Not everything deserves equal or chronological attention.",
            "Priority must dynamically adjust as live circumstances shift.",
            "The system must rapidly make the single most critical need visible.",
          ],
          userQuestion: "What needs my attention right now?",
          lifeOsOpportunity:
            "Instead of presenting one long, flat to-do list, Life OS surfaces a small, acuity-ranked set of actions based on urgency, true impact, and real-time available capacity.",
          badgeText: "Life OS → Surface the right priority",
        },
        {
          id: "kanban",
          pyramidIndex: 1,
          domainName: "Workflow & Operations",
          domainTier: "Adjacent Domain",
          title: "Kanban Systems",
          icon: "📊",
          colorAccent: "#8b5cf6",
          tagline: "Stop starting. Start finishing.",
          hook: "Limit work in progress (WIP)",
          contextText:
            "Kanban uses Work-In-Progress (WIP) limits to cap how much work can be active concurrently. It prevents congestion, reveals bottlenecks, and keeps attention from fracturing across half-started tasks.",
          lessons: [
            "More active tasks do not equal more meaningful progress.",
            "Unconstrained work-in-progress causes severe cognitive congestion.",
            "Completing open loops protects attention (combating attention residue).",
          ],
          userQuestion: "What should I finish before I start something else?",
          lifeOsOpportunity:
            "Intentionally restrict active priorities to a strict threshold (1–3 tasks), nudging users to focus on one clear next action rather than an overwhelming multi-tasking backlog.",
          badgeText: "Life OS → Focus on fewer active tasks",
        },
        {
          id: "navigation",
          pyramidIndex: 2,
          domainName: "High-Stakes Decision Systems",
          domainTier: "Distant Domain",
          title: "Navigation Systems",
          icon: "🧭",
          colorAccent: "#06b6d4",
          tagline: "Keep the destination. Change the route.",
          hook: "Adapt when conditions change",
          contextText:
            "Digital navigation platforms (Google Maps, Waze) combine the intended destination with live telemetry. When traffic jams or closures emerge, they dynamically recalculate without declaring the trip failed.",
          lessons: [
            "Daily execution plans must stay elastic to changing real-world conditions.",
            "A disruption should trigger instant recalculation, not guilt or abandonment.",
            "Users need the immediate next viable turn, not a rigid, shattered itinerary.",
          ],
          userQuestion: "My day changed. What makes sense now?",
          lifeOsOpportunity:
            "When a meeting overruns or an urgent emergency lands, Life OS enables one-click lightweight replanning around remaining energy and hours, without forcing a painful manual schedule rebuild.",
          badgeText: "Life OS → Replan without starting over",
        },
      ],
      principleTriad: "Prioritize like triage. Focus like Kanban. Adapt like navigation.",
      heroQuote:
        "The best systems do not eliminate uncertainty. They help people make the next best decision within it.",
      heroSubquote:
        "Life OS shouldn't create the perfect plan. It should help users make the next best decision, even when the plan changes.",
      hmwStatement:
        "How might Life OS help users decide what matters, focus on a manageable next action, and adapt their plan when life inevitably gets in the way?",
    },
  },
  {
    id: "empathize-ideology",
    type: "custom",
    component: "LifeOsIdeologyCoreValues",
    data: {
      badge: "Empathize",
      eyebrow: "Ideology",
      title: "Core values of Life OS",
      lead: "Before architecting features or wireframing interfaces, we established three core ideological pillars to ensure Life OS remains a catalyst for human agency rather than another bureaucratic productivity chore.",
      values: [
        {
          id: "clarity",
          number: "01",
          title: "Clarity over Complexity",
          icon: "🧘",
          accentColor: "#6366f1",
          premise: "Life OS should reduce mental effort, not add to it.",
          explanation:
            "The system helps users understand what matters, what can wait, and what the next action is without forcing them to maintain a complicated productivity setup.",
          goalStatement:
            "The goal is not to show users more information. It is to help them make fewer, better decisions.",
          designPrinciple:
            "If the system needs too much organising, configuring, or reviewing, it becomes part of the problem.",
        },
        {
          id: "action",
          number: "02",
          title: "Action over Organization",
          icon: "⚡",
          accentColor: "#10b981",
          premise: "A perfectly organised task list is useless if nothing moves forward.",
          explanation:
            "Life OS should constantly help users move from “I need to do this” to “This is the next thing I can actually start.” Tasks should become smaller, priorities clearer, and meaningful work easier to begin.",
          goalStatement:
            "Success is not how many tasks are stored. Success is whether the user can start, continue, and finish what matters.",
          designPrinciple:
            "Success is not how many tasks are stored. Success is whether the user can start, continue, and finish what matters.",
        },
        {
          id: "guidance",
          number: "03",
          title: "Guidance without Dependence",
          icon: "🧭",
          accentColor: "#ec4899",
          premise:
            "Life OS should help users make better decisions without making them dependent on the system.",
          explanation:
            "It can suggest priorities, expose repeated procrastination, and help replan when the day changes. But the user should still understand why something matters and remain in control of the final decision.",
          goalStatement:
            "Over time, the system should help people develop better planning, prioritisation, and execution habits of their own.",
          designPrinciple:
            "The product should reduce executive effort, not replace personal agency.",
        },
      ],
      emotionsTitle: "Target emotions for a sustainable system",
      emotions: [
        {
          id: "calm",
          emoji: "😌",
          label: "Calm",
          quote: "“I don't have to keep everything in my head.”",
          accent: "#38bdf8",
        },
        {
          id: "clarity",
          emoji: "👀",
          label: "Clarity",
          quote: "“I know what deserves my attention.”",
          accent: "#818cf8",
        },
        {
          id: "control",
          emoji: "🧭",
          label: "Control",
          quote: "“I know what I'm doing and why.”",
          accent: "#6366f1",
        },
        {
          id: "momentum",
          emoji: "🚀",
          label: "Momentum",
          quote: "“I've started. I'm making progress.”",
          accent: "#f59e0b",
        },
        {
          id: "accomplishment",
          emoji: "✅",
          label: "Accomplishment",
          quote: "“I moved something meaningful forward today.”",
          accent: "#10b981",
        },
        {
          id: "trust",
          emoji: "🤝",
          label: "Trust",
          quote: "“The system helps me without constantly interrupting me.”",
          accent: "#14b8a6",
        },
        {
          id: "growth",
          emoji: "🌱",
          label: "Growth",
          quote: "“I'm getting better at managing myself, not just my tasks.”",
          accent: "#4ade80",
        },
        {
          id: "adaptability",
          emoji: "🔄",
          label: "Adaptability",
          quote: "“My plan changed, but my day isn't ruined.”",
          accent: "#a855f7",
        },
        {
          id: "confidence",
          emoji: "💪",
          label: "Confidence",
          quote: "“I can follow through on the things I care about.”",
          accent: "#f43f5e",
        },
      ],
    },
  },
  {
    id: "empathize-redesigned-brief-hmw",
    type: "custom",
    component: "RedesignedBriefHmw",
    data: {
      badge: "Bridge to Ideation",
      briefTitle: "Redesigned Brief",
      briefText:
        "Design a personal productivity system that helps ambitious people turn intentions into action by making priorities clearer, plans more realistic, and the next step easier to start.",
      phaseBanner: "Ideate",
      hmwEyebrow: "Sparking thoughts",
      hmwTitle: "How Might We?",
      heroHmw: "HMW help people turn what they intend to do into what they actually do?",
      questions: [
        {
          id: "q-hero",
          text: "HMW help people turn what they intend to do into what they actually do?",
          category: "execution",
          weight: "hero",
          accentColor: "#10b981",
        },
        {
          id: "q-01",
          text: "HMW help users know what deserves their attention right now?",
          category: "priority",
          weight: "primary",
          accentColor: "#6366f1",
        },
        {
          id: "q-02",
          text: "HMW make important tasks easier to start?",
          category: "execution",
          weight: "primary",
          accentColor: "#8b5cf6",
        },
        {
          id: "q-03",
          text: "HMW reduce the friction between planning and doing?",
          category: "execution",
          weight: "primary",
          accentColor: "#10b981",
        },
        {
          id: "q-04",
          text: "HMW help users turn vague goals into clear next actions?",
          category: "execution",
          weight: "primary",
          accentColor: "#06b6d4",
        },
        {
          id: "q-05",
          text: "HMW prevent overwhelming task lists from becoming another source of stress?",
          category: "attention",
          weight: "medium",
          accentColor: "#f59e0b",
        },
        {
          id: "q-06",
          text: "HMW help users make realistic plans around the time they actually have?",
          category: "planning",
          weight: "primary",
          accentColor: "#3b82f6",
        },
        {
          id: "q-07",
          text: "HMW help users adapt when meetings, interruptions, or urgent work change the day?",
          category: "planning",
          weight: "primary",
          accentColor: "#ec4899",
        },
        {
          id: "q-08",
          text: "HMW reduce the mental effort of remembering every commitment?",
          category: "attention",
          weight: "medium",
          accentColor: "#64748b",
        },
        {
          id: "q-09",
          text: "HMW help users focus on fewer things at a time?",
          category: "attention",
          weight: "medium",
          accentColor: "#8b5cf6",
        },
        {
          id: "q-10",
          text: "HMW make it easier to return to work after an interruption?",
          category: "attention",
          weight: "medium",
          accentColor: "#06b6d4",
        },
        {
          id: "q-11",
          text: "HMW help users recognize tasks they repeatedly postpone?",
          category: "agency",
          weight: "medium",
          accentColor: "#f97316",
        },
        {
          id: "q-12",
          text: "HMW help users understand why important work keeps getting pushed to tomorrow?",
          category: "agency",
          weight: "medium",
          accentColor: "#f43f5e",
        },
        {
          id: "q-13",
          text: "HMW help users spend less time deciding what to do next?",
          category: "priority",
          weight: "medium",
          accentColor: "#6366f1",
        },
        {
          id: "q-14",
          text: "HMW connect everyday tasks to larger goals?",
          category: "agency",
          weight: "compact",
          accentColor: "#10b981",
        },
        {
          id: "q-15",
          text: "HMW help users protect meaningful work from urgent but lower-value tasks?",
          category: "priority",
          weight: "medium",
          accentColor: "#a855f7",
        },
        {
          id: "q-16",
          text: "HMW make unfinished work feel manageable instead of guilt-inducing?",
          category: "agency",
          weight: "compact",
          accentColor: "#64748b",
        },
        {
          id: "q-17",
          text: "HMW help users recover from a bad day without rebuilding their entire system?",
          category: "planning",
          weight: "medium",
          accentColor: "#06b6d4",
        },
        {
          id: "q-18",
          text: "HMW help users build consistency without relying on motivation?",
          category: "execution",
          weight: "compact",
          accentColor: "#f59e0b",
        },
        {
          id: "q-19",
          text: "HMW make progress visible without turning productivity into a score?",
          category: "agency",
          weight: "compact",
          accentColor: "#10b981",
        },
        {
          id: "q-20",
          text: "HMW design a system that saves more effort than it requires?",
          category: "agency",
          weight: "medium",
          accentColor: "#8b5cf6",
        },
        {
          id: "q-21",
          text: "HMW help users feel in control without over-optimizing every minute?",
          category: "agency",
          weight: "compact",
          accentColor: "#3b82f6",
        },
        {
          id: "q-22",
          text: "HMW guide users without making them dependent on the product?",
          category: "agency",
          weight: "compact",
          accentColor: "#ec4899",
        },
        {
          id: "q-23",
          text: "HMW support personal goals alongside a demanding full-time job?",
          category: "planning",
          weight: "compact",
          accentColor: "#f97316",
        },
        {
          id: "q-24",
          text: "HMW make capturing a thought almost effortless?",
          category: "attention",
          weight: "compact",
          accentColor: "#64748b",
        },
        {
          id: "q-25",
          text: "HMW help users finish what matters before starting something new?",
          category: "execution",
          weight: "compact",
          accentColor: "#10b981",
        },
        {
          id: "q-26",
          text: "HMW make the next best action obvious when priorities change?",
          category: "priority",
          weight: "medium",
          accentColor: "#6366f1",
        },
      ],
    },
  },
  {
    id: "empathize-learnings",
    type: "custom",
    component: "DesignLearnings",
    data: {},
  },
];

/* =========================================================================
   ARCHIVED / DEPRECATED LEGACY SECTIONS (Dry-run synthetic drafts)
   Preserved for historical reference, excluded from active case study view.
   ========================================================================= */
export const archivedLegacyEmpathizeSections: Section[] = [
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
