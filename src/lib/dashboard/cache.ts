import type { DashboardPayload } from "@/lib/dashboard/types";

/** Bump when payload shape/metric caps change so in-memory cache cannot serve stale slices. */
const CACHE_VERSION = 2;

let cached: {
  version: number;
  syncRunId: string;
  payload: DashboardPayload;
} | null = null;

export function getCachedDashboard(syncRunId: string): DashboardPayload | null {
  if (cached?.syncRunId === syncRunId && cached.version === CACHE_VERSION) {
    return cached.payload;
  }
  return null;
}

export function setCachedDashboard(
  syncRunId: string,
  payload: DashboardPayload,
): void {
  cached = { version: CACHE_VERSION, syncRunId, payload };
}

export function invalidateDashboardCache(): void {
  cached = null;
}
