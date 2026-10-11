// src/case-study/products/life-os/LifeOsPhaseContent.tsx

import type { Section } from "../../engine/types";
import { SectionRenderer } from "../../engine/SectionRenderer";
import { lifeOsCustomSections } from "./customSections";

export interface LifeOsPhaseContentProps {
  sections: Section[];
}

export function LifeOsPhaseContent({ sections }: LifeOsPhaseContentProps) {
  return (
    <div className="flex flex-col gap-8 md:gap-12">
      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          customSections={lifeOsCustomSections}
        />
      ))}
    </div>
  );
}
