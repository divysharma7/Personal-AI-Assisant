// src/case-study/products/life-os/custom/RedesignedBriefHmw.tsx
//
// Phase 2 -> Phase 3 Transition:
// "Redesigned Brief & How Might We"
// Loose editorial layout: soft tinted blocks (#F3F0FF, #F2F6FF, #EFF8F1),
// varied text sizes, strongest North Star HMW, generous whitespace, no em dashes.

import type { CustomSection } from "../../../engine/types";

export function RedesignedBriefHmw({
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  return (
    <section
      className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 py-16 md:py-24"
      id={section?.id || "empathize-brief-hmw"}
      aria-labelledby="brief-hmw-heading"
    >
      {/* Eyebrow & Title matching reference */}
      <p className="text-sm font-medium text-[#8E8E8A]">Sparking thoughts</p>
      <h2
        id="brief-hmw-heading"
        className="mt-2 text-[32px] font-bold tracking-tight text-[#1F2937] md:text-[40px]"
      >
        How Might We?
      </h2>

      {/* The Redesigned Brief on Pale Purple Surface */}
      <div className="mt-10 rounded-2xl border border-[#E8E8E8] bg-[#F3F0FF] p-8 md:p-12">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6157E8]">
          The redesigned brief
        </span>
        <p className="mt-4 text-xl font-medium leading-relaxed text-[#151515] md:text-2xl md:leading-relaxed">
          “Design a personal productivity system that helps ambitious people turn intentions into
          action by making priorities clearer, plans more realistic, and the next step easier to start.”
        </p>
      </div>

      {/* Varied HMW Exploration with Soft Tinted Blocks */}
      <div className="mt-20">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#8E8E8A]">
          Sparking thoughts
        </span>

        {/* Strongest North Star HMW */}
        <div className="mt-6 rounded-2xl border-2 border-[#6157E8]/30 bg-white p-8 md:p-10 shadow-[0_2px_12px_rgba(97,87,232,0.04)]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#6157E8] block">
            Primary north star question
          </span>
          <p className="mt-3 text-2xl font-medium tracking-tight text-[#151515] sm:text-3xl md:text-[34px] md:leading-tight">
            How might we help people turn what they intend to do into what they actually do?
          </p>
        </div>

        {/* Supporting HMW Questions in Soft Tinted Blocks */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Soft Purple */}
          <div className="rounded-xl border border-[#E8E8E8] bg-[#F3F0FF] p-6">
            <span className="text-[10px] font-mono text-[#6157E8]">Priority</span>
            <p className="mt-2 text-base font-medium text-[#151515]">
              How might we help users know what deserves their attention right now?
            </p>
          </div>

          {/* Soft Green */}
          <div className="rounded-xl border border-[#E8E8E8] bg-[#EFF8F1] p-6">
            <span className="text-[10px] font-mono text-emerald-700">Execution</span>
            <p className="mt-2 text-base font-medium text-[#151515]">
              How might we make important tasks easier to start?
            </p>
          </div>

          {/* Soft Blue */}
          <div className="rounded-xl border border-[#E8E8E8] bg-[#F2F6FF] p-6">
            <span className="text-[10px] font-mono text-blue-700">Friction reduction</span>
            <p className="mt-2 text-base font-medium text-[#151515]">
              How might we reduce the friction between planning and doing?
            </p>
          </div>

          {/* Soft Peach */}
          <div className="rounded-xl border border-[#E8E8E8] bg-[#FFF4EF] p-6">
            <span className="text-[10px] font-mono text-amber-700">Adaptability</span>
            <p className="mt-2 text-base font-medium text-[#151515]">
              How might we help users adapt when meetings, interruptions, or urgent work change the day?
            </p>
          </div>

          {/* Clean White */}
          <div className="rounded-xl border border-[#E8E8E8] bg-white p-6">
            <span className="text-[10px] font-mono text-[#8E8E8A]">Clarity</span>
            <p className="mt-2 text-base font-medium text-[#151515]">
              How might we help users turn vague goals into clear, bite-sized next actions?
            </p>
          </div>

          {/* Clean White */}
          <div className="rounded-xl border border-[#E8E8E8] bg-white p-6">
            <span className="text-[10px] font-mono text-[#8E8E8A]">Mental health</span>
            <p className="mt-2 text-base font-medium text-[#151515]">
              How might we prevent overwhelming task lists from becoming another source of stress?
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
