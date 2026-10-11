// src/case-study/engine/sections/StatsSectionView.tsx

import { ArrowUpRight } from "lucide-react";
import type { StatsSection } from "../types";

export interface StatsSectionViewProps {
  section: StatsSection;
}

export function StatsSectionView({ section }: StatsSectionViewProps) {
  return (
    <div className="study-stat-row" id={section.id}>
      {section.eyebrow && <span className="study-overline">{section.eyebrow}</span>}
      {section.title && <h2>{section.title}</h2>}
      {section.description && <p className="study-text-section__desc">{section.description}</p>}
      {section.items.map((stat) => (
        <article className="study-stat" key={stat.id}>
          <strong className="study-stat__value">{stat.value}</strong>
          <p>{stat.label}</p>
          {stat.context && <span className="study-stat__context">{stat.context}</span>}
          {stat.source && (
            <a href={stat.source} target="_blank" rel="noreferrer">
              {stat.sourceLabel ?? "Source"}
              <ArrowUpRight size={13} />
            </a>
          )}
        </article>
      ))}
    </div>
  );
}
