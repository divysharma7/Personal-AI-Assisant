// src/case-study/engine/sections/InsightSectionView.tsx

import type { InsightSection } from "../types";

export interface InsightSectionViewProps {
  section: InsightSection;
}

export function InsightSectionView({ section }: InsightSectionViewProps) {
  if (section.id.endsWith("hmw")) {
    return (
      <blockquote className="hmw-callout" id={section.id}>
        {section.eyebrow && <span className="study-overline">{section.eyebrow}</span>}
        <p>{section.text}</p>
        {section.description && <cite>{section.description}</cite>}
      </blockquote>
    );
  }

  return (
    <blockquote className="study-insight-callout" id={section.id}>
      {section.eyebrow && <span className="study-overline">{section.eyebrow}</span>}
      <p>{section.text}</p>
      {section.description && <cite>{section.description}</cite>}
    </blockquote>
  );
}
