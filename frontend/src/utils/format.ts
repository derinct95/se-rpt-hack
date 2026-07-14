interface FormatOptions {
  type?: "number" | "percent" | "currency" | "date" | "text";
  decimals?: number;
  placeholder?: string;
}

function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "number" && Number.isNaN(value)) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  return false;
}

export function formatValue(value: unknown, opts: FormatOptions = {}): string {
  const { type = "text", decimals, placeholder = "—" } = opts;

  if (isMissing(value)) return placeholder;

  const lowered = String(value).trim().toLowerCase();
  if (lowered === "undefined" || lowered === "nan" || lowered === "none") return placeholder;

  if (type === "number" && typeof value === "number") {
    return decimals !== undefined ? value.toFixed(decimals) : String(value);
  }
  if (type === "percent" && typeof value === "number") {
    return `${value.toFixed(decimals ?? 1)}%`;
  }
  if (type === "currency" && typeof value === "number") {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: decimals ?? 0 })}`;
  }
  if (type === "date" && typeof value === "string") {
    return value;
  }
  return String(value);
}
