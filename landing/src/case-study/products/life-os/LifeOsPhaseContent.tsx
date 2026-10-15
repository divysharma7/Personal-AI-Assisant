// src/case-study/products/life-os/LifeOsPhaseContent.tsx
//
// Editorial Case Study Section Orchestrator.
// Provides generous section breathing room (120-180px vertical spacing)
// and subtle background variation rhythm (white -> pale purple -> off-white -> pale blue).

import type { Section } from "../../engine/types";
import { SectionRenderer } from "../../engine/SectionRenderer";
import { lifeOsCustomSections } from "./customSections";

export interface LifeOsPhaseContentProps {
  sections: Section[];
}

const SECTION_BACKGROUNDS: Record<string, string> = {
  "empathize-secondary-research": "bg-white",
  "empathize-primary-research": "bg-[#FAFAFA]",
  "empathize-understanding-synthesis": "bg-[#F3F0FF]/40",
  "empathize-affinity-mapping": "bg-[#FAF8FE]",
  "empathize-pattern-emergence": "bg-white",
  "empathize-personas": "bg-[#FAFAFA]",
  "empathize-user-journey": "bg-white",
  "empathize-pain-points": "bg-[#F2F6FF]/35",
  "empathize-competitor-analysis": "bg-white",
  "empathize-pyramid-search": "bg-[#FAFAFA]",
  "empathize-ideology": "bg-white",
  "empathize-brief-hmw": "bg-[#F3F0FF]/30",
  "empathize-learnings": "bg-white",
};

export function LifeOsPhaseContent({ sections }: LifeOsPhaseContentProps) {
  return (
    <div className="flex flex-col">
      {sections.map((section) => {
        const bg = SECTION_BACKGROUNDS[section.id] || "bg-white";
        return (
          <div
            key={section.id}
            className={`${bg} border-b border-[#E8E8E8]/70 transition-colors duration-200`}
          >
            <SectionRenderer
              section={section}
              customSections={lifeOsCustomSections}
            />
          </div>
        );
      })}
    </div>
  );
}
