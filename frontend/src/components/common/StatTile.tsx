import type { LucideIcon } from "lucide-react";
import TrendSparkline from "../charts/TrendSparkline";

interface StatTileProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: string;
  sparkline?: number[];
  subtext?: string;
}

export default function StatTile({ label, value, icon: Icon, accent = "#2a78d6", sparkline, subtext }: StatTileProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 border border-ink-primary/10 shadow-sm hover:shadow-md transition-shadow"
      style={{ background: `linear-gradient(150deg, ${accent}14 0%, #fcfcfb 55%)` }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}55)` }}
      />
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-secondary font-medium">{label}</span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
        >
          <Icon className="w-4.5 h-4.5 text-white" />
        </div>
      </div>
      <div className="tabular-nums text-3xl font-bold text-ink-primary">{value}</div>
      {subtext && <p className="text-xs text-ink-muted -mt-2">{subtext}</p>}
      {sparkline && sparkline.length > 1 && <TrendSparkline data={sparkline} color={accent} />}
    </div>
  );
}
