// src/case-study/products/life-os/custom/ThreeNumbersBand.tsx
//
// 01-discovery-brief.md Ã¢â‚¬â€ "Three numbers that shaped this brief".
// Visual request: three oversized numerals on a band, each with a one-line
// caption and a small source tag. All three figures are [E] verified sources.

import type { CustomSection } from "../../../engine/types";
import { EvidenceTag } from "../../../shell/EvidenceTag";

export interface ThreeNumbersDatum {
  value: string;
  caption: string;
  source: string;
}

export interface ThreeNumbersBandData {
  numbers: ThreeNumbersDatum[];
}

export function ThreeNumbersBand({ data }: { data: unknown; section: CustomSection }) {
  const { numbers } = data as ThreeNumbersBandData;
  return (
    <div className="mx-auto max-w-[1200px] px-6 md:px-10 ">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
        {numbers.map((number) => (
          <div key={number.value} className="bg-bg-surface p-8 md:p-10">
            <strong className="block text-[clamp(2.75rem,6vw,4.5rem)] font-semibold leading-none tracking-tight text-text-primary">
              {number.value}
            </strong>
            <p className="mt-4 text-base leading-relaxed text-text-secondary">
              {number.caption}
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-text-muted">
              <EvidenceTag kind="E" />
              {number.source}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
