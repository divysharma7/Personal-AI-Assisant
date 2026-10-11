// src/case-study/products/life-os/custom/ImpactRadar.tsx
//
// 01-discovery-brief.md Ã¢â‚¬â€ "Impact framework: what a calmer day should improve".
// Six dimensions: four Primary filled, two Ripple outlined. No numeric scores
// exist in the source, so the radar encodes Primary (outer) vs Ripple (inner,
// outlined) Ã¢â‚¬â€ never fabricated values.

import type { CustomSection } from "../../../engine/types";

export interface ImpactRadarData {
  intro: string;
  planningNote: string;
  scopeNote: string;
}

const CX = 180;
const CY = 180;
const R = 130;

const AXES = [
  { label: "Cognitive Load", weight: "Primary" as const, angle: -90 },
  { label: "Time Control", weight: "Primary" as const, angle: -30 },
  { label: "Focus", weight: "Primary" as const, angle: 30 },
  { label: "Trust and Agency", weight: "Primary" as const, angle: 90 },
  { label: "Follow-through", weight: "Ripple" as const, angle: 150 },
  { label: "Wellbeing", weight: "Ripple" as const, angle: 210 },
];

const pt = (r: number, aDeg: number): [number, number] => {
  const rad = (aDeg * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
};

const dataRadius = (weight: "Primary" | "Ripple") => (weight === "Primary" ? 112 : 56);
const ringFactors = [0.33, 0.66, 1];

export function ImpactRadar({ data, section }: { data: unknown; section: CustomSection }) {
  const { intro, planningNote, scopeNote } = data as ImpactRadarData;

  const polygon = AXES.map((a) => pt(dataRadius(a.weight), a.angle))
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10 " id={section.id}>
      {section.eyebrow && (
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-accent">
          {section.eyebrow}
        </p>
      )}
      {section.title && (
        <h2 className="max-w-3xl text-section-mobile font-medium text-text-primary md:text-section">
          {section.title}
        </h2>
      )}
      <p className="mt-6 max-w-text text-base leading-relaxed text-text-secondary">{intro}</p>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,420px)_1fr] md:items-center">
        <div className="mx-auto w-full max-w-[420px] rounded-2xl border border-border bg-bg-surface p-4">
          <svg viewBox="0 0 360 360" className="w-full" role="img" aria-label="Impact framework radar: four primary dimensions filled, two ripple outlined">
            {/* rings */}
            {ringFactors.map((f) => {
              const points = AXES.map((a) => pt(R * f, a.angle)).map(([x, y]) => `${x},${y}`).join(" ");
              return (
                <polygon key={f} points={points} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
              );
            })}
            {/* spokes */}
            {AXES.map((a) => {
              const [x, y] = pt(R, a.angle);
              return <line key={a.label} x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />;
            })}
            {/* data polygon */}
            <polygon className="cs-radar-poly" points={polygon} fill="rgba(99,102,241,0.12)" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
            {/* vertices */}
            {AXES.map((a) => {
              const [x, y] = pt(dataRadius(a.weight), a.angle);
              return a.weight === "Primary" ? (
                <circle key={a.label} cx={x} cy={y} r="5" fill="#6366f1" stroke="#050810" strokeWidth="2" />
              ) : (
                <circle key={a.label} cx={x} cy={y} r="5" fill="#0a0f1e" stroke="#818cf8" strokeWidth="2" strokeDasharray="2 2" />
              );
            })}
            {/* labels */}
            {AXES.map((a) => {
              const [x, y] = pt(R + 24, a.angle);
              const anchor = Math.cos((a.angle * Math.PI) / 180) > 0.3 ? "start" : Math.cos((a.angle * Math.PI) / 180) < -0.3 ? "end" : "middle";
              return (
                <text key={a.label} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fontSize="11" fontFamily="Inter, sans-serif" fill={a.weight === "Primary" ? "#f0f2f5" : "#8b95a9"}>
                  {a.label}
                </text>
              );
            })}
          </svg>
        </div>

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {AXES.map((a) => (
            <li key={a.label} className="flex items-center gap-3 rounded-xl border border-border bg-bg-secondary px-4 py-3">
              <span className={`h-2.5 w-2.5 rounded-full ${a.weight === "Primary" ? "bg-accent" : "border border-dashed border-accent-light"}`} aria-hidden="true" />
              <span className="text-sm text-text-primary">{a.label}</span>
              <span className="ml-auto text-xs uppercase tracking-widest text-text-muted">{a.weight}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-8 max-w-text text-sm leading-relaxed text-text-muted">{scopeNote}</p>
      <div className="mt-6 rounded-2xl border border-border bg-bg-secondary p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">Planning research, with limits</p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">{planningNote}</p>
      </div>
    </section>
  );
}
