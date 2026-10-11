// src/case-study/shell/SectionBlock.tsx

import type { ReactNode } from "react";
import { PageContainer } from "../../components/layout/PageContainer";

export interface SectionBlockProps {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  tight?: boolean;
  children?: ReactNode;
}

export function SectionBlock({
  id,
  eyebrow,
  title,
  lead,
  tight = false,
  children,
}: SectionBlockProps) {
  return (
    <section id={id} className={tight ? "py-10 md:py-14" : "py-14 md:py-20"}>
      <PageContainer>
        {eyebrow && (
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-accent">
            {eyebrow}
          </p>
        )}
        {title && (
          <h2 className="max-w-3xl text-section-mobile font-medium text-text-primary md:text-section">
            {title}
          </h2>
        )}
        {lead && (
          <div className="mt-5 max-w-text text-base leading-relaxed text-text-secondary">
            {lead}
          </div>
        )}
        {children}
      </PageContainer>
    </section>
  );
}
