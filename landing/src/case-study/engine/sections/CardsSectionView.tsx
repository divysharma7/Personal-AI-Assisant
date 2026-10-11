// src/case-study/engine/sections/CardsSectionView.tsx

import { ArrowUpRight } from "lucide-react";
import type { CardsSection } from "../types";

export interface CardsSectionViewProps {
  section: CardsSection;
}

export function CardsSectionView({ section }: CardsSectionViewProps) {
  return (
    <div className="generic-cards-section" id={section.id}>
      {section.eyebrow && <span className="study-overline">{section.eyebrow}</span>}
      {section.title && <h2>{section.title}</h2>}
      {section.description && <p>{section.description}</p>}
      <div className="generic-cards-grid">
        {section.items.map((item) => (
          <article key={item.id}>
            <h4>{item.title}</h4>
            {item.body && <p>{item.body}</p>}
            {item.meta && <span>{item.meta}</span>}
            {item.href && (
              <a href={item.href} target="_blank" rel="noreferrer">
                {item.source ?? item.sourceLabel ?? "Source"}
                <ArrowUpRight size={13} />
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
