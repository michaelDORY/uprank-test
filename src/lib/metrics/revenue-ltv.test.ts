import { describe, expect, it } from "vitest";

import { buildRevenueLtvByTrade } from "@/lib/metrics/revenue-ltv";
import type { MetricClient } from "@/lib/metrics/types";

const referenceDate = new Date("2026-11-01T00:00:00.000Z");

function clientWithSub(
  id: string,
  opts: {
    trade?: string | null;
    status?: string;
    unitAmount?: number;
    startDate?: Date;
    canceledAt?: Date | null;
    includeSub?: boolean;
  } = {},
): MetricClient {
  const {
    trade = "plumber",
    status = "active",
    unitAmount = 30000,
    startDate = new Date("2026-01-01T00:00:00.000Z"),
    canceledAt = null,
    includeSub = true,
  } = opts;

  return {
    id,
    businessName: id,
    trade,
    status: status === "canceled" ? "cancelled" : "live",
    signupAt: startDate,
    liveAt: startDate,
    lastLoginAt: new Date("2026-10-01T00:00:00.000Z"),
    adsEnabled: false,
    stripeCustomerId: `cus_${id}`,
    leads: [],
    tickets: [],
    customer: includeSub
      ? {
          delinquent: false,
          subscriptions: [
            {
              id: `sub_${id}`,
              status,
              startDate,
              canceledAt,
              cancellationReason: null,
              cancellationFeedback: null,
              items: [
                {
                  productId: "prod_growth_plan",
                  priceId: "price_growth",
                  unitAmount,
                  quantity: 1,
                },
              ],
            },
          ],
          invoices: [],
        }
      : null,
  };
}

describe("buildRevenueLtvByTrade", () => {
  it("skips clients without a subscription", () => {
    const rows = buildRevenueLtvByTrade(
      [clientWithSub("a", { includeSub: false })],
      referenceDate,
    );
    expect(rows).toHaveLength(0);
  });

  it("computes LTV as MRR times months retained", () => {
    const rows = buildRevenueLtvByTrade(
      [
        clientWithSub("a", {
          unitAmount: 30000,
          startDate: new Date("2026-01-01T00:00:00.000Z"),
          canceledAt: new Date("2026-04-01T00:00:00.000Z"),
          status: "canceled",
        }),
      ],
      referenceDate,
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]?.avgMrrCents).toBe(30000);
    // ~90 days / 30 = 3 months
    expect(rows[0]?.avgMonthsRetained).toBe(3);
    expect(rows[0]?.avgLtvCents).toBe(90000);
    expect(rows[0]?.smallSample).toBe(true);
  });

  it("prefers active subscription over an older canceled one", () => {
    const client = clientWithSub("a", {
      status: "active",
      unitAmount: 40000,
      startDate: new Date("2026-06-01T00:00:00.000Z"),
    });
    client.customer!.subscriptions.push({
      id: "sub_old",
      status: "canceled",
      startDate: new Date("2025-01-01T00:00:00.000Z"),
      canceledAt: new Date("2025-06-01T00:00:00.000Z"),
      cancellationReason: null,
      cancellationFeedback: null,
      items: [
        {
          productId: "prod_growth_plan",
          priceId: "price_growth",
          unitAmount: 10000,
          quantity: 1,
        },
      ],
    });

    const rows = buildRevenueLtvByTrade([client], referenceDate);
    expect(rows[0]?.avgMrrCents).toBe(40000);
  });
});
