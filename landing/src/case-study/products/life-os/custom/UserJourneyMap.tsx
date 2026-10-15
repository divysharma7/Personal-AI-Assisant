// src/case-study/products/life-os/custom/UserJourneyMap.tsx
//
// Phase 2 — Empathize: "Zooming into my User's Journey"
// Editorial table layout: white canvas, very thin separators, small emotional icons,
// pale purple (#F3F0FF) for header and opportunity highlights, no outer card, no em dashes.

import type { CustomSection } from "../../../engine/types";

interface JourneyStage {
  id: string;
  number: string;
  emoji: string;
  emotion: string;
  activityPrimary: string;
  activityDetails: string;
  obstacleKeyword: string;
  obstacleText: string;
  opportunityKeyword: string;
  opportunityText: string;
}

const STAGES: JourneyStage[] = [
  {
    id: "stage-01",
    number: "01",
    emoji: "☀️",
    emotion: "Motivated",
    activityPrimary: "Starts the day with high optimism.",
    activityDetails: "Opens the to-do list, reviews deadlines, and plans to finish several ambitious tasks.",
    obstacleKeyword: "Overestimating available time.",
    obstacleText: "Plans for an ideal day without accounting for meetings, interruptions, or energy limits.",
    opportunityKeyword: "Realistic daily planning.",
    opportunityText: "Guide the user to pick a small, realistic set of priorities that fit the actual calendar.",
  },
  {
    id: "stage-02",
    number: "02",
    emoji: "🤔",
    emotion: "Confused",
    activityPrimary: "Tries to decide what to work on first.",
    activityDetails: "Scans across Slack notes, email threads, calendar invites, and backlog lists.",
    obstacleKeyword: "Everything feels urgent.",
    obstacleText: "Unclear priorities make deciding what to do almost as exhausting as the work itself.",
    opportunityKeyword: "Clear next actions.",
    opportunityText: "Bring scattered commitments together and surface the single action that matters most.",
  },
  {
    id: "stage-03",
    number: "03",
    emoji: "😵",
    emotion: "Overwhelmed",
    activityPrimary: "Attempts to organize scattered commitments.",
    activityDetails: "Remembers follow-ups, personal errands, and chores while trying to plan work.",
    obstacleKeyword: "Information fragmentation.",
    obstacleText: "Tasks live in four different apps. Holding them in memory creates persistent mental clutter.",
    opportunityKeyword: "Effortless capture.",
    opportunityText: "Allow lightning-fast capture and auto-clarification without breaking current concentration.",
  },
  {
    id: "stage-04",
    number: "04",
    emoji: "🧱",
    emotion: "Hesitant",
    activityPrimary: "Attempts to begin an important project.",
    activityDetails: "Opens a strategic deliverable that has been postponed for several consecutive days.",
    obstacleKeyword: "The task feels too big.",
    obstacleText: "Vague scope and uncertainty about where to start make easy tasks far more tempting.",
    opportunityKeyword: "Deconstruct the first step.",
    opportunityText: "Break daunting work into a concrete 10-minute starter action that lowers the threshold to begin.",
  },
  {
    id: "stage-05",
    number: "05",
    emoji: "🔔",
    emotion: "Distracted",
    activityPrimary: "Finally reaches a flow state.",
    activityDetails: "Starts writing or coding, but incoming messages and impromptu meeting requests hit.",
    obstacleKeyword: "Frequent context switching.",
    obstacleText: "Fragmented attention creates high residue, making it difficult to find flow again.",
    opportunityKeyword: "Resumable focus.",
    opportunityText: "Keep active work anchored so users can cleanly return to it after inevitable interruptions.",
  },
  {
    id: "stage-06",
    number: "06",
    emoji: "🚨",
    emotion: "Frustrated",
    activityPrimary: "Reacts to sudden team emergencies.",
    activityDetails: "Handles urgent fixes, stakeholder questions, and unplanned tasks.",
    obstacleKeyword: "Priorities shift abruptly.",
    obstacleText: "The morning plan disintegrates, and meaningful personal work is silently pushed aside.",
    opportunityKeyword: "Calm recalibration.",
    opportunityText: "Help users adjust remaining tasks in two clicks without rebuilding their entire day.",
  },
  {
    id: "stage-07",
    number: "07",
    emoji: "😞",
    emotion: "Disappointed",
    activityPrimary: "Reviews what remains at 5 PM.",
    activityDetails: "Notices that several planned high-impact items were never touched despite working all day.",
    obstacleKeyword: "Activity does not equal progress.",
    obstacleText: "Urgent administrative work was cleared, but the core work that moves the needle stayed at zero.",
    opportunityKeyword: "Outcome-based tracking.",
    opportunityText: "Celebrate meaningful goal movement rather than just ticking off low-value tasks.",
  },
  {
    id: "stage-08",
    number: "08",
    emoji: "🔄",
    emotion: "Guilty",
    activityPrimary: "Rolls unfinished tasks over to tomorrow.",
    activityDetails: "Carries forward the same heavy tasks and silently vows to be more disciplined tomorrow.",
    obstacleKeyword: "Chronic postponement cycle.",
    obstacleText: "Rescheduling without deconstructing causes the exact same friction tomorrow.",
    opportunityKeyword: "Pattern recognition.",
    opportunityText: "Gently highlight repeatedly postponed items and prompt right-sizing or delegating them.",
  },
  {
    id: "stage-09",
    number: "09",
    emoji: "🌙",
    emotion: "Drained",
    activityPrimary: "Tries to work on personal goals after hours.",
    activityDetails: "Wants to learn, exercise, read, or build a side project in the evening.",
    obstacleKeyword: "Depleted executive energy.",
    obstacleText: "Ambitious evening intentions crash against mental exhaustion from workday decision fatigue.",
    opportunityKeyword: "Progress that fits reality.",
    opportunityText: "Offer micro-actions tailored to low-energy evening windows so progress still happens.",
  },
  {
    id: "stage-10",
    number: "10",
    emoji: "📓",
    emotion: "Reflective",
    activityPrimary: "Prepares for the next day.",
    activityDetails: "Thinks through what went wrong and hopes tomorrow will feel less chaotic.",
    obstacleKeyword: "Lack of structured closure.",
    obstacleText: "Without honest evening reflection, the same unrealistic cycle loops again tomorrow.",
    opportunityKeyword: "Light evening reflection.",
    opportunityText: "A 60-second evening wind-down to close open loops, celebrate wins, and reset cleanly.",
  },
];

