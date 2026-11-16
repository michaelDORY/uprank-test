"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { AssumptionHelp } from "@/components/dashboard/assumption-mark";
import { ChartFrame } from "@/components/dashboard/chart-frame";
import { CriticalityBadge } from "@/components/dashboard/criticality-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CRITICALITY_TEXT_CLASS,
  criticalityLabel,
  rateCriticality,
} from "@/lib/criticality";
import { formatPercent } from "@/lib/format";
import type { RetentionSummary } from "@/lib/metrics/types";
import { cn } from "@/lib/utils";

type RetentionSectionProps = {
  retention: RetentionSummary;
};

export function RetentionSection({ retention }: RetentionSectionProps) {
  const chartData = [
    { bucket: "1–3 mo", count: retention.leaveTiming["1-3"] },
    { bucket: "4–6 mo", count: retention.leaveTiming["4-6"] },
    { bucket: "6+ mo", count: retention.leaveTiming["6+"] },
  ];
  const level = rateCriticality(retention.retentionRate);

  return (
    <Card id="retention" className="scroll-mt-20">
      <CardHeader className="pb-3">
        <CardTitle>Retention</CardTitle>
        <CardDescription>
          How many stay, and when leavers typically drop off.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2 md:items-stretch">
        <div className="space-y-3">
          <p
            className={cn(
              "font-heading text-3xl font-bold tracking-tight",
              CRITICALITY_TEXT_CLASS[level],
            )}
          >
            {formatPercent(retention.retentionRate)}
          </p>
          <CriticalityBadge level={level}>
            {criticalityLabel(level)}
          </CriticalityBadge>
          <p className="text-sm text-muted-foreground">
            Still with us · {retention.retainedCount} kept ·{" "}
            {retention.churnedCount} left · {retention.totalClients} total
          </p>
          <div className="space-y-2 rounded-lg border border-dashed border-[color-mix(in_srgb,var(--assumption-from)_40%,transparent)] bg-[color-mix(in_srgb,var(--assumption-from)_8%,white)] p-3">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-xs font-medium text-[var(--assumption-from)]">
                Reading the timing
              </span>
              <AssumptionHelp topic="retention-timing" />
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>Months 1–3: onboarding or expectations.</li>
              <li>After 6+ months: results or value.</li>
            </ul>
          </div>
        </div>
        <div className="relative min-h-[180px] w-full md:min-h-0">
          <ChartFrame fill>
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              barCategoryGap="18%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="bucket"
                tickLine={false}
                axisLine={false}
                height={24}
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
                name="Clients"
                fill="var(--color-chart-3)"
                radius={4}
                maxBarSize={48}
              />
            </BarChart>
          </ChartFrame>
        </div>
      </CardContent>
    </Card>
  );
}
