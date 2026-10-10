import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { PageContainer } from "./layout/PageContainer";
import { IconTile } from "./ui";

const steps = [
  {
    icon: "🎯",
    color: "#ef4444",
    number: "01",
    title: "Intention",
    description:
      "Start each day with a morning ritual. Pick your top outcome. Life OS builds your task list around it.",
  },
  {
    icon: "🧭",
    color: "#3b82f6",
    number: "02",
    title: "Guidance",
    description:
      "Today view shows exactly what's due. The Eisenhower Matrix sorts urgency from importance. No noise.",
  },
  {
    icon: "⚡",
    color: "#f59e0b",
    number: "03",
    title: "Execution",
    description:
      "Start a Pomodoro, check in a habit, drag a task into a time block. Every action is one click away.",
  },
  {
    icon: "📈",
    color: "#22c55e",
    number: "04",
    title: "Reflection",
    description:
      "Evening shutdown reviews what moved forward. Statistics track your patterns. The AI surfaces insights.",
  },
];

export function WorkflowSection() {
  const { ref, inView } = useInView();

  return (
    <section className="section-padding bg-bg-secondary/30" id="workflow">
      <PageContainer>
        <div className="max-w-text mx-auto text-center mb-14 md:mb-20">
          <motion.span
            ref={ref}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-xs font-medium uppercase tracking-widest text-accent mb-4"
          >
            How it works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-section-mobile md:text-section font-medium text-text-primary"
          >
            Life OS turns scattered days
            <br className="hidden md:block" /> into structured progress
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 max-w-[1040px] mx-auto relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.12 }}
              className="relative flex flex-col items-center text-center"
            >
              <IconTile
                icon={step.icon}
                color={step.color}
                size="lg"
                className="relative z-10 mb-5"
              />
              <span className="text-[10px] font-bold text-accent/60 uppercase tracking-widest mb-2">
                {step.number}
              </span>
              <h3 className="text-base font-semibold text-text-primary mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
