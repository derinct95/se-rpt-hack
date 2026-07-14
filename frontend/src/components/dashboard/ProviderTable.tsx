import { ArrowDown, ArrowUp, CheckCircle2, ClipboardList, GitCompareArrows } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { ProviderSummary, RiskLevel } from "../../types";
import { RiskBadge, TrendBadge } from "../common/Badge";
import StuckRiskBadge from "../common/StuckRiskBadge";
import Value from "../common/Value";
import TrendSparkline from "../charts/TrendSparkline";
import { RISK_COLORS, RISK_LABELS } from "../charts/theme";
import { useCompare } from "../../context/CompareContext";

type SortKey = "name" | "performanceScore" | "denialRate" | "netCollectionRate";
type QualityBand = "" | "excellent" | "good" | "fair" | "poor";

const QUALITY_BANDS: { key: QualityBand; label: string; test: (score: number) => boolean }[] = [
  { key: "excellent", label: "Excellent (90+)", test: (s) => s >= 90 },
  { key: "good", label: "Good (75-89)", test: (s) => s >= 75 && s < 90 },
  { key: "fair", label: "Fair (60-74)", test: (s) => s >= 60 && s < 75 },
  { key: "poor", label: "Needs Improvement (<60)", test: (s) => s < 60 },
];

interface ProviderTableProps {
  providers: ProviderSummary[];
  onMarkReviewed: (id: string) => void;
}

