import { clientHasAdsAddon, isRetained } from "@/lib/metrics/subscriptions";
import type { AdsImpactSummary, MetricClient } from "@/lib/metrics/types";

function cohortStats(clients: MetricClient[]) {
  const retainedCount = clients.filter(isRetained).length;
  const clientCount = clients.length;
  return {
    clientCount,
    retainedCount,
    retentionRate: clientCount === 0 ? 0 : retainedCount / clientCount,
  };
}

export function buildAdsImpact(clients: MetricClient[]): AdsImpactSummary {
  const withAds: MetricClient[] = [];
  const withoutAds: MetricClient[] = [];

  for (const client of clients) {
    if (clientHasAdsAddon(client)) {
      withAds.push(client);
    } else {
      withoutAds.push(client);
    }
  }

  return {
    withAds: cohortStats(withAds),
    withoutAds: cohortStats(withoutAds),
  };
}
