export type ProductVariant =
  | "hero"
  | "medium"
  | "small"
  | "wide"
  | "tall";

export interface Product {
  title: string;
  description: string;
  icon: string;
  variant: ProductVariant;
  gridArea: string;
  entryFrom: "top" | "left" | "right" | "bottom";
  color: string;
}

export const products: Product[] = [
  {
    title: "Today",
    description: "See what matters right now.",
    icon: "☀",
    variant: "hero",
    gridArea: "hero",
    entryFrom: "top",
    color: "#6366f1",
  },
  {
    title: "Tasks",
    description: "Organize everything in one place.",
    icon: "☑",
    variant: "medium",
    gridArea: "tasks",
    entryFrom: "left",
    color: "#22c55e",
  },
  {
    title: "Focus",
    description: "Deep work that counts.",
    icon: "⏱",
    variant: "medium",
    gridArea: "focus",
    entryFrom: "right",
    color: "#f59e0b",
  },
  {
    title: "Calendar",
    description: "Your schedule, unified.",
    icon: "📅",
    variant: "wide",
    gridArea: "calendar",
    entryFrom: "bottom",
    color: "#3b82f6",
  },
  {
    title: "Habits",
    description: "Build streaks that stick.",
    icon: "🔥",
    variant: "small",
    gridArea: "habits",
    entryFrom: "left",
    color: "#ef4444",
  },
  {
    title: "AI Chat",
    description: "Knows your whole day.",
    icon: "✦",
    variant: "tall",
    gridArea: "ai",
    entryFrom: "right",
    color: "#8b5cf6",
  },
  {
    title: "Workflows",
    description: "Visual boards for every project.",
    icon: "◫",
    variant: "small",
    gridArea: "workflows",
    entryFrom: "bottom",
    color: "#06b6d4",
  },
  {
    title: "Statistics",
    description: "Measure what matters.",
    icon: "▧",
    variant: "medium",
    gridArea: "stats",
    entryFrom: "bottom",
    color: "#ec4899",
  },
];