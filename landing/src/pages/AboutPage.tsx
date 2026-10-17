import { GridExpandSection } from "../components/about/GridExpandSection";
import { PageContainer } from "../components/layout/PageContainer";
import { CheckCircle2, Shield, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="about-page bg-bg-canvas text-text-primary min-h-screen">
      {/* Intro section before the pinned grid expand */}
      <section className="about-intro py-28 border-b border-border">
        <PageContainer>
          <div className="max-w-3xl">
            <span className="text-xs font-semibold tracking-wider uppercase text-accent mb-4 block">
              About Life OS
            </span>
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
              Designed for the way days actually unfold.
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary leading-relaxed">
              We built Life OS to solve the daily fragmentation problem: bridging the gap between making a plan, handling interruptions, and finishing the day with calm confidence.
            </p>
          </div>
        </PageContainer>
      </section>

      {/* ── THE GSAP SCROLL-DRIVEN GRID EXPAND ANIMATION ── */}
      <GridExpandSection />

      {/* Subsequent section to demonstrate clean unpinning and pinSpacing */}
      <section className="about-values py-32 border-t border-border bg-bg-primary">
        <PageContainer>
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-semibold tracking-wider uppercase text-text-muted mb-3 block">
              Core Principles
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Restraint over feature bloat.
            </h2>
            <p className="text-base sm:text-lg text-text-secondary">
              Most productivity apps try to do everything and end up overwhelming your mornings. We prioritize high-craft defaults and calm workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-border bg-bg-elevated/40">
              <Zap className="text-accent mb-4" size={24} />
              <h3 className="text-lg font-semibold mb-2">Intentional Speed</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Sub-50ms interactions with zero spinner states so capturing ideas never breaks your train of thought.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-border bg-bg-elevated/40">
              <Shield className="text-accent mb-4" size={24} />
              <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Your thoughts, habits, and schedules are yours alone. End-to-end encrypted with local-first persistence.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-border bg-bg-elevated/40">
              <CheckCircle2 className="text-accent mb-4" size={24} />
              <h3 className="text-lg font-semibold mb-2">Daily Closure</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                End each workday with clear demarcation: knowing what got done and what automatically carries forward.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
