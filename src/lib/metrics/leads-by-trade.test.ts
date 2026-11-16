import { describe, expect, it } from "vitest";

import { buildLeadsByTrade } from "@/lib/metrics/leads-by-trade";
import type { MetricClient } from "@/lib/metrics/types";

const referenceDate = new Date("2026-11-01T00:00:00.000Z");

function client(
  id: string,
  trade: string | null,
  liveAt: Date | null,
  leads: Array<{ month: string; leads: number }>,
): MetricClient {
  return {
    id,
    businessName: id,
    trade,
    status: "live",
    signupAt: new Date("2025-01-01T00:00:00.000Z"),
    liveAt,
    lastLoginAt: new Date("2026-10-01T00:00:00.000Z"),
    adsEnabled: false,
    stripeCustomerId: `cus_${id}`,
    leads,
    tickets: [],
    customer: null,
  };
}

describe("buildLeadsByTrade", () => {
  it("skips clients without liveAt", () => {
    const rows = buildLeadsByTrade(
      [
        client("a", "plumber", null, [
          { month: "2026-09", leads: 10 },
          { month: "2026-10", leads: 10 },
        ]),
      ],
      referenceDate,
    );
    expect(rows).toHaveLength(0);
  });

  it("averages total leads over client-months and maps null trade", () => {
    const rows = buildLeadsByTrade(
      [
        client("a", "plumber", new Date("2025-01-01T00:00:00.000Z"), [
          { month: "2026-09", leads: 10 },
          { month: "2026-10", leads: 20 },
        ]),
        client("b", null, new Date("2025-01-01T00:00:00.000Z"), [
          { month: "2026-10", leads: 5 },
        ]),
      ],
      referenceDate,
    );

    const plumber = rows.find((row) => row.trade === "plumber");
    const unknown = rows.find((row) => row.trade === "Unknown");

    expect(plumber?.avgLeadsPerClientPerMonth).toBe(15);
    expect(plumber?.clientCount).toBe(1);
    expect(plumber?.smallSample).toBe(true);
    expect(unknown?.avgLeadsPerClientPerMonth).toBe(5);
    expect(unknown?.trade).toBe("Unknown");
  });
});
