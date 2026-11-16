import { buildAdsImpact } from "@/lib/metrics/ads-impact";
import { buildCancelReasons } from "@/lib/metrics/cancel-reasons";
import { buildAtRiskList } from "@/lib/metrics/health-score";
import { buildLeadsByTrade } from "@/lib/metrics/leads-by-trade";
import { buildRetentionSummary } from "@/lib/metrics/retention";
import { buildRevenueLtvByTrade } from "@/lib/metrics/revenue-ltv";
import type { MetricClient } from "@/lib/metrics/types";

export type DashboardMetrics = ReturnType<typeof computeDashboardMetrics>;

export function computeDashboardMetrics(
  clients: MetricClient[],
  referenceDate: Date,
) {
  const cancel = buildCancelReasons(clients);

  return {
    referenceDate: referenceDate.toISOString(),
    // Cap at 25 so client `riskLimit` filter (10|15|25) can slice without another fetch.
    atRisk: buildAtRiskList(clients, referenceDate, 25),
    retention: buildRetentionSummary(clients, referenceDate),
    leadsByTrade: buildLeadsByTrade(clients, referenceDate),
    revenueByTrade: buildRevenueLtvByTrade(clients, referenceDate),
    adsImpact: buildAdsImpact(clients),
    cancelReasons: cancel.reasons,
    cancelFeedback: cancel.feedback,
  };
}

export * from "@/lib/metrics/types";
