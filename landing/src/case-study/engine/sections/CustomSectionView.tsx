// src/case-study/engine/sections/CustomSectionView.tsx

import type { CustomSection, CustomSectionRegistry } from "../types";

export interface CustomSectionViewProps {
  section: CustomSection;
  registry?: CustomSectionRegistry;
}

export function CustomSectionView({ section, registry }: CustomSectionViewProps) {
  const Component = registry?.[section.component];
  if (!Component) {
    throw new Error(
      `Custom section component "${section.component}" not found in registry.`
    );
  }
  return <Component data={section.data} section={section} />;
}
