// src/case-study/shell/SourceLink.tsx

import { ArrowUpRight } from "lucide-react";

export interface SourceLinkProps {
  href: string;
  children: string;
}

export function SourceLink({ href, children }: SourceLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs text-text-secondary transition-colors hover:text-accent-light"
    >
      {children}
      <ArrowUpRight size={12} />
    </a>
  );
}
