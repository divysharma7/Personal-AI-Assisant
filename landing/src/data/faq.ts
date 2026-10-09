export interface FAQ {
  question: string;
  answer: string;
}

export const faqs: FAQ[] = [
  {
    question: "Who is Life OS for?",
    answer:
      "Life OS is built for professionals, founders, and makers who juggle tasks, habits, meetings, and focus time — and want one calm interface instead of five disconnected apps.",
  },
  {
    question: "What problem does it solve?",
    answer:
      "Most people use separate apps for to-dos, calendars, habit tracking, timers, and notes. Life OS unifies all of these into a single workspace with an AI assistant that understands your full day.",
  },
  {
    question: "How does the onboarding process work?",
    answer:
      "After signing up, you answer a few questions about your role, priorities, and whether you want to connect Google Calendar. Life OS configures your dashboard, suggests starter habits, and drops you into a ready workspace.",
  },
  {
    question: "Does it integrate with existing tools?",
    answer:
      "Yes. Life OS has two-way Google Calendar sync so your external events appear alongside tasks and habits. A REST API is also available for custom integrations.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Every user's data is fully isolated. The API enforces ownership filtering on every query — you can only see your own data. Authentication uses signed JWTs stored in HTTP-only cookies.",
  },
  {
    question: "Can teams use it collaboratively?",
    answer:
      "Life OS is currently designed for individual use. List sharing and team workspaces are on the roadmap.",
  },
  {
    question: "How long does setup take?",
    answer:
      "Under two minutes. Sign up, answer the onboarding questions, and you're in. No credit card required for the free tier.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes. The free plan includes task management, habit tracking, calendar, focus sessions, and the AI assistant. Upgrade to Pro for unlimited workflows and advanced statistics.",
  },
];