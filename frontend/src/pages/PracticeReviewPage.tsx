import { AlertCircle, AlertOctagon, AlertTriangle, ArrowLeft, Download, Info, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import SegmentedControl from "../components/common/SegmentedControl";
import type { InsightSeverity, PracticeReviewReport, ReviewPeriod } from "../types";

const SEVERITY_CONFIG: Record<InsightSeverity, { color: string; icon: typeof AlertOctagon }> = {
  critical: { color: "#d03b3b", icon: AlertOctagon },
  high: { color: "#ec835a", icon: AlertTriangle },
  medium: { color: "#fab219", icon: AlertTriangle },
  info: { color: "#2a78d6", icon: Info },
};

export default function PracticeReviewPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<ReviewPeriod>("quarterly");
  const [report, setReport] = useState<PracticeReviewReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  async function generate(p: ReviewPeriod) {
    setPeriod(p);
    setLoading(true);
    setGenerateError(null);
    try {
      const result = await api.generatePracticeReview(p);
      setReport(result);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate the review. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function download(format: "pdf" | "csv") {
    setDownloading(true);
    setDownloadError(null);
    try {
      await api.downloadPracticeReviewReport(period, format);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <button type="button" onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink-primary transition">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </button>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary">AI Practice Review</h1>
          <p className="text-sm text-ink-secondary">Claude-generated key findings and priority actions for Clearview Medical Group.</p>
        </div>
        <SegmentedControl
          options={[
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
            { value: "quarterly", label: "Quarterly" },
          ]}
          value={period}
          onChange={generate}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => generate(period)}
          disabled={loading}
          className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-ink-primary text-white hover:bg-ink-primary/90 transition disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {report ? "Regenerate" : "Generate Review"}
        </button>
        {report && (
          <>
            <button
              type="button"
              onClick={() => download("pdf")}
              disabled={downloading}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-line-axis hover:bg-plane transition disabled:opacity-60"
            >
              <Download className="w-4 h-4" /> PDF
            </button>
            <button
              type="button"
              onClick={() => download("csv")}
              disabled={downloading}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-line-axis hover:bg-plane transition disabled:opacity-60"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
          </>
        )}
        {downloadError && (
          <span className="flex items-center gap-1.5 text-xs text-risk-critical">
            <AlertCircle className="w-3.5 h-3.5" /> {downloadError}
          </span>
        )}
      </div>

      {generateError && (
        <div className="flex items-center gap-2 text-sm text-risk-critical bg-risk-critical/10 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {generateError}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-plane animate-pulse" />)}
        </div>
      )}

      {!loading && report && (
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>{report.period.charAt(0).toUpperCase() + report.period.slice(1)} review — {report.periodLabel}</span>
            <span>{report.generatedBy === "ai" ? "Generated by Claude" : "Rule-based (offline mode)"}</span>
          </div>

          <section className="bg-surface border border-ink-primary/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-ink-primary mb-3">Key Findings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.keyFindings.map((f, i) => {
                const config = SEVERITY_CONFIG[f.severity];
                const Icon = config.icon;
                return (
                  <div key={i} className="rounded-xl border border-line-grid p-4">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full mb-2"
                      style={{ backgroundColor: `${config.color}1a`, color: config.color }}
                    >
                      <Icon className="w-3 h-3" /> {f.severity.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-medium text-ink-primary">{f.title}</h3>
                    <p className="text-xs text-ink-secondary mt-1">{f.narrative}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-surface border border-ink-primary/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-ink-primary mb-3">Priority Actions</h2>
            <div className="space-y-3">
              {report.priorityActions.map((a, i) => (
                <div key={i} className="rounded-xl border border-line-grid p-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink-primary">{a.title}</p>
                    <p className="text-xs text-ink-secondary mt-1">{a.description}</p>
                  </div>
                  <span className="text-xs font-medium text-ink-muted uppercase shrink-0">{a.priority}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {!loading && !report && (
        <p className="text-sm text-ink-muted">Choose a period and generate a review to see findings here.</p>
      )}
    </div>
  );
}
