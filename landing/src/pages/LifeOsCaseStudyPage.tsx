import { Link, Navigate, useParams } from "react-router-dom";
import type { ReactNode } from "react";
import { CaseStudyShell } from "../case-study/shell/CaseStudyShell";
import { SectionBlock } from "../case-study/shell/SectionBlock";
import { PhaseHero } from "../case-study/shell/PhaseHero";
import { PageContainer } from "../components/layout/PageContainer";
import { LifeOsPhaseContent } from "../case-study/products/life-os/LifeOsPhaseContent";
import { discoverHero, discoverSections } from "../case-study/products/life-os/discover";
import { empathizeHero, empathizeSections } from "../case-study/products/life-os/empathize";
import { convergeHero, convergeSections } from "../case-study/products/life-os/converge";

const phases = [
  { slug: "discover", number: "01", label: "Discover", title: "Phase 1 — Discover" },
  { slug: "empathize", number: "02", label: "Empathize", title: "Phase 2 — Empathize" },
  { slug: "converge", number: "03", label: "Converge", title: "Phase 3 — Converge" },
  { slug: "solution", number: "04", label: "Solution", title: "Phase 4 — Solution" },
] as const;

function StatusPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs text-text-secondary">
      {children}
    </span>
  );
}

function OverviewPlaceholder() {
  return (
    <>
      <header className="border-b border-border pb-14 pt-16 md:pb-20 md:pt-24">
        <PageContainer>
          <p className="mb-5 text-xs font-medium uppercase tracking-widest text-accent">
            A research-led product case study
          </p>
          <h1 className="gradient-text max-w-4xl text-hero-mobile font-medium leading-tight md:text-hero">
            Life OS — Your Daily Operating System
          </h1>
          <p className="mt-6 max-w-text text-lg text-text-secondary">
            Research → Empathy → Convergence → Solution. Four phases of product thinking
            applied to one question: how might self-managing knowledge workers in India
            turn scattered work and personal commitments into a realistic, adaptable day?
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <StatusPill>Status: desk research + synthetic dry run</StatusPill>
            <StatusPill>No real interviews yet</StatusPill>
          </div>
        </PageContainer>
      </header>

      <SectionBlock eyebrow="The four phases" title="Where this goes" tight>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {phases.map((phase) => (
            <Link
              key={phase.slug}
              to={`/case-study/life-os/${phase.slug}`}
              className="rounded-2xl border border-border bg-bg-secondary p-6 transition-colors hover:border-border-hover md:p-8"
            >
              <span className="text-xs font-medium uppercase tracking-widest text-accent">
                {phase.number}
              </span>
              <h3 className="mt-3 text-xl font-medium text-text-primary">{phase.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Content is being rebuilt from the source research files.
              </p>
            </Link>
          ))}
        </div>
      </SectionBlock>
    </>
  );
}

function PhasePlaceholder({ title }: { title: string }) {
  return (
    <SectionBlock
      eyebrow="Under construction"
      title={title}
      lead="This phase is being rebuilt from the source research files. The shell, navigation and design system are in place."
    >
      <div className="mt-8 rounded-2xl border border-dashed border-border bg-bg-secondary p-8 text-sm text-text-secondary">
        Placeholder — content pending. Sections land in the next implementation chunk.
      </div>
    </SectionBlock>
  );
}

export default function LifeOsCaseStudyPage() {
  const { phase } = useParams<{ phase: string }>();

  if (phase === "deliver") {
    return <Navigate to="/case-study/life-os/solution" replace />;
  }

  const current = phases.find((p) => p.slug === phase);

  if (phase && !current) {
    return <Navigate to="/case-study/life-os" replace />;
  }

  return (
    <CaseStudyShell crumb={current ? current.title : "Overview"}>
      {!current && <OverviewPlaceholder />}
      {current?.slug === "discover" && (
        <>
          <PhaseHero {...discoverHero} />
          <LifeOsPhaseContent sections={discoverSections} />
        </>
      )}
      {current?.slug === "empathize" && (
        <>
          <PhaseHero {...empathizeHero} />
          <LifeOsPhaseContent sections={empathizeSections} />
        </>
      )}
      {current?.slug === "converge" && (
        <>
          <PhaseHero {...convergeHero} />
          <LifeOsPhaseContent sections={convergeSections} />
        </>
      )}
      {current && current.slug !== "discover" && current.slug !== "empathize" && current.slug !== "converge" && (
        <PhasePlaceholder title={current.title} />
      )}
    </CaseStudyShell>
  );
}
