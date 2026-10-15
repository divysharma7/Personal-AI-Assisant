import { Navigate, useParams } from "react-router-dom";
import { CaseStudyShell } from "../case-study/shell/CaseStudyShell";
import { ExecutionGapOverview } from "../case-study/products/life-os/custom/ExecutionGapOverview";
import { ExecutionParadox } from "../case-study/products/life-os/custom/ExecutionParadox";
import { ProcessTimeline } from "../case-study/products/life-os/custom/ProcessTimeline";
import { LifeOsEditorialHero } from "../case-study/shell/LifeOsEditorialHero";
import { PhaseNav } from "../case-study/shell/PhaseNav";
import { LifeOsPhaseContent } from "../case-study/products/life-os/LifeOsPhaseContent";
import { empathizeSections } from "../case-study/products/life-os/empathize";

export default function LifeOsCaseStudyPage() {
  const { phase } = useParams<{ phase?: string }>();

  // If a user navigates to an old phase URL (/discover, /converge, /solution, /empathize),
  // seamlessly redirect to the unified case study URL.
  if (phase) {
    return <Navigate to="/case-study/life-os" replace />;
  }

  return (
    <CaseStudyShell>
      {/* 1. Overview: The Domino Effect & Opportunities */}
      <ExecutionGapOverview />

      {/* 2. The Execution Paradox: Taped Inquiry Card & 3 Research Statistics */}
      <ExecutionParadox />

      {/* 3. The Process: 5-Stage Methodology Timeline */}
      <ProcessTimeline />

      {/* 4. Main Hero & Behavioral Narrative Timeline */}
      <LifeOsEditorialHero />

      {/* 5. Section Navigation (Sticky below hero) */}
      <PhaseNav />

      {/* 6. Empirical Case Study Content */}
      <LifeOsPhaseContent sections={empathizeSections} />
    </CaseStudyShell>
  );
}

/*
// ==============================================================================
// ARCHIVED LEGACY 4-PHASE CASE STUDY COMPONENTS
// ==============================================================================
// Kept for historical reference. The old 4-phase architecture (Discover, Converge,
// Solution) was replaced by the 12-section empirical research flow.

import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { SectionBlock } from "../case-study/shell/SectionBlock";
import { PageContainer } from "../components/layout/PageContainer";
import { ExecutionParadox } from "../case-study/products/life-os/custom/ExecutionParadox";
import { ExecutionGapOverview } from "../case-study/products/life-os/custom/ExecutionGapOverview";
import { ProcessTimeline } from "../case-study/products/life-os/custom/ProcessTimeline";
import { InformationArchitectureMap } from "../case-study/products/life-os/custom/InformationArchitectureMap";
import { discoverHero, discoverSections } from "../case-study/products/life-os/discover";
import { convergeHero, convergeSections } from "../case-study/products/life-os/converge";

const archivedPhases = [
  { slug: "discover", number: "01", label: "Discover", title: "Phase 1: Discover" },
  { slug: "empathize", number: "02", label: "Empathize", title: "Phase 2: Empathize" },
  { slug: "converge", number: "03", label: "Converge", title: "Phase 3: Converge" },
  { slug: "solution", number: "04", label: "Solution", title: "Phase 4: Solution" },
] as const;

function ArchivedOverviewView() {
  return (
    <>
      <header className="border-b border-border pb-14 pt-16 md:pb-20 md:pt-24">
        <PageContainer>
          <p className="mb-5 text-xs font-medium uppercase tracking-widest text-accent">
            A research-led product case study
          </p>
          <h1 className="gradient-text max-w-4xl text-hero-mobile font-medium leading-tight md:text-hero">
            Life OS: Your Daily Operating System
          </h1>
          <p className="mt-6 max-w-text text-lg text-text-secondary">
            Research → Empathy → Convergence → Solution. Four phases of product thinking
            applied to one question: how might self-managing knowledge workers in India
            turn scattered work and personal commitments into a realistic, adaptable day?
          </p>
        </PageContainer>
      </header>
      <div className="pt-12 md:pt-16"><ExecutionParadox /></div>
      <div className="py-12 md:py-16"><ExecutionGapOverview /></div>
      <div className="pb-12 md:pb-16"><ProcessTimeline /></div>
      <div className="pb-12 md:pb-16"><InformationArchitectureMap /></div>
    </>
  );
}
*/
