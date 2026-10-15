// src/case-study/products/life-os/custom/PyramidSearchAnalogy.tsx
//
// Phase 2 Empathize: "Leveraging Analogies - Pyramid Search"
// Exact recreation of the reference portfolio slide:
// - Eyebrow: "Leveraging Analogies"
// - Title: "Pyramid Search"
// - Left copy: "This technique was utilized as a quest for more..."
// - Right graphic: 2D coordinate system (Expertise vs Contextual Distance) with 3 triangular peaks & arrows
// - Bottom subhead: "Insights from Analogous Sectors?" in seafoam green (#48C09B)
// - 3-column white card with purple headers (#7E22CE) and qualitative insight bullets
// Strictly zero em dashes and zero raw markdown.

import type { CustomSection } from "../../../engine/types";

interface AnalogousSector {
  title: string;
  bullets: string[];
  takeaway: string;
}

const ANALOGOUS_SECTORS: AnalogousSector[] = [
  {
    title: "Hospital Triage",
    bullets: [
      "Emergency rooms prioritize patients strictly by medical acuity, never arrival order.",
      "Doctors never face an unranked backlog of 40 patients. They address the single most critical case first.",
      "When unexpected emergencies arrive, the queue dynamically recalibrates without panicking staff.",
    ],
    takeaway: "Life OS surfaces the single critical next action rather than a flat, overwhelming to-do list.",
  },
  {
    title: "Lean Operations / Kanban",
    bullets: [
      "Industrial engineers proved that pushing more active work onto the floor slows delivery.",
      "Strict Work-In-Progress (WIP) caps keep cycle time fast and make bottlenecks immediately visible.",
      "A pull-based rhythm replaces chaotic push pressure and multitasking fatigue.",
    ],
    takeaway: "Life OS restricts active priorities to 1 to 3 items, preserving focus and execution momentum.",
  },
  {
    title: "Adaptive GPS Navigation",
    bullets: [
      "When a driver misses an exit, the GPS recalculates quietly without scolding, shame, or guilt.",
      "It meets the driver where they are right now instead of mourning the abandoned route.",
      "Continual lightweight guidance eliminates cognitive exhaustion on unfamiliar roads.",
    ],
    takeaway: "When daily plans get derailed by meetings, Life OS adjusts remaining tasks without guilt.",
  },
];

