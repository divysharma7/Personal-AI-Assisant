import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { PageContainer } from "./layout/PageContainer";
import { IconTile } from "./ui";

const problems = [
  {
    icon: "🧩",
    color: "#ef4444",
    title: "Fragmented tools",
    description:
      "Your tasks live in one app, calendar in another, habits in a third, and focus sessions in a fourth. Every switch costs context and momentum.",
  },
  {
    icon: "🗺️",
    color: "#3b82f6",
    title: "No unified picture",
    description:
      "You can't see how your time, habits, and tasks connect. There's no single view of what matters today, what's at risk, or where your focus actually went.",
  },
  {
    icon: "🔄",
    color: "#f59e0b",
    title: "Planning without feedback",
    description:
      "You plan your day in the morning and forget the plan by noon. There's no feedback loop — no way to see if you're actually building the routines you intended.",
  },
];

export function ProblemSection() {
  const { ref, inView } = useInView();

  return (
    <section className="section-padding" id="problem">
      <PageContainer>
        <div className="max-w-text mx-auto text-center mb-14 md:mb-20">
          <motion.span
            ref={ref}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-xs font-medium uppercase tracking-widest text-accent mb-4"
          >
            The problem
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-section-mobile md:text-section font-medium text-text-primary"
          >
            Five apps. Zero clarity.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-[1040px] mx-auto">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
              className="group bg-bg-secondary rounded-2xl p-6 md:p-8 border border-border hover:border-border-hover transition-colors"
            >
              <IconTile icon={problem.icon} color={problem.color} className="mb-5" />
              <h3 className="text-base font-semibold text-text-primary mb-3">
                {problem.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
