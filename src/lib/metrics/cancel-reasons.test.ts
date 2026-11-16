import { describe, expect, it } from "vitest";

import { buildCancelReasons } from "@/lib/metrics/cancel-reasons";
import type { MetricClient } from "@/lib/metrics/types";

function clientWithSubs(
  id: string,
  subscriptions: NonNullable<
    NonNullable<MetricClient["customer"]>["subscriptions"]
  >,
): MetricClient {
  return {
    id,
    businessName: id,
    trade: "plumber",
    status: "cancelled",
    signupAt: new Date("2025-01-01T00:00:00.000Z"),
    liveAt: new Date("2025-01-15T00:00:00.000Z"),
    lastLoginAt: null,
    adsEnabled: false,
    stripeCustomerId: `cus_${id}`,
    leads: [],
    tickets: [],
    customer: {
      delinquent: false,
      subscriptions,
      invoices: [],
    },
  };
}

describe("buildCancelReasons", () => {
  it("counts only canceled subscriptions and maps missing feedback to none", () => {
    const result = buildCancelReasons([
      clientWithSubs("a", [
        {
          id: "sub_active",
          status: "active",
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          canceledAt: null,
          cancellationReason: null,
          cancellationFeedback: null,
          items: [],
        },
        {
          id: "sub_canceled",
          status: "canceled",
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          canceledAt: new Date("2026-01-01T00:00:00.000Z"),
          cancellationReason: "cancellation_requested",
          cancellationFeedback: null,
          items: [],
        },
      ]),
      clientWithSubs("b", [
        {
          id: "sub_b",
          status: "canceled",
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          canceledAt: new Date("2026-02-01T00:00:00.000Z"),
          cancellationReason: "payment_failed",
          cancellationFeedback: "too_expensive",
          items: [],
        },
      ]),
    ]);

    expect(result.reasons).toHaveLength(2);
    expect(result.feedback.find((row) => row.key === "none")?.count).toBe(1);
    expect(
      result.feedback.find((row) => row.key === "too_expensive")?.count,
    ).toBe(1);
    expect(result.feedback.find((row) => row.key === "none")?.share).toBe(0.5);
  });
});
