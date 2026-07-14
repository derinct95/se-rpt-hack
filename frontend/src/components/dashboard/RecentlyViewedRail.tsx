import { History } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { RISK_COLORS } from "../charts/theme";
import { useRecentlyViewed } from "../../utils/recentlyViewed";
import type { PracticeType } from "../../types";

interface RecentlyViewedRailProps {
  practiceType: PracticeType;
}

export default function RecentlyViewedRail({ practiceType }: RecentlyViewedRailProps) {
  const entries = useRecentlyViewed(practiceType);
  const navigate = useNavigate();
  const location = useLocation();

  if (entries.length === 0) return null;

  return (
    <section className="bg-surface border border-ink-primary/10 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-ink-muted" />
        <h2 className="text-sm font-semibold text-ink-primary">Recently Viewed</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {entries.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => navigate(`/providers/${e.id}`, { state: { backgroundLocation: location } })}
            className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-xl border border-line-axis hover:border-chart-1/40 hover:bg-plane/60 transition text-left"
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: RISK_COLORS[e.riskLevel] }} />
            <span className="text-sm font-medium text-ink-primary whitespace-nowrap">{e.name}</span>
            <span className="text-xs text-ink-muted whitespace-nowrap">{e.specialty}</span>
            <span className="text-xs font-semibold text-ink-secondary tabular-nums shrink-0">{e.performanceScore.toFixed(1)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
