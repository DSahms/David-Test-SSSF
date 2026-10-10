import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  if (isNaN(d)) return "—";
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

export function durationMs(startedAt: string | null, endedAt: string | null): number | null {
  if (!startedAt) return null;
  const s = new Date(startedAt).getTime();
  const e = endedAt ? new Date(endedAt).getTime() : Date.now();
  if (isNaN(s) || isNaN(e)) return null;
  return Math.max(0, e - s);
}

export function fmtDuration(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rem = Math.floor(s % 60);
  return `${m}m ${rem}s`;
}

export function fmtTokens(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}k`;
  return `${(n / 1_000_000).toFixed(2)}M`;
}

export function fmtCost(n: number | null | undefined): string {
  if (n == null) return "—";
  return `$${n.toFixed(4)}`;
}

export const STATUS_COLORS: Record<string, string> = {
  success: "text-emerald-600 bg-emerald-50 border-emerald-200",
  running: "text-amber-600 bg-amber-50 border-amber-200",
  queued: "text-zinc-500 bg-zinc-100 border-zinc-200",
  fail: "text-rose-600 bg-rose-50 border-rose-200",
  error: "text-rose-600 bg-rose-50 border-rose-200",
  launched: "text-amber-600 bg-amber-50 border-amber-200",
  done: "text-emerald-600 bg-emerald-50 border-amber-200",
  approved: "text-emerald-600 bg-emerald-50 border-emerald-200",
  draft: "text-zinc-500 bg-zinc-100 border-zinc-200",
};
