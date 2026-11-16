"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { AssumptionHelp } from "@/components/dashboard/assumption-mark";
import { CriticalityBadge } from "@/components/dashboard/criticality-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortableHead, type SortDir } from "@/components/ui/sortable-head";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_TRADE, RISK_LIMIT_OPTIONS } from "@/lib/dashboard/filters";
import { healthCriticality } from "@/lib/criticality";
import { formatEnumLabel, signalLabel } from "@/lib/format";
import type { AtRiskClient, HealthSignal } from "@/lib/metrics/types";
import { cn } from "@/lib/utils";

const ALL_SIGNALS: HealthSignal[] = [
  "zero_leads_recently",
  "falling_leads",
  "failed_payment",
  "support_spike",
  "stuck_onboarding",
  "no_login",
];

type SortKey = "score" | "name" | "trade";

type AtRiskSectionProps = {
  rows: AtRiskClient[];
  trades: string[];
  trade: string;
  riskLimit: number;
  onTradeChange: (trade: string) => void;
  onRiskLimitChange: (limit: string) => void;
  filtersPending?: boolean;
};

export function AtRiskSection({
  rows,
  trades,
  trade,
  riskLimit,
  onTradeChange,
  onRiskLimitChange,
  filtersPending = false,
}: AtRiskSectionProps) {
  const [query, setQuery] = useState("");
  const [signalFilter, setSignalFilter] = useState<HealthSignal | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const tradeItems = [
    { value: DEFAULT_TRADE, label: "All trades" },
    ...trades.map((value) => ({
      value,
      label: value === "Unknown" ? "Unknown trade" : formatEnumLabel(value),
    })),
  ];

  const riskItems = RISK_LIMIT_OPTIONS.map((value) => ({
    value: String(value),
    label: `Top ${value}`,
  }));

  const signalItems = [
    { value: "all", label: "All signals" },
    ...ALL_SIGNALS.map((value) => ({
      value,
      label: signalLabel(value),
    })),
  ];

  function toggleSort(column: SortKey) {
    if (sortKey === column) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(column);
    setSortDir(column === "score" ? "asc" : "asc");
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let next = rows;
    if (q) {
      next = next.filter((row) => row.businessName.toLowerCase().includes(q));
    }
    if (signalFilter !== "all") {
      next = next.filter((row) => row.signals.includes(signalFilter));
    }
    const sorted = [...next].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "score":
          cmp = a.score - b.score;
          break;
        case "name":
          cmp = a.businessName.localeCompare(b.businessName);
          break;
        case "trade":
          cmp = (a.trade ?? "").localeCompare(b.trade ?? "");
          break;
        default: {
          const _exhaustive: never = sortKey;
          return _exhaustive;
        }
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [query, rows, signalFilter, sortDir, sortKey]);

  return (
    <Card id="needs-attention" className="scroll-mt-20">
      <CardHeader className="gap-4 border-b pb-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <CardTitle>Needs attention</CardTitle>
              <AssumptionHelp topic="health-score" />
            </div>
            <CardDescription>
              Clients most likely to leave — work this list first.
            </CardDescription>
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">
            Showing {visible.length}
            {rows.length !== visible.length ? ` of ${rows.length}` : ""}
          </p>
        </div>

        <div
          className={cn(
            "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
            filtersPending && "opacity-70",
          )}
        >
          <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
            <Label htmlFor="at-risk-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="at-risk-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Client name"
                className="pl-8"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="trade-filter">Trade</Label>
            <Select
              value={trade}
              onValueChange={(value) => {
                if (typeof value === "string") {
                  onTradeChange(value);
                }
              }}
              disabled={filtersPending}
              items={tradeItems}
            >
              <SelectTrigger id="trade-filter" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tradeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="risk-filter">List size</Label>
            <Select
              value={String(riskLimit)}
              onValueChange={(value) => {
                if (typeof value === "string") {
                  onRiskLimitChange(value);
                }
              }}
              disabled={filtersPending}
              items={riskItems}
            >
              <SelectTrigger id="risk-filter" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {riskItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="signal-filter">Signal</Label>
            <Select
              value={signalFilter}
              onValueChange={(value) => {
                if (typeof value === "string") {
                  setSignalFilter(value as HealthSignal | "all");
                }
              }}
              items={signalItems}
            >
              <SelectTrigger id="signal-filter" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {signalItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {(query || signalFilter !== "all") && (
          <div className="flex flex-wrap items-center gap-2">
            {query ? <Badge variant="secondary">Search: {query}</Badge> : null}
            {signalFilter !== "all" ? (
              <Badge variant="secondary">{signalLabel(signalFilter)}</Badge>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="cursor-pointer"
              onClick={() => {
                setQuery("");
                setSignalFilter("all");
              }}
            >
              Clear local filters
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead
                label="Client"
                column="name"
                activeColumn={sortKey}
                direction={sortDir}
                onSort={toggleSort}
              />
              <SortableHead
                label="Trade"
                column="trade"
                activeColumn={sortKey}
                direction={sortDir}
                onSort={toggleSort}
              />
              <SortableHead
                label="Health"
                column="score"
                activeColumn={sortKey}
                direction={sortDir}
                onSort={toggleSort}
                align="right"
              />
              <TableHead>Why</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  No clients match these filters.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((row) => (
                <TableRow key={row.clientId}>
                  <TableCell className="font-medium">
                    {row.businessName}
                  </TableCell>
                  <TableCell>
                    {row.trade ? formatEnumLabel(row.trade) : "Unknown trade"}
                  </TableCell>
                  <TableCell className="text-right">
                    <CriticalityBadge level={healthCriticality(row.score)}>
                      {row.score}
                    </CriticalityBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {row.signals.map((signal) => (
                        <Badge key={signal} variant="secondary">
                          {signalLabel(signal)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
