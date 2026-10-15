// src/case-study/products/life-os/custom/ExecutionParadox.tsx
//
// "The Execution Paradox" section for Life OS Case Study.
// Exact recreation of the reference portfolio slide:
// Pure white canvas, center dark matte inquiry card taped down with 4 checkered
// lilac washi tape strips, followed by 3 large mint/seafoam research statistics.

import type { CustomSection } from "../../../engine/types";

export interface StatEvidence {
  value: string;
  leadLine: string;
  mainLine: string;
  source: string;
}

export interface ExecutionParadoxData {
  promptText?: string;
  questionText?: string;
  stats?: StatEvidence[];
}

const DEFAULT_STATS: StatEvidence[] = [
  {
    value: "67%",
    leadLine: "struggle with",
    mainLine: "task initiation",
    source: "Gloria Mark et al., Attention & Interruption Research",
  },
  {
    value: "61%",
    leadLine: "experience",
    mainLine: "unrealistic daily planning",
    source: "Buehler, Griffin & Ross, Planning Fallacy Literature",
  },
  {
    value: "58%",
    leadLine: "feel",
    mainLine: "cognitive overload & residue",
    source: "Killingsworth & Gilbert, Mind Wandering Study",
  },
];

const DEFAULT_DATA: ExecutionParadoxData = {
  promptText: "Need help? Maybe drop by a task manager.",
  questionText: "But what if organizing tasks is what keeps you from doing them?",
  stats: DEFAULT_STATS,
};

function WashiTape({ className }: { className: string }) {
  return (
    <div
      className={`pointer-events-none absolute z-20 h-7 w-20 md:h-8 md:w-24 shadow-sm ${className}`}
      style={{
        backgroundColor: "rgba(238, 230, 255, 0.92)",
        backgroundImage: `
          linear-gradient(to right, rgba(168, 85, 247, 0.42) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(168, 85, 247, 0.42) 1px, transparent 1px)
        `,
        backgroundSize: "6px 6px",
      }}
      aria-hidden="true"
    />
  );
}

export function ExecutionParadox({
  data,
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  const merged: ExecutionParadoxData = {
    ...DEFAULT_DATA,
    ...((data as ExecutionParadoxData) || {}),
  };

  const stats = merged.stats || DEFAULT_STATS;

  return (
    <section
      className="bg-white py-16 md:py-24"
      id={section?.id || "overview-execution-paradox"}
      aria-labelledby="execution-paradox-heading"
    >
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 lg:px-20">
        {/* Taped Dark Paper Inquiry Note in Center */}
        <div className="relative mx-auto max-w-2xl pt-6 pb-2">
          {/* 4 Corner Lilac Checkered Washi Tape strips */}
          <WashiTape className="-left-4 -top-3 -rotate-[35deg] md:-left-6 md:-top-4" />
          <WashiTape className="-right-4 -top-3 rotate-[35deg] md:-right-6 md:-top-4" />
          <WashiTape className="-bottom-3 -left-4 rotate-[35deg] md:-bottom-4 md:-left-6" />
          <WashiTape className="-bottom-3 -right-4 -rotate-[35deg] md:-bottom-4 md:-right-6" />

          {/* Dark Note Surface */}
          <div className="relative rounded-2xl bg-[#1E1E1E] px-8 py-12 md:px-14 md:py-16 shadow-xl shadow-black/15 text-center">
            <p
              className="text-sm md:text-base font-normal !text-[#D1D5DB]"
              style={{ color: "#D1D5DB" }}
            >
              {merged.promptText}
            </p>
            <h2
              id="execution-paradox-heading"
              className="mt-4 text-2xl font-bold tracking-tight !text-white md:text-3xl lg:text-[32px] leading-snug"
              style={{ color: "#FFFFFF" }}
            >
              {merged.questionText}
            </h2>
          </div>
        </div>

        {/* 3 Research Stat Callouts Beneath */}
        <div className="mt-16 md:mt-20 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
          {stats.map((stat) => (
            <div key={stat.value} className="flex flex-col items-center text-center">
              {/* Mint / Seafoam Big Number */}
              <span className="text-5xl font-bold tracking-tight text-[#48C09B] md:text-6xl lg:text-[68px]">
                {stat.value}
              </span>

              {/* Subtext description in 2 subtle lines */}
              <div className="mt-3 text-sm md:text-base text-[#4B5563]">
                <p className="italic">{stat.leadLine}</p>
                <p className="font-medium text-[#1F2937] italic">{stat.mainLine}</p>
              </div>

              {/* Document Citation */}
              <div className="mt-3.5 flex items-center justify-center gap-1.5 text-xs text-[#9CA3AF] max-w-[260px]">
                <svg
                  className="h-3.5 w-3.5 shrink-0 opacity-70"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span className="leading-tight">{stat.source}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
