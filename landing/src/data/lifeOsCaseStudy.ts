export const caseStudyMeta = {
  eyebrow: "A research-led product case study",
  title: "When the day changes,\nthe plan should make sense again.",
  intro:
    "A four-phase case study into how India-based, self-managing knowledge workers can turn scattered work and personal commitments into a day they can actually use.",
  status:
    "Desk research and analyst synthesis complete. Primary interviews, co-creation and usability testing have not been conducted.",
  date: "Research finalized 10 October 2026 · India time",
  audience: "Self-managing knowledge workers in India",
  scope: "Work, time, personal routines and focus",
  readTime: "Two research chapters",
  chapterLinks: [
    { id: "discovery", number: "01", label: "Discovery" },
    { id: "empathy", number: "02", label: "Empathy" },
    { id: "convergence", number: "03", label: "Convergence" },
    { id: "solution", number: "04", label: "Solution" },
    { id: "sources", number: "↗", label: "Sources & limits" },
  ],
};

export const evidenceLabels = {
  secondary: "Secondary research",
  discussion: "Public discussion",
  synthesis: "Analyst synthesis",
  simulated: "Simulated response",
  provisional: "Provisional persona",
  planned: "Planned validation",
};

export const discovery = {
  kicker: "Chapter one · Discover",
  title: "The work is fragmented. So is the work of keeping it together.",
  intro:
    "The investigation started beyond the next productivity feature: with the repeated translations between tasks, calendars, routines, focus tools and communication channels.",
  context: {
    title: "Two kinds of fragmentation",
    groups: [
      {
        label: "Outside the system",
        summary: "Work arrives from many directions.",
        items: [
          "Meetings interrupt planned work",
          "Chat and email create reactive queues",
          "Calendar availability and task priority live apart",
          "Knowledge, tasks and reminders are spread across tools",
        ],
      },
      {
        label: "Inside self-management",
        summary: "A backlog is not a realistic day.",
        items: [
          "Habits and personal routines compete with work",
          "Focus sessions disconnect from the task plan",
          "Disruptions trigger repeated re-prioritization",
          "Maintaining the system becomes work of its own",
        ],
      },
    ],
    path: ["Chat", "Task list", "Calendar", "Focus", "Routine", "Reflection"],
    note:
      "A commitment can pass through several representations before it becomes protected execution time.",
  },
  statistics: [
    {
      value: "68%",
      label: "said they lacked uninterrupted focus time",
      context: "Microsoft global Work Trend Index · 2023",
      source: "https://www.microsoft.com/en-us/worklab/work-trend-index/will-ai-fix-work",
      sourceLabel: "Read the 2023 Work Trend Index",
      evidence: "secondary",
    },
    {
      value: "≈4h",
      label: "per week spent reorienting after app switches",
      context: "HBR study: 137 users, 20 teams, three firms · 2022",
      source: "https://hbr.org/2022/08/how-much-time-and-energy-do-we-waste-toggling-between-applications",
      sourceLabel: "Read the HBR study",
      evidence: "secondary",
    },
    {
      value: "2 min",
      label: "average interval between pings in the highest-ping cohort",
      context: "Microsoft · Breaking down the infinite workday · 2025",
      source: "https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday",
      sourceLabel: "Read the 2025 report",
      evidence: "secondary",
    },
    {
      value: "48%",
      label: "of surveyed employees described work as chaotic and fragmented",
      context: "Microsoft · Breaking down the infinite workday · 2025",
      source: "https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday",
      sourceLabel: "Read the 2025 report",
      evidence: "secondary",
    },
  ],
  india: {
    title: "Two India signals. Two different surveys.",
    description:
      "Both findings make the context worth investigating. They do not describe the same participants or establish demand for another planning tool.",
    stats: [
      {
        value: "92%",
        label: "of Indian knowledge workers reported using AI at work",
        context: "Microsoft–LinkedIn Work Trend Index · 2024",
        source: "https://news.microsoft.com/en-in/92-of-indian-knowledge-workers-use-ai-in-the-workplace-finds-microsoft-and-linkedin-2024-work-trend-index/",
      },
      {
        value: "78%",
        label: "of Indian workers said they lacked uninterrupted focus",
        context: "Microsoft India Work Trend Index · 2023",
        source: "https://news.microsoft.com/en-in/microsoft-work-trend-index-2023-releases-new-insights-on-how-ai-will-change-the-way-we-work-in-india/",
      },
    ],
  },
  audience: {
    title: "Narrowing to the self-managed work phase",
    description:
      "The working audience is not every employee. It is India-based, English-speaking individual knowledge workers who coordinate tasks, calendar commitments, personal routines and focus across tools while managing their own priorities.",
    stages: ["Capture", "Prioritize", "Schedule", "Execute", "Recover", "Re-plan"],
    note:
      "The translation loop is an analyst hypothesis about where higher-leverage friction may sit; it is not an observed prevalence claim.",
  },
  signals: [
    {
      title: "Upkeep competes with work",
      type: "Public discussion",
      body:
        "A poster described daily logging and maintenance as effortful. A commenter used “sync tax” while promoting a product, so this is a low-confidence lead, not independent prevalence evidence.",
      href: "https://www.reddit.com/r/ProductivityApps/comments/1u0bi0x/ive_tried_multiple_productivity_and_habittracking/",
      source: "Discussion retrieved 9 October 2026 UTC; exact posting date unconfirmed",
    },
    {
      title: "Shared time has different owners",
      type: "Analyst synthesis",
      body:
        "Work and personal commitments may have different audiences and owners. This is a stakeholder hypothesis, not a finding from managers or families.",
    },
    {
      title: "A simpler stack may already work",
      type: "Public discussion",
      body:
        "Some participants favour a small multi-tool setup. Consolidation is optional; satisfied users and people whose main difficulty is starting work are important counterexamples.",
      href: "https://www.reddit.com/r/ProductivityApps/comments/1sxzf5h/unpopular_opinion_most_people_need_fewer/",
      source: "Self-selected public discussion; retrieved 9 October 2026 UTC",
    },
  ],
  synthetic: [
    {
      question: "How does a task become something you do today?",
      answer: "It may move from chat or memory to a task tool, calendar, then get rearranged when meetings change.",
      hypothesis: "Users manually translate tasks into time repeatedly.",
    },
    {
      question: "What part of planning feels like admin?",
      answer: "Estimating every item and repeatedly dragging blocks may feel like maintenance rather than progress.",
      hypothesis: "Planning support should lower upkeep, not add ceremony.",
    },
    {
      question: "What happens when the day changes at 2 PM?",
      answer: "The plan may go stale; someone switches to the urgent item and postpones reconciliation.",
      hypothesis: "Re-planning may be a critical moment to study.",
    },
    {
      question: "Would you let AI rearrange your day?",
      answer: "A plausible response is to welcome suggestions and resist silent changes.",
      hypothesis: "Test advisory AI, explanations and user control.",
    },
    {
      question: "Where do habits fit?",
      answer: "A routine in a separate system may disappear first when work expands.",
      hypothesis: "Test whether personal routines need to share a capacity model.",
    },
    {
      question: "What makes one app overwhelming?",
      answer: "Showing every commitment at once may create attentional overload.",
      hypothesis: "Test whether people can see the next useful decision.",
    },
  ],
  journey: [
    { title: "Morning setup", state: "Hopeful · in control", body: "Reviews inbox, calendar and overdue work; chooses priorities and tries to protect focus." },
    { title: "First execution", state: "Focused · fragile", body: "Begins meaningful work; a request arrives and pulls attention to another app." },
    { title: "Midday compression", state: "Pressured · uncertain", body: "A meeting runs long, capacity shrinks and a routine may be deferred." },
    { title: "Afternoon re-plan", state: "Cognitively loaded", body: "Chooses between urgent and valuable work; the plan needs manual reconciliation." },
    { title: "Evening closure", state: "Relief · incompleteness", body: "Some work moves forward, while open tasks lack a clear next slot." },
  ],
  journeyNote:
    "A provisional arc for one plausible day, not a universal journey or participant-reported emotion curve. Reality changes faster than the system may be reconciled.",
  impact: [
    { name: "Cognitive load", detail: "Mental effort spent remembering and reconciling systems.", focus: true },
    { name: "Time control", detail: "Seeing what can realistically fit.", focus: true },
    { name: "Focus", detail: "Staying with meaningful work long enough to progress.", focus: true },
    { name: "Follow-through", detail: "Turning intentions into scheduled and completed action." },
    { name: "Wellbeing", detail: "Planning that does not amplify guilt or spillover." },
    { name: "Trust & agency", detail: "Understandable, reversible and user-controlled support.", focus: true },
  ],
  opportunities: [
    { number: "01", title: "Reduce cross-system reconciliation", body: "Investigate where users repeat decisions while translating commitments, priorities and time." },
    { number: "02", title: "Reduce recovery effort", body: "Learn what people need to reconsider after disruption and which commitments they cannot change." },
    { number: "03", title: "Preserve attention and agency", body: "Find what information helps people act now and which decisions they want to retain." },
  ],
  hmw:
    "How might we help self-managing knowledge workers in India turn scattered work and personal commitments into a realistic, adaptable daily plan that remains calm enough to use throughout the day?",
  whyNow:
    "Knowledge work is becoming more digitally dense. India combines high AI adoption with reported focus and time/energy pressure, while productivity products add automation and integrations. The opportunity is a clear daily decision loop—not feature breadth.",
  expectedImpact: [
    "Individual: less mental effort deciding what to do next.",
    "Relational: fewer missed or conflicting commitments when calendar reality is visible.",
    "Work and personal system: stronger follow-through on priority work and routines.",
    "Market: AI that recommends and explains instead of silently taking over.",
  ],
  interviewQuestions: [
    "Walk me through yesterday from the moment you first checked work until you stopped.",
    "Which apps or surfaces did you use to capture, plan, schedule, focus and reflect?",
    "Show me the last time a task moved from “I should do this” to a calendar slot or actual work session.",
    "What usually makes your morning plan inaccurate by afternoon?",
    "When the day changes, which items do you drop first and why?",
    "What parts of your productivity system do you maintain only because another tool requires it?",
    "Tell me about a time an automation or AI suggestion felt useful. What made you trust it?",
    "Tell me about a time automation felt wrong, intrusive or too rigid.",
    "Where do exercise, reading, family, health or other personal routines live relative to your work calendar?",
    "If one screen could answer only one question at 10 AM, 2 PM and 7 PM, what should that question be?",
    "What information would you not want an AI assistant to infer or modify automatically?",
    "What would make an all-in-one productivity app feel more overwhelming than separate apps?",
  ],
  recruitment: [
    "Uses at least two of: task manager, calendar, habit tracker, focus timer, notes or AI assistant.",
    "Self-manages daily priorities rather than receiving a fixed queue.",
    "Works in a role with meetings/messages plus independent output.",
    "Include disrupted-day users and satisfied comparisons; do not require everyone to report the hypothesised problem.",
    "Mix manual planners and people who have tried auto-scheduling.",
  ],
  confidence: [
    { claim: "Digital work is fragmented and interruption-heavy", level: "High", basis: "Microsoft telemetry and global survey evidence." },
    { claim: "App switching imposes reorientation cost", level: "Medium–high", basis: "HBR observational study: 137 users, 20 teams, three firms." },
    { claim: "Indian workers report AI use and focus scarcity", level: "High", basis: "Microsoft–LinkedIn India and Microsoft India surveys." },
    { claim: "Some people describe maintenance and feature overload", level: "Low", basis: "Two public discussions; self-selected, with promotional content and unknown geography." },
    { claim: "People prefer advisory AI to silent replanning", level: "Low–medium", basis: "Synthetic hypothesis and category inference; interviews needed." },
    { claim: "Daily orchestration is a coherent direction", level: "Low–medium", basis: "Analyst synthesis; superiority to other problems remains untested." },
  ],
  sources: [
    { id: "E1", name: "Microsoft global Work Trend Index", detail: "9 May 2023 · 31,000 workers across 31 markets", limit: "Supports reported global focus scarcity; not planner demand or causal product effects.", href: "https://www.microsoft.com/en-us/worklab/work-trend-index/will-ai-fix-work" },
    { id: "E2", name: "Microsoft India Work Trend Index", detail: "1 June 2023", limit: "India context; not a representative estimate for this target segment.", href: "https://news.microsoft.com/en-in/microsoft-work-trend-index-2023-releases-new-insights-on-how-ai-will-change-the-way-we-work-in-india/" },
    { id: "E3", name: "Microsoft–LinkedIn India Work Trend Index", detail: "16 May 2024", limit: "Reported AI use; not willingness to share calendars or allow rescheduling.", href: "https://news.microsoft.com/en-in/92-of-indian-knowledge-workers-use-ai-in-the-workplace-finds-microsoft-and-linkedin-2024-work-trend-index/" },
    { id: "E4", name: "Microsoft · Breaking down the infinite workday", detail: "June 2025 · telemetry ends 15 February 2025", limit: "High-ping cohort; not every worker's interruption rate. Education and EU tenants excluded.", href: "https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday" },
    { id: "E5", name: "Murty, Dadlani & Das · HBR app switching", detail: "29 August 2022 · 20 teams, 137 users, three firms", limit: "Enterprise business workflows, not only personal planning; no product savings estimate.", href: "https://hbr.org/2022/08/how-much-time-and-energy-do-we-waste-toggling-between-applications" },
    { id: "E6", name: "Leroy · Attention residue", detail: "2009 · two experiments", limit: "Supports tested task-transition effects, not clinical wellbeing or timer benefits.", href: "https://doi.org/10.1016/j.obhdp.2009.04.002" },
    { id: "E7", name: "Implementation intentions meta-analysis", detail: "Gollwitzer & Sheeran 2006; Sheeran et al. 2024", limit: "Evidence for implementation intentions, not ordinary scheduling or AI planning.", href: "https://doi.org/10.1016/S0065-2601(06)38002-1" },
    { id: "E8", name: "Two linked public discussions", detail: "Retrieved 9 October 2026 UTC", limit: "Qualitative leads only; no prevalence, verified identity, geography or stakeholder triangulation.", href: "https://www.reddit.com/r/ProductivityApps/comments/1u0bi0x/ive_tried_multiple_productivity_and_habittracking/" },
  ],
  audit: "Editorial self-audit scores are judgments, not measured quality or user outcomes. Evidence rigor was rated 7/10; the main gap is primary fieldwork.",
};

