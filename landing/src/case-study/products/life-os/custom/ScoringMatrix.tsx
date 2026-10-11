// src/case-study/products/life-os/custom/ScoringMatrix.tsx
//
// 03-problem-convergence.md — "1.2 Problem scoring".
// Full score matrix (8 candidates × 6 criteria + total + why), a ranked bar
// list with the chosen problem outlined, a small radar for the chosen problem
// (one polygon in coral), a 3-row sensitivity table, and the one-scorer note.

import type { CustomSection } from "../../../engine/types";

export interface ScoredCandidate {
  name: string;
  scores: number[];
  total: number;
  why: string;
  chosen?: boolean;
}

export interface SensitivityRow {
  drop: string;
  top: string;
}

export interface ScoringMatrixData {
  intro: string;
  criteriaShort: string[];
  candidates: ScoredCandidate[];
  sensitivity: SensitivityRow[];
  sensitivityNote: string;
  oneScorerNote: string;
  chosenRadar: { label: string; axes: string[]; scores: number[] };
}

const CX = 160;
const CY = 160;
const R = 120;
const pt = (r: number, aDeg: number): [number, number] => {
  const rad = (aDeg * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
};
const ANGLES = [-90, -30, 30, 90, 150, 210];

export function ScoringMatrix({ data, section }: { data: unknown; section: CustomSection }) {
  const { intro, criteriaShort, candidates, sensitivity, sensitivityNote, oneScorerNote, chosenRadar } =
    data as ScoringMatrixData;

  const sorted = [...candidates].sort((a, b) => b.total - a.total);
  const radarPoints = chosenRadar.scores
    .map((s, i) => pt((s / 5) * R, ANGLES[i]))
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10" id={section.id}>
      {section.title && (
        <h2 className="max-w-3xl text-section-mobile font-medium text-text-primary md:text-section">
          {section.title}
        </h2>
      )}
      <p className="mt-5 max-w-text text-base leading-relaxed text-text-secondary">{intro}</p>

      {/* Score table */}
      <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-[860px] w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-border bg-bg-surface px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted">Candidate</th>
              {criteriaShort.map((c) => (
                <th key={c} className="border-b border-border bg-bg-surface px-3 py-3 text-center text-xs font-medium uppercase tracking-widest text-text-muted">{c}</th>
              ))}
              <th className="border-b border-border bg-bg-surface px-3 py-3 text-center text-xs font-medium uppercase tracking-widest text-accent-light">/30</th>
              <th className="border-b border-border bg-bg-surface px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted">Why these numbers</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.name} className={c.chosen ? "bg-[rgba(99,102,241,0.06)]" : ""}>
                <th scope="row" className={`border-b border-border px-4 py-3 text-left text-sm ${c.chosen ? "font-bold text-accent-light" : "font-medium text-text-primary"}`}>
                  {c.chosen && <span className="mr-1 text-accent">▸</span>}
                  {c.name}
                </th>
                {c.scores.map((s, i) => (
                  <td key={i} className="border-b border-border px-3 py-3 text-center font-variant-numeric tabular-nums text-text-secondary">{s}</td>
                ))}
                <td className="border-b border-border px-3 py-3 text-center font-bold text-text-primary">{c.total}</td>
                <td className="border-b border-border px-4 py-3 text-xs leading-relaxed text-text-muted">{c.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ranked bars + radar + sensitivity */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h3 className="text-sm font-medium text-text-secondary">Ranked by total (chosen outlined)</h3>
          <ul className="mt-4 space-y-2">
            {sorted.map((c) => (
              <li key={c.name} className="flex items-center gap-3">
                <span className="w-44 shrink-0 truncate text-sm text-text-primary">{c.name}</span>
                <div className="flex-1 overflow-hidden rounded-full bg-bg-elevated">
                  <div
                    className={`flex h-7 items-center justify-end rounded-full px-2 text-xs font-bold ${
                      c.chosen ? "bg-[#e08a7b] text-white ring-2 ring-[#e08a7b] ring-offset-2 ring-offset-bg-canvas" : "bg-accent text-white"
                    }`}
                    style={{ width: `${(c.total / 30) * 100}%` }}
                  >
                    {c.total}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-bg-surface p-4">
          <svg viewBox="0 0 320 320" className="mx-auto w-full max-w-[280px]" role="img" aria-label={`Radar: ${chosenRadar.label} scores across six criteria`}>
            {[0.33, 0.66, 1].map((f) => {
              const pts = ANGLES.map((a) => pt(R * f, a)).map(([x, y]) => `${x},${y}`).join(" ");
              return <polygon key={f} points={pts} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
            })}
            {ANGLES.map((a) => {
              const [x, y] = pt(R, a);
              return <line key={a} x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
            })}
            <polygon points={radarPoints} fill="rgba(224,138,123,0.15)" stroke="#e08a7b" strokeWidth="2" strokeLinejoin="round" />
            {chosenRadar.scores.map((s, i) => {
              const [x, y] = pt((s / 5) * R, ANGLES[i]);
              return <circle key={i} cx={x} cy={y} r="4" fill="#e08a7b" />;
            })}
            {chosenRadar.axes.map((label, i) => {
              const [x, y] = pt(R + 22, ANGLES[i]);
              const anchor = Math.cos((ANGLES[i] * Math.PI) / 180) > 0.3 ? "start" : Math.cos((ANGLES[i] * Math.PI) / 180) < -0.3 ? "end" : "middle";
              return <text key={label} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fontSize="9" fontFamily="Inter, sans-serif" fill="#8b95a9">{label}</text>;
            })}
          </svg>
          <p className="mt-2 text-center text-xs text-text-muted">{chosenRadar.label}</p>
        </div>
      </div>

      {/* Sensitivity */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-text-secondary">Sensitivity: what happens if one criterion goes</h3>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-[480px] w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-border bg-bg-surface px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted">If we drop</th>
                <th className="border-b border-border bg-bg-surface px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted">Top of the table</th>
              </tr>
            </thead>
            <tbody>
              {sensitivity.map((row) => (
                <tr key={row.drop}>
                  <th scope="row" className="border-b border-border px-4 py-3 text-left font-semibold text-text-primary">{row.drop}</th>
                  <td className="border-b border-border px-4 py-3 text-text-secondary">{row.top}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-text text-sm leading-relaxed text-text-secondary">{sensitivityNote}</p>
      </div>

      <p className="mt-6 max-w-text text-sm italic leading-relaxed text-text-muted">{oneScorerNote}</p>
    </section>
  );
}
