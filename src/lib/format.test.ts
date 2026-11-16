import { describe, expect, it } from "vitest";

import {
  formatAudFromCents,
  formatDate,
  formatDateTime,
  formatPercent,
} from "@/lib/format";

describe("format helpers", () => {
  it("formats AUD from cents (display boundary)", () => {
    expect(formatAudFromCents(29700)).toBe("$297");
    expect(formatAudFromCents(44650, true)).toBe("$446.50");
  });

  it("formats retention-style percents", () => {
    expect(formatPercent(0.731)).toBe("73.1%");
  });

  it("formats Melbourne dates from UTC timestamps", () => {
    expect(formatDate("2026-11-01T00:00:00.000Z")).toBe("1 Nov 2026");
    expect(formatDateTime("2026-11-16T06:32:00.000Z")).toBe(
      "16 Nov 2026, 5:32 pm",
    );
  });
});