export const empathy = {
  kicker: "Chapter two · Deepen empathy",
  title: "A plan lives inside an ecosystem of people, tools and interruptions.",
  intro:
    "Phase 2 widens the lens from “too many apps” to the number of decisions and translations needed to move an intention into action. Its maps and personas remain provisional because fieldwork did not happen.",
  funnel: [
    ["01", "Intent exists", "I need or want to do this."],
    ["02", "Intent is captured", "Task, message, note, reminder or memory."],
    ["03", "Intent is clarified", "Next action, deadline and importance."],
    ["04", "Intent is prioritized", "It competes with work and personal commitments."],
    ["05", "Intent receives time", "A realistic slot exists in the day."],
    ["06", "Time is protected", "New work does not immediately displace it."],
    ["07", "Work begins", "The user enters execution with context."],
    ["08", "Work closes", "Done, consciously deferred or re-planned."],
  ],
  funnelNote:
    "Conceptual behavioral filtration, not measured conversion. Likely friction points are capture → clarify, prioritize → time, time → protection and execution → closure. A diary study should measure them.",
  contexts: [
    "Hybrid or remote work with high message and meeting volume",
    "Individual-contributor work that requires focus and responsiveness",
    "Side projects, care, study or health routines competing with work time",
    "Cross-time-zone teams that may expand the workday",
    "Early-career workers building planning habits",
    "Several productivity tools without a stable source of truth",
  ],
  scripts: [
    { title: "Responsiveness can outrank intention", body: "A carefully planned day can be socially overridden by incoming work. This combines India survey context with global interruption research; it is not a universal cultural claim." },
    { title: "Sophistication can become a proxy for control", body: "Public communities show people cycling through tags, integrations and tools. A sophisticated setup is not necessarily lower cognitive load." },
    { title: "AI use does not equal AI authority", body: "Reported AI adoption lowers a possible adoption barrier; it does not prove people want silent automation. Availability and authority are separate questions." },
  ],
  services: [
    { type: "Broad personal organiser", mechanism: "Tasks, calendars, habits and focus in one system", implication: "Feature breadth already exists", question: "Does consolidation lower maintenance for this person?" },
    { type: "Guided daily planner", mechanism: "Planning and shutdown rituals; task durations around events", implication: "Realistic capacity is addressed in the category", question: "Does recovery remain difficult?" },
    { type: "Automatic scheduler", mechanism: "Places tasks using availability, duration, deadlines and priority", implication: "Rescheduling is already offered", question: "What delegation feels understandable?" },
    { type: "Consolidated planning workspace", mechanism: "Imported tasks, time blocking, rituals and focus", implication: "Importing can lower copying effort", question: "Does integration reduce work or add sync supervision?" },
    { type: "Task manager with calendar integration", mechanism: "Scheduled tasks mirrored to external calendars", implication: "Task/time links are familiar", question: "Which decisions remain manual?" },
  ],
  serviceConclusion:
    "Capacity-aware planning and recovery are not uncovered capabilities. Feature pages show what services offer, not user satisfaction, adoption, retention or a unique market gap.",
  stakeholders: {
    core: ["Target user / knowledge worker", "Manager or direct lead", "Immediate teammates", "Meeting organizers", "Partner / family / household", "Future self inheriting deferred work"],
    involved: ["Clients / external collaborators", "Cross-functional teams", "Calendar providers", "Communication platforms", "Organizational task systems", "Personal health / fitness / habit routines", "AI assistants and automation agents", "Notification systems", "Device ecosystem and OS reminders"],
    informed: ["Employer IT / security policy", "Privacy and data-protection expectations", "App marketplaces and subscriptions", "Productivity coaches / creators / communities", "Integrations / API providers", "Family calendars and shared-event systems"],
  },
  stakeholderTension:
    "The user controls only part of the system. A planner cannot prevent a manager moving a meeting, a client escalating a deadline or a family obligation appearing. Recovery from change matters.",
  publicPerspectives: [
    { perspective: "Original app poster", evidence: "Reports upkeep, feature overload and stopping use", limit: "Motivation and cost may also explain abandonment." },
    { perspective: "Tool-builder commenter", evidence: "Describes maintenance while promoting a product", limit: "Commercial interest; not independent triangulation." },
    { perspective: "Simple-tool users", evidence: "Some replies favour a small existing stack", limit: "Counterexample to assuming consolidation is required." },
    { perspective: "Fewer-tools discussion", evidence: "Challenges productivity-tool proliferation", limit: "Self-selected discussion; no population estimate." },
    { perspective: "Manager, partner, IT/security", evidence: "No primary evidence collected", limit: "Perspectives remain open research questions." },
  ],
  stakeholderHypotheses: [
    "Managers may need focus time to appear unavailable without exposing private task details.",
    "Partners and family may need shared commitments while work details remain private.",
    "IT/security may require explicit calendar and AI permissions with clear data boundaries.",
    "Users may value recovery support more than unexplained autonomous decisions.",
  ],
  branches: [
    { title: "Capture fragmentation", items: ["Work arrives via chat, email, meetings, notes and memory", "Duplicate capture across personal and work systems", "Copied tasks lose source context", "Inboxes are not consistently processed", "Tasks lack duration, deadline or next action"] },
    { title: "Priority ambiguity", items: ["Urgency competes with importance", "Routines are easier to drop than visible meetings", "Long backlogs flatten meaningful differences", "Newest requests can win by default", "Priority labels disconnect from calendar reality"] },
    { title: "Capacity blindness", items: ["Task lists have no hard link to available hours", "Optimistic estimates make plans impossible", "Meetings consume peak-focus windows", "Overcommitment appears too late", "Deferred work grows without a recovery strategy"] },
    { title: "Execution friction", items: ["App switching breaks context", "Setup overhead delays starting", "Unfinished tasks leave attention residue", "Notifications interrupt deep work", "The next action is not always clear"] },
    { title: "Re-planning burden", items: ["One meeting change invalidates blocks", "Manual drag-and-drop becomes calendar Tetris", "Auto-replanning may feel controlling", "Trade-offs need explanation", "Today can go stale by afternoon"] },
    { title: "System sustainability", items: ["Feature breadth becomes visual noise", "Streaks can create guilt", "Tags and integrations become admin", "Systems are abandoned after novelty fades", "Privacy limits cross-tool context and AI"] },
  ],
  discoveries: [
    { title: "Interruption is structural", body: "Microsoft’s roughly two-minute interval describes a high-ping cohort, not every worker. A resilient plan should be studied under change." },
    { title: "Specific plans merit study", body: "Implementation-intention evidence supports specific when/where/how plans. A calendar block alone is not the same intervention." },
    { title: "The category already overlaps", body: "Services document projected capacity, protected blocks, adaptive scheduling and correction. Any advantage needs comparison with a capable competitor." },
  ],
  experience: [
    { stage: "Start day", action: "Checks messages, calendar, overdue tasks and habits", thought: "What actually matters today?", friction: "Several sources of truth; priorities may not fit time", direction: "Understand priorities against finite time" },
    { stage: "Commit", action: "Chooses tasks, estimates time, blocks focus", thought: "This looks doable.", friction: "Estimation and timeboxing overhead", direction: "Study effort and uncertainty" },
    { stage: "Execute", action: "Works on a priority task, may use focus mode", thought: "Let me stay with this.", friction: "Notifications and context switches", direction: "Study what helps someone begin" },
    { stage: "Disruption", action: "Meeting overruns; a request arrives", thought: "My plan no longer fits.", friction: "Re-planning cost and attention residue", direction: "Identify recovery information" },
    { stage: "Recover", action: "Defers, moves tasks, drops a routine or reshuffles", thought: "What can I safely move?", friction: "Rebuild manually or give up", direction: "Reduce the effort of choosing what changes" },
    { stage: "Close day", action: "Reviews completed work and tomorrow", thought: "Did I make progress?", friction: "Open loops carry forward mentally", direction: "Learn which decisions need closure" },
  ],
  fieldworkLayers: ["Action: clicks, tools, transitions and workarounds", "Context: location, meeting density, device and social demands", "Cognition: decisions, memory burden, uncertainty and trust", "Emotion: confidence, pressure, relief, guilt and control"],
  enactment: {
    status: "Participant bodystorming did not occur.",
    prompt: "A future session could reconstruct a recent “plan broke at 2 PM” moment using real tools, then introduce one change at a time.",
    observe: ["Which screen opens first", "What gets edited or ignored", "Whether focus blocks survive", "What information is needed to decide what moves", "Desired automation vs suggestion vs control", "When the tool starts to feel like extra work"],
    scenario: "Constructed scenario: 3.5 free hours, four tasks totaling four hours, a 30-minute protected workout included in that budget, and a separate 30-minute meeting that extends to 75 minutes. Initial demand is 270 minutes against 210 available; the overrun widens the gap from 60 to 105 minutes.",
    hypothesis: "A static list may hide the capacity conflict; a calendar may hide task importance; aggressive auto-scheduling may move work without explaining why. Investigate constraint + consequence + choice. This is not observed user data.",
  },
  personas: [
    {
      name: "The Deliberate Planner",
      label: "Provisional persona · fictional scenario, not interview-derived",
      fictional: "Ananya · product designer in a hybrid team",
      context: "A self-managed phase with cross-functional work, exercise and learning routines. The current stack described in the source is an invented scenario, not a verified participant.",
      goals: ["Protect meaningful focus blocks", "Know what can fit before committing", "Keep routines without micromanagement", "Close the day clearly"],
      motivations: ["Values control and intention", "Finds planning reassuring", "Wants less admin without invisible decisions"],
      frictions: ["Manual reconciliation after schedule changes", "Duplicate tasks across work and personal systems", "Dashboards show too much", "Distrusts unexplained auto-scheduling"],
      hypothesis: "May want a better plan surfaced while keeping final control over what moves.",
    },
    {
      name: "The Adaptive Executor",
      label: "Provisional persona · fictional scenario, not interview-derived",
      fictional: "Rohan · engineer working across India and US time zones",
      context: "An early-career self-directed role with a frequently changing schedule. The persona is a hypothesis, not a recruited user.",
      goals: ["Spend less morning energy planning", "Know the next useful action", "Recover quickly", "Keep work from expanding into the evening"],
      motivations: ["Values speed and low ceremony", "Is comfortable with AI", "May want routine patterns inferred over time"],
      frictions: ["Forgets updates after interruptions", "Personal routines can disappear", "Resents metadata-heavy setup", "Abandons systems needing daily grooming"],
      hypothesis: "May value ongoing orientation more than maintaining a detailed system.",
    },
  ],
  challenged: [
    { assumption: "Consolidation guarantees less overwhelm", signal: "Public abandonment accounts and satisfied multi-tool users complicate that idea.", question: "Under what conditions does consolidation help, and when does it add overhead?" },
    { assumption: "The main pain is capturing tasks", signal: "Fast capture is common in documented services; tension may emerge after capture.", question: "Where do priority, capacity, disruption and re-planning become difficult?" },
    { assumption: "AI differentiation means more automation", signal: "Scheduling services already automate; India AI use does not imply trust in silent changes.", question: "What explanation, correction and control would make assistance acceptable?" },
  ],
  scope:
    "This work cannot control meeting culture, manager behavior, message volume or life events. Its proposed scope remains understanding how an individual makes, executes and recovers a realistic daily plan across tasks, time, routines and focus.",
  researchPlan: {
    sample: ["8–12 target users", "At least three heavy manual planners", "At least three AI-positive users", "Include people who abandoned an integrated tool and people satisfied with their system", "Mix design/product, engineering, operations/consulting and independent/freelance roles"],
    methods: ["45-minute contextual interview with current tools open", "Three-day lightweight diary: morning plan, first disruption and evening close", "30-minute reconstruction of a plan-breaking moment", "Explore acceptable delegation boundaries"],
    measures: ["Tools touched during morning planning", "Time to produce a realistic plan", "Midday manual plan edits", "Planned focus blocks disrupted", "Self-rated clarity about what to do next", "Self-rated control/trust after an AI suggestion", "Personal routines dropped when work expands"],
  },
  sourceLinks: [
    { label: "TickTick features", href: "https://ticktick.com/features" },
    { label: "Sunsama · daily planning and shutdown", href: "https://www.sunsama.com/features/daily-planning-and-shutdown" },
    { label: "Sunsama · timeboxing", href: "https://www.sunsama.com/features/timeboxing" },
    { label: "Motion · AI Calendar", href: "https://www.usemotion.com/features/ai-calendar" },
    { label: "Motion · auto-scheduling reference", href: "https://www.usemotion.com/help/time-management/auto-scheduling/reference-auto-scheduling" },
    { label: "Akiflow features", href: "https://akiflow.com/features" },
    { label: "Todoist calendar integration", href: "https://www.todoist.com/help/articles/use-the-calendar-integration-rCqwLCt3G" },
    { label: "Microsoft Research · Human–AI interaction guidelines", href: "https://www.microsoft.com/en-us/research/articles/guidelines-for-human-ai-interaction-eighteen-best-practices-for-human-centered-ai-design/" },
    { label: "Grand View Research · Productivity management software market", href: "https://www.grandviewresearch.com/industry-analysis/productivity-management-software-market" },
    { label: "Grand View Research · AI productivity tools market", href: "https://www.grandviewresearch.com/industry-analysis/ai-productivity-tools-market-report" },
    { label: "Life OS product repository", href: "https://github.com/divysharma7/Personal-AI-Assisant" },
    { label: "UX Case Study Writer method", href: "https://github.com/divysharma7/ux-case-study-writer" },
  ],
  audit: "The source’s self-audit scores are editorial judgments, not user outcomes: ecosystem breadth 9/10, empathic granularity 6/10 and persona contrast/humility 8/10. Empathic granularity is weakest because there was no contextual observation, field visit or recruited quote.",
};

export const evidenceGlossary = [
  { label: "Secondary research", detail: "Published surveys, telemetry and peer-reviewed studies." },
  { label: "README-documented capability", detail: "Builder-described product foundation; not independently audited." },
  { label: "Public discussion", detail: "Self-selected community accounts; directional signals only." },
  { label: "Analyst synthesis", detail: "Interpretation that needs comparison or field validation." },
  { label: "Simulated response", detail: "Hypothesis-generation material, never participant evidence." },
  { label: "Provisional persona", detail: "Fictional scenario used to test questions, not a recruited person." },
  { label: "Proposed experience", detail: "Design recommendation, not a verified current product behavior." },
  { label: "Planned validation", detail: "Future research activity; not conducted or measured." },
];
