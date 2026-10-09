import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { X, Check } from "lucide-react";
import { PageContainer } from "./layout/PageContainer";

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
            className="inline-block text-xs font-medium uppercase tracking-widest text-accent mb-4"
          >
            Why Life OS
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-section-mobile md:text-section font-medium text-text-primary"
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
          {/* Header */}
          <div className="hidden md:grid md:grid-cols-2 gap-4 mb-4 px-4">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
              Traditional approach
            </span>
            <span className="text-xs font-medium text-accent uppercase tracking-wide">
              Life OS
            </span>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {rows.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4"
              >
                <div className="flex items-start gap-3 bg-bg-secondary rounded-xl px-4 py-3.5 border border-border">
                  <X size={14} className="text-red-400/60 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-text-secondary leading-relaxed">
                    {row.traditional}
                  </span>
                </div>
                <div className="flex items-start gap-3 bg-bg-secondary rounded-xl px-4 py-3.5 border border-accent/10">
                  <Check size={14} className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-text-primary leading-relaxed">
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