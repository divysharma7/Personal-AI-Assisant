import { ArrowRight } from "lucide-react";
import { PageContainer } from "./layout/PageContainer";

export function AnnouncementBar() {
  return (
    <div className="bg-bg-secondary border-b border-border">
      <PageContainer className="flex items-center justify-center gap-2 py-2.5 text-sm text-text-secondary">
        <span className="hidden sm:inline">New</span>
        <span className="font-medium text-text-primary">
          AI-powered daily brief now available
        </span>
        <span className="text-text-muted">—</span>
        <a
          href="#product"
          className="inline-flex items-center gap-1 text-accent transition-colors hover:text-accent-hover"
        >
          See what's new
          <ArrowRight size={14} />
        </a>
      </PageContainer>
    </div>
  );
}