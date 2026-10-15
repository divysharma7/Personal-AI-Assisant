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
      "Unified dashboard",
      "Task management",
      "Habit tracking",
      "Calendar sync",
      "Smart inbox",
    ],
  },
  {
    theme: "light",
    title: "A calmer way to move through your day.",
    description:
      "Plan around the time you actually have, stay with what matters, then close the day knowing what's done and what's next.",
    cta: "See the ritual flow",
    tags: [
      "Morning ritual",
      "Evening shutdown",
      "Eisenhower matrix",
      "Time blocking",
      "Capacity awareness",
    ],
  },
  {
    theme: "gold",
    title: "Deep work that actually counts.",
    description:
      "Start a Pomodoro from any task. Track focus time across days. Link sessions to habits or projects. Your concentration, measured and improved.",
    cta: "Try focus mode",
    tags: [
      "Pomodoro timer",
      "Stopwatch mode",
      "Session history",
      "Focus targets",
      "Breathing ring",
    ],
  },
  {
    theme: "dark",
    title: "An AI that knows your whole day.",
    description:
      "The assistant reviews your tasks, habits, and focus data. It surfaces insights, remembers context between sessions, and summarizes your priorities every morning.",
    cta: "Meet the assistant",
    tags: [
      "AI brief",
      "Memory system",
      "Context aware",
      "Chat history",
      "Daily summaries",
    ],
  },
];