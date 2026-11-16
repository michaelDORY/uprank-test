import { describe, expect, it } from "vitest";

import { buildAtRiskList, scoreClientHealth } from "@/lib/metrics/health-score";
import type { MetricClient } from "@/lib/metrics/types";

const referenceDate = new Date("2026-11-01T00:00:00.000Z");

function baseClient(overrides: Partial<MetricClient> = {}): MetricClient {
  return {
    id: "cl_1",
    businessName: "Test Plumbing",
    trade: "plumber",
    status: "live",
    signupAt: new Date("2025-01-01T00:00:00.000Z"),
    liveAt: new Date("2025-01-15T00:00:00.000Z"),
    lastLoginAt: new Date("2026-10-28T00:00:00.000Z"),
    adsEnabled: false,
    stripeCustomerId: "cus_1",
    leads: [
      { month: "2026-08", leads: 10 },
      { month: "2026-09", leads: 8 },
      { month: "2026-10", leads: 5 },
    ],
    tickets: [],
    customer: {
      delinquent: false,
      subscriptions: [
        {
          id: "sub_1",
          status: "active",
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          canceledAt: null,
          cancellationReason: null,
          cancellationFeedback: null,
          items: [
            {
              productId: "prod_growth_plan",
              priceId: "price_growth",
              unitAmount: 29700,
              quantity: 1,
            },
          ],
        },
      ],
      invoices: [],
    },
    ...overrides,
  };
}

describe("scoreClientHealth", () => {
  it("flags falling leads and scores below 100", () => {
    const { score, signals } = scoreClientHealth(baseClient(), referenceDate);
    expect(signals).toContain("falling_leads");
    expect(score).toBeLessThan(100);
  });

  it("flags failed payment when delinquent", () => {
    const client = baseClient({
      customer: {
        delinquent: true,
        subscriptions: [],
        invoices: [],
      },
    });
    const { signals } = scoreClientHealth(client, referenceDate);
    expect(signals).toContain("failed_payment");
  });

  it("excludes cancelled clients from at-risk list", () => {
    const list = buildAtRiskList(
      [baseClient({ status: "cancelled", id: "cl_cancelled" })],
      referenceDate,
    );
    expect(list).toHaveLength(0);
  });
});
