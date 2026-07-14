import { RISK_COLORS, RISK_LABELS } from "../charts/theme";
import type { RiskLevel } from "../../types";

export function RiskBadge({ level }: { level: RiskLevel }) {
  const color = RISK_COLORS[level];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {RISK_LABELS[level]}
    </span>
  );
}

export function TrendBadge({ trend }: { trend: "up" | "down" | "flat" }) {
  const config = {
    up: { symbol: "▲", label: "Improving", color: "#0ca30c" },
    down: { symbol: "▼", label: "Declining", color: "#d03b3b" },
    flat: { symbol: "▬", label: "Stable", color: "#898781" },
  }[trend];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${config.color}1a`, color: config.color }}
      title={`Score trend: ${config.label.toLowerCase()} over the recent period, separate from the current risk level`}
    >
      {config.symbol} {config.label}
    </span>
  );
}
