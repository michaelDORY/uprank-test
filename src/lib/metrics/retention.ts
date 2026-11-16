import {
  isRetained,
  pickPrimarySubscription,
} from "@/lib/metrics/subscriptions";
import type {
  MetricClient,
  RetentionBucket,
  RetentionSummary,
} from "@/lib/metrics/types";
import { monthsBetween } from "@/lib/reference-date";

function bucketForMonths(months: number): RetentionBucket {
  if (months <= 3) {
    return "1-3";
  }
  if (months <= 6) {
    return "4-6";
  }
  return "6+";
}

export function buildRetentionSummary(
  clients: MetricClient[],
  referenceDate: Date,
): RetentionSummary {
  const leaveTiming: Record<RetentionBucket, number> = {
    "1-3": 0,
    "4-6": 0,
    "6+": 0,
  };

  let retainedCount = 0;
  let churnedCount = 0;

  for (const client of clients) {
    if (isRetained(client)) {
      retainedCount += 1;
      continue;
    }

    churnedCount += 1;
    const sub = pickPrimarySubscription(client);
    if (sub?.canceledAt) {
      leaveTiming[
        bucketForMonths(monthsBetween(sub.canceledAt, sub.startDate))
      ] += 1;
    } else {
      leaveTiming[
        bucketForMonths(monthsBetween(referenceDate, client.signupAt))
      ] += 1;
    }
  }

  const totalClients = clients.length;

  return {
    totalClients,
    retainedCount,
    churnedCount,
    retentionRate: totalClients === 0 ? 0 : retainedCount / totalClients,
    leaveTiming,
  };
}
