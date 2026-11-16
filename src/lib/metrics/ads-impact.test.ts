import { describe, expect, it } from "vitest";

import { buildAdsImpact } from "@/lib/metrics/ads-impact";
import type { MetricClient } from "@/lib/metrics/types";

function client(id: string, ads: boolean, status: string): MetricClient {
  return {
    id,
    businessName: id,
    trade: "roofer",
    status,
    signupAt: new Date("2025-01-01T00:00:00.000Z"),
    liveAt: new Date("2025-01-15T00:00:00.000Z"),
    lastLoginAt: new Date("2026-10-01T00:00:00.000Z"),
    adsEnabled: ads,
    stripeCustomerId: `cus_${id}`,
    leads: [],
    tickets: [],
    customer: {
      delinquent: false,
      subscriptions: [
        {
          id: `sub_${id}`,
          status: status === "cancelled" ? "canceled" : "active",
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          canceledAt:
            status === "cancelled"
              ? new Date("2026-01-01T00:00:00.000Z")
              : null,
          cancellationReason: null,
          cancellationFeedback: null,
          items: ads
            ? [
                {
                  productId: "prod_ads_management",
                  priceId: "price_ads_management",
                  unitAmount: 14900,
                  quantity: 1,
                },
              ]
            : [],
        },
      ],
      invoices: [],
    },
  };
}

describe("buildAdsImpact", () => {
  it("compares retention with and without ads", () => {
    const summary = buildAdsImpact([
      client("a", true, "live"),
      client("b", true, "cancelled"),
      client("c", false, "live"),
      client("d", false, "live"),
    ]);

    expect(summary.withAds.clientCount).toBe(2);
    expect(summary.withAds.retentionRate).toBe(0.5);
    expect(summary.withoutAds.clientCount).toBe(2);
    expect(summary.withoutAds.retentionRate).toBe(1);
  });
});
