import { ArrowUpRight, BookOpen, MoveRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PageContainer } from "./layout/PageContainer";

export function CaseStudyPreview() {
  return (
    <section className="section-padding" aria-labelledby="case-study-preview-title">
      <PageContainer>
        <div className="mx-auto grid max-w-[1120px] gap-9 overflow-hidden rounded-2xl border border-border bg-bg-secondary p-7 md:grid-cols-[1.2fr_.8fr] md:items-center md:p-12">
          <div>
            <span className="type-eyebrow inline-flex items-center gap-2 text-accent">
              <BookOpen size={14} aria-hidden="true" /> Behind the product
            </span>
            <h2 id="case-study-preview-title" className="mt-4 max-w-[630px] type-section text-text-primary">
              A closer look at the problem Life OS is exploring.
            </h2>
            <p className="mt-4 max-w-[590px] type-body text-text-secondary">
              See how primary qualitative research, cognitive science, and analogous problem-solving shaped Life OS from intention to action - turning daily overwhelm into a calm, realistic operating system.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs text-text-secondary">
              <span className="rounded-full border border-border bg-bg-elevated px-3 py-1">User interviews</span>
              <span className="rounded-full border border-border bg-bg-elevated px-3 py-1">Affinity synthesis</span>
              <span className="rounded-full border border-border bg-bg-elevated px-3 py-1">Journey mapping</span>
              <span className="rounded-full border border-border bg-bg-elevated px-3 py-1">Competitor benchmark</span>
              <span className="rounded-full border border-border bg-bg-elevated px-3 py-1">Core values</span>
            </div>
            <Link to="/case-study/life-os" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500">
              Read the research case study <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="relative min-h-[205px] overflow-hidden rounded-xl border border-border bg-bg-canvas p-5 md:min-h-[240px]">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
            <div className="relative flex h-full min-h-[165px] flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-medium text-text-muted">
                <span>Empirical research to direction</span>
                <span>01-12</span>
              </div>
              <div className="flex items-center gap-2">
                {["Inquiries", "Synthesis", "Calm daily system"].map((item, index) => (
                  <div key={item} className={`flex min-h-[50px] flex-1 items-center justify-center rounded-lg border px-2 text-center text-xs font-medium ${index === 2 ? "border-indigo-400/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-200" : "border-border bg-bg-surface text-text-muted"}`}>
                    {item}
                  </div>
                )).flatMap((node, i) => i < 2 ? [node, <MoveRight key={`arrow-${i}`} size={13} className="shrink-0 text-text-muted" aria-hidden="true" />] : [node])}
              </div>
              <p className="text-xs text-text-muted">Primary research verified · 12-stage empirical case study</p>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
