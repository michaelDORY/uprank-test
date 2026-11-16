import { tradeLabel } from "@/lib/metrics/subscriptions";
import {
  SMALL_SAMPLE_THRESHOLD,
  type MetricClient,
  type TradeLeadsRow,
} from "@/lib/metrics/types";
import { priorMonthKey } from "@/lib/reference-date";

export function buildLeadsByTrade(
  clients: MetricClient[],
  referenceDate: Date,
): TradeLeadsRow[] {
  const lastCompleteMonth = priorMonthKey(referenceDate, 1);
  const groups = new Map<
    string,
    { clientCount: number; leadSum: number; monthSum: number }
  >();

  for (const client of clients) {
    if (!client.liveAt) {
      continue;
    }

    const eligibleMonths = client.leads.filter(
      (row) => row.month <= lastCompleteMonth,
    );
    if (eligibleMonths.length === 0) {
      continue;
    }

    const trade = tradeLabel(client.trade);
    const existing = groups.get(trade) ?? {
      clientCount: 0,
      leadSum: 0,
      monthSum: 0,
    };
    existing.clientCount += 1;
    existing.leadSum += eligibleMonths.reduce((sum, row) => sum + row.leads, 0);
    existing.monthSum += eligibleMonths.length;
    groups.set(trade, existing);
  }

  return [...groups.entries()]
    .map(([trade, stats]) => ({
      trade,
      clientCount: stats.clientCount,
      avgLeadsPerClientPerMonth: Number(
        (stats.monthSum === 0 ? 0 : stats.leadSum / stats.monthSum).toFixed(2),
      ),
      smallSample: stats.clientCount < SMALL_SAMPLE_THRESHOLD,
    }))
    .sort(
      (a, b) =>
        b.avgLeadsPerClientPerMonth - a.avgLeadsPerClientPerMonth ||
        a.trade.localeCompare(b.trade),
    );
}
