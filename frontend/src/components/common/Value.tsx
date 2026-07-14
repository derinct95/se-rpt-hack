import { formatValue } from "../../utils/format";

interface ValueProps {
  value: unknown;
  type?: "number" | "percent" | "currency" | "date" | "text";
  decimals?: number;
  placeholder?: string;
  className?: string;
}

export default function Value({ value, type, decimals, placeholder, className = "" }: ValueProps) {
  const formatted = formatValue(value, { type, decimals, placeholder });
  const isPlaceholder = formatted === (placeholder ?? "—");
  return (
    <span className={`tabular-nums ${isPlaceholder ? "text-ink-muted italic" : "text-ink-primary"} ${className}`}>
      {formatted}
    </span>
  );
}