export function UserJourneyMap({
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  return (
    <section
      className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 py-16 md:py-24"
      id={section?.id || "empathize-user-journey"}
      aria-labelledby="journey-heading"
    >
      {/* Eyebrow & Title matching reference */}
      <p className="text-sm font-medium text-[#8E8E8A]">User Journey</p>
      <h2
        id="journey-heading"
        className="mt-2 text-[32px] font-bold tracking-tight text-[#1F2937] md:text-[40px]"
      >
        Zooming into the Journey
      </h2>
      <p className="mt-5 max-w-[720px] text-base leading-relaxed text-[#666666] md:text-lg">
        To understand why plans fall apart, we mapped an ambitious professional's day across 10
        touchpoints. The journey shows how morning optimism systematically erodes through decision
        fatigue, context switching, and guilt.
      </p>

      {/* Editorial Table (No large outer card. Clean border rules with pale purple header) */}
      <div className="mt-16 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E8E8E8] bg-[#F3F0FF] text-[11px] font-semibold uppercase tracking-wider text-[#151515]">
              <th className="py-3 px-4 w-40">Stage & Emotion</th>
              <th className="py-3 px-4">Activity</th>
              <th className="py-3 px-4">Obstacle</th>
              <th className="py-3 px-4">Opportunity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8E8] text-xs">
            {STAGES.map((s) => (
              <tr key={s.id} className="transition-colors hover:bg-[#FAFAFA]">
                <td className="py-4 px-4 align-top">
                  <div className="flex items-center gap-2">
                    <span>{s.emoji}</span>
                    <span className="font-medium text-[#151515]">{s.emotion}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#8E8E8A] block mt-0.5">
                    Step {s.number}
                  </span>
                </td>
                <td className="py-4 px-4 align-top text-[#666666]">
                  <p className="font-medium text-[#151515]">{s.activityPrimary}</p>
                  <p className="mt-1 text-[11px] leading-relaxed">{s.activityDetails}</p>
                </td>
                <td className="py-4 px-4 align-top text-[#666666]">
                  <p className="font-medium text-[#151515]">{s.obstacleKeyword}</p>
                  <p className="mt-1 text-[11px] leading-relaxed">{s.obstacleText}</p>
                </td>
                <td className="py-4 px-4 align-top">
                  <p className="font-medium text-[#6157E8]">{s.opportunityKeyword}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#666666]">{s.opportunityText}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Observations Underneath (No giant card) */}
      <div className="mt-16 border-t border-[#E8E8E8] pt-12">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8E8E8A]">
          Key observations from the journey
        </h3>

        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <span className="font-mono text-xs font-semibold text-[#6157E8]">01</span>
            <h4 className="mt-2 text-base font-medium text-[#151515]">
              Morning optimism vs. afternoon reality
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-[#666666]">
              The day begins motivated, but clarity erodes as unexpected tasks, pings, and meetings
              fracture attention.
            </p>
          </div>
          <div>
            <span className="font-mono text-xs font-semibold text-[#6157E8]">02</span>
            <h4 className="mt-2 text-base font-medium text-[#151515]">
              The illusion of busyness
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-[#666666]">
              Users stay exhausted and active all day, yet finish feeling that the work that mattered
              most was never touched.
            </p>
          </div>
          <div>
            <span className="font-mono text-xs font-semibold text-[#6157E8]">03</span>
            <h4 className="mt-2 text-base font-medium text-[#151515]">
              The execution bottleneck
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-[#666666]">
              The problem is rarely lack of discipline. It is the friction of repeatedly deciding what
              matters, where to begin, and how to recover when plans break.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