export function PyramidSearchAnalogy({
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  return (
    <section
      className="bg-white py-16 md:py-24"
      id={section?.id || "empathize-pyramid-search"}
      aria-labelledby="pyramid-heading"
    >
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 lg:px-20">
        {/* Eyebrow & Main Title matching reference slide */}
        <p className="text-sm font-medium text-[#8E8E8A]">Leveraging Analogies</p>
        <h2
          id="pyramid-heading"
          className="mt-2 text-[32px] font-bold tracking-tight text-[#1F2937] md:text-[40px]"
        >
          Pyramid Search
        </h2>

        {/* Top Split: Explanatory Copy + Pyramid Search Coordinate Diagram */}
        <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 md:mt-12">
          {/* Left Description */}
          <div className="space-y-4 lg:col-span-5">
            <p className="text-base font-normal leading-relaxed text-[#1F2937] md:text-lg">
              This technique was utilized as a{" "}
              <strong className="font-semibold text-[#1F2937]">quest for more</strong>.
            </p>
            <p className="text-sm leading-relaxed text-[#4B5563] md:text-[15px]">
              It avoids investing resources in existing ideas. It helps discover novel solutions
              by studying how people in analogous domains have tackled a similar problem.
            </p>
          </div>

          {/* Right: The 2D Coordinate Pyramid Diagram */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl border border-[#F0EDF6] bg-[#FAF8FE] p-6 sm:p-8">
              {/* SVG Pyramid Search Visual */}
              <div className="relative w-full aspect-[16/9] max-h-[260px]">
                <svg
                  viewBox="0 0 600 300"
                  className="h-full w-full overflow-visible"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Axes */}
                  {/* Y-Axis: Expertise */}
                  <line
                    x1="60"
                    y1="250"
                    x2="60"
                    y2="30"
                    stroke="#D1D5DB"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M57 36L60 28L63 36"
                    stroke="#D1D5DB"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* X-Axis: Contextual Distance */}
                  <line
                    x1="60"
                    y1="250"
                    x2="560"
                    y2="250"
                    stroke="#D1D5DB"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M552 247L560 250L552 253"
                    stroke="#D1D5DB"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Axis Text Labels */}
                  <text
                    x="-140"
                    y="45"
                    transform="rotate(-90)"
                    fill="#6B7280"
                    fontSize="11"
                    fontWeight="500"
                    fontFamily="inherit"
                  >
                    Expertise
                  </text>
                  <text
                    x="480"
                    y="275"
                    fill="#6B7280"
                    fontSize="11"
                    fontWeight="500"
                    fontFamily="inherit"
                  >
                    Contextual Distance
                  </text>

                  {/* Peak 1: Our Domain */}
                  <polygon
                    points="70,250 145,70 220,250"
                    fill="#F3EFFF"
                    stroke="#E9DFFC"
                    strokeWidth="1"
                  />
                  {/* Arrow up inside Peak 1 */}
                  <line
                    x1="145"
                    y1="240"
                    x2="145"
                    y2="85"
                    stroke="#6B7280"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M142 92L145 84L148 92"
                    stroke="#6B7280"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />

                  {/* Diagonal Arrow Peak 1 -> Peak 2 */}
                  <line
                    x1="145"
                    y1="85"
                    x2="305"
                    y2="240"
                    stroke="#6B7280"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M298 238L306 241L303 233"
                    stroke="#6B7280"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />

                  {/* Peak 2: Emergency Triage */}
                  <polygon
                    points="235,250 310,70 385,250"
                    fill="#F3EFFF"
                    stroke="#E9DFFC"
                    strokeWidth="1"
                  />
                  {/* Arrow up inside Peak 2 */}
                  <line
                    x1="310"
                    y1="240"
                    x2="310"
                    y2="85"
                    stroke="#6B7280"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M307 92L310 84L313 92"
                    stroke="#6B7280"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />

                  {/* Diagonal Arrow Peak 2 -> Peak 3 */}
                  <line
                    x1="310"
                    y1="85"
                    x2="470"
                    y2="240"
                    stroke="#6B7280"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M463 238L471 241L468 233"
                    stroke="#6B7280"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />

                  {/* Peak 3: Adaptive Navigation */}
                  <polygon
                    points="400,250 475,70 550,250"
                    fill="#F3EFFF"
                    stroke="#E9DFFC"
                    strokeWidth="1"
                  />
                  {/* Arrow up inside Peak 3 */}
                  <line
                    x1="475"
                    y1="240"
                    x2="475"
                    y2="85"
                    stroke="#6B7280"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M472 92L475 84L478 92"
                    stroke="#6B7280"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Domain Pill Badges at the Base matching reference */}
                <div className="absolute bottom-2 left-[10%] right-[10%] flex justify-between gap-2 text-center pointer-events-none">
                  <div className="rounded-lg bg-[#D8B4FE] px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm sm:text-xs">
                    Our Domain
                  </div>
                  <div className="rounded-lg bg-[#D8B4FE] px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm sm:text-xs">
                    Hospital Triage
                  </div>
                  <div className="rounded-lg bg-[#D8B4FE] px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm sm:text-xs">
                    GPS & Navigation
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Insights from Analogous Sectors */}
        <div className="mt-14 md:mt-20">
          <h3 className="text-xl font-semibold text-[#48C09B] md:text-2xl">
            Insights from Analogous Sectors?
          </h3>

          {/* 3-Column White Card matching reference */}
          <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] sm:p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:divide-x md:divide-[#F3F4F6]">
              {ANALOGOUS_SECTORS.map((sector, idx) => (
                <div key={sector.title} className={idx > 0 ? "md:pl-8" : ""}>
                  <h4 className="text-sm font-bold text-[#7E22CE] md:text-base">
                    {sector.title}
                  </h4>

                  <ul className="mt-4 space-y-3 text-xs leading-relaxed text-[#4B5563] md:text-[13px]">
                    {sector.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <span className="text-[#9CA3AF]">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 rounded-xl bg-[#FAF8FE] p-3 border border-[#F3EFFF]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E22CE] block">
                      Life OS Application
                    </span>
                    <p className="mt-1 text-xs font-medium text-[#1F2937] leading-snug">
                      {sector.takeaway}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
