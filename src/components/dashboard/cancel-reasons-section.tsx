"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import {
  ChartFrame,
  chartHeightForRows,
} from "@/components/dashboard/chart-frame";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatEnumLabel, formatPercent } from "@/lib/format";
import type { CancelReasonRow } from "@/lib/metrics/types";

type CancelReasonsSectionProps = {
  reasons: CancelReasonRow[];
  feedback: CancelReasonRow[];
};

export function CancelReasonsSection({
  reasons,
  feedback,
}: CancelReasonsSectionProps) {
  const feedbackChart = feedback.map((row) => ({
    key: formatEnumLabel(row.key),
    count: row.count,
  }));

  const expensive = feedback.find((row) => row.key === "too_expensive");
  const quality = feedback.find((row) => row.key === "low_quality");
  const unused = feedback.find((row) => row.key === "unused");

  return (
    <Card id="cancel-reasons" className="scroll-mt-20">
      <CardHeader className="pb-3">
        <CardTitle>Cancel reasons</CardTitle>
        <CardDescription>
          What leavers told us — price, quality, or usage.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid items-start gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Too expensive</p>
              <p className="text-lg font-semibold">
                {formatPercent(expensive?.share ?? 0)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Low quality</p>
              <p className="text-lg font-semibold">
                {formatPercent(quality?.share ?? 0)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Unused</p>
              <p className="text-lg font-semibold">
                {formatPercent(unused?.share ?? 0)}
              </p>
            </div>
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {reasons.map((row) => (
              <li key={row.key}>
                <span className="font-medium text-foreground">
                  {formatEnumLabel(row.key)}
                </span>
                : {row.count} ({formatPercent(row.share)})
              </li>
            ))}
          </ul>
        </div>
        <ChartFrame
          height={Math.max(
            280,
            chartHeightForRows(feedbackChart.length, 52, 64),
          )}
        >
          <BarChart
            data={feedbackChart}
            margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="key"
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-18}
              textAnchor="end"
              height={64}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <Tooltip />
            <Bar
              dataKey="count"
              name="Cancels"
              fill="var(--color-chart-4)"
              radius={4}
            />
          </BarChart>
        </ChartFrame>
      </CardContent>
    </Card>
  );
}
