import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { ArrowRight } from "lucide-react";
import { PixelScene } from "./scene";
import { PixelFlag } from "./pixel/PixelArtAssets";
import { PageContainer } from "./layout/PageContainer";

export function FinalCTA() {
  const { ref, inView } = useInView();

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
          <span className="inline-block type-eyebrow text-accent mb-3">
            Ready to begin?
          </span>

          <h2 className="type-section text-text-primary mb-5">
            Stop managing apps.
            <br />
            <PixelFlag className="mr-2" />
            Start running your day.
          </h2>

          <p className="type-body text-text-secondary mb-10 max-w-[480px] mx-auto leading-relaxed">
            Life OS is free to start. No credit card, no setup wizard, no 30-minute
            onboarding video. Sign up and you're in.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="https://laif-iota.vercel.app/signup" className="button-primary">
              Get started free
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a href="https://laif-iota.vercel.app/login" className="button-secondary">
              Log in
            </a>
          </div>
        </motion.div>
      </PageContainer>
    </section>
  );
}