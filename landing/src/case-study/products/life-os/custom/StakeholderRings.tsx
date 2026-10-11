// src/case-study/products/life-os/custom/StakeholderRings.tsx
//
// 02-empathy-deepening.md — "Who all are involved".
// Hierarchy-first: three tiers (Core / Involved / Informed) with visual
// distance from the user's control. Not 21 unreadable labels.

import type { CustomSection } from "../../../engine/types";

export interface StakeholderRing {
  name: string;
  who: string;
  line: string;
  tone: "core" | "involved" | "informed";
}

export interface StakeholderRingsData {
  intro: string;
  rings: StakeholderRing[];
}

const TONE: Record<StakeholderRing["tone"], string> = {
  core: "border-accent bg-accent-soft",
  involved: "border-border bg-bg-secondary",
  informed: "border-dashed border-border bg-transparent",
};

const TONE_DOT: Record<StakeholderRing["tone"], string> = {
  core: "bg-accent",
  involved: "bg-text-muted",
  informed: "border border-dashed border-text-muted",
};

export function StakeholderRings({ data, section }: { data: unknown; section: CustomSection }) {
  const { intro, rings } = data as StakeholderRingsData;

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10" id={section.id}>
      {section.title && (
        <h2 className="max-w-3xl text-section-mobile font-medium text-text-primary md:text-section">
          {section.title}
        </h2>
      )}
      <p className="mt-5 max-w-text text-base leading-relaxed text-text-secondary">{intro}</p>

      <div className="mt-8 flex items-center justify-center">
        <span className="rounded-full border border-accent bg-accent px-4 py-2 text-sm font-semibold text-white">
          The user
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {rings.map((ring) => (
          <article key={ring.name} className={`rounded-2xl border p-6 ${TONE[ring.tone]}`}>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${TONE_DOT[ring.tone]}`} aria-hidden="true" />
              <h3 className="text-base font-semibold text-text-primary">{ring.name}</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{ring.who}</p>
            <p className="mt-3 text-xs italic text-text-muted">{ring.line}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
