import type { Weights } from "./engine";

const KEY = "lumen-history-v1";

export type HistoryEntry = {
  id: string;
  at: number;
  label: string;
  overall: number;
  verdict: string;
  resume: string;
  job: string;
  weights: Weights;
};

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function saveHistory(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...loadHistory().filter((item) => item.id !== entry.id)].slice(0, 8);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function removeHistory(id: string): HistoryEntry[] {
  const next = loadHistory().filter((item) => item.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearHistory(): void {
  window.localStorage.removeItem(KEY);
}
