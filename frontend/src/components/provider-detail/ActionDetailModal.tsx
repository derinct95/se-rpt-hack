import { CalendarClock, CheckCircle2, History, ListChecks, Sparkles } from "lucide-react";
import Modal from "../common/Modal";
import type { Action, Metrics, QuarterlySnapshot } from "../../types";
import MetricTrendChart from "./MetricTrendChart";

const CATEGORY_METRIC: Record<string, keyof Metrics> = {
  denials: "denialRate",
  coding: "codingAccuracy",
  collections: "daysInAR",
  documentation: "documentationAccuracy",
  compliance: "priorAuthApprovalRate",
};

const CATEGORY_LABEL: Record<string, string> = {
  denials: "Denial Rate",
  coding: "Coding Accuracy",
  collections: "Days in AR",
  documentation: "Documentation Accuracy",
  compliance: "Prior-Auth Approval",
};

const CATEGORY_STEPS: Record<string, string[]> = {
  denials: [
    "Pull the last 90 days of denied claims for this provider, grouped by denial reason.",
    "Convene a 30-minute root-cause review with billing on the top 2 reasons.",
    "Assign an owner to appeal or resubmit each denied claim within 5 business days.",
  ],
  coding: [
    "Pull a 10-15 chart audit sample with the coding team.",
    "Identify the specific codes or modifiers driving the errors.",
    "Schedule refresher training and re-audit in 30 days.",
  ],
  collections: [
    "Prioritize claims aged 60+ days for active follow-up this week.",
    "Escalate high-dollar aged claims directly to the payer rep.",
    "Set a weekly AR-aging review cadence until the metric recovers.",
  ],
  documentation: [
    "Deploy a point-of-care documentation checklist for this provider's common visit types.",
    "Review the last 5 denials tied to insufficient documentation together with the provider.",
    "Re-audit documentation completeness in 30 days.",
  ],
  compliance: [
    "Audit the intake workflow for missed prior-authorization steps.",
    "Confirm payer-specific authorization requirements are documented for front-desk staff.",
    "Track the authorization approval rate weekly until it recovers.",
  ],
};

function daysOpen(createdAt: string): number | null {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return null;
  return Math.max(0, Math.round((Date.now() - created) / 86400000));
}

interface ActionDetailModalProps {
  action: Action | null;
  quarterlyHistory: QuarterlySnapshot[];
  onClose: () => void;
  onAdvanceToReview: () => void;
  onRequestComplete: () => void;
}

export default function ActionDetailModal({
  action,
  quarterlyHistory,
  onClose,
  onAdvanceToReview,
  onRequestComplete,
}: ActionDetailModalProps) {
  if (!action) return null;
  const metricKey = CATEGORY_METRIC[action.category];
  const steps = CATEGORY_STEPS[action.category];
  const openDays = daysOpen(action.createdAt);

  return (
    <Modal open={!!action} onClose={onClose} title={action.title} widthClassName="max-w-xl">
      <div className="space-y-4">
        <p className="text-sm text-ink-secondary">{action.description}</p>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-plane text-ink-secondary capitalize">{action.category}</span>
          <span className="px-2 py-0.5 rounded-full bg-plane text-ink-secondary uppercase">{action.priority} priority</span>
          {openDays !== null && action.status !== "resolved" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-plane text-ink-secondary">
              <CalendarClock className="w-3 h-3" /> Open {openDays} day{openDays === 1 ? "" : "s"}
            </span>
          )}
          {action.source === "ai" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-5/10 text-chart-5">
              <Sparkles className="w-3 h-3" /> AI-suggested
            </span>
          )}
          {action.isRecurring && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-risk-high text-risk-high">
              <History className="w-3 h-3" /> Recurring — {action.consecutiveQuarters} consecutive quarters
            </span>
          )}
        </div>

        {steps && (
          <div className="rounded-lg border border-line-grid p-3">
            <p className="text-xs font-medium text-ink-secondary mb-2 flex items-center gap-1.5">
              <ListChecks className="w-3.5 h-3.5" /> Suggested Next Steps
            </p>
            <ol className="space-y-1.5 text-xs text-ink-secondary list-decimal list-inside">
              {steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {metricKey && quarterlyHistory.length > 0 && (
          <div>
            <p className="text-xs font-medium text-ink-secondary mb-2">
              {CATEGORY_LABEL[action.category]} — trend behind this recommendation
            </p>
            <MetricTrendChart
              points={quarterlyHistory.map((q) => ({
                period: q.quarter, label: q.quarter, performanceScore: q.performanceScore,
                riskLevel: q.riskLevel, trend: q.trend, metrics: q.metrics, peerAverageMetrics: q.peerAverageMetrics,
              }))}
              metricKey={metricKey}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-line-grid">
          {action.status === "resolved" ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-risk-low">
              <CheckCircle2 className="w-4 h-4" /> Completed
            </span>
          ) : (
            <>
              {action.status === "open" && (
                <button
                  type="button"
                  onClick={onAdvanceToReview}
                  className="text-sm px-4 py-2 rounded-lg border border-line-axis hover:bg-plane transition"
                >
                  Move to In Review
                </button>
              )}
              <button
                type="button"
                onClick={onRequestComplete}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-ink-primary text-white hover:bg-ink-primary/90 transition"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Complete
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
