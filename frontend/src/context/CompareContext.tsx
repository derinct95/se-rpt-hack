import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

const MAX_COMPARE = 4;

interface CompareContextValue {
  selectedIds: string[];
  toggle: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  max: number;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const value = useMemo<CompareContextValue>(() => ({
    selectedIds,
    max: MAX_COMPARE,
    isSelected: (id: string) => selectedIds.includes(id),
    toggle: (id: string) => {
      setSelectedIds((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= MAX_COMPARE) return prev;
        return [...prev, id];
      });
    },
    clear: () => setSelectedIds([]),
  }), [selectedIds]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
