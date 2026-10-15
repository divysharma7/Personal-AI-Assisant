// src/case-study/products/life-os/custom/CompetitorAnalysisMatrix.tsx
//
// Phase 2 — Empathize: "Competitor Analysis — Who are we up against?"
// Clean editorial table with thin gray lines (#E8E8E8) and alternating row tints.
// Columns: Tool, What it does well, Where friction remains, What Life OS can learn.
// Followed by the large simple takeaway. No cards. No em dashes.

import type { CustomSection } from "../../../engine/types";

interface CompetitorAudit {
  name: string;
  tagline: string;
  domain: string;
  logoBg: string;
  logoLetter: string;
  gains: string;
  pains: string;
  learning: string;
}

const COMPETITORS: CompetitorAudit[] = [
  {
    name: "Todoist",
    tagline: "Natural language capture and nesting",
    domain: "Capture and organize",
    logoBg: "bg-[#E44332] text-white",
    logoLetter: "T",
    gains: "Fast capture and structured task management with multi-level nesting.",
    pains: "A well-organized list can still leave users paralyzed, deciding what to tackle first when energy is low.",
    learning: "Help users move from an intimidating list of possibilities to a single immediate start.",
  },
  {
    name: "TickTick",
    tagline: "Tasks, calendar views and focus timers",
    domain: "Capture and organize",
    logoBg: "bg-[#3A7AFE] text-white",
    logoLetter: "✓",
    gains: "Unified client bringing planning, calendar blocking, and habit streaks into one screen.",
    pains: "Feature sprawl requires users to maintain multiple distinct routines, adding administrative overhead.",
    learning: "Connect planning and execution seamlessly without demanding multi-tab routine upkeep.",
  },
  {
    name: "Notion",
    tagline: "Modular databases and linked views",
    domain: "Plan and prioritize",
    logoBg: "bg-[#151515] text-white",
    logoLetter: "N",
    gains: "Infinite flexibility, fully tailorable to any project or personal knowledge base.",
    pains: "Building and tweaking the system becomes work in itself, distracting from actual execution.",
    learning: "Offer opinionated, ready-to-run structure without requiring hours of database crafting.",
  },
  {
    name: "Sunsama",
    tagline: "Intentional daily planning rituals",
    domain: "Plan and prioritize",
    logoBg: "bg-[#FA8C16] text-white",
    logoLetter: "S",
    gains: "Workload awareness that reveals total daily capacity to prevent chronic overcommitment.",
    pains: "Rigid rituals can feel demanding on chaotic days when emergencies break the schedule.",
    learning: "Support quick mid-day adjustments and frictionless recovery when reality breaks the plan.",
  },
  {
    name: "Motion",
    tagline: "Algorithmic auto-scheduling",
    domain: "Start and follow through",
    logoBg: "bg-[#06B6D4] text-white",
    logoLetter: "M",
    gains: "Zero manual scheduling, saving effort spent playing calendar Tetris.",
    pains: "Automated schedule moves can feel rigid and controlling, failing to reflect human mood or energy.",
    learning: "Balance intelligent suggestions with user autonomy and forgiving, intuitive control.",
  },
  {
    name: "Google Calendar",
    tagline: "Time blocking and appointments",
    domain: "Start and follow through",
    logoBg: "bg-[#4285F4] text-white",
    logoLetter: "31",
    gains: "Clear visibility into hard commitments and total free time across the work week.",
    pains: "Reserving an empty block does not make an intimidating, undefined task easier to start.",
    learning: "Turn empty time blocks into micro-step starting points that dissolve initial friction.",
  },
];

export function CompetitorAnalysisMatrix({
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  return (
    <section
      className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 py-16 md:py-24"
      id={section?.id || "empathize-competitor-analysis"}
      aria-labelledby="competitor-heading"
    >
      {/* Eyebrow & Title matching reference */}
      <p className="text-sm font-medium text-[#8E8E8A]">Competitor Analysis</p>
      <h2
        id="competitor-heading"
        className="mt-2 text-[32px] font-bold tracking-tight text-[#1F2937] md:text-[40px]"
      >
        Who are we up against?
      </h2>
      <p className="mt-5 max-w-[720px] text-base leading-relaxed text-[#666666] md:text-lg">
        If we already have so many productivity tools, why do we still struggle to follow through
        on our plans? We looked beyond feature checklists to examine the upkeep these systems
        demand.
      </p>

      {/* Clean Editorial Table (Thin gray lines #E8E8E8, very light alternating row tint) */}
      <div className="mt-16 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E8E8E8] bg-[#FAFAFA] text-[11px] font-semibold uppercase tracking-wider text-[#151515]">
              <th className="py-3 px-4 w-52">Tool</th>
              <th className="py-3 px-4">What it does well</th>
              <th className="py-3 px-4">Where friction remains</th>
              <th className="py-3 px-4">What Life OS can learn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8E8] text-xs">
            {COMPETITORS.map((c, idx) => (
              <tr
                key={c.name}
                className={idx % 2 === 1 ? "bg-[#FAFAFA]/60" : "bg-white"}
              >
                <td className="py-4 px-4 align-top">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-[11px] font-bold ${c.logoBg}`}
                    >
                      {c.logoLetter}
                    </span>
                    <div>
                      <span className="font-medium text-[#151515] block">{c.name}</span>
                      <span className="text-[11px] text-[#8E8E8A]">{c.domain}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 align-top text-[#666666] leading-relaxed">
                  {c.gains}
                </td>
                <td className="py-4 px-4 align-top text-[#666666] leading-relaxed">
                  {c.pains}
                </td>
                <td className="py-4 px-4 align-top text-[#151515] leading-relaxed font-medium">
                  {c.learning}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Large Simple Takeaway After Table */}
      <div className="mt-20 border-t border-[#E8E8E8] pt-12">
        <div className="max-w-[760px] space-y-4">
          <p className="text-xl font-normal leading-relaxed text-[#151515] sm:text-2xl md:text-[28px] md:leading-snug">
            People already have excellent tools for storing tasks.
            <br />
            The gap appears after the list exists.
          </p>

          <div className="pt-4 space-y-2 text-base text-[#666666] md:text-lg">
            <p className="font-medium text-[#6157E8]">
              What should I do now?
            </p>
            <p className="font-medium text-[#6157E8]">
              Can it actually fit today?
            </p>
            <p className="font-medium text-[#6157E8]">
              Why am I still avoiding it?
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
