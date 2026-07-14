import { useEffect, useState } from "react";
import { api } from "../../../api/client";
import type { ClaimsPage, ClaimsStatusSummary } from "../../../types";
import Pagination from "../../common/Pagination";
import Value from "../../common/Value";
import ClaimDetailModal from "./ClaimDetailModal";

const STATUS_COLOR: Record<string, string> = {
  paid: "#0ca30c", denied: "#d03b3b", pending: "#fab219", resubmitted: "#2a78d6",
};

type StatusFilter = "" | "paid" | "denied" | "pending" | "resubmitted";

export default function ClaimsTable({ providerId }: { providerId: string }) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [data, setData] = useState<ClaimsPage | null>(null);
  const [summary, setSummary] = useState<ClaimsStatusSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  useEffect(() => {
    api.getClaimsStatusSummary(providerId).then(setSummary);
  }, [providerId]);

  useEffect(() => {
    setLoading(true);
    api.getProviderClaims(providerId, page, 10, statusFilter || undefined)
      .then(setData)
      .finally(() => setLoading(false));
  }, [providerId, page, statusFilter]);

  const tabs: { key: StatusFilter; label: string; count: number | undefined; color?: string }[] = [
    { key: "", label: "All", count: summary?.total },
    { key: "paid", label: "Successful", count: summary?.paid, color: STATUS_COLOR.paid },
    { key: "denied", label: "Denied", count: summary?.denied, color: STATUS_COLOR.denied },
    { key: "pending", label: "Pending", count: summary?.pending, color: STATUS_COLOR.pending },
    { key: "resubmitted", label: "Resubmitted", count: summary?.resubmitted, color: STATUS_COLOR.resubmitted },
  ];

  return (
    <div className="bg-surface border border-ink-primary/10 rounded-2xl overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 border-b border-line-grid">
        <h3 className="text-sm font-semibold text-ink-primary">Claims</h3>
        <div className="flex flex-wrap gap-1.5 sm:ml-auto">
          {tabs.map((t) => (
            <button
              type="button"
              key={t.key || "all"}
              onClick={() => { setStatusFilter(t.key); setPage(1); }}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition ${
                statusFilter === t.key
                  ? "bg-ink-primary text-white border-ink-primary"
                  : "border-line-axis text-ink-secondary hover:bg-plane"
              }`}
            >
              {t.color && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />}
              {t.label} {t.count !== undefined ? `(${t.count})` : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-grid text-left">
              <th className="px-4 py-2 text-xs font-medium text-ink-muted uppercase">Claim ID</th>
              <th className="px-4 py-2 text-xs font-medium text-ink-muted uppercase">Date</th>
              <th className="px-4 py-2 text-xs font-medium text-ink-muted uppercase">Payer</th>
              <th className="px-4 py-2 text-xs font-medium text-ink-muted uppercase">Amount</th>
              <th className="px-4 py-2 text-xs font-medium text-ink-muted uppercase">Status</th>
              <th className="px-4 py-2 text-xs font-medium text-ink-muted uppercase">Denial Reason</th>
            </tr>
          </thead>
          <tbody>
            {!loading && data?.claims.map((c) => (
              <tr
                key={c.id}
                onClick={() => setSelectedClaimId(c.id)}
                className="border-b border-line-grid last:border-0 hover:bg-plane/60 cursor-pointer transition"
              >
                <td className="px-4 py-2 font-medium text-ink-primary">{c.id}</td>
                <td className="px-4 py-2"><Value value={c.claimDate} /></td>
                <td className="px-4 py-2"><Value value={c.payer} /></td>
                <td className="px-4 py-2"><Value value={c.amountBilled} type="currency" /></td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-1.5 capitalize">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLOR[c.status] ?? "#898781" }} />
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-2"><Value value={c.denialReason} /></td>
              </tr>
            ))}
            {!loading && data?.claims.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-muted">No claims for this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4">
        {data && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />}
      </div>

      <ClaimDetailModal providerId={providerId} claimId={selectedClaimId} onClose={() => setSelectedClaimId(null)} />
    </div>
  );
}
