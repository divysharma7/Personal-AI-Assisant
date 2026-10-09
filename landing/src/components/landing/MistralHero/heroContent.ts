import type { HeroPhase } from "./useHeroSequence";

export const heroCopy = {
  headline: {
    eyebrow: "THE OPERATING SYSTEM FOR YOUR DAY",
    title: "Powerful ideas.\nIn your hands.",
    subtitle:
      "One calm interface for tasks, habits, calendar, focus sessions, workflows, and AI.",
  },
  panel: {
    eyebrow: "OUR MISSION",
    mission: "We help people run their entire day from one calm interface.",
  },
  statement: "Everything connects.\nEverything flows.",
};

export const panelFeatures = [
  { symbol: "✳", title: "Tasks & Habits", detail: "Everything in one view." },
  { symbol: "◈", title: "Focus Sessions", detail: "Deep work that counts." },
  { symbol: "↗", title: "AI Assistant", detail: "Knows your whole day." },
];

export const matrixCells = [
  { id: 1, tone: "blue" },
  { id: 2, tone: "blue-dark" },
  { id: 3, tone: "gold" },
  { id: 4, tone: "blue" },
  { id: 5, tone: "white" },
  { id: 6, tone: "blue-dark" },
  { id: 7, tone: "gold" },
  { id: 8, tone: "blue" },
  { id: 9, tone: "blue" },
  { id: 10, tone: "gold" },
  { id: 11, tone: "blue-dark" },
  { id: 12, tone: "blue" },
];

export interface CellLayout {
  id: number;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

const fullLayout: CellLayout[] = [
  { id: 1, col: 1, row: 1, colSpan: 2, rowSpan: 1 },
  { id: 2, col: 3, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 3, col: 4, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 4, col: 5, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 5, col: 6, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 6, col: 1, row: 2, colSpan: 1, rowSpan: 1 },
  { id: 7, col: 2, row: 2, colSpan: 1, rowSpan: 1 },
  { id: 8, col: 3, row: 2, colSpan: 2, rowSpan: 1 },
  { id: 9, col: 5, row: 2, colSpan: 1, rowSpan: 1 },
  { id: 10, col: 6, row: 2, colSpan: 1, rowSpan: 1 },
  { id: 11, col: 1, row: 3, colSpan: 2, rowSpan: 1 },
  { id: 12, col: 3, row: 3, colSpan: 1, rowSpan: 1 },
];

const statementLayout: CellLayout[] = [
  { id: 1, col: 1, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 2, col: 2, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 3, col: 3, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 4, col: 1, row: 2, colSpan: 1, rowSpan: 1 },
  { id: 5, col: 2, row: 2, colSpan: 1, rowSpan: 1 },
  { id: 6, col: 3, row: 2, colSpan: 1, rowSpan: 1 },
  { id: 7, col: 1, row: 3, colSpan: 1, rowSpan: 1 },
  { id: 8, col: 2, row: 3, colSpan: 1, rowSpan: 1 },
  { id: 9, col: 3, row: 3, colSpan: 1, rowSpan: 1 },
  { id: 10, col: 1, row: 4, colSpan: 1, rowSpan: 1 },
  { id: 11, col: 2, row: 4, colSpan: 1, rowSpan: 1 },
  { id: 12, col: 3, row: 4, colSpan: 1, rowSpan: 1 },
];

const stripLayout: CellLayout[] = [
  { id: 1, col: 1, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 2, col: 2, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 3, col: 3, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 4, col: 4, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 5, col: 5, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 6, col: 6, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 7, col: 7, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 8, col: 8, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 9, col: 9, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 10, col: 10, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 11, col: 11, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 12, col: 12, row: 1, colSpan: 1, rowSpan: 1 },
];

export const cellLayouts: Record<HeroPhase, CellLayout[]> = {
  full: fullLayout,
  statement: statementLayout,
  strip: stripLayout,
  return: fullLayout,
};
