// src/case-study/products/life-os/custom/ExecutionGapOverview.tsx
//
// Overview section for Life OS Case Study.
// Exact recreation of the reference portfolio slide architecture:
// Pure white canvas, soft corner lavender accents (#F3EFFF),
// Top-left "Overview" narrative, indented terracotta "The domino effect"
// with 4-stage causal pills (3 peach + 1 solid coral), and "Opportunities" with 3 mint-green pills.

import type { CustomSection } from "../../../engine/types";
import { LifeOsMark } from "../../../../components/brand/LifeOsLogo";

export interface ExecutionGapOverviewData {
  overviewTitle?: string;
  overviewBody?: {
    boldPrefix?: string;
    text?: string;
    boldSuffix?: string;
  };
  gapTitle?: string;
  gapParagraph1?: {
    lead?: string;
    bold1?: string;
    mid1?: string;
    bold2?: string;
    mid2?: string;
    bold3?: string;
    tail?: string;
  };
  gapParagraph2?: {
    lead?: string;
    bold1?: string;
    mid1?: string;
    bold2?: string;
    tail?: string;
  };
  dominoSteps?: { label: string; isCulmination?: boolean }[];
  opportunitiesTitle?: string;
  opportunities?: string[];
}

const DEFAULT_DATA: ExecutionGapOverviewData = {
  overviewTitle: "Overview",
  overviewBody: {
    boldPrefix: "Life OS",
    text: " an end-to-end personal productivity system that strives to elevate daily focus and execution by empowering ambitious people to bridge the gap between intention and action and ",
    boldSuffix: "foster meaningful daily progress.",
  },
  gapTitle: "The domino effect",
  gapParagraph1: {
    lead: "People often feel ",
    bold1: "overwhelmed",
    mid1: " due to the ",
    bold2: "unpredictable nature of daily work",
    mid2: " and the complexity of competing demands, which are not easily managed by simple to-do lists. The ",
    bold3: "constant exposure",
    tail: " to pings, meetings, and fragmented focus can lead to burnout, decision fatigue, and avoided tasks.",
  },
  gapParagraph2: {
    lead: "This is compounded by the fact that daily planning often remains in its ",
    bold1: "unrealistic",
    mid1: " stages with zero buffer for real-world disruptions. This in turn ",
    bold2: "hinders their overall momentum and professional growth",
    tail: ", ultimately impacting the quality and consistency of what gets finished.",
  },
  dominoSteps: [
    { label: "Scattered Intentions" },
    { label: "Overwhelming Priorities" },
    { label: "Delayed Action" },
    { label: "Stalled Progress", isCulmination: true },
  ],
  opportunitiesTitle: "Opportunities",
  opportunities: [
    "foster realistic planning",
    "clarify immediate next action",
    "build calm daily momentum",
  ],
};

export function ExecutionGapOverview({
  data,
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  const merged: ExecutionGapOverviewData = {
    ...DEFAULT_DATA,
    ...((data as ExecutionGapOverviewData) || {}),
  };

  return (
    <section
      className="relative overflow-hidden bg-white py-16 md:py-24"
      id={section?.id || "overview-execution-gap"}
      aria-labelledby="overview-heading"
    >
      {/* Soft atmospheric corner accents matching the reference slide */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-[340px] w-[340px] rounded-full bg-[#F3EFFF] md:-top-32 md:-right-32 md:h-[500px] md:w-[500px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-[340px] w-[340px] rounded-full bg-[#F3EFFF] md:-bottom-36 md:-left-36 md:h-[500px] md:w-[500px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 lg:px-20">
        {/* Block 1: Top-Left Overview */}
        <div className="max-w-[480px]">
          <div className="flex items-center gap-2">
            <LifeOsMark size={18} />
            <p className="text-sm font-medium text-[#8E8E8A]">Life OS</p>
          </div>
          <h2
            id="overview-heading"
            className="mt-2 text-[32px] font-bold tracking-tight text-[#1F2937] md:text-[40px]"
          >
            {merged.overviewTitle}
          </h2>

          <p className="mt-4 text-sm leading-[1.65] text-[#4B5563] md:text-[15px]">
            <strong className="font-bold text-[#1F2937]">
              {merged.overviewBody?.boldPrefix}
            </strong>
            {merged.overviewBody?.text}
            <strong className="font-bold text-[#1F2937]">
              {merged.overviewBody?.boldSuffix}
            </strong>
          </p>
        </div>

        {/* Block 2: The Domino Effect (Indented asymmetrically as in reference) */}
        <div className="mt-12 md:mt-16 md:pl-28 lg:pl-44">
          <h3 className="text-[28px] font-bold tracking-tight text-[#E07A5F] md:text-[34px]">
            {merged.gapTitle}
          </h3>

          <div className="mt-4 max-w-[620px] space-y-4 text-sm leading-[1.65] text-[#4B5563] md:text-[15px]">
            <p>
              {merged.gapParagraph1?.lead}
              <strong className="font-bold text-[#1F2937]">
                {merged.gapParagraph1?.bold1}
              </strong>
              {merged.gapParagraph1?.mid1}
              <strong className="font-bold text-[#1F2937]">
                {merged.gapParagraph1?.bold2}
              </strong>
              {merged.gapParagraph1?.mid2}
              <strong className="font-bold text-[#1F2937]">
                {merged.gapParagraph1?.bold3}
              </strong>
              {merged.gapParagraph1?.tail}
            </p>

            <p>
              {merged.gapParagraph2?.lead}
              <strong className="font-bold text-[#1F2937]">
                {merged.gapParagraph2?.bold1}
              </strong>
              {merged.gapParagraph2?.mid1}
              <strong className="font-bold text-[#1F2937]">
                {merged.gapParagraph2?.bold2}
              </strong>
              {merged.gapParagraph2?.tail}
            </p>
          </div>

          {/* Domino Causal Pills (3 blush + 1 solid terracotta) */}
          <div
            className="mt-7 flex flex-wrap items-center gap-2.5 md:gap-3"
            role="list"
            aria-label="The domino effect progression"
          >
            {merged.dominoSteps?.map((step, idx) => {
              const isLast = idx === (merged.dominoSteps?.length || 0) - 1;
              return (
                <div
                  key={step.label}
                  className="inline-flex items-center gap-2.5 md:gap-3"
                  role="listitem"
                >
                  <div
                    className={`inline-flex items-center rounded-lg px-4 py-2 text-xs font-medium md:text-sm ${
                      step.isCulmination
                        ? "bg-[#E07A5F] text-white shadow-sm shadow-[#E07A5F]/20"
                        : "bg-[#FEECE6] text-[#27272A]"
                    }`}
                  >
                    {step.label}
                  </div>

                  {!isLast && (
                    <span
                      className="select-none text-sm text-[#6B7280] md:text-base"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Block 3: Opportunities */}
          <div className="mt-12 md:mt-14">
            <h3 className="text-[22px] font-bold tracking-tight text-[#1F2937] md:text-[26px]">
              {merged.opportunitiesTitle}
            </h3>

            <div
              className="mt-4 flex flex-wrap items-center gap-3"
              role="list"
              aria-label="Opportunities"
            >
              {merged.opportunities?.map((opp) => (
                <div
                  key={opp}
                  role="listitem"
                  className="inline-flex items-center rounded-lg bg-[#D8F3E5] px-4 py-2.5 text-xs font-normal text-[#1F2937] md:text-sm"
                >
                  {opp}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
