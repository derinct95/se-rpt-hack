import { RadialBar, RadialBarChart } from "recharts";
import { RISK_COLORS } from "./theme";
import type { RiskLevel } from "../../types";

interface ScoreGaugeProps {
  score: number;
  riskLevel: RiskLevel;
  size?: number;
}

export default function ScoreGauge({ score, riskLevel, size = 140 }: ScoreGaugeProps) {
  const color = RISK_COLORS[riskLevel];
  const data = [{ name: "score", value: score, fill: color }];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <RadialBarChart
        width={size}
        height={size}
        cx="50%"
        cy="50%"
        innerRadius="72%"
        outerRadius="100%"
        barSize={12}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <RadialBar dataKey="value" background={{ fill: "#e1e0d9" }} cornerRadius={6} isAnimationActive={false} max={100} />
      </RadialBarChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular-nums text-ink-primary">{score}</span>
        <span className="text-xs text-ink-muted">/ 100</span>
      </div>
    </div>
  );
}
