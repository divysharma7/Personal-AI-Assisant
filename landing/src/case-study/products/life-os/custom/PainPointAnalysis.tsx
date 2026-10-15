// src/case-study/products/life-os/custom/PainPointAnalysis.tsx
//
// Phase 2 Empathize: "Pain Point Analysis - Knockout Battle"
// Exact recreation of the reference portfolio slide:
// - Eyebrow: "Pain Point Analysis"
// - Title: "Knockout Battle"
// - Green Subheads (#48C09B): "Identifying pain point patterns" & "Problem Prioritization"
// - Method card: Qualitative Ranking (QR) & Frequency of Occurrence
// - Priority axis: "Low Priority" -> "High Priority" with 9 progressive lilac pills
// Strictly zero em dashes and zero raw markdown.

import { useState } from "react";
import type { CustomSection } from "../../../engine/types";

interface PainPointItem {
  id: string;
  rank: number;
  name: string;
  severity: number;
  frequency: number;
  level: "Low" | "Moderate" | "High";
  note: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

const PAIN_POINTS: PainPointItem[] = [
  {
    id: "tool-customization",
    rank: 1,
    name: "Tool Customization",
    severity: 2,
    frequency: 2,
    level: "Low",
    note: "Tinkering with Notion layouts, plugins, and tags consumes time, but is a symptom rather than the root cause.",
    bgClass: "bg-white",
    borderClass: "border-[#E5E7EB]",
    textClass: "text-[#4B5563]",
  },
  {
    id: "habit-inconsistency",
    rank: 2,
    name: "Habit Inconsistency",
    severity: 3,
    frequency: 3,
    level: "Low",
    note: "Skipping personal routines (reading, exercise, side projects) causes mild guilt, but rarely blocks immediate responsibilities.",
    bgClass: "bg-[#FDFBFE]",
    borderClass: "border-[#ECE5F5]",
    textClass: "text-[#4B5563]",
  },
  {
    id: "progress-visibility",
    rank: 3,
    name: "Progress Visibility",
    severity: 2.5,
    frequency: 3,
    level: "Low",
    note: "Not seeing daily milestones dampens morale over weeks, but surfaces mostly during evening review rather than mid-work.",
    bgClass: "bg-[#FAF6FE]",
    borderClass: "border-[#E8DEF5]",
    textClass: "text-[#4B5563]",
  },
  {
    id: "scattered-commitments",
    rank: 4,
    name: "Scattered Commitments",
    severity: 3.5,
    frequency: 4,
    level: "Moderate",
    note: "Tasks spread across Slack, WhatsApp, and quick notes create mental clutter, fragmented attention, and background anxiety.",
    bgClass: "bg-[#F5EEFD]",
    borderClass: "border-[#E2D4F3]",
    textClass: "text-[#4B5563]",
  },
  {
    id: "frequent-distractions",
    rank: 5,
    name: "Frequent Distractions",
    severity: 4,
    frequency: 4.5,
    level: "Moderate",
    note: "Constant notifications and interruptions shatter deep focus, demanding significant energy to rebuild cognitive momentum.",
    bgClass: "bg-[#F0E5FD]",
    borderClass: "border-[#DEC8F4]",
    textClass: "text-[#374151]",
  },
  {
    id: "unrealistic-planning",
    rank: 6,
    name: "Unrealistic Planning",
    severity: 4,
    frequency: 4,
    level: "Moderate",
    note: "Scheduling 8 hours of deep work with zero buffers makes daily plans brittle when meetings overrun or emergencies strike.",
    bgClass: "bg-[#EADDFD]",
    borderClass: "border-[#D7BFF2]",
    textClass: "text-[#374151]",
  },
  {
    id: "task-overload",
    rank: 7,
    name: "Task Overload",
    severity: 4.5,
    frequency: 4.5,
    level: "High",
    note: "Seeing 30 open items on a morning to-do list triggers immediate paralysis before the workday even begins.",
    bgClass: "bg-[#E2CEFC]",
    borderClass: "border-[#CEAEF0]",
    textClass: "text-[#1F2937] font-medium",
  },
  {
    id: "unclear-priorities",
    rank: 8,
    name: "Unclear Priorities",
    severity: 4.5,
    frequency: 5,
    level: "High",
    note: "When everything on the list feels equally urgent, deciding what deserves attention becomes almost as exhausting as doing the work.",
    bgClass: "bg-[#D9BFFB]",
    borderClass: "border-[#C298EE]",
    textClass: "text-[#1F2937] font-semibold",
  },
  {
    id: "difficulty-starting",
    rank: 9,
    name: "Difficulty Starting",
    severity: 5,
    frequency: 5,
    level: "High",
    note: "The definitive bottleneck between intention and action. Vague, intimidating tasks invite avoidance, procrastination, and guilt.",
    bgClass: "bg-[#CFACF9]",
    borderClass: "border-[#B381E9]",
    textClass: "text-[#581C87] font-bold shadow-sm",
  },
];

export function PainPointAnalysis({
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  const [selectedPoint, setSelectedPoint] = useState<PainPointItem>(PAIN_POINTS[8]);

  return (
    <section
      className="bg-white py-16 md:py-24"
      id={section?.id || "empathize-pain-points"}
      aria-labelledby="pain-points-heading"
    >
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 lg:px-20">
        {/* Eyebrow & Main Title matching reference slide */}
        <p className="text-sm font-medium text-[#8E8E8A]">Pain Point Analysis</p>
        <h2
          id="pain-points-heading"
          className="mt-2 text-[32px] font-bold tracking-tight text-[#1F2937] md:text-[40px]"
        >
          Knockout Battle
        </h2>

        {/* Top Research Content Split */}
        <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-12 md:mt-12">
          {/* Left: Narrative & Methodology Subheadings */}
          <div className="space-y-6 lg:col-span-7">
            <div>
              <h3 className="text-lg font-semibold text-[#48C09B] md:text-xl">
                Identifying pain point patterns
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4B5563] md:text-[15px]">
                After drawing patterns from clustered insights, pain points were analyzed to draw the{" "}
                <strong className="font-semibold text-[#1F2937]">most pressing pain point</strong>.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#48C09B] md:text-xl">
                Problem Prioritization
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4B5563] md:text-[15px]">
                In order to establish a hierarchy of pain points and identify the more pressing problems to solve for. To gain quantifiable data a survey of{" "}
                <strong className="font-semibold text-[#1F2937]">32 participants</strong> was used.
              </p>
            </div>
          </div>

          {/* Right: Method Evaluation Card matching reference slide */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="grid grid-cols-1 gap-4 divide-y divide-[#F3F4F6] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                {/* Qualitative Ranking */}
                <div className="sm:pr-4">
                  <h4 className="text-xs font-semibold text-[#9333EA] md:text-[13px]">
                    Qualitative Ranking (QR)
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#4B5563]">
                    • Rank the <strong className="font-semibold text-[#1F2937]">severity and impact</strong> of a particular problem.
                  </p>
                </div>

                {/* Frequency of Occurrence */}
                <div className="pt-4 sm:pl-4 sm:pt-0">
                  <h4 className="text-xs font-semibold text-[#9333EA] md:text-[13px]">
                    Frequency of Occurrence
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#4B5563]">
                    • Gauge the <strong className="font-semibold text-[#1F2937]">Frequency</strong> of the problem's occurrence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Spectrum Axis (Low Priority -> High Priority) */}
        <div className="mt-14 md:mt-20">
          {/* Axis Labels and Direction Arrow */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-[#1F2937] md:text-sm">
              Low Priority
            </span>
            <div className="relative flex-1 flex items-center">
              <div className="h-[1.5px] w-full bg-[#1F2937]/70" />
              <div className="h-0 w-0 border-y-[4px] border-y-transparent border-l-[8px] border-l-[#1F2937]" />
            </div>
            <span className="text-xs font-bold text-[#1F2937] md:text-sm">
              High Priority
            </span>
          </div>

          {/* 9 Progressive Lilac Pills in Horizontal Gradient */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-9">
            {PAIN_POINTS.map((item) => {
              const isSelected = selectedPoint.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedPoint(item)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-200 cursor-pointer ${item.bgClass} ${item.borderClass} ${
                    isSelected ? "ring-2 ring-[#7E22CE] ring-offset-2 scale-[1.03]" : "hover:scale-[1.02]"
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className={`text-[11px] md:text-[12px] leading-snug ${item.textClass}`}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Detail Callout */}
          <div className="mt-6 rounded-2xl border border-[#F3EFFF] bg-[#FAF8FE] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#EFEBF6] pb-3">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7E22CE] text-xs font-bold text-white">
                  {selectedPoint.rank}
                </span>
                <h4 className="text-sm font-bold text-[#1F2937]">
                  {selectedPoint.name}
                </h4>
                <span className="rounded-full bg-[#F3EFFF] px-2.5 py-0.5 text-[11px] font-semibold text-[#7E22CE]">
                  {selectedPoint.level} Priority
                </span>
              </div>
              <div className="text-xs text-[#6B7280]">
                Severity: <span className="font-semibold text-[#1F2937]">{selectedPoint.severity}/5</span> · Frequency: <span className="font-semibold text-[#1F2937]">{selectedPoint.frequency}/5</span>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#4B5563] md:text-[13px]">
              {selectedPoint.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
