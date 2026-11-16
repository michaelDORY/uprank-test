import {
  ADS_PRICE_ID,
  ADS_PRODUCT_ID,
  type MetricClient,
} from "@/lib/metrics/types";

export type MetricSubscription = NonNullable<
  MetricClient["customer"]
>["subscriptions"][number];

function isAdsItem(item: { productId: string; priceId: string }): boolean {
  return item.productId === ADS_PRODUCT_ID || item.priceId === ADS_PRICE_ID;
}

/** Product flag or billing subscription item for ads management. */
export function clientHasAdsAddon(client: MetricClient): boolean {
  if (client.adsEnabled) {
    return true;
  }
  const items = client.customer?.subscriptions.flatMap((s) => s.items) ?? [];
  return items.some(isAdsItem);
}

/** Prefer live billing state; otherwise the most recently ended subscription. */
export function pickPrimarySubscription(
  client: MetricClient,
): MetricSubscription | null {
  const subscriptions = client.customer?.subscriptions ?? [];
  if (subscriptions.length === 0) {
    return null;
  }

  const active = subscriptions.find(
    (subscription) =>
      subscription.status === "active" || subscription.status === "past_due",
  );
  if (active) {
    return active;
  }

  return [...subscriptions].sort((a, b) => {
    const aEnd = a.canceledAt?.getTime() ?? a.startDate.getTime();
    const bEnd = b.canceledAt?.getTime() ?? b.startDate.getTime();
    return bEnd - aEnd;
  })[0]!;
}

export function tradeLabel(trade: string | null): string {
  return trade ?? "Unknown";
}

export function isRetained(client: MetricClient): boolean {
  return client.status !== "cancelled";
}
