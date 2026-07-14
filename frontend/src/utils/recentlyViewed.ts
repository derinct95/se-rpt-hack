import { useEffect, useState } from "react";
import type { PracticeType, RiskLevel } from "../types";

export interface RecentlyViewedEntry {
  id: string;
  name: string;
  specialty: string;
  performanceScore: number;
  riskLevel: RiskLevel;
  practiceType: PracticeType;
  viewedAt: number;
}

const STORAGE_KEY = "ppd_recently_viewed";
const MAX_ENTRIES = 15;
const EVENT_NAME = "clearview:recently-viewed-changed";

export function getRecentlyViewed(): RecentlyViewedEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(entry: Omit<RecentlyViewedEntry, "viewedAt">): void {
  const existing = getRecentlyViewed().filter((e) => e.id !== entry.id);
  const next = [{ ...entry, viewedAt: Date.now() }, ...existing].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function useRecentlyViewed(practiceType?: PracticeType): RecentlyViewedEntry[] {
  const [entries, setEntries] = useState<RecentlyViewedEntry[]>(() => getRecentlyViewed());

  useEffect(() => {
    function refresh() {
      setEntries(getRecentlyViewed());
    }
    window.addEventListener(EVENT_NAME, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT_NAME, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filtered = practiceType ? entries.filter((e) => e.practiceType === practiceType) : entries;
  return filtered.slice(0, 6);
}
