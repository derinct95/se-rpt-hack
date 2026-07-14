import { Line, LineChart, ResponsiveContainer } from "recharts";
import { CATEGORICAL } from "./theme";

interface TrendSparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export default function TrendSparkline({ data, color = CATEGORICAL[0], height = 36 }: TrendSparklineProps) {
  const points = data.map((value, index) => ({ index, value }));
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
