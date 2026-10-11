// src/case-study/shell/EvidenceTag.tsx

const KINDS = {
  E: "verified evidence",
  P: "public signal",
  S: "synthetic",
  H: "hypothesis",
  C: "constructed example",
} as const;

export type EvidenceKind = keyof typeof KINDS;

export interface EvidenceTagProps {
  kind: EvidenceKind;
}

export function EvidenceTag({ kind }: EvidenceTagProps) {
  return (
    <span
      title={KINDS[kind]}
      className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] font-medium tracking-wide text-text-secondary"
    >
      [{kind}] <span className="sr-only">{KINDS[kind]}</span>
    </span>
  );
}
