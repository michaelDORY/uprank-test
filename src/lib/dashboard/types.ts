import type { DashboardMetrics } from "@/lib/metrics";

export type DashboardPayload = {
  syncedOnLoad: boolean;
  lastSync: {
    id: string;
    finishedAt: string | null;
    referenceDate: string;
    clientCount: number;
    customerCount: number;
  } | null;
  metrics: DashboardMetrics;
};
