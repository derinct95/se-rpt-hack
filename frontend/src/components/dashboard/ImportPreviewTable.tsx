import type { ImportPreviewRow } from "../../types";
import Value from "../common/Value";

export default function ImportPreviewTable({ rows }: { rows: ImportPreviewRow[] }) {
  return (
    <div className="overflow-x-auto border border-line-grid rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line-grid text-left bg-plane">
            <th className="px-3 py-2 text-xs font-medium text-ink-muted uppercase">Name</th>
            <th className="px-3 py-2 text-xs font-medium text-ink-muted uppercase">Specialty</th>
            <th className="px-3 py-2 text-xs font-medium text-ink-muted uppercase">Facility</th>
            <th className="px-3 py-2 text-xs font-medium text-ink-muted uppercase">NPI</th>
            <th className="px-3 py-2 text-xs font-medium text-ink-muted uppercase">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-line-grid last:border-0">
              <td className="px-3 py-2"><Value value={row.name} /></td>
              <td className="px-3 py-2"><Value value={row.specialty} placeholder="Will be assigned" /></td>
              <td className="px-3 py-2"><Value value={row.facility} placeholder="Will be assigned" /></td>
              <td className="px-3 py-2"><Value value={row.npi} placeholder="Will be assigned" /></td>
              <td className="px-3 py-2"><Value value={row.performanceScore} type="number" decimals={1} placeholder="Will be assigned" /></td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={5} className="px-3 py-6 text-center text-ink-muted">No importable rows found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
