import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { useCases } from "../data/useCases";
import { PageContainer } from "./layout/PageContainer";
import { IconTile } from "./ui";

export function UseCaseSection() {
  const { ref, inView } = useInView();

  return (
    <section className="section-padding bg-bg-secondary/30" id="use-cases">
      <PageContainer>
        {/* Section Header */}
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
            className="type-section text-text-primary mb-3"
          >
            Built for how you actually work
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-text-secondary text-base max-w-[520px] mx-auto leading-relaxed"
          >
            Different roles, same core tension: turning fragmented commitments into a realistic, calm day.
          </motion.p>
        </div>

        {/* 2x2 Grid of Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7 max-w-[1040px] mx-auto">
          {useCases.map((uc, i) => (
            <motion.div
              key={uc.audience}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
              className="card p-7 md:p-8 flex flex-col justify-between rounded-2xl border border-border/40 bg-bg-surface/50 backdrop-blur-sm transition-all duration-300 hover:border-border/70 hover:bg-bg-surface/70 group"
            >
              {/* Header: 3D Icon + Audience Title */}
              <div className="flex items-center gap-3.5 mb-5">
                <IconTile
                  icon={uc.icon}
                  color={uc.color}
                  size="lg"
                  className="rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.25)] border border-white/5 transition-transform duration-300 group-hover:scale-110"
                />
                <div>
                  <span
                    className="text-sm font-semibold tracking-normal block"
                    style={{ color: uc.color }}
                  >
                    {uc.audience}
                  </span>
                </div>
              </div>

              {/* Challenge / Tension */}
              <h3 className="text-base md:text-[17px] font-medium text-text-primary leading-snug mb-3.5">
                {uc.challenge}
              </h3>

              {/* Solution / Architecture */}
              <p className="text-sm text-text-secondary/85 leading-relaxed mb-6 flex-1">
                {uc.solution}
              </p>

              {/* Outcome Quote */}
              <div className="pt-4 border-t border-border/30 flex items-start gap-2.5">
                <span
                  className="text-base font-serif leading-none mt-0.5 select-none shrink-0"
                  style={{ color: uc.color }}
                >
                  “
                </span>
                <p className="text-xs md:text-[13px] text-text-secondary/75 italic leading-relaxed">
                  {uc.outcome}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
