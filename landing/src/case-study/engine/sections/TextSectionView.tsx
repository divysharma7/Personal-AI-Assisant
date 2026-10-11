// src/case-study/engine/sections/TextSectionView.tsx

import type { TextSection } from "../types";

export interface TextSectionViewProps {
  section: TextSection;
}

export function TextSectionView({ section }: TextSectionViewProps) {
  return (
    <section className="study-text-section" id={section.id}>
      {section.eyebrow && <span className="study-overline">{section.eyebrow}</span>}
      {section.title && <h2>{section.title}</h2>}
      {section.description && (
        <p className="study-text-section__desc">{section.description}</p>
      )}
      {section.body.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </section>
  );
}
