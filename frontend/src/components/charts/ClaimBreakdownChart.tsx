import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORICAL } from "./theme";

interface ClaimBreakdownChartProps {
  amountBilled: number;
  amountPaid: number;
}

export default function ClaimBreakdownChart({ amountBilled, amountPaid }: ClaimBreakdownChartProps) {
  const adjustment = Math.max(amountBilled - amountPaid, 0);
  const slices = [
    { name: "Paid", value: amountPaid, color: CATEGORICAL[3] },
    { name: "Adjustment / Write-off", value: adjustment, color: CATEGORICAL[5] },
  ].filter((d) => d.value > 0);

  if (amountBilled <= 0) {
    return <p className="text-sm text-ink-muted">No amount data for this claim.</p>;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 h-24 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices.length ? slices : [{ name: "Billed", value: amountBilled, color: CATEGORICAL[0] }]}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="90%"
              paddingAngle={3}
              isAnimationActive={false}
            >
              {(slices.length ? slices : [{ name: "Billed", value: amountBilled, color: CATEGORICAL[0] }]).map((d, i) => (
                <Cell key={i} fill={d.color} stroke="#fcfcfb" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex-1 space-y-1.5 text-sm">
        <li className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-ink-muted">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORICAL[0] }} /> Amount Billed
          </span>
          <span className="font-medium text-ink-primary tabular-nums">${amountBilled.toLocaleString()}</span>
        </li>
        {slices.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-ink-muted">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}
            </span>
            <span className="font-medium text-ink-primary tabular-nums">${d.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
