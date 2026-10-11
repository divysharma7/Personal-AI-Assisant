// src/case-study/shell/CaseStudyShell.tsx

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageContainer } from "../../components/layout/PageContainer";
import { PhaseNav } from "./PhaseNav";

export interface CaseStudyShellProps {
  crumb: string;
  children: ReactNode;
}

export function CaseStudyShell({ crumb, children }: CaseStudyShellProps) {
  return (
    <div className="pb-24">
      <nav aria-label="Breadcrumb" className="border-b border-border">
        <PageContainer className="flex flex-wrap items-center gap-3 py-4 text-sm text-text-secondary">
          <Link to="/" className="transition-colors hover:text-text-primary">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/case-study/life-os" className="transition-colors hover:text-text-primary">
            Case study
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-text-primary" aria-current="page">
            {crumb}
          </span>
        </PageContainer>
      </nav>
      <PhaseNav />
      {children}
    </div>
  );
}
