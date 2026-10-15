import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "../case-study-light.css";

export interface CaseStudyShellProps {
  crumb?: string;
  children: ReactNode;
}

export function CaseStudyShell({ children }: CaseStudyShellProps) {
  return (
    <div className="case-study-light min-h-screen bg-[#FFFFFF] text-[#151515] selection:bg-[#6157E8]/15 selection:text-[#151515]">
      {/* 1. Low-Contrast Secondary Breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b border-[#E8E8E8] pt-8 pb-4">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 flex items-center gap-2 text-xs text-[#8E8E8A]">
          <Link
            to="/"
            className="transition-colors hover:text-[#1B1B1B]"
          >
            Home
          </Link>
          <span className="opacity-40" aria-hidden="true">
            /
          </span>
          <Link
            to="/case-study/life-os"
            className="transition-colors hover:text-[#1B1B1B]"
          >
            Case Study
          </Link>
          <span className="opacity-40" aria-hidden="true">
            /
          </span>
          <span className="text-[#1B1B1B] font-medium" aria-current="page">
            Life OS
          </span>
        </div>
      </nav>

      {/* Main Page Flow (Hero -> Insight Strip -> PhaseNav -> Sections) */}
      <div className="pb-36">
        {children}
      </div>
    </div>
  );
}
