import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { PageContainer } from "./layout/PageContainer";

const stats = [
  { value: "44", label: "Product capabilities" },
  { value: "6", label: "Unified modules" },
  { value: "20+", label: "Database models" },
  { value: "<2min", label: "Setup time" },
];

export function TrustStrip() {
  const { ref, inView } = useInView();

  return (
    <section className="section-padding border-y border-border bg-bg-secondary/30">
      <PageContainer>
        <p className="text-center text-sm text-text-muted mb-10 md:mb-12">
          Designed for professionals who need to move from information to action.
        </p>

        <div
          ref={ref}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-[800px] mx-auto"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-text-muted">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}