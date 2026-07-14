interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export default function SegmentedControl<T extends string>({ options, value, onChange, className = "" }: SegmentedControlProps<T>) {
  return (
    <div className={`inline-flex gap-1 bg-plane rounded-lg p-1 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-md text-sm transition ${
            value === opt.value ? "bg-surface shadow-sm text-ink-primary font-medium" : "text-ink-secondary hover:text-ink-primary"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
