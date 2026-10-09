import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { useCases } from "../data/useCases";
import { ArrowRight } from "lucide-react";
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
            className="inline-block text-xs font-medium uppercase tracking-widest text-accent mb-4"
          >
            Use cases
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-section-mobile md:text-section font-medium text-text-primary"
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
              className="group bg-bg-primary rounded-2xl p-6 md:p-8 border border-border hover:border-border-hover transition-colors flex flex-col"
            >
              <span className="text-xs font-medium text-accent mb-3">{uc.audience}</span>
              <h3 className="text-sm font-semibold text-text-primary mb-3">{uc.challenge}</h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-4 flex-1">{uc.solution}</p>
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-text-muted italic mb-3">"{uc.outcome}"</p>
                <span className="inline-flex items-center gap-1.5 text-xs text-accent font-medium group-hover:gap-2.5 transition-all">
                  Learn more <ArrowRight size={12} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}