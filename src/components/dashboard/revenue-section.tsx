"use client";

import { useMemo, useState } from "react";

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
import {
  formatAudFromCents,
  formatEnumLabel,
  formatMonths,
} from "@/lib/format";
import type { TradeRevenueRow } from "@/lib/metrics/types";

type SortKey = "trade" | "clients" | "mrr" | "months" | "ltv";

type RevenueSectionProps = {
  rows: TradeRevenueRow[];
};

export function RevenueSection({ rows }: RevenueSectionProps) {
  const [sortKey, setSortKey] = useState<SortKey>("ltv");
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
        case "mrr":
          cmp = a.avgMrrCents - b.avgMrrCents;
          break;
        case "months":
          cmp = a.avgMonthsRetained - b.avgMonthsRetained;
          break;
        case "ltv":
          cmp = a.avgLtvCents - b.avgLtvCents;
          break;
        default: {
          const _exhaustive: never = sortKey;
          return _exhaustive;
        }
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortDir, sortKey]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Revenue by trade</CardTitle>
        <CardDescription>
          Monthly revenue and lifetime value. Sort by lifetime value to see the
          best business.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                label="Monthly revenue"
                column="mrr"
                activeColumn={sortKey}
                direction={sortDir}
                onSort={toggleSort}
                align="right"
              />
              <SortableHead
                label="Avg months"
                column="months"
                activeColumn={sortKey}
                direction={sortDir}
                onSort={toggleSort}
                align="right"
              />
              <SortableHead
                label="Lifetime value"
                column="ltv"
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
                  {formatAudFromCents(row.avgMrrCents)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMonths(row.avgMonthsRetained)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {formatAudFromCents(row.avgLtvCents)}
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
