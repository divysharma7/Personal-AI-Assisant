// src/case-study/shell/LifeOsEditorialHero.tsx
//
// Editorial Hero for Life OS Case Study.
// Pure white canvas, calm typography, generous whitespace,
// and the "A day that slowly goes off-plan" vertical timeline narrative.

export function LifeOsEditorialHero() {
  const timelineEvents = [
    { time: "8:30", event: "Plan the day", isAccent: false },
    { time: "9:15", event: "Start important work", isAccent: false },
    { time: "9:42", event: "Slack message", isAccent: false },
    { time: "10:00", event: "Unexpected meeting", isAccent: false },
    { time: "11:30", event: "Urgent request", isAccent: false },
    { time: "2:15", event: "Important task moves again", isAccent: false },
    {
      time: "6:20",
      event: "Busy all day. Still didn't do what mattered most.",
      isAccent: true,
    },
  ];

  return (
    <section className="bg-white pt-16 pb-20 md:pt-24 md:pb-32">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14">
        {/* Eyebrow in sentence case */}
        <p className="text-sm font-medium text-[#8E8E8A]">
          Product Design Case Study
        </p>

        {/* Main Headline */}
        <h1 className="mt-6 max-w-[820px] text-[clamp(2.4rem,5.2vw,4.5rem)] font-normal leading-[1.08] tracking-[-0.03em] text-[#151515]">
          The problem isn't knowing what to do.
          <br />
          <span className="text-[#666666]">It's actually doing it.</span>
        </h1>

        {/* Supporting Copy in a narrow readable column */}
        <div className="mt-8 max-w-[650px] space-y-4 text-base leading-relaxed text-[#666666] md:mt-10 md:text-lg">
          <p className="font-medium text-[#151515]">
            We make plans. We write lists. We know what matters.
          </p>
          <p>
            But important work still gets postponed when priorities compete, tasks
            feel too big, and the day doesn't go as planned.
          </p>
          <p>
            Life OS explores how to make the next meaningful action easier to see
            and easier to start.
          </p>
        </div>

        {/* The Narrative Visual: A day that slowly goes off-plan (No cards) */}
        <div className="mt-20 border-t border-[#E8E8E8] pt-16 md:mt-28 md:pt-20">
          <div className="max-w-[580px]">
            <h2 className="text-sm font-medium text-[#666666]">
              A day that slowly goes off-plan
            </h2>

            {/* Vertical timeline */}
            <div className="relative mt-8 ml-3 space-y-6 border-l border-[#E8E8E8] pl-6 md:pl-8">
              {timelineEvents.map((item, idx) => (
                <div key={idx} className="relative flex items-baseline gap-4">
                  {/* Accent dot on vertical line */}
                  <span
                    className={`absolute -left-[31px] md:-left-[39px] top-1.5 h-2 w-2 rounded-full ${
                      item.isAccent
                        ? "bg-[#6157E8] ring-4 ring-[#F3F0FF]"
                        : "bg-[#E8E8E8]"
                    }`}
                  />
                  <span className="text-xs font-medium text-[#8E8E8A] w-12 shrink-0">
                    {item.time}
                  </span>
                  <span
                    className={`text-sm md:text-base ${
                      item.isAccent
                        ? "font-medium text-[#151515]"
                        : "text-[#666666]"
                    }`}
                  >
                    {item.event}
                  </span>
                </div>
              ))}
            </div>

            {/* Closing narrative takeaway underneath */}
            <div className="mt-10 pt-6 border-t border-[#E8E8E8]/70">
              <p className="text-sm font-medium leading-relaxed text-[#151515]">
                The task was never forgotten.
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[#666666]">
                The difficulty was everything that happened before it could be started.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
