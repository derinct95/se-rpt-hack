import { AlertTriangle, Trophy } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import type { ProviderSummary } from "../../types";
import { RiskBadge } from "../common/Badge";
import TrendSparkline from "../charts/TrendSparkline";
import { RISK_COLORS } from "../charts/theme";

interface PerformerLeaderboardProps {
  providers: ProviderSummary[];
  count?: number;
}

function Rail({
  title,
  icon: Icon,
  accent,
  rows,
  onOpen,
}: {
  title: string;
  icon: typeof Trophy;
  accent: string;
  rows: ProviderSummary[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="bg-surface border border-ink-primary/10 rounded-2xl p-4 flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${accent}1a`, color: accent }}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold text-ink-primary">{title}</h3>
      </div>
      <div className="space-y-1">
        {rows.map((p, i) => (
          <button
            key={p.id}
            onClick={() => onOpen(p.id)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-plane/60 transition text-left"
          >
            <span className="text-xs font-semibold text-ink-muted w-4 shrink-0 tabular-nums">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink-primary truncate">{p.name}</p>
              <p className="text-xs text-ink-muted truncate">{p.specialty}</p>
            </div>
            <div className="w-14 shrink-0 hidden sm:block">
              <TrendSparkline data={p.scoreHistory} color={RISK_COLORS[p.riskLevel]} height={18} />
            </div>
            <span className="text-sm font-semibold tabular-nums shrink-0" style={{ color: accent }}>
              {p.performanceScore.toFixed(1)}
            </span>
            <div className="shrink-0 hidden md:block">
              <RiskBadge level={p.riskLevel} />
            </div>
          </button>
        ))}
        {rows.length === 0 && <p className="text-xs text-ink-muted px-2 py-2">No providers to show.</p>}
      </div>
    </div>
  );
}

export default function PerformerLeaderboard({ providers, count = 5 }: PerformerLeaderboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const sorted = [...providers].sort((a, b) => b.performanceScore - a.performanceScore);
  const top = sorted.slice(0, count);
  const bottom = sorted.slice(-count).reverse();

  function open(id: string) {
    navigate(`/providers/${id}`, { state: { backgroundLocation: location } });
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <Rail title="Top Performers" icon={Trophy} accent="#0ca30c" rows={top} onOpen={open} />
      <Rail title="Needs Attention" icon={AlertTriangle} accent="#d03b3b" rows={bottom} onOpen={open} />
    </div>
  );
}
