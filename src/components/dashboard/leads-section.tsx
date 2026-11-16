"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import {
  CHART_CATEGORY_AXIS_WIDTH,
  CHART_MARGIN,
  ChartFrame,
} from "@/components/dashboard/chart-frame";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SortableHead, type SortDir } from "@/components/ui/sortable-head";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatEnumLabel, formatNumber } from "@/lib/format";
import type { TradeLeadsRow } from "@/lib/metrics/types";

type SortKey = "trade" | "clients" | "leads";

type LeadsSectionProps = {
  rows: TradeLeadsRow[];
};

export function LeadsSection({ rows }: LeadsSectionProps) {
  const [sortKey, setSortKey] = useState<SortKey>("leads");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(column: SortKey) {
    if (sortKey === column) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(column);
    setSortDir(column === "trade" ? "asc" : "desc");
  }

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "trade":
          cmp = a.trade.localeCompare(b.trade);
          break;
        case "clients":
          cmp = a.clientCount - b.clientCount;
          break;
        case "leads":
          cmp = a.avgLeadsPerClientPerMonth - b.avgLeadsPerClientPerMonth;
          break;
        default: {
          const _exhaustive: never = sortKey;
          return _exhaustive;
        }
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortDir, sortKey]);

  const chartRows = sorted.map((row) => ({
    ...row,
    tradeLabel:
      row.trade === "Unknown" ? "Unknown trade" : formatEnumLabel(row.trade),
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Leads by trade</CardTitle>
        <CardDescription>
          Average leads per client per month. Limited data means few clients.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <div className="relative min-h-[240px] w-full lg:min-h-0">
          <ChartFrame fill>
            <BarChart
              data={chartRows}
              layout="vertical"
              margin={CHART_MARGIN}
              barCategoryGap="12%"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                height={24}
              />
              <YAxis
                type="category"
                dataKey="tradeLabel"
                width={CHART_CATEGORY_AXIS_WIDTH}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip />
              <Bar
                dataKey="avgLeadsPerClientPerMonth"
                name="Avg leads / month"
                fill="var(--color-chart-2)"
                radius={4}
                maxBarSize={28}
              />
            </BarChart>
          </ChartFrame>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead
                label="Trade"
                column="trade"
                activeColumn={sortKey}
                direction={sortDir}
                onSort={toggleSort}
              />
              <SortableHead
                label="Clients"
                column="clients"
                activeColumn={sortKey}
                direction={sortDir}
                onSort={toggleSort}
                align="right"
              />
              <SortableHead
                label="Avg leads / mo"
                column="leads"
                activeColumn={sortKey}
                direction={sortDir}
                onSort={toggleSort}
                align="right"
              />
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => (
              <TableRow key={row.trade}>
                <TableCell className="font-medium">
                  {row.trade === "Unknown"
                    ? "Unknown trade"
                    : formatEnumLabel(row.trade)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.clientCount}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(row.avgLeadsPerClientPerMonth, 2)}
                </TableCell>
                <TableCell>
                  {row.smallSample ? (
                    <Badge variant="outline">Limited data</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
