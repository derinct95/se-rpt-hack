import { AlertTriangle, Award, TrendingUp, Users } from "lucide-react";
import StatTile from "../common/StatTile";
import type { DashboardSummary, ProviderSummary } from "../../types";

interface KpiRowProps {
  summary: DashboardSummary;
  providers: ProviderSummary[];
}

export default function KpiRow({ summary, providers }: KpiRowProps) {
  const orgAverageTrend = providers.length
    ? providers[0].scoreHistory.map((_, i) => {
        const values = providers.map((p) => p.scoreHistory[i] ?? p.performanceScore);
        return values.reduce((sum, v) => sum + v, 0) / values.length;
      })
    : [];

  const topPerformer = providers.find((p) => p.id === summary.topPerformerId);
  const facilityCount = new Set(providers.map((p) => p.facility)).size;

  return (
    <div data-tour="kpi-row" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatTile
        label="Total Providers"
        value={summary.totalProviders.toString()}
        icon={Users}
        accent="#2a78d6"
        subtext={`Across ${facilityCount} facilities`}
      />
      <StatTile
        label="Average Performance Score"
        value={summary.averageScore.toFixed(1)}
        icon={TrendingUp}
        accent="#1baf7a"
        sparkline={orgAverageTrend}
      />
      <StatTile
        label="Critical / High Risk"
        value={summary.criticalHighRiskCount.toString()}
        icon={AlertTriangle}
        accent="#d03b3b"
        subtext={`${summary.flaggedCount} awaiting review`}
      />
      <StatTile
        label="Top Performer"
        value={summary.topPerformerScore.toFixed(1)}
        icon={Award}
        accent="#eda100"
        subtext={summary.topPerformerName}
        sparkline={topPerformer?.scoreHistory}
      />
    </div>
  );
}
