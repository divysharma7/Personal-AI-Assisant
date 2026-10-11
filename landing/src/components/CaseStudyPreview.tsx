import { ArrowUpRight, BookOpen, MoveRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PageContainer } from "./layout/PageContainer";

export function CaseStudyPreview() {
  return (
    <section className="section-padding" aria-labelledby="case-study-preview-title">
      <PageContainer>
        <div className="mx-auto grid max-w-[1120px] gap-9 overflow-hidden rounded-2xl border border-white/10 bg-[#11182a] p-7 md:grid-cols-[1.2fr_.8fr] md:items-center md:p-12">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-indigo-300"><BookOpen size={14} /> Behind the product</span>
            <h2 id="case-study-preview-title" className="mt-4 max-w-[630px] font-serif text-3xl font-medium leading-tight tracking-tight text-white md:text-4xl">A closer look at the problem Life OS is exploring.</h2>
            <p className="mt-4 max-w-[590px] text-sm leading-7 text-slate-300">See how desk research narrows from fragmented commitments to a capacity-aware planning direction—and what still needs to be tested with real people.</p>
            <div className="mt-6 flex flex-wrap gap-2 text-[10px] text-slate-300"><span className="rounded-full border border-white/15 px-3 py-1.5">Discovery</span><span className="rounded-full border border-white/15 px-3 py-1.5">Empathy</span><span className="rounded-full border border-white/15 px-3 py-1.5">Convergence</span><span className="rounded-full border border-white/15 px-3 py-1.5">Proposed experience</span></div>
            <Link to="/case-study/life-os" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-3 text-xs font-semibold text-white transition hover:bg-indigo-400">Read the research case study <ArrowUpRight size={15} /></Link>
          </div>
          <div className="relative min-h-[205px] overflow-hidden rounded-xl border border-white/10 bg-[#0a1020] p-5 md:min-h-[240px]">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
            <div className="relative flex h-full min-h-[165px] flex-col justify-between">
              <div className="flex items-center justify-between text-[8px] font-semibold uppercase tracking-[.17em] text-slate-500"><span>From research to direction</span><span>01—04</span></div>
              <div className="flex items-center gap-2">
                {["Signals", "Choices", "A realistic day"].map((item, index) => <div key={item} className={`flex min-h-[52px] flex-1 items-center justify-center border px-2 text-center text-[9px] font-medium ${index === 2 ? "border-indigo-300/40 bg-indigo-400/10 text-indigo-100" : "border-white/10 bg-white/[.03] text-slate-400"}`}>{item}</div>).flatMap((node, i) => i < 2 ? [node, <MoveRight key={`arrow-${i}`} size={13} className="shrink-0 text-slate-600" />] : [node])}
              </div>
              <p className="text-[9px] text-slate-500">Desk research complete · primary validation still ahead</p>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
