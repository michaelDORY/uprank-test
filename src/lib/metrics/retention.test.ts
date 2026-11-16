import { describe, expect, it } from "vitest";

import { buildRetentionSummary } from "@/lib/metrics/retention";
import type { MetricClient } from "@/lib/metrics/types";

const referenceDate = new Date("2026-11-01T00:00:00.000Z");

function client(
  status: string,
  canceledAt: Date | null,
  startDate: Date,
): MetricClient {
  return {
    id: `cl_${status}_${startDate.toISOString()}`,
    businessName: "Biz",
    trade: "plumber",
    status,
    signupAt: startDate,
    liveAt: startDate,
    lastLoginAt: referenceDate,
    adsEnabled: false,
    stripeCustomerId: "cus_x",
    leads: [],
    tickets: [],
    customer: {
      delinquent: false,
      subscriptions: [
        {
          id: "sub_x",
          status: status === "cancelled" ? "canceled" : "active",
          startDate,
          canceledAt,
          cancellationReason: canceledAt ? "cancellation_requested" : null,
          cancellationFeedback: null,
          items: [],
        },
      ],
      invoices: [],
    },
  };
}

describe("buildRetentionSummary", () => {
  it("computes retention rate and leave buckets", () => {
    const summary = buildRetentionSummary(
      [
        client("live", null, new Date("2025-01-01T00:00:00.000Z")),
        client(
          "cancelled",
          new Date("2025-03-01T00:00:00.000Z"),
          new Date("2025-01-01T00:00:00.000Z"),
        ),
        client(
          "cancelled",
          new Date("2025-08-01T00:00:00.000Z"),
          new Date("2025-01-01T00:00:00.000Z"),
        ),
      ],
      referenceDate,
    );

    expect(summary.totalClients).toBe(3);
    expect(summary.retainedCount).toBe(1);
    expect(summary.churnedCount).toBe(2);
    expect(summary.retentionRate).toBeCloseTo(1 / 3);
    expect(summary.leaveTiming["1-3"]).toBe(1);
    expect(summary.leaveTiming["6+"]).toBe(1);
  });
});
