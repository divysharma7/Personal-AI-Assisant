// src/case-study/products/life-os/custom/EmotionArc.tsx
//
// 01-discovery-brief.md Ã¢â‚¬â€ "Emotional arc: a day that starts intentional and
// turns reactive". A descending zigzag with a partial recovery at shutdown,
// five stage columns, the synthetic 2 PM scene [S] and the Leroy [E]/[H]
// research connection. One plausible weekday, not a universal journey.

import type { CustomSection } from "../../../engine/types";

export interface ArcStage {
  n: string;
  name: string;
  touchpoints: string;
  feeling: string;
  color: "hopeful" | "focused" | "pressured" | "overloaded" | "relief";
}

export interface EmotionArcData {
  caption: string;
  stages: ArcStage[];
  curveShape: string;
  scene: { label: string; text: string };
  research: { text: string };
  scopeDisclaimer: string;
}

const NODE_X = [110, 330, 550, 770, 990];
const NODE_Y = [70, 120, 185, 235, 170];
const COLORS: Record<ArcStage["color"], string> = {
  hopeful: "#818cf8",
  focused: "#6366f1",
  pressured: "#e8b84f",
  overloaded: "#e08a7b",
  relief: "#e8b84f",
};

export function EmotionArc({ data, section }: { data: unknown; section: CustomSection }) {
  const { caption, stages, curveShape, scene, research, scopeDisclaimer } =
    data as EmotionArcData;

  const linePoints = NODE_X.map((x, i) => `${x},${NODE_Y[i]}`).join(" ");

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
      <p className="mt-5 max-w-text text-sm italic leading-relaxed text-text-muted">{caption}</p>

      <div className="mt-8 hidden rounded-2xl border border-border bg-bg-surface p-6 md:block md:p-8">
        <svg viewBox="0 0 1100 300" className="w-full" role="img" aria-label="Emotional arc zigzag across five stages">
          <defs>
            <linearGradient id="cs-arc-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="45%" stopColor="#e8b84f" />
              <stop offset="70%" stopColor="#e08a7b" />
              <stop offset="100%" stopColor="#e8b84f" />
            </linearGradient>
          </defs>
          {/* grid baseline */}
          <line x1="60" y1="150" x2="1040" y2="150" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 6" />
          {/* 2 PM disruption marker between node 3 and 4 */}
          <line x1="660" y1="40" x2="660" y2="260" stroke="#e08a7b" strokeWidth="1.5" strokeDasharray="3 5" opacity="0.6" />
          <text x="668" y="52" fill="#e08a7b" fontSize="11" fontFamily="Inter, sans-serif">2 PM Ã‚Â· meeting +45 min [S]</text>
          <polyline points={linePoints} fill="none" stroke="url(#cs-arc-grad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="cs-draw-path" />
          {NODE_X.map((x, i) => (
            <g key={x} className="cs-arc-node" style={{ animationDelay: `${1.15 + i * 0.12}s` }}>
              <circle cx={x} cy={NODE_Y[i]} r="7" fill={COLORS[stages[i].color]} stroke="#050810" strokeWidth="2" />
              <text x={x} y={NODE_Y[i] + 26} textAnchor="middle" fill="#8b95a9" fontSize="11" fontFamily="Inter, sans-serif">
                {stages[i].n}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <ol className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
        {stages.map((stage) => (
          <li key={stage.n} className="rounded-2xl border border-border bg-bg-secondary p-5">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[stage.color] }} aria-hidden="true" />
              <span className="text-xs font-medium uppercase tracking-widest text-text-muted">
                Stage {stage.n}
              </span>
            </span>
            <h3 className="mt-2 text-base font-semibold text-text-primary">{stage.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{stage.touchpoints}</p>
            <p className="mt-3 text-xs italic text-text-secondary">{stage.feeling}</p>
          </li>
        ))}
      </ol>

      <p className="mt-8 max-w-text text-base leading-relaxed text-text-secondary">{curveShape}</p>

      <div className="mt-6 rounded-2xl border border-border bg-bg-secondary p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-widest text-gold">{scene.label}</p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">{scene.text}</p>
      </div>

      <p className="mt-6 max-w-text text-sm leading-relaxed text-text-muted">{research.text}</p>
      <p className="mt-6 text-xs italic text-text-muted">{scopeDisclaimer}</p>
    </section>
  );
}
