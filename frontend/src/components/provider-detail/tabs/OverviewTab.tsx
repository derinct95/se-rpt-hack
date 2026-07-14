import { Building2, Hash, Stethoscope } from "lucide-react";
import ScoreGauge from "../../charts/ScoreGauge";
import TrendSparkline from "../../charts/TrendSparkline";
import { RiskBadge, TrendBadge } from "../../common/Badge";
import StuckRiskBadge from "../../common/StuckRiskBadge";
import { RISK_COLORS } from "../../charts/theme";
import type { Insight, Provider } from "../../../types";

interface OverviewTabProps {
  provider: Provider;
  insights: Insight[];
}

export default function OverviewTab({ provider, insights }: OverviewTabProps) {
  const providerInsights = insights.filter((i) => i.providerId === provider.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-1 bg-surface border border-ink-primary/10 rounded-2xl p-6 flex flex-col items-center text-center gap-3">
        <ScoreGauge score={provider.performanceScore} riskLevel={provider.riskLevel} size={150} />
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <RiskBadge level={provider.riskLevel} />
          <TrendBadge trend={provider.trend} />
          <StuckRiskBadge quarters={provider.stuckAtRiskQuarters} />
        </div>
        <div className="w-full pt-3 border-t border-line-grid space-y-2 text-left">
          <div className="flex items-center gap-2 text-sm text-ink-secondary">
            <Stethoscope className="w-4 h-4 text-ink-muted" /> {provider.specialty}
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-secondary">
            <Building2 className="w-4 h-4 text-ink-muted" /> {provider.facility}
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-secondary">
            <Hash className="w-4 h-4 text-ink-muted" /> NPI {provider.npi}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-5">
        <div className="bg-surface border border-ink-primary/10 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-ink-primary mb-1">12-Month Score Trend</h3>
          <p className="text-xs text-ink-muted mb-3">
            Performance score history, colored by current risk level.
          </p>
          <TrendSparkline data={provider.scoreHistory} color={RISK_COLORS[provider.riskLevel]} height={120} />
        </div>

        <div className="bg-surface border border-ink-primary/10 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-ink-primary mb-3">Provider-Specific AI Insights</h3>
          {providerInsights.length === 0 ? (
            <p className="text-sm text-ink-muted">No specific AI insights flagged for this provider right now.</p>
          ) : (
            <div className="space-y-3">
              {providerInsights.map((insight) => (
                <div key={insight.id} className="rounded-xl border border-line-grid p-3">
                  <p className="text-sm font-medium text-ink-primary">{insight.title}</p>
                  <p className="text-xs text-ink-secondary mt-1">{insight.narrative}</p>
                  <p className="text-xs text-chart-1 mt-2">→ {insight.recommendedAction}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {provider.flagged && provider.flagReason && (
          <div className="rounded-2xl border border-risk-high/30 bg-risk-high/5 p-4">
            <h3 className="text-sm font-semibold text-risk-high mb-1">Flagged for Review</h3>
            <p className="text-sm text-ink-secondary">{provider.flagReason}</p>
          </div>
        )}
      </div>
    </div>
  );
}
