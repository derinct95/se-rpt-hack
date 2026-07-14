import { Info } from "lucide-react";
import { useState } from "react";

const FULL_DISCLAIMER =
  "All provider names, claims, and metrics in Clearview Medical Group are synthetically generated for demonstration purposes. No real patient or provider health information (PHI) is used anywhere in this application.";

interface SyntheticDataBadgeProps {
  variant?: "banner" | "compact";
}

export default function SyntheticDataBadge({ variant = "compact" }: SyntheticDataBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  if (variant === "banner") {
    return (
      <div className="rounded-xl border border-line-grid bg-plane px-4 py-3 text-xs text-ink-secondary flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-ink-muted" />
        <span>
          <strong className="text-ink-primary">Synthetic Data Only — No Real PHI.</strong> {FULL_DISCLAIMER}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      title={FULL_DISCLAIMER}
      className="relative inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-ink-secondary bg-ink-primary/5 border border-line-grid hover:bg-ink-primary/10 transition"
    >
      <Info className="w-3 h-3" />
      Synthetic Data Only
      {expanded && (
        <span className="absolute z-50 top-full mt-2 left-0 w-64 p-3 rounded-lg bg-surface border border-line-grid shadow-lg text-left text-ink-secondary normal-case font-normal">
          {FULL_DISCLAIMER}
        </span>
      )}
    </button>
  );
}
