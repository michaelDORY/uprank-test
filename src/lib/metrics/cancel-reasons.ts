import type { CancelReasonRow, MetricClient } from "@/lib/metrics/types";

export function buildCancelReasons(clients: MetricClient[]): {
  reasons: CancelReasonRow[];
  feedback: CancelReasonRow[];
} {
  const reasonCounts = new Map<string, number>();
  const feedbackCounts = new Map<string, number>();
  let canceledSubs = 0;

  for (const client of clients) {
    for (const sub of client.customer?.subscriptions ?? []) {
      if (sub.status !== "canceled" && !sub.canceledAt) {
        continue;
      }
      canceledSubs += 1;

      const reason = sub.cancellationReason ?? "unknown";
      reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);

      const feedback = sub.cancellationFeedback ?? "none";
      feedbackCounts.set(feedback, (feedbackCounts.get(feedback) ?? 0) + 1);
    }
  }

  const toRows = (
    counts: Map<string, number>,
    kind: "reason" | "feedback",
  ): CancelReasonRow[] =>
    [...counts.entries()]
      .map(([key, count]) => ({
        key,
        kind,
        count,
        share: canceledSubs === 0 ? 0 : count / canceledSubs,
      }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));

  return {
    reasons: toRows(reasonCounts, "reason"),
    feedback: toRows(feedbackCounts, "feedback"),
  };
}
