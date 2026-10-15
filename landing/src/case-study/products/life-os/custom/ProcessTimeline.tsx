// src/case-study/products/life-os/custom/ProcessTimeline.tsx
//
// "The Process" timeline section for Life OS Case Study.
// Exact recreation of the reference portfolio slide:
// Bold dark "The Process" heading, 5-stage horizontal timeline with purple stage labels,
// numbered circular badges (1 to 5) anchored on a thin gray connecting line,
// and soft lilac rounded cards (#F7F2FE) containing the design activities.

import type { CustomSection } from "../../../engine/types";

export interface ProcessStep {
  number: string;
  name: string;
  items: string[];
}

export interface ProcessTimelineData {
  title?: string;
  steps?: ProcessStep[];
}

const DEFAULT_STEPS: ProcessStep[] = [
  {
    number: "1",
    name: "Empathize",
    items: [
      "Secondary Research",
      "Primary Research",
    ],
  },
  {
    number: "2",
    name: "Define",
    items: [
      "Affinity mapping",
      "User Personae",
      "Empathy Map",
      "User Journey",
      "Pain Point Analysis",
      "Competitive Audit",
      "Pyramid Search",
    ],
  },
  {
    number: "3",
    name: "Ideate",
    items: [
      "HMWs",
      "Co-brainstorming",
      "Concept Research",
      "Information Architecture",
      "Low-fidelity Wireframing",
    ],
  },
  {
    number: "4",
    name: "Design",
    items: [
      "Visual Language",
      "Final Screens",
    ],
  },
  {
    number: "5",
    name: "Review",
    items: [
      "User Reviews",
      "The positives",
      "The negatives",
    ],
  },
];

export function ProcessTimeline({
  data,
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  const merged: ProcessTimelineData = {
    title: "The Process",
    steps: DEFAULT_STEPS,
    ...((data as ProcessTimelineData) || {}),
  };

  const steps = merged.steps || DEFAULT_STEPS;

  return (
    <section
      className="bg-white py-16 md:py-24"
      id={section?.id || "overview-process-timeline"}
      aria-labelledby="process-heading"
    >
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 lg:px-20">
        {/* Section Heading matching reference */}
        <p className="text-sm font-medium text-[#8E8E8A]">Methodology</p>
        <h2
          id="process-heading"
          className="mt-2 text-[32px] font-bold tracking-tight text-[#1F2937] md:text-[40px]"
        >
          {merged.title}
        </h2>

        {/* Desktop 5-Column Horizontal Timeline */}
        <div className="relative mt-14 hidden md:block">
          {/* Continuous thin connecting horizontal line */}
          <div
            className="absolute top-[42px] left-[10%] right-[10%] h-[1px] bg-[#E8E8E8]"
            aria-hidden="true"
          />

          <div className="grid grid-cols-5 gap-4 lg:gap-6 items-start">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                {/* Purple Stage Label */}
                <span className="text-base font-bold text-[#C084FC] lg:text-[17px]">
                  {step.name}
                </span>

                {/* Numbered circular badge sitting on top of the line */}
                <div className="my-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#F3EFFF] text-xs font-semibold text-[#A855F7] ring-4 ring-white shadow-sm">
                  {step.number}
                </div>

                {/* Soft Lilac Content Card */}
                <div className="mt-3 w-full rounded-2xl bg-[#F7F2FE] p-5 lg:p-6 text-center shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                  <ul className="space-y-1.5 text-xs text-[#27272A] lg:text-[13px] leading-relaxed">
                    {step.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Responsive Version (Horizontal scroll with preserved cards) */}
        <div className="relative mt-10 md:hidden">
          <div className="flex gap-4 overflow-x-auto pb-6 pt-2 no-scrollbar">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex w-[240px] shrink-0 flex-col items-center"
              >
                {/* Purple Stage Label */}
                <span className="text-base font-bold text-[#C084FC]">
                  {step.name}
                </span>

                {/* Numbered badge */}
                <div className="my-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#F3EFFF] text-xs font-semibold text-[#A855F7] ring-2 ring-white">
                  {step.number}
                </div>

                {/* Soft Lilac Content Card */}
                <div className="mt-2 w-full rounded-2xl bg-[#F7F2FE] p-5 text-center">
                  <ul className="space-y-1.5 text-xs text-[#27272A] leading-relaxed">
                    {step.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