export default function ProviderTable({ providers, onMarkReviewed }: ProviderTableProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedIds, toggle, isSelected, max } = useCompare();
  const [tab, setTab] = useState<"all" | "flagged">("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "">("");
  const [qualityFilter, setQualityFilter] = useState<QualityBand>("");
  const [sortKey, setSortKey] = useState<SortKey>("performanceScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const flaggedCount = providers.filter((p) => p.flagged && !p.reviewed).length;

  const specialties = useMemo(
    () => Array.from(new Set(providers.map((p) => p.specialty))).sort(),
    [providers],
  );

  const filtered = useMemo(() => {
    let list = providers;
    if (tab === "flagged") list = list.filter((p) => p.flagged && !p.reviewed);
    if (specialtyFilter) list = list.filter((p) => p.specialty === specialtyFilter);
    if (riskFilter) list = list.filter((p) => p.riskLevel === riskFilter);
    if (qualityFilter) {
      const band = QUALITY_BANDS.find((b) => b.key === qualityFilter);
      if (band) list = list.filter((p) => band.test(p.performanceScore));
    }
    const sorted = [...list].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      return (a[sortKey] - b[sortKey]) * dir;
    });
    return sorted;
  }, [providers, tab, specialtyFilter, riskFilter, qualityFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function openProvider(id: string) {
    navigate(`/providers/${id}`, { state: { backgroundLocation: location } });
  }

  function SortHeader({ label, columnKey }: { label: string; columnKey: SortKey }) {
    const active = sortKey === columnKey;
    return (
      <button
        type="button"
        onClick={() => toggleSort(columnKey)}
        className="flex items-center gap-1 text-xs font-medium text-ink-muted uppercase tracking-wide hover:text-ink-primary transition"
      >
        {label}
        {active && (sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
      </button>
    );
  }

  return (
    <section id="provider-table" data-tour="provider-table" className="bg-surface border border-ink-primary/10 rounded-2xl overflow-hidden">
      <div className="p-5 flex flex-col gap-3 border-b border-line-grid">
        <div className="flex gap-1 bg-plane rounded-lg p-1 w-fit" id="flagged">
          <button
            type="button"
            onClick={() => setTab("all")}
            className={`px-3 py-1.5 rounded-md text-sm transition ${tab === "all" ? "bg-surface shadow-sm text-ink-primary" : "text-ink-secondary"}`}
          >
            All Providers ({providers.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("flagged")}
            className={`px-3 py-1.5 rounded-md text-sm transition ${tab === "flagged" ? "bg-surface shadow-sm text-ink-primary" : "text-ink-secondary"}`}
          >
            Flagged for Review ({flaggedCount})
          </button>
        </div>
        <div data-tour="provider-filters" className="flex flex-wrap items-center gap-2">
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="text-sm border border-line-axis rounded-lg px-2.5 py-1.5 bg-surface text-ink-secondary"
          >
            <option value="">All Departments</option>
            {specialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as RiskLevel | "")}
            className="text-sm border border-line-axis rounded-lg px-2.5 py-1.5 bg-surface text-ink-secondary"
          >
            <option value="">All Risk Levels</option>
            {(Object.keys(RISK_LABELS) as RiskLevel[]).map((level) => (
              <option key={level} value={level}>{RISK_LABELS[level]} Risk</option>
            ))}
          </select>
          <select
            value={qualityFilter}
            onChange={(e) => setQualityFilter(e.target.value as QualityBand)}
            className="text-sm border border-line-axis rounded-lg px-2.5 py-1.5 bg-surface text-ink-secondary"
          >
            <option value="">All Quality Scores</option>
            {QUALITY_BANDS.map((b) => (
              <option key={b.key} value={b.key}>{b.label}</option>
            ))}
          </select>
          {(specialtyFilter || riskFilter || qualityFilter) && (
            <button
              type="button"
              onClick={() => { setSpecialtyFilter(""); setRiskFilter(""); setQualityFilter(""); }}
              className="text-xs font-medium text-chart-1 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-grid text-left">
              <th data-tour="compare-toggle" className="px-3 py-3 text-xs font-medium text-ink-muted uppercase tracking-wide" title="Select up to 4 providers to compare">Cmp</th>
              <th className="px-5 py-3"><SortHeader label="Provider" columnKey="name" /></th>
              <th className="px-3 py-3 text-xs font-medium text-ink-muted uppercase tracking-wide">Risk</th>
              <th className="px-3 py-3"><SortHeader label="Score" columnKey="performanceScore" /></th>
              <th className="px-3 py-3 text-xs font-medium text-ink-muted uppercase tracking-wide">Trend</th>
              <th className="px-3 py-3"><SortHeader label="Denial Rate" columnKey="denialRate" /></th>
              <th className="px-3 py-3"><SortHeader label="Net Collection" columnKey="netCollectionRate" /></th>
              <th data-tour="open-actions" className="px-3 py-3 text-xs font-medium text-ink-muted uppercase tracking-wide">Open Actions</th>
              <th className="px-3 py-3 text-xs font-medium text-ink-muted uppercase tracking-wide">Review</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const selected = isSelected(p.id);
              const disableCompare = !selected && selectedIds.length >= max;
              return (
                <tr
                  key={p.id}
                  className="border-b border-line-grid last:border-0 hover:bg-plane/60 cursor-pointer transition"
                  onClick={() => openProvider(p.id)}
                >
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => toggle(p.id)}
                      disabled={disableCompare}
                      title={disableCompare ? `Up to ${max} providers` : "Toggle compare"}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg border transition ${
                        selected ? "bg-chart-1 border-chart-1 text-white" : "border-line-axis text-ink-muted hover:bg-plane"
                      } disabled:opacity-30`}
                    >
                      <GitCompareArrows className="w-3.5 h-3.5" />
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-ink-primary">{p.name}</div>
                    <div className="text-xs text-ink-muted">{p.specialty} · {p.facility}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-1 items-start">
                      <RiskBadge level={p.riskLevel} />
                      <StuckRiskBadge quarters={p.stuckAtRiskQuarters} />
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2 tabular-nums font-medium">
                      <Value value={p.performanceScore} type="number" decimals={1} />
                      <div className="w-16 hidden lg:block">
                        <TrendSparkline data={p.scoreHistory} color={RISK_COLORS[p.riskLevel]} height={20} />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><TrendBadge trend={p.trend} /></td>
                  <td className="px-3 py-3"><Value value={p.denialRate} type="percent" /></td>
                  <td className="px-3 py-3"><Value value={p.netCollectionRate} type="percent" /></td>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    {p.pendingActionsCount > 0 ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/providers/${p.id}?tab=actions`, { state: { backgroundLocation: location } })}
                        className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-chart-1/10 text-chart-1 hover:bg-chart-1/20 transition"
                      >
                        <ClipboardList className="w-3.5 h-3.5" /> {p.pendingActionsCount} pending
                      </button>
                    ) : (
                      <span className="text-xs text-ink-muted">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    {p.flagged && !p.reviewed ? (
                      <button
                        type="button"
                        onClick={() => onMarkReviewed(p.id)}
                        className="flex items-center gap-1 text-xs font-medium text-chart-1 hover:underline"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark reviewed
                      </button>
                    ) : p.flagged ? (
                      <span className="text-xs text-ink-muted">Reviewed</span>
                    ) : (
                      <span className="text-xs text-ink-muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-sm text-ink-muted">
                  No providers match this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
