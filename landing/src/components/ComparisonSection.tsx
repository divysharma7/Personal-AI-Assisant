import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { PageContainer } from "./layout/PageContainer";
import { IconTile } from "./ui";

const rows = [
  {
    traditional: "5 separate apps for tasks, calendar, habits, timers, notes",
    lifeos: "One unified workspace with all modules connected",
  },
  {
    traditional: "Generic task lists with no context about your day",
    lifeos: "AI Brief that summarizes priorities based on your actual data",
  },
  {
    traditional: "Habit tracking disconnected from your schedule",
    lifeos: "Habits, tasks, and calendar visible on one dashboard",
  },
  {
    traditional: "Manual planning with no feedback loop",
    lifeos: "Morning plan → execution → evening shutdown ritual",
  },
  {
    traditional: "Focus sessions in a separate timer app",
    lifeos: "Pomodoro linked directly to tasks with session history",
  },
];

export function ComparisonSection() {
  const { ref, inView } = useInView();

  return (
    <section className="section-padding">
      <PageContainer>
        <div className="max-w-text mx-auto text-center mb-14 md:mb-20">
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
            className="type-section text-text-primary"
          >
            A different approach
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-[920px] mx-auto"
        >
          {/* Column headers */}
          <div className="hidden md:grid md:grid-cols-2 gap-4 mb-3 px-1">
            <span className="border border-border bg-bg-surface/30 rounded-lg inline-flex w-fit px-3.5 py-1.5 text-sm font-medium text-text-muted">
              Traditional approach
            </span>
            <span className="border border-accent/25 bg-accent/5 rounded-lg inline-flex w-fit px-3.5 py-1.5 text-sm font-medium text-accent">
              Life OS
            </span>
          </div>

          {/* Rows */}
          <div className="space-y-2.5">
            {rows.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4"
              >
                <div className="card bg-bg-surface/40 flex items-start gap-3 px-4 py-3.5">
                  <IconTile icon="❌" color="#ef4444" size="sm" className="mt-0.5" />
                  <span className="text-sm text-text-secondary leading-relaxed">
                    {row.traditional}
                  </span>
                </div>
                <div className="card bg-bg-surface/70 border-accent/20 flex items-start gap-3 px-4 py-3.5">
                  <IconTile icon="✅" color="#22c55e" size="sm" className="mt-0.5" />
                  <span className="text-sm text-text-primary leading-relaxed">
                    {row.lifeos}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </PageContainer>
    </section>
  );
}
