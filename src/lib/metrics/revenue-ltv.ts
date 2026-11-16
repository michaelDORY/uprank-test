import {
  pickPrimarySubscription,
  tradeLabel,
} from "@/lib/metrics/subscriptions";
import {
  SMALL_SAMPLE_THRESHOLD,
  type MetricClient,
  type TradeRevenueRow,
} from "@/lib/metrics/types";
import { monthsBetween } from "@/lib/reference-date";

function subscriptionMrrCents(
  subscription: NonNullable<ReturnType<typeof pickPrimarySubscription>>,
): number {
  return subscription.items.reduce(
    (sum, item) => sum + item.unitAmount * item.quantity,
    0,
  );
}

export function buildRevenueLtvByTrade(
  clients: MetricClient[],
  referenceDate: Date,
): TradeRevenueRow[] {
  const groups = new Map<
    string,
    { clientCount: number; mrrSum: number; monthsSum: number }
  >();

  for (const client of clients) {
    const sub = pickPrimarySubscription(client);
    if (!sub) {
      continue;
    }

    const mrr = subscriptionMrrCents(sub);
    const end = sub.canceledAt ?? referenceDate;
    const months = Math.max(monthsBetween(end, sub.startDate), 1 / 30);
    const trade = tradeLabel(client.trade);

    const existing = groups.get(trade) ?? {
      clientCount: 0,
      mrrSum: 0,
      monthsSum: 0,
    };
    existing.clientCount += 1;
    existing.mrrSum += mrr;
    existing.monthsSum += months;
    groups.set(trade, existing);
  }

  return [...groups.entries()]
    .map(([trade, stats]) => {
      const avgMrr = stats.mrrSum / stats.clientCount;
      const avgMonths = stats.monthsSum / stats.clientCount;
      return {
        trade,
        clientCount: stats.clientCount,
        avgMrrCents: Math.round(avgMrr),
        avgMonthsRetained: Number(avgMonths.toFixed(2)),
        avgLtvCents: Math.round(avgMrr * avgMonths),
        smallSample: stats.clientCount < SMALL_SAMPLE_THRESHOLD,
      };
    })
    .sort(
      (a, b) => b.avgLtvCents - a.avgLtvCents || a.trade.localeCompare(b.trade),
    );
}
