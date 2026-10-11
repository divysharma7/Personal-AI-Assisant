// src/case-study/engine/SectionRenderer.tsx

import type { Section, CustomSectionRegistry } from "./types";
import "./case-study-engine.css";
import { TextSectionView } from "./sections/TextSectionView";
import { StatsSectionView } from "./sections/StatsSectionView";
import { CardsSectionView } from "./sections/CardsSectionView";
import { InsightSectionView } from "./sections/InsightSectionView";
import { JourneySectionView } from "./sections/JourneySectionView";
import { CustomSectionView } from "./sections/CustomSectionView";

export interface SectionRendererProps {
  section: Section;
  customSections?: CustomSectionRegistry;
}

export function SectionRenderer({
  section,
  customSections,
}: SectionRendererProps) {
  switch (section.type) {
    case "text":
      return <TextSectionView section={section} />;

    case "stats":
      return <StatsSectionView section={section} />;

    case "cards":
      return <CardsSectionView section={section} />;

    case "insight":
      return <InsightSectionView section={section} />;

    case "journey":
      return <JourneySectionView section={section} />;

    case "custom":
      return (
        <CustomSectionView
          section={section}
          registry={customSections}
        />
      );

    default: {
      const _exhaustiveCheck: never = section;
      throw new Error(`Unhandled section type: ${JSON.stringify(_exhaustiveCheck)}`);
    }
  }
}
