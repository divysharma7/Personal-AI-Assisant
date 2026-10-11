// src/case-study/products/life-os/custom/ServicesAudit.tsx
//
// 02-empathy-deepening.md Ã¢â‚¬â€ "Existing services audit".
// Six vendors read from their own pages (11 Oct 2026). Sunsama gets the deep-
// dive treatment. Documented features get a check; gaps get a hollow circle.
// Silence on a page is weak evidence of absence Ã¢â‚¬â€ preserved.

import { Check, Circle } from "lucide-react";
import type { CustomSection } from "../../../engine/types";

export interface ServiceRow {
  name: string;
  tag?: string;
  documented: string;
  gap: string;
}

export interface ServicesAuditData {
  intro: string;
  services: ServiceRow[];
  gapClaim: string;
  policiesGap: string;
}

export function ServicesAudit({ data, section }: { data: unknown; section: CustomSection }) {
  const { intro, services, gapClaim, policiesGap } = data as ServicesAuditData;

  const featured = services.find((s) => s.tag);
  const rest = services.filter((s) => !s.tag);

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10 " id={section.id}>
      {section.title && (
        <h2 className="max-w-3xl text-section-mobile font-medium text-text-primary md:text-section">
          {section.title}
        </h2>
      )}
      <p className="mt-6 max-w-text text-base leading-relaxed text-text-secondary">{intro}</p>

      {featured && (
        <article className="mt-8 rounded-2xl border border-accent bg-bg-secondary p-6 md:p-8">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-text-primary">{featured.name}</h3>
            <span className="rounded-full border border-accent bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-accent-light">
              {featured.tag}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-accent">
                <Check size={14} /> Documented
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{featured.documented}</p>
            </div>
            <div>
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-text-muted">
                <Circle size={14} /> Gap on the page
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{featured.gap}</p>
            </div>
          </div>
        </article>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((service) => (
          <article key={service.name} className="rounded-2xl border border-border bg-bg-secondary p-6">
            <h3 className="text-base font-semibold text-text-primary">{service.name}</h3>
            <div className="mt-4 space-y-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-accent">
                  <Check size={13} /> Documented
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{service.documented}</p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-text-muted">
                  <Circle size={13} /> Gap
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{service.gap}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-start gap-3 max-w-text">
          <span className="mt-0.5 flex-shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-text-muted">[H]</span>
          <p className="text-sm leading-relaxed text-text-secondary">{gapClaim}</p>
        </div>
        <p className="max-w-text text-sm italic leading-relaxed text-text-muted">{policiesGap}</p>
      </div>
    </section>
  );
}
