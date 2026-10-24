import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { ArrowRight, Sparkles } from "lucide-react";
import { PixelScene } from "./scene";
import { PixelFlag } from "./pixel/PixelArtAssets";
import { PageContainer } from "./layout/PageContainer";
import { useWaitlistModal } from "../context/WaitlistContext";

export function FinalCTA() {
  const { inView, ref } = useInView();
  const { openWaitlist } = useWaitlistModal();

  return (
    <section className="section-padding relative overflow-hidden" id="cta">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary" />
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />

      <PixelScene />

      <PageContainer className="relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-text mx-auto text-center"
        >
          <span className="inline-flex items-center gap-1.5 type-eyebrow text-accent mb-3">
            <Sparkles size={13} />
            Early Access Cohort
          </span>

          <h2 className="type-section text-text-primary mb-5">
            Stop managing apps.
            <br />
            <PixelFlag className="mr-2" />
            Start running your day.
          </h2>

          <p className="type-body text-text-secondary mb-10 max-w-[480px] mx-auto leading-relaxed">
            We are rolling out early access in limited weekly batches. Reserve your spot today to secure priority access.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={openWaitlist}
              className="button-primary"
            >
              Join the Waitlist
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      </PageContainer>
    </section>
  );
}