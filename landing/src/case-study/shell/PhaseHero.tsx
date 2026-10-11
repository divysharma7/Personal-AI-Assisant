// src/case-study/shell/PhaseHero.tsx

import { PageContainer } from "../../components/layout/PageContainer";

export interface PhaseHeroProps {
  eyebrow: string;
  title: string;
  lead: string;
  status?: string[];
  legend?: string;
}

export function PhaseHero({ eyebrow, title, lead, status, legend }: PhaseHeroProps) {
  return (
    <header className="border-b border-border pb-10 pt-14 md:pb-12 md:pt-16">
      <PageContainer>
        <p className="mb-5 text-xs font-medium uppercase tracking-widest text-accent">
          {eyebrow}
        </p>
        <h1 className="gradient-text max-w-4xl text-hero-mobile font-medium leading-tight md:text-hero">
          {title}
        </h1>
        <p className="mt-6 max-w-text text-lg text-text-secondary">{lead}</p>
        {status && status.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {status.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs text-text-secondary"
              >
                {item}
              </span>
            ))}
          </div>
        )}
        {legend && (
          <p className="mt-6 text-xs leading-relaxed text-text-muted">{legend}</p>
        )}
      </PageContainer>
    </header>
  );
}
