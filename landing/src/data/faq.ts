export interface FAQ {
  question: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: string[];
  closing?: string;
}

export const faqs: FAQ[] = [
  {
    question: "Is this just another to-do list?",
    paragraphs: [
      "No.",
      "Life OS is not designed to help you collect more tasks.",
      "It is designed to help you decide what matters, make a realistic plan, and actually start.",
    ],
  },
  {
    question: "Do I have to completely change how I work?",
    paragraphs: [
      "No.",
      "Life OS should fit around the tools and routines you already use.",
      "The goal is to reduce friction, not make you rebuild your entire productivity system.",
    ],
  },
  {
    question: "What if I already use Todoist, TickTick, Notion, or a calendar?",
    paragraphs: [
      "That is fine.",
      "Life OS is not trying to replace every tool you use.",
      "It focuses on the part many systems still leave to you:",
    ],
    callout: [
      "What should I do now?",
      "What can realistically fit today?",
      "How do I actually get started?",
    ],
  },
  {
    question: "Will Life OS plan my whole day for me?",
    paragraphs: [
      "Not blindly.",
      "It can help you make better decisions, but you stay in control.",
      "Your priorities, energy, deadlines, and changing circumstances still matter.",
    ],
  },
  {
    question: "What happens when my day goes completely off-plan?",
    paragraphs: [
      "You replan without starting from zero.",
      "Life OS should help you see what still matters, what can move, and what is no longer realistic.",
      "A broken plan should not mean a broken day.",
    ],
  },
  {
    question: "Can this actually help with procrastination?",
    paragraphs: [
      "It can reduce some of the friction that makes procrastination easier.",
      "For example:",
    ],
    bullets: [
      "unclear priorities",
      "tasks that feel too big",
      "unrealistic plans",
      "not knowing where to start",
      "repeatedly postponing the same work",
    ],
    closing: "But no tool can remove the need to act.",
  },
  {
    question: "Is this for people who are already productive?",
    paragraphs: [
      "Yes.",
      "Especially if you are ambitious, already use productivity tools, and still feel like too much of your time disappears into deciding, organizing, and reacting.",
    ],
  },
  {
    question: "Who is Life OS not for?",
    paragraphs: [
      "Probably not for you if:",
    ],
    bullets: [
      "you only need a simple checklist",
      "your current system already works well",
      "you want a full team project-management tool",
      "you enjoy endlessly configuring productivity systems",
      "you expect software to create motivation for you",
    ],
  },
  {
    question: "Will this become another app I have to maintain?",
    paragraphs: [
      "It should not.",
      "That is one of the core design principles.",
      "If Life OS takes more effort to manage than it saves, it has failed.",
    ],
  },
  {
    question: "What is Life OS actually trying to improve?",
    paragraphs: [
      "Not the number of tasks you complete.",
      "The goal is to help you:",
    ],
    callout: [
      "think more clearly, choose better, start sooner, and make consistent progress on what matters.",
    ],
  },
];