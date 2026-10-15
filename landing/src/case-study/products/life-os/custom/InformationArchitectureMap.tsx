// src/case-study/products/life-os/custom/InformationArchitectureMap.tsx
//
// "Information Architecture" diagram for Life OS Case Study overview.
// Visual adaptation of the hierarchical IA tree:
// Main Spine → Core Product Modules (amber badges) → Category Pillars (mint badges) → Feature Drill-downs.

import type { CustomSection } from "../../../engine/types";

export interface SubActionItem {
  title: string;
  subActions?: string[];
}

export interface ArchitectureCategory {
  title: string;
  items: (string | SubActionItem)[];
}

export interface ArchitectureModule {
  id: string;
  title: string;
  icon: string;
  categories: ArchitectureCategory[];
}

export interface InformationArchitectureData {
  eyebrow?: string;
  title?: string;
  lead?: string;
  footnote?: string;
  modules?: ArchitectureModule[];
}

const DEFAULT_MODULES: ArchitectureModule[] = [
  {
    id: "today",
    title: "Today",
    icon: "☀️",
    categories: [
      {
        title: "Daily OS",
        items: [
          "Capacity vs Demand Meter",
          "Focus Minutes Allowance",
          "Fixed Meetings Union",
          "Active Day Plan",
        ],
      },
      {
        title: "Repair Engine",
        items: [
          "Disruption Detection",
          "Deficit Calculation",
          {
            title: "Repair Proposal Card",
            subActions: ["Accept", "Undo / Revert", "Dismiss"],
          },
          "Staged Deferrals",
        ],
      },
      {
        title: "Quick Capture",
        items: [
          "Frictionless Input",
          "Natural Language Parser",
          "Firm vs Flexible Toggle",
          "Duration Guess",
        ],
      },
      {
        title: "Close of Day",
        items: [
          "Evening Closure Card",
          "Keep / Defer / Drop",
          "Tomorrow Carryover",
          "Zero-Guilt State",
        ],
      },
    ],
  },
  {
    id: "tasks",
    title: "Tasks & Workflows",
    icon: "✅",
    categories: [
      {
        title: "Inbox",
        items: [
          "Unprocessed Items",
          "Quick Triage",
          "Source Metadata",
        ],
      },
      {
        title: "Active Backlog",
        items: [
          "Firm Commitments",
          "Flexible Tasks",
          "Context & Energy Tags",
          "Deadline Defenses",
        ],
      },
      {
        title: "Workflows",
        items: [
          "Kanban Boards",
          "Project Milestones",
          "Stage Progression",
        ],
      },
      {
        title: "Matrix Views",
        items: [
          "Eisenhower 2×2",
          "Effort vs Impact",
          "Time Estimation Accuracy",
        ],
      },
    ],
  },
  {
    id: "schedule",
    title: "Calendar & Schedule",
    icon: "🗓️",
    categories: [
      {
        title: "Unified Timeline",
        items: [
          "24-Hour Day Strip",
          "Google & Outlook Sync",
          "Meeting Union Blocks",
        ],
      },
      {
        title: "Capacity Defense",
        items: [
          "Focus Block Armor",
          "Transition Reserve (90m)",
          "Minimum Feasible Slot Filter",
        ],
      },
      {
        title: "Event Manager",
        items: [
          "Fixed Appointments",
          {
            title: "Overrun Resolver",
            subActions: ["Dynamic Recompute", "Buffer Absorption"],
          },
          "Timezone Overlap Guard",
        ],
      },
    ],
  },
  {
    id: "focus",
    title: "Focus & Habits",
    icon: "🎯",
    categories: [
      {
        title: "Deep Work",
        items: [
          "Distraction-Free Timer",
          "Binaural Soundscapes",
          {
            title: "Post-Session Wrap",
            subActions: ["Completed", "Continue 15m", "Mark Blocked"],
          },
        ],
      },
      {
        title: "Habit Engine",
        items: [
          "Morning & Evening Loops",
          "Protected Habit Slots",
          "Streak Continuity",
        ],
      },
      {
        title: "Analytics",
        items: [
          "Usable Focus Trends",
          "Context-Switching Cost",
          "Weekly Velocity",
        ],
      },
    ],
  },
  {
    id: "assistant",
    title: "AI Companion",
    icon: "✨",
    categories: [
      {
        title: "Assistant",
        items: [
          "Re-planning Dialogue",
          "Reasoning Explanations",
          "Command Bar (Cmd+K)",
        ],
      },
      {
        title: "Control & Settings",
        items: [
          "Transparent Suggestions",
          "Non-Destructive Undo",
          "Integrations (Calendar, Slack)",
        ],
      },
    ],
  },
];

const DEFAULT_DATA: InformationArchitectureData = {
  eyebrow: "System Design",
  title: "Information Architecture",
  lead: "The structural blueprint of Life OS: unifying daily capacity, dynamic repair, scheduled commitments, and deep focus into a cohesive operating system.",
  footnote: "*Adaptive repair and capacity arithmetic operate across all modules with complete non-destructive undo.",
  modules: DEFAULT_MODULES,
};

export function InformationArchitectureMap({
  data,
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  const merged: InformationArchitectureData = {
    ...DEFAULT_DATA,
    ...((data as InformationArchitectureData) || {}),
  };

  const modules = merged.modules || DEFAULT_MODULES;

  return (
    <section
      className="mx-auto max-w-[1200px] px-6 md:px-10"
      id={section?.id || "overview-information-architecture"}
      aria-labelledby="ia-heading"
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-bg-secondary via-bg-secondary to-bg-tertiary/80 p-8 shadow-2xl md:p-12 lg:p-16">
        {/* Soft atmospheric gradient accents */}
        <div
          className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10">
          {/* Eyebrow badge */}
          {merged.eyebrow && (
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">
              {merged.eyebrow}
            </p>
          )}

          {/* Section title */}
          <h2
            id="ia-heading"
            className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl"
          >
            {merged.title}
          </h2>

          {merged.lead && (
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-text-secondary md:text-lg">
              {merged.lead}
            </p>
          )}

          {/* Scrollable Diagram Canvas container */}
          <div className="mt-12 overflow-x-auto pb-6 scrollbar-thin">
            <div className="min-w-[860px] pl-4 pr-6">
              {/* Main Vertical Spine Tree */}
              <div className="relative border-l-2 border-white/15 pl-8 space-y-12">
                {modules.map((mod) => (
                  <div key={mod.id} className="relative">
                    {/* Horizontal elbow connecting trunk to Parent Node */}
                    <div
                      className="absolute -left-8 top-5 h-0.5 w-8 bg-white/15"
                      aria-hidden="true"
                    />

                    {/* Primary Parent Module Node (Amber/Cream rounded pill) */}
                    <div className="inline-flex items-center gap-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 shadow-sm">
                      <span className="text-base select-none" aria-hidden="true">
                        {mod.icon}
                      </span>
                      <span className="text-sm font-bold text-amber-200 md:text-base">
                        {mod.title}
                      </span>
                    </div>

                    {/* Branching tree connector to Categories */}
                    <div className="relative mt-4 pl-4">
                      {/* Vertical stem from parent down to distribution line */}
                      <div
                        className="absolute left-4 top-0 h-4 w-0.5 bg-white/15"
                        aria-hidden="true"
                      />

                      {/* Horizontal distribution track spanning all categories */}
                      <div className="relative pt-4">
                        <div
                          className="absolute left-0 right-8 top-4 h-0.5 bg-white/15"
                          aria-hidden="true"
                        />

                        {/* Category columns */}
                        <div className="grid grid-flow-col auto-cols-fr gap-4 pt-4">
                          {mod.categories.map((cat) => (
                            <div key={cat.title} className="relative flex flex-col">
                              {/* Vertical stem from distribution track to Category Pill */}
                              <div
                                className="absolute -top-4 left-6 h-4 w-0.5 bg-white/15"
                                aria-hidden="true"
                              />

                              {/* Category Header (Mint/Teal rounded pill) */}
                              <div className="mb-3 inline-flex self-start rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 shadow-sm">
                                {cat.title}
                              </div>

                              {/* Items list */}
                              <ul className="space-y-1.5 pl-2 text-xs leading-relaxed text-text-secondary">
                                {cat.items.map((item, idx) => {
                                  if (typeof item === "string") {
                                    return (
                                      <li key={idx} className="flex items-start gap-1.5">
                                        <span className="text-text-muted select-none">•</span>
                                        <span>{item}</span>
                                      </li>
                                    );
                                  }

                                  // Item with sub-actions (drill-down arrow chain)
                                  return (
                                    <li key={idx} className="space-y-1">
                                      <div className="flex items-start gap-1.5 font-medium text-text-primary">
                                        <span className="text-text-muted select-none">•</span>
                                        <span>{item.title}</span>
                                      </div>
                                      {item.subActions && item.subActions.length > 0 && (
                                        <div className="pl-3.5 space-y-0.5 text-[11px] text-text-muted">
                                          {item.subActions.map((sub, sIdx) => (
                                            <div key={sIdx} className="flex items-center gap-1">
                                              <span className="text-accent-light select-none">↳</span>
                                              <span>{sub}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footnote */}
          {merged.footnote && (
            <p className="mt-8 text-xs italic text-text-muted">
              {merged.footnote}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
