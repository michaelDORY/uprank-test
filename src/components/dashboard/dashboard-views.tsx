"use client";

import { Suspense, useCallback, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  AppSidebar,
  type DashboardSectionId,
} from "@/components/dashboard/app-sidebar";
import { AdsSection } from "@/components/dashboard/ads-section";
import { AtRiskSection } from "@/components/dashboard/at-risk-section";
import { CancelReasonsSection } from "@/components/dashboard/cancel-reasons-section";
import { KpiStrip } from "@/components/dashboard/kpi-strip";
import { LeadsSection } from "@/components/dashboard/leads-section";
import { RetentionSection } from "@/components/dashboard/retention-section";
import { RevenueSection } from "@/components/dashboard/revenue-section";
import { SyncButton } from "@/components/dashboard/sync-button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DEFAULT_RISK_LIMIT,
  DEFAULT_TRADE,
  parseRiskLimitParam,
  parseTradeParam,
} from "@/lib/dashboard/filters";
import type { DashboardPayload } from "@/lib/dashboard/types";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type DashboardViewsProps = {
  payload: DashboardPayload;
  busy?: boolean;
  onBusyChange?: (busy: boolean) => void;
};

function DashboardViewsInner({
  payload,
  busy = false,
  onBusyChange,
}: DashboardViewsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [activeSection, setActiveSection] =
    useState<DashboardSectionId>("overview");
  const { metrics, lastSync } = payload;

  const tradeOptions = useMemo(() => {
    const set = new Set<string>();
    for (const row of metrics.leadsByTrade) {
      set.add(row.trade);
    }
    for (const row of metrics.revenueByTrade) {
      set.add(row.trade);
    }
    for (const row of metrics.atRisk) {
      if (row.trade) {
        set.add(row.trade);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [metrics]);

  const trade = parseTradeParam(searchParams.get("trade"));
  const riskLimit = parseRiskLimitParam(searchParams.get("riskLimit"));
  const activeTrade = tradeOptions.includes(trade) ? trade : DEFAULT_TRADE;

  const updateParams = useCallback(
    (patch: { trade?: string; riskLimit?: string }) => {
      const next = new URLSearchParams(searchParams.toString());
      const nextTrade = patch.trade ?? activeTrade;
      const nextRisk = patch.riskLimit ?? String(riskLimit);

      if (nextTrade === DEFAULT_TRADE) {
        next.delete("trade");
      } else {
        next.set("trade", nextTrade);
      }

      if (Number(nextRisk) === DEFAULT_RISK_LIMIT) {
        next.delete("riskLimit");
      } else {
        next.set("riskLimit", nextRisk);
      }

      const query = next.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    [activeTrade, pathname, riskLimit, router, searchParams],
  );

  const atRisk = useMemo(() => {
    const filtered =
      activeTrade === DEFAULT_TRADE
        ? metrics.atRisk
        : metrics.atRisk.filter((row) => row.trade === activeTrade);
    return filtered.slice(0, riskLimit);
  }, [activeTrade, metrics.atRisk, riskLimit]);

  const leadsByTrade = useMemo(() => {
    if (activeTrade === DEFAULT_TRADE) {
      return metrics.leadsByTrade;
    }
    return metrics.leadsByTrade.filter((row) => row.trade === activeTrade);
  }, [activeTrade, metrics.leadsByTrade]);

  const revenueByTrade = useMemo(() => {
    if (activeTrade === DEFAULT_TRADE) {
      return metrics.revenueByTrade;
    }
    return metrics.revenueByTrade.filter((row) => row.trade === activeTrade);
  }, [activeTrade, metrics.revenueByTrade]);

  function navigate(id: string) {
    const sidebarId: DashboardSectionId =
      id === "ads-impact" || id === "cancel-reasons"
        ? "ads-cancels"
        : id === "needs-attention" ||
            id === "retention" ||
            id === "trade-performance" ||
            id === "overview" ||
            id === "ads-cancels"
          ? id
          : "overview";
    setActiveSection(sidebarId);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar
        activeSection={activeSection}
        onNavigate={navigate}
        className="sticky top-0 hidden h-screen md:flex"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur-sm sm:px-6">
          <div className="min-w-0">
            <h1 className="font-heading text-lg font-semibold tracking-tight text-[var(--uprank-navy)]">
              Operations
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              As of {formatDate(metrics.referenceDate)}
              {lastSync
                ? ` · Updated ${formatDateTime(lastSync.finishedAt)} · ${lastSync.clientCount} clients`
                : null}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {busy ? (
              <Badge variant="outline">Refreshing…</Badge>
            ) : (
              <Badge variant="secondary">Live</Badge>
            )}
            <SyncButton onBusyChange={onBusyChange} />
          </div>
        </header>

        <div
          className={cn(
            "flex flex-col gap-6 px-4 py-6 transition-opacity duration-300 animate-in fade-in sm:px-6",
            busy && "pointer-events-none opacity-60",
          )}
          aria-busy={busy}
        >
          <nav
            className="flex gap-2 overflow-x-auto pb-1 md:hidden"
            aria-label="Sections"
          >
            {(
              [
                ["overview", "Overview"],
                ["needs-attention", "Attention"],
                ["retention", "Retention"],
                ["trade-performance", "Trades"],
                ["ads-cancels", "Ads"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => navigate(id)}
                className={cn(
                  "shrink-0 cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  activeSection === id
                    ? "border-primary/30 bg-secondary text-secondary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                {label}
              </button>
            ))}
          </nav>

          <KpiStrip
            metrics={metrics}
            atRiskCount={atRisk.length}
            onNavigate={navigate}
          />

          <AtRiskSection
            rows={atRisk}
            trades={tradeOptions}
            trade={activeTrade}
            riskLimit={riskLimit}
            onTradeChange={(value) => updateParams({ trade: value })}
            onRiskLimitChange={(value) => updateParams({ riskLimit: value })}
            filtersPending={isPending}
          />

          <RetentionSection retention={metrics.retention} />

          <section id="trade-performance" className="scroll-mt-20 space-y-4">
            <Tabs defaultValue="leads">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--uprank-navy)]">
                  Trade performance
                </h2>
                <TabsList>
                  <TabsTrigger value="leads">Leads</TabsTrigger>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="leads" className="mt-4">
                <LeadsSection rows={leadsByTrade} />
              </TabsContent>
              <TabsContent value="revenue" className="mt-4">
                <RevenueSection rows={revenueByTrade} />
              </TabsContent>
            </Tabs>
          </section>

          <section id="ads-cancels" className="scroll-mt-20 space-y-4">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--uprank-navy)]">
              Ads & cancels
            </h2>
            <AdsSection adsImpact={metrics.adsImpact} />
            <CancelReasonsSection
              reasons={metrics.cancelReasons}
              feedback={metrics.cancelFeedback}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

export function DashboardViews(props: DashboardViewsProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full">
          <Skeleton className="hidden h-screen w-56 md:block" />
          <div className="flex-1 space-y-4 p-6">
            <Skeleton className="h-14 w-full" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      }
    >
      <DashboardViewsInner {...props} />
    </Suspense>
  );
}
