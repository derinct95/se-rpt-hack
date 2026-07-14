import { History } from "lucide-react";

export default function StuckRiskBadge({ quarters }: { quarters: number }) {
  if (quarters < 2) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border"
      style={{ borderColor: "#d03b3b", color: "#d03b3b" }}
      title={`Risk level has been high or critical for ${quarters} consecutive quarters`}
    >
      <History className="w-3 h-3" />
      Stuck at Risk — {quarters}Q
    </span>
  );
}
