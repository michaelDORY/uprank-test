import { isRetained } from "@/lib/metrics/subscriptions";
import type {
  AtRiskClient,
  HealthSignal,
  MetricClient,
} from "@/lib/metrics/types";
import { addDays, daysBetween, priorMonthKey } from "@/lib/reference-date";

const PENALTIES: Record<HealthSignal, number> = {
  zero_leads_recently: 25,
  falling_leads: 20,
  failed_payment: 30,
  support_spike: 15,
  stuck_onboarding: 25,
  no_login: 15,
};

/** Window / threshold days — keep in sync with docs/METRICS.md */
export const ZERO_LEADS_MIN_LIVE_DAYS = 30;
export const SUPPORT_WINDOW_DAYS = 30;
export const SUPPORT_SPIKE_MIN_TICKETS = 3;
export const SUPPORT_SPIKE_MULTIPLIER = 2;
export const STUCK_ONBOARDING_DAYS = 14;
export const NO_LOGIN_DAYS = 21;
export const FAILED_PAYMENT_MIN_ATTEMPTS = 2;

function hasFailedPayment(client: MetricClient): boolean {
  const customer = client.customer;
  if (!customer) {
    return false;
  }

  if (customer.delinquent) {
    return true;
  }

  const hasPastDue = customer.subscriptions.some(
    (s) => s.status === "past_due",
  );
  if (hasPastDue) {
    return true;
  }

  return customer.invoices.some(
    (invoice) =>
      invoice.status === "uncollectible" ||
      (invoice.attemptCount >= FAILED_PAYMENT_MIN_ATTEMPTS &&
        invoice.status === "open"),
  );
}

function hasZeroLeadsRecently(
  client: MetricClient,
  referenceDate: Date,
): boolean {
  if (!client.liveAt) {
    return false;
  }
  if (daysBetween(referenceDate, client.liveAt) < ZERO_LEADS_MIN_LIVE_DAYS) {
    return false;
  }

  const keys = [
    priorMonthKey(referenceDate, 1),
    priorMonthKey(referenceDate, 2),
  ];
  const leadMap = new Map(client.leads.map((l) => [l.month, l.leads]));
  const sum = keys.reduce((acc, key) => acc + (leadMap.get(key) ?? 0), 0);
  return sum === 0;
}

function hasFallingLeads(client: MetricClient, referenceDate: Date): boolean {
  if (!client.liveAt) {
    return false;
  }

  const keys = [
    priorMonthKey(referenceDate, 3),
    priorMonthKey(referenceDate, 2),
    priorMonthKey(referenceDate, 1),
  ];
  const leadMap = new Map(client.leads.map((l) => [l.month, l.leads]));
  const values = keys.map((key) => leadMap.get(key));
  if (values.some((v) => v == null)) {
    return false;
  }

  const [a, b, c] = values as [number, number, number];
  return b < a && c < b;
}

function hasSupportSpike(client: MetricClient, referenceDate: Date): boolean {
  const windowStart = addDays(referenceDate, -SUPPORT_WINDOW_DAYS);
  const priorStart = addDays(referenceDate, -(SUPPORT_WINDOW_DAYS * 2));

  const recent = client.tickets.filter(
    (t) => t.createdAt >= windowStart && t.createdAt < referenceDate,
  ).length;
  const prior = client.tickets.filter(
    (t) => t.createdAt >= priorStart && t.createdAt < windowStart,
  ).length;

  if (recent >= SUPPORT_SPIKE_MIN_TICKETS) {
    return true;
  }
  if (prior >= 1 && recent >= prior * SUPPORT_SPIKE_MULTIPLIER) {
    return true;
  }
  return false;
}

function isStuckOnboarding(client: MetricClient, referenceDate: Date): boolean {
  if (client.status !== "onboarding") {
    return false;
  }
  if (client.liveAt) {
    return false;
  }
  return daysBetween(referenceDate, client.signupAt) >= STUCK_ONBOARDING_DAYS;
}

function hasNoLogin(client: MetricClient, referenceDate: Date): boolean {
  if (!client.lastLoginAt) {
    return true;
  }
  return daysBetween(referenceDate, client.lastLoginAt) > NO_LOGIN_DAYS;
}

export function scoreClientHealth(
  client: MetricClient,
  referenceDate: Date,
): { score: number; signals: HealthSignal[] } {
  const signals: HealthSignal[] = [];

  if (hasZeroLeadsRecently(client, referenceDate)) {
    signals.push("zero_leads_recently");
  }
  if (hasFallingLeads(client, referenceDate)) {
    signals.push("falling_leads");
  }
  if (hasFailedPayment(client)) {
    signals.push("failed_payment");
  }
  if (hasSupportSpike(client, referenceDate)) {
    signals.push("support_spike");
  }
  if (isStuckOnboarding(client, referenceDate)) {
    signals.push("stuck_onboarding");
  }
  if (hasNoLogin(client, referenceDate)) {
    signals.push("no_login");
  }

  const penalty = signals.reduce((sum, signal) => sum + PENALTIES[signal], 0);
  const score = Math.max(0, 100 - penalty);
  return { score, signals };
}

export function buildAtRiskList(
  clients: MetricClient[],
  referenceDate: Date,
  limit = 15,
): AtRiskClient[] {
  return clients
    .filter(isRetained)
    .map((client) => {
      const { score, signals } = scoreClientHealth(client, referenceDate);
      return {
        clientId: client.id,
        businessName: client.businessName,
        trade: client.trade,
        score,
        signals,
      };
    })
    .filter((row) => row.signals.length > 0)
    .sort(
      (a, b) =>
        a.score - b.score || a.businessName.localeCompare(b.businessName),
    )
    .slice(0, limit);
}
