// src/case-study/products/life-os/custom/AffinityMappingGrid.tsx
//
// Affinity Mapping Section for Life OS Case Study.
// Exact recreation of the reference portfolio slide:
// - Header: "Affinity Mapping" eyebrow + bold "Finally gathered this!" title.
// - 4x2 Grid of 8 white rounded cards (#FFFFFF) with rounded purple header containers (#F3EFFF),
//   and centered qualitative observation points separated by subtle hairlines.

import type { CustomSection } from "../../../engine/types";

export interface AffinityCluster {
  id: string;
  title: string;
  items: string[];
}

const CLUSTERS: AffinityCluster[] = [
  {
    id: "task-overload",
    title: "Task overload",
    items: [
      "Too many tasks competing for attention at once.",
      "Commitments scattered across different apps and notes.",
      "Constant background anxiety about forgetting something.",
      "Feeling overwhelmed before even starting the day.",
    ],
  },
  {
    id: "prioritization",
    title: "Prioritization",
    items: [
      "Everything on the list feels equally urgent.",
      "Urgent fires constantly overshadow long-term goals.",
      "Spending 20+ minutes just deciding what to work on next.",
      "Defaulting to easy, low-value tasks to feel busy.",
    ],
  },
  {
    id: "planning-time",
    title: "Planning and time",
    items: [
      "Chronically underestimating how long deep work takes.",
      "Scheduling 8 hours of focused work in an 8-hour day.",
      "Surprise meetings blow up the morning schedule.",
      "Rolling unfinished tasks over to tomorrow every night.",
    ],
  },
  {
    id: "procrastination",
    title: "Procrastination",
    items: [
      "Delaying work when the first step is vague or intimidating.",
      "Waiting for 'inspiration' or perfect energy to start.",
      "Avoiding projects with uncertain outcomes.",
      "Over-researching instead of writing or designing.",
    ],
  },
  {
    id: "focus-distractions",
    title: "Focus and distractions",
    items: [
      "Slack and WhatsApp notifications shattering focus.",
      "Switching between three unfinished browser tabs.",
      "High attention residue after context switching.",
      "Losing productive flow to sudden digital interruptions.",
    ],
  },
  {
    id: "goals-consistency",
    title: "Goals and consistency",
    items: [
      "Long-term personal ambitions get forgotten in daily routine.",
      "Struggling to sustain habits past week two.",
      "Starting projects with enthusiasm but losing follow-through.",
      "No direct connection between today's tasks and 6-month goals.",
    ],
  },
  {
    id: "progress-reflection",
    title: "Progress and reflection",
    items: [
      "Feeling exhausted at 7 PM without knowing what got done.",
      "No clear visibility into where working hours actually went.",
      "Difficulty recognizing repeating procrastination triggers.",
      "Carrying persistent guilt about unfinished to-dos.",
    ],
  },
  {
    id: "tools-workflows",
    title: "Tools and workflows",
    items: [
      "Important work split across Notion, Apple Notes, and Todoist.",
      "Spending more time configuring templates than doing work.",
      "Complicated productivity systems that crumble under stress.",
      "Notification fatigue makes reminder pings invisible.",
    ],
  },
];

export function AffinityMappingGrid({
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  return (
    <section
      className="bg-[#FAF8FE] py-16 md:py-24"
      id={section?.id || "empathize-affinity-mapping"}
      aria-labelledby="affinity-heading"
    >
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 lg:px-20">
        {/* Eyebrow & Main Title matching reference */}
        <p className="text-sm font-medium text-[#8E8E8A]">Affinity Mapping</p>
        <h2
          id="affinity-heading"
          className="mt-2 text-[32px] font-bold tracking-tight text-[#1F2937] md:text-[40px]"
        >
          Finally gathered this!
        </h2>

        {/* 4x2 Research Affinity Grid matching reference */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:mt-16">
          {CLUSTERS.map((cluster) => (
            <div
              key={cluster.id}
              className="flex flex-col rounded-2xl border border-[#EFEBF6] bg-white p-5 shadow-[0_4px_20px_rgba(110,89,165,0.04)]"
            >
              {/* Purple Header Container matching reference */}
              <div className="rounded-xl bg-[#F3EFFF] px-4 py-2.5 text-center">
                <h3 className="text-sm font-bold text-[#7E22CE]">
                  {cluster.title}
                </h3>
              </div>

              {/* Centered Observation Points separated by clean dividers */}
              <div className="mt-5 flex-1 flex flex-col justify-between space-y-3.5 text-center text-xs leading-relaxed text-[#4B5563] md:text-[13px]">
                {cluster.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={idx > 0 ? "border-t border-[#F3F4F6] pt-3.5" : ""}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
