import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORICAL, GRID_LINE, INK_MUTED } from "./theme";

interface MetricBenchmarkChartProps {
  value: number;
  peerValue: number;
  targetValue: number;
}

/** A 3-axis radar (This Provider / Peer Average / Practice Target) for a single
 * metric -- with exactly 3 axes it renders as a triangle, making it easy to see
 * at a glance whether the provider sits closer to the peer average or the target. */
export default function MetricBenchmarkChart({ value, peerValue, targetValue }: MetricBenchmarkChartProps) {
  const data = [
    { axis: "This Provider", value: Math.round(value * 10) / 10 },
    { axis: "Peer Average", value: Math.round(peerValue * 10) / 10 },
    { axis: "Practice Target", value: Math.round(targetValue * 10) / 10 },
  ];
  const domainMax = Math.ceil(Math.max(value, peerValue, targetValue) * 1.25);

  return (
    <ResponsiveContainer width="100%" height={190}>
      <RadarChart data={data} outerRadius="68%">
        <PolarGrid stroke={GRID_LINE} />
        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: INK_MUTED }} />
        <PolarRadiusAxis domain={[0, domainMax || 1]} tick={{ fontSize: 9, fill: INK_MUTED }} axisLine={false} />
        <Radar dataKey="value" stroke={CATEGORICAL[0]} fill={CATEGORICAL[0]} fillOpacity={0.35} strokeWidth={2} isAnimationActive={false} />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
}
