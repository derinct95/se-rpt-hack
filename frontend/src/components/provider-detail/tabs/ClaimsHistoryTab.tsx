import type { ClaimsHistoryPoint } from "../../../types";
import Value from "../../common/Value";
import ClaimsTable from "./ClaimsTable";

interface ClaimsHistoryTabProps {
  providerId: string;
  history: ClaimsHistoryPoint[];
}

export default function ClaimsHistoryTab({ providerId, history }: ClaimsHistoryTabProps) {
  const totalSubmitted = history.reduce((sum, h) => sum + h.claimsSubmitted, 0);
  const totalRevenue = history.reduce((sum, h) => sum + h.revenueCollected, 0);
  const avgMonthlyVolume = history.length > 0 ? Math.round(totalSubmitted / history.length) : null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-ink-primary/10 rounded-xl p-4">
          <p className="text-xs text-ink-muted mb-1">Claims submitted (12mo)</p>
          <p className="text-xl font-semibold"><Value value={history.length ? totalSubmitted : null} type="number" /></p>
        </div>
        <div className="bg-surface border border-ink-primary/10 rounded-xl p-4">
          <p className="text-xs text-ink-muted mb-1">Revenue collected (12mo)</p>
          <p className="text-xl font-semibold"><Value value={history.length ? totalRevenue : null} type="currency" /></p>
        </div>
        <div className="bg-surface border border-ink-primary/10 rounded-xl p-4">
          <p className="text-xs text-ink-muted mb-1">Avg monthly volume</p>
          <p className="text-xl font-semibold"><Value value={avgMonthlyVolume} type="number" /></p>
        </div>
      </div>

      <ClaimsTable providerId={providerId} />
    </div>
  );
}
