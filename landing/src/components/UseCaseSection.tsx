import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { useCases } from "../data/useCases";
import { PageContainer } from "./layout/PageContainer";

export function UseCaseSection() {
  const { ref, inView } = useInView();

  return (
    <section className="section-padding bg-bg-secondary/30" id="use-cases">
      <PageContainer>
        <div className="max-w-text mx-auto text-center mb-14 md:mb-20">
          <motion.span
            ref={ref}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block type-eyebrow text-accent mb-3"
          >
            Use cases
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="type-section text-text-primary"
          >
            Built for how you actually work
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-[1040px] mx-auto">
          {useCases.map((uc, i) => (
            <motion.div
              key={uc.audience}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
              className="card p-6 md:p-8 flex flex-col"
            >
              <span className="text-sm font-medium text-accent mb-3 block">
                {uc.audience}
              </span>
              <h3 className="text-base md:text-lg font-medium text-text-primary mb-3 leading-snug">
                {uc.challenge}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6 flex-1">
                {uc.solution}
              </p>
              <p className="text-sm text-text-secondary italic border-l border-border pl-3.5">
                "{uc.outcome}"
              </p>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
