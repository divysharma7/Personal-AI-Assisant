export interface UseCase {
  audience: string;
  challenge: string;
  solution: string;
  outcome: string;
}

export const useCases: UseCase[] = [
  {
    audience: "Founders & Operators",
    challenge:
      "Your day is a mix of meetings, deep work, and reactive fire-fighting. Nothing is in one place.",
    solution:
      "Life OS puts your calendar, tasks, and focus sessions on one dashboard. The morning ritual forces you to pick the one outcome that matters.",
    outcome:
      "You start each day with a clear intention and end it knowing what actually moved forward.",
  },
  {
    audience: "Engineers & Makers",
    challenge:
      "You have side projects, habits you're building, and a full-time job. Context-switching kills your flow.",
    solution:
      "Focus mode dims everything except the current task. Link Pomodoros to specific tasks and track where your deep work actually goes.",
    outcome:
      "You get measurable focus time and stop wondering where the afternoon went.",
  },
  {
    audience: "Product Managers",
    challenge:
      "You manage backlogs, write specs, attend reviews, and try to maintain habits. Every tool is separate.",
    solution:
      "Kanban workflows handle your backlog. The Eisenhower Matrix surfaces what's urgent vs. important. Habits run alongside your work tasks.",
    outcome:
      "One workspace replaces your task manager, habit tracker, and weekly planner.",
  },
  {
    audience: "Knowledge Workers",
    challenge:
      "You read articles, attend meetings, and have ideas — but nothing gets captured or revisited.",
    solution:
      "The Memories system stores books, ideas, quotes, and links. The AI assistant recalls context from past chat sessions.",
    outcome:
      "Your second brain actually remembers things so you can focus on doing, not recalling.",
  },
];