import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { ArrowRight } from "lucide-react";
import { PixelScene, PixelSprite, flag } from "./scene";
import { PageContainer } from "./layout/PageContainer";

export function FinalCTA() {
  const { ref, inView } = useInView();

  return (
    <section className="section-padding relative overflow-hidden" id="cta">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary" />
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

      <PixelScene />

      <PageContainer className="relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-text mx-auto text-center"
        >
          <span className="inline-block text-xs font-medium uppercase tracking-widest text-accent mb-4">
            Ready to begin?
          </span>

          <h2 className="text-section-mobile md:text-section font-medium text-text-primary mb-5">
            Stop managing apps.
            <br />
            <PixelSprite
              art={flag}
              pixel={5}
              className="inline-block align-middle mr-3"
            />
            Start running your day.
          </h2>

          <p className="text-sm text-text-secondary mb-10 max-w-[480px] mx-auto leading-relaxed">
            Life OS is free to start. No credit card, no setup wizard, no 30-minute
            onboarding video. Sign up and you're in.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://laif-iota.vercel.app/signup"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-medium px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-accent/20 text-sm"
            >
              Get Started Free
              <ArrowRight size={16} />
            </a>
            <a
              href="https://laif-iota.vercel.app/login"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary font-medium px-6 py-4 rounded-xl border border-border hover:border-border-hover transition-all text-sm"
            >
              Log in
            </a>
          </div>
        </motion.div>
      </PageContainer>
    </section>
  );
}