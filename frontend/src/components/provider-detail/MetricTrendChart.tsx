import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Metrics, MetricSnapshot } from "../../types";
import { CATEGORICAL, GRID_LINE, INK_MUTED } from "../charts/theme";

interface MetricTrendChartProps {
  points: MetricSnapshot[];
  metricKey: keyof Metrics;
}

export default function MetricTrendChart({ points, metricKey }: MetricTrendChartProps) {
  const data = points.map((p) => ({
    period: p.label,
    Provider: p.metrics[metricKey],
    "Peer Average": p.peerAverageMetrics[metricKey],
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID_LINE} vertical={false} />
        <XAxis dataKey="period" tick={{ fontSize: 11, fill: INK_MUTED }} axisLine={{ stroke: "#c3c2b7" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: INK_MUTED }} axisLine={false} tickLine={false} width={44} />
        <Tooltip />
        <Line type="monotone" dataKey="Provider" stroke={CATEGORICAL[0]} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
        <Line type="monotone" dataKey="Peer Average" stroke={INK_MUTED} strokeWidth={2} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
