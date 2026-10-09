export type ShowcaseTheme = "blue" | "light" | "gold" | "dark";

export interface ShowcaseData {
  theme: ShowcaseTheme;
  title: string;
  description: string;
  cta: string;
  tags: string[];
}

export const showcases: ShowcaseData[] = [
  {
    theme: "blue",
    title: "Your entire workspace, unified.",
    description:
      "Life OS brings tasks, habits, calendar, and focus into one interface. No more switching between five apps to plan your morning.",
    cta: "Explore the dashboard",
    tags: [
      "UNIFIED DASHBOARD",
      "TASK MANAGEMENT",
      "HABIT TRACKING",
      "CALENDAR SYNC",
      "SMART INBOX",
    ],
  },
  {
    theme: "light",
    title: "Guided days, not chaotic ones.",
    description:
      "Morning plan sets your intention. Today view shows only what matters. Evening shutdown decides what carries forward. A complete daily operating rhythm.",
    cta: "See the ritual flow",
    tags: [
      "MORNING RITUAL",
      "EVENING SHUTDOWN",
      "EISENHOWER MATRIX",
      "TIME BLOCKING",
      "CAPACITY AWARENESS",
    ],
  },
  {
    theme: "gold",
    title: "Deep work that actually counts.",
    description:
      "Start a Pomodoro from any task. Track focus time across days. Link sessions to habits or projects. Your concentration, measured and improved.",
    cta: "Try focus mode",
    tags: [
      "POMODORO TIMER",
      "STOPWATCH MODE",
      "SESSION HISTORY",
      "FOCUS TARGETS",
      "BREATHING RING",
    ],
  },
  {
    theme: "dark",
    title: "An AI that knows your whole day.",
    description:
      "The assistant reviews your tasks, habits, and focus data. It surfaces insights, remembers context between sessions, and summarizes your priorities every morning.",
    cta: "Meet the assistant",
    tags: [
      "AI BRIEF",
      "MEMORY SYSTEM",
      "CONTEXT AWARE",
      "CHAT HISTORY",
      "DAILY SUMMARIES",
    ],
  },
];