import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

/** Challenge mock data freezes “today” at 1 November 2026. */
export const DEFAULT_REFERENCE_DATE = dayjs
  .utc("2026-11-01T00:00:00.000Z")
  .toDate();

export function parseMockReferenceDateHeader(
  value: string | null,
): Date | null {
  if (!value) {
    return null;
  }
  const parsed = dayjs.utc(value);
  return parsed.isValid() ? parsed.toDate() : null;
}

export function fromUnixSeconds(
  seconds: number | null | undefined,
): Date | null {
  if (seconds == null) {
    return null;
  }
  return dayjs.unix(seconds).utc().toDate();
}

export function fromIso(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  const parsed = dayjs.utc(value);
  return parsed.isValid() ? parsed.toDate() : null;
}

export function daysBetween(later: Date, earlier: Date): number {
  return dayjs.utc(later).diff(dayjs.utc(earlier), "day");
}

/** Approximate tenure months using 30-day months (documented in METRICS.md). */
export function monthsBetween(later: Date, earlier: Date): number {
  return dayjs.utc(later).diff(dayjs.utc(earlier), "day") / 30;
}

export function addDays(date: Date, days: number): Date {
  return dayjs.utc(date).add(days, "day").toDate();
}

export function toMonthKey(date: Date): string {
  return dayjs.utc(date).format("YYYY-MM");
}

export function priorMonthKey(referenceDate: Date, monthsAgo: number): string {
  return dayjs
    .utc(referenceDate)
    .subtract(monthsAgo, "month")
    .format("YYYY-MM");
}
