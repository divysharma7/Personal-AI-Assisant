import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { PageContainer } from "./layout/PageContainer";
import { Check, X } from "lucide-react";

interface CriteriaItem {
  heading: string;
  body: string;
}

const chooseReasons: CriteriaItem[] = [
  {
    heading: "Your day is full before it even starts",
    body: "Work, meetings, errands, habits and personal goals all compete for the same few hours. Life OS helps you see what actually fits.",
  },
  {
    heading: "Your task list and calendar rarely agree",
    body: "You know what needs to get done, but not where it fits. Life OS connects your tasks with the time you actually have.",
  },
  {
    heading: "You want AI to help you decide, not decide for you",
    body: "AI Brief looks at your schedule, priorities and daily context so you can make a better call about what matters now.",
  },
  {
    heading: "You want a daily rhythm you can stick to",
    body: "Plan the morning. Focus during the day. Shut things down properly at night. Life OS gives your day a repeatable structure.",
  },
];

const skipReasons: CriteriaItem[] = [
  {
    heading: "You just want another task manager",
    body: "Life OS is built around deciding what happens today, not collecting an endless backlog of things you may do someday.",
  },
  {
    heading: "Your current system already works",
    body: "If your calendar, tasks, routines and priorities already stay in sync with very little effort, you probably do not need another layer.",
  },
  {
    heading: "You do not want to plan your day",
    body: "Life OS can reduce friction and help you reset when things change, but it still needs you to engage with the plan.",
  },
  {
    heading: "You want AI to run the day for you",
    body: "Life OS helps you plan, prioritise and adapt. The thinking, focus and execution are still yours.",
  },
];

export function ComparisonSection() {
  const { ref, inView } = useInView();

  return (
    <section className="section-padding relative" id="why-lifeos">
      <PageContainer>
        {/* Section Header */}
        <div className="max-w-text mx-auto text-center mb-12 md:mb-16">
          <motion.span
            ref={ref}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block type-eyebrow text-accent mb-3"
          >
            Why Life OS
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="type-section text-text-primary mb-4"
          >
            Is this for you?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-text-secondary text-base max-w-[560px] mx-auto leading-relaxed"
          >
            Life OS works best when you want more structure in your day without turning productivity into another thing to manage.
          </motion.p>
        </div>

        {/* Stacked Editorial Panels */}
        <div className="max-w-[740px] mx-auto space-y-6 md:space-y-8">
          {/* ── PANEL 1: Choose Life OS if ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-emerald-500/20 bg-bg-surface/50 p-6 sm:p-8 md:p-10"
          >
            {/* Panel Label */}
            <div className="mb-7 md:mb-8">
              <span className="text-emerald-400 font-medium text-sm md:text-[15px] tracking-normal">
                Choose Life OS if
              </span>
            </div>

            {/* Editorial Rows */}
            <div className="space-y-7 md:space-y-8">
              {chooseReasons.map((item) => (
                <div key={item.heading} className="flex items-start gap-3.5 md:gap-4">
                  {/* Restrained Check Icon */}
                  <div
                    className="w-5 h-5 rounded-full border border-emerald-500/35 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400"
                    aria-hidden="true"
                  >
                    <Check size={11} strokeWidth={2.4} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] md:text-base font-medium text-text-primary leading-snug mb-1">
                      {item.heading}
                    </h3>
                    <p className="text-sm text-text-secondary/85 leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── PANEL 2: Skip this if ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl border border-rose-500/15 bg-bg-surface/50 p-6 sm:p-8 md:p-10"
          >
            {/* Panel Label */}
            <div className="mb-7 md:mb-8">
              <span className="text-rose-400/90 font-medium text-sm md:text-[15px] tracking-normal">
                Skip this if
              </span>
            </div>

            {/* Editorial Rows */}
            <div className="space-y-7 md:space-y-8">
              {skipReasons.map((item) => (
                <div key={item.heading} className="flex items-start gap-3.5 md:gap-4">
                  {/* Restrained Cross Icon */}
                  <div
                    className="w-5 h-5 rounded-full border border-rose-500/30 flex items-center justify-center shrink-0 mt-0.5 text-rose-400/90"
                    aria-hidden="true"
                  >
                    <X size={11} strokeWidth={2.4} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] md:text-base font-medium text-text-primary leading-snug mb-1">
                      {item.heading}
                    </h3>
                    <p className="text-sm text-text-secondary/85 leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </PageContainer>
    </section>
  );
}
