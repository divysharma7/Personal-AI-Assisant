// src/case-study/engine/types.ts

import type { ComponentType } from "react";

/** Core type definitions for the case‑study framework. */
export type Appearance = "default" | "muted" | "dark";
export type Width = "reading" | "content" | "wide";

export interface SectionBase {
  id: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  appearance?: Appearance;
  width?: Width;
}

export interface TextSection extends SectionBase {
  type: "text";
  body: string[];
}

export interface CardItem {
  id: string;
  title: string;
  body?: string;
  meta?: string;
  href?: string;
  source?: string;
  sourceLabel?: string;
}
export interface CardsSection extends SectionBase {
  type: "cards";
  items: CardItem[];
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  context?: string;
  source?: string;
  sourceLabel?: string;
  evidence?: string;
}
export interface StatsSection extends SectionBase {
  type: "stats";
  items: StatItem[];
}

export interface InsightSection extends SectionBase {
  type: "insight";
  text: string;
}

export interface JourneyStep {
  title: string;
  state: string;
  body: string;
}
export interface JourneySection extends SectionBase {
  type: "journey";
  steps: JourneyStep[];
  note?: string;
}

export interface CustomSection extends SectionBase {
  type: "custom";
  component: string;
  data: unknown;
}

export type CustomSectionComponent = ComponentType<{
  data: unknown;
  section: CustomSection;
}>;

export type CustomSectionRegistry = Record<string, CustomSectionComponent>;

export type Section =
  | TextSection
  | CardsSection
  | StatsSection
  | InsightSection
  | JourneySection
  | CustomSection;

export interface Phase {
  slug: string;
  number: string;
  label: string;
  title: string;
  description?: string;
  duration?: string;
  insight?: string;
  sections: Section[];
}

export interface CaseStudyMeta {
  eyebrow?: string;
  summary?: string;
  role?: string;
  duration?: string;
  status?: string;
  year?: string;
  deliverables?: string[];
  tags?: string[];
}

export interface CaseStudyTheme {
  accent: string;
  surface: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  description?: string;
  meta: CaseStudyMeta;
  theme?: CaseStudyTheme;
  phases: Phase[];
  customSections?: Record<string, unknown>;
}
