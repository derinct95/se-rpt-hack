import { AlertTriangle, BadgeCheck, CheckCircle2, Circle, CircleDot, Clock, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../api/client";
import type { ClaimDetail, MetricSnapshot } from "../../../types";
import ClaimBreakdownChart from "../../charts/ClaimBreakdownChart";
import Modal from "../../common/Modal";
import Value from "../../common/Value";
import MetricTrendChart from "../MetricTrendChart";

interface ClaimDetailModalProps {
  providerId: string;
  claimId: string | null;
  onClose: () => void;
}

const STATUS_ICON: Record<string, typeof Circle> = {
  submitted: Circle,
  paid: CheckCircle2,
  denied: AlertTriangle,
  resubmitted: RotateCcw,
  pending: CircleDot,
};

export default function ClaimDetailModal({ providerId, claimId, onClose }: ClaimDetailModalProps) {
  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [cleanClaimHistory, setCleanClaimHistory] = useState<MetricSnapshot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!claimId) {
      setClaim(null);
      return;
    }
    setLoading(true);
    Promise.all([
      api.getClaimDetail(providerId, claimId),
      api.getProviderMetricHistory(providerId, "quarter"),
    ])
      .then(([detail, history]) => {
        setClaim(detail);
        setCleanClaimHistory(history);
      })
      .finally(() => setLoading(false));
  }, [providerId, claimId]);

  return (
    <Modal open={!!claimId} onClose={onClose} title={claim ? `Claim ${claim.id}` : "Claim detail"} widthClassName="max-w-xl">
      {loading && <p className="text-sm text-ink-muted">Loading...</p>}
      {claim && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {claim.isCleanClaim && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-risk-low/10 text-risk-low text-xs font-medium">
                <BadgeCheck className="w-3.5 h-3.5" /> Clean Claim
              </span>
            )}
            {claim.daysToResolution !== null && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-plane text-ink-secondary text-xs font-medium">
                <Clock className="w-3.5 h-3.5" /> {claim.daysToResolution} day{claim.daysToResolution === 1 ? "" : "s"} to resolve
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-ink-muted">Date of Service</p>
              <Value value={claim.claimDate} />
            </div>
            <div>
              <p className="text-xs text-ink-muted">Payer</p>
              <Value value={claim.payer} />
            </div>
            <div>
              <p className="text-xs text-ink-muted">Procedure</p>
              <Value value={claim.procedureCode ? `${claim.procedureCode} — ${claim.procedureDescription}` : null} />
            </div>
            <div>
              <p className="text-xs text-ink-muted">Status</p>
              <Value value={claim.status} className="capitalize" />
            </div>
            <div>
              <p className="text-xs text-ink-muted">Quarter</p>
              <Value value={claim.quarter} />
            </div>
          </div>

          <div className="rounded-lg border border-line-grid p-3">
            <p className="text-xs font-medium text-ink-secondary mb-2">Payment Breakdown</p>
            <ClaimBreakdownChart amountBilled={claim.amountBilled ?? 0} amountPaid={claim.amountPaid ?? 0} />
          </div>

          {cleanClaimHistory.length > 0 && (
            <div className="rounded-lg border border-line-grid p-3">
              <p className="text-xs font-medium text-ink-secondary mb-1">Provider's Clean Claim Rate Trend</p>
              <p className="text-xs text-ink-muted mb-2">
                {claim.isCleanClaim ? "This claim was clean." : "This claim was not clean."} Context: how the
                provider's overall clean claim rate has trended vs. peer average.
              </p>
              <MetricTrendChart points={cleanClaimHistory} metricKey="cleanClaimRate" />
            </div>
          )}

          {claim.denialReason && (
            <div className="rounded-lg border border-line-grid p-3">
              <p className="text-xs text-ink-muted mb-1">Denial Reason</p>
              <p className="text-sm text-ink-primary">{claim.denialReason}</p>
              {claim.isRecurringDenial && (
                <p className="text-xs text-risk-high mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> This denial reason has recurred across multiple quarters for this provider.
                </p>
              )}
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-ink-secondary mb-2">Status Timeline</p>
            <div className="space-y-2">
              {claim.statusHistory.map((event, i) => {
                const Icon = STATUS_ICON[event.status] ?? Circle;
                return (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Icon className="w-4 h-4 mt-0.5 text-chart-1 shrink-0" />
                    <div>
                      <span className="capitalize font-medium text-ink-primary">{event.status}</span>
                      <span className="text-ink-muted"> — <Value value={event.eventDate} /></span>
                      {event.note && <p className="text-xs text-ink-muted">{event.note}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {claim.relatedActionIds.length > 0 && (
            <p className="text-xs text-ink-muted">
              {claim.relatedActionIds.length} related action(s) — see the Actions tab.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
