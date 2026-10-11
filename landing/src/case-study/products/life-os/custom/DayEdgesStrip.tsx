// src/case-study/products/life-os/custom/DayEdgesStrip.tsx
//
// 02-empathy-deepening.md Ã¢â‚¬â€ "The day has no edges (the scenario, revisited)".
// A 24-hour strip with bars at 6 am (40%) and 10 pm (29%), each carrying its
// percentage. Global workforce, not India Ã¢â‚¬â€ caveat preserved.

import type { CustomSection } from "../../../engine/types";

export interface DayEdgesStat {
  value: string;
  label: string;
  source: string;
  position: number;
  tone: "accent" | "gold";
}

export interface DayEdgesStripData {
  intro: string;
  stats: DayEdgesStat[];
  caveat: string;
}

const TONE_COLOR: Record<DayEdgesStat["tone"], string> = {
  accent: "#6366f1",
  gold: "#e8b84f",
};

export function DayEdgesStrip({ data, section }: { data: unknown; section: CustomSection }) {
  const { intro, stats, caveat } = data as DayEdgesStripData;

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10 " id={section.id}>
      {section.title && (
        <h2 className="max-w-3xl text-section-mobile font-medium text-text-primary md:text-section">
          {section.title}
        </h2>
      )}
      <p className="mt-6 max-w-text text-base leading-relaxed text-text-secondary">{intro}</p>

      <div className="mt-8 rounded-2xl border border-border bg-bg-surface p-6 md:p-10">
        <svg viewBox="0 0 1000 180" className="w-full" role="img" aria-label="24-hour strip showing 40% active at 6 AM and 29% back by 10 PM">
          {/* baseline */}
          <line x1="40" y1="150" x2="960" y2="150" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          {/* hour ticks */}
          {[0, 6, 12, 18, 22, 24].map((h) => {
            const x = 40 + (h / 24) * 920;
            const labels: Record<number, string> = { 0: "12 AM", 6: "6 AM", 12: "12 PM", 18: "6 PM", 22: "10 PM", 24: "12 AM" };
            return (
              <g key={h}>
                <line x1={x} y1="148" x2={x} y2="156" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <text x={x} y="172" textAnchor="middle" fontSize="11" fill="#5a6478" fontFamily="Inter, sans-serif">{labels[h]}</text>
              </g>
            );
          })}
          {/* bars */}
          {stats.map((stat) => {
            const x = 40 + (stat.position / 100) * 920;
            const barHeight = parseFloat(stat.value) * 1.2;
            const color = TONE_COLOR[stat.tone];
            return (
              <g key={stat.value}>
                <rect x={x - 24} y={150 - barHeight} width="48" height={barHeight} rx="4" fill={color} opacity="0.85" />
                <text x={x} y={150 - barHeight - 8} textAnchor="middle" fontSize="16" fontWeight="700" fill={color} fontFamily="Inter, sans-serif">{stat.value}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {stats.map((stat) => (
          <article key={stat.value} className="rounded-2xl border border-border bg-bg-secondary p-6">
            <strong className="text-[clamp(1.75rem,3vw,2.25rem)] font-semibold leading-none tracking-tight text-text-primary">{stat.value}</strong>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{stat.label}</p>
            <p className="mt-3 text-xs text-text-muted">{stat.source}</p>
          </article>
        ))}
      </div>

      <p className="mt-8 max-w-text text-sm italic leading-relaxed text-text-muted">{caveat}</p>
    </section>
  );
}
