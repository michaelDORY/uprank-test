import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import type { HealthSignal } from "@/lib/metrics/types";

dayjs.extend(utc);
dayjs.extend(timezone);

const DISPLAY_TZ = "Australia/Melbourne";

function toMelbourne(value: string | Date) {
  return dayjs.utc(value).tz(DISPLAY_TZ);
}

const AUD_CURRENCY = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const AUD_CURRENCY_PRECISE = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const PERCENT = new Intl.NumberFormat("en-AU", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const NUMBER = (digits: number) =>
  new Intl.NumberFormat("en-AU", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });

/** Billing amounts are stored in cents. */
export function formatAudFromCents(cents: number, precise = false): string {
  const dollars = cents / 100;
  return (precise ? AUD_CURRENCY_PRECISE : AUD_CURRENCY).format(dollars);
}

export function formatPercent(value: number): string {
  return PERCENT.format(value);
}

export function formatNumber(value: number, digits = 1): string {
  return NUMBER(digits).format(value);
}

export function formatMonths(value: number): string {
  return `${formatNumber(value, 1)} mo`;
}

/** Calendar date in Australia/Melbourne, e.g. 1 Nov 2026. */
export function formatDate(
  value: string | Date | null | undefined,
  fallback = "—",
): string {
  if (!value) {
    return fallback;
  }
  const parsed = toMelbourne(value);
  if (!parsed.isValid()) {
    return fallback;
  }
  return parsed.format("D MMM YYYY");
}

/** Date + time in Australia/Melbourne, e.g. 16 Nov 2026, 4:32 pm. */
export function formatDateTime(
  value: string | Date | null | undefined,
  fallback = "—",
): string {
  if (!value) {
    return fallback;
  }
  const parsed = toMelbourne(value);
  if (!parsed.isValid()) {
    return fallback;
  }
  return parsed.format("D MMM YYYY, h:mm a");
}

/** Stripe-style snake_case enums → readable labels. */
export function formatEnumLabel(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function signalLabel(signal: HealthSignal): string {
  switch (signal) {
    case "zero_leads_recently":
      return "Zero leads recently";
    case "falling_leads":
      return "Falling leads";
    case "failed_payment":
      return "Failed payment";
    case "support_spike":
      return "Support spike";
    case "stuck_onboarding":
      return "Stuck in onboarding";
    case "no_login":
      return "No recent login";
    default: {
      const _exhaustive: never = signal;
      return _exhaustive;
    }
  }
}
