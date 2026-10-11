// src/case-study/products/life-os/custom/ExperienceMap.tsx
//
// 02-empathy-deepening.md — "Experience map: a day in the life".
// A synthetic composite [S]. Six stages (Start→Close) across five lanes.
// The emotion row gets mood-colored chips; the arithmetic [S] overflows.

import type { CustomSection } from "../../../engine/types";

export interface ExperienceLane {
  label: string;
  cells: string[];
  type?: "emotion" | "evidence" | "thought" | "pain" | "default";
}

export interface ExperienceMapData {
  intro: string;
  stages: string[];
  lanes: ExperienceLane[];
  bodystorming: string;
  arithmetic: { label: string; text: string; insight: string };
}

const EMOTION_COLORS = ["#818cf8", "#6366f1", "#e8b84f", "#e08a7b", "#e08a7b", "#e8b84f"];

export function ExperienceMap({ data, section }: { data: unknown; section: CustomSection }) {
  const { intro, stages, lanes, bodystorming, arithmetic } = data as ExperienceMapData;

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10" id={section.id}>
      {section.title && (
        <h2 className="max-w-3xl text-section-mobile font-medium text-text-primary md:text-section">
          {section.title}
        </h2>
      )}
      <p className="mt-5 max-w-text text-base leading-relaxed text-text-secondary">{intro}</p>

      {/* Desktop swim-lane table */}
      <div className="mt-8 hidden overflow-x-auto rounded-2xl border border-border md:block">
        <table className="min-w-[900px] w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-border bg-bg-surface px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted"></th>
              {stages.map((stage) => (
                <th key={stage} className="border-b border-border bg-bg-surface px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-accent-light">
                  <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent" />{stage}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lanes.map((lane) => (
              <tr key={lane.label}>
                <th scope="row" className="border-b border-border bg-bg-surface px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted">
                  {lane.label}
                </th>
                {lane.cells.map((cell, i) => (
                  <td key={i} className="border-b border-border px-4 py-3 align-top">
                    {lane.type === "emotion" && (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: EMOTION_COLORS[i] }} />
                        <span className="text-text-primary">{cell}</span>
                      </span>
                    )}
                    {lane.type === "evidence" && (
                      <span className="inline-block rounded-full border border-border px-2 py-0.5 text-[11px] font-medium tracking-wide text-text-secondary">{cell}</span>
                    )}
                    {lane.type === "thought" && (
                      <span className="italic text-text-secondary">&ldquo;{cell}&rdquo;</span>
                    )}
                    {lane.type === "pain" && (
                      <span className="text-text-muted">{cell}</span>
                    )}
                    {!lane.type && <span className="text-text-secondary">{cell}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="mt-8 space-y-3 md:hidden">
        {stages.map((stage, si) => (
          <article key={stage} className="rounded-2xl border border-border bg-bg-secondary p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <span className="h-2 w-2 rounded-full" style={{ background: EMOTION_COLORS[si] }} />
              {stage}
            </h3>
            <dl className="mt-3 space-y-2">
              {lanes.map((lane) => (
                <div key={lane.label}>
                  <dt className="text-xs font-medium uppercase tracking-widest text-text-muted">{lane.label}</dt>
                  <dd className="mt-0.5 text-sm text-text-secondary">{lane.cells[si]}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <p className="mt-6 max-w-text text-sm italic leading-relaxed text-text-muted">{bodystorming}</p>

      {/* Worked arithmetic [S] */}
      <div className="mt-8 rounded-2xl border border-border bg-bg-surface p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-widest text-gold">{arithmetic.label}</p>
        <div className="mt-5 flex items-end gap-4">
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-text-muted">Available</span>
              <span className="text-sm font-semibold text-text-primary">210 min</span>
            </div>
            <div className="mt-1 h-6 overflow-hidden rounded-full bg-bg-elevated">
              <div className="h-full rounded-full bg-accent" style={{ width: "77%" }} />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-text-muted">Demand</span>
              <span className="text-sm font-semibold text-[#e08a7b]">270 min</span>
            </div>
            <div className="mt-1 h-6 overflow-hidden rounded-full bg-bg-elevated">
              <div className="h-full rounded-full bg-[#e08a7b]" style={{ width: "100%" }} />
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs font-medium text-[#e08a7b]">Gap: 60 min over → meeting +45 min → 105 min total</p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-text-secondary">{arithmetic.text}</p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-muted">{arithmetic.insight}</p>
      </div>
    </section>
  );
}
