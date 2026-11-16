"use client";

import { ChevronRight } from "lucide-react";

import { CriticalityBadge } from "@/components/dashboard/criticality-badge";
import {
  CRITICALITY_TEXT_CLASS,
  criticalityLabel,
  rateCriticality,
  signedDeltaCriticality,
  type CriticalityLevel,
} from "@/lib/criticality";
import { formatEnumLabel, formatPercent } from "@/lib/format";
import type { DashboardMetrics } from "@/lib/metrics";
import { cn } from "@/lib/utils";

type KpiStripProps = {
  metrics: DashboardMetrics;
  atRiskCount: number;
  onNavigate: (sectionId: string) => void;
};

type KpiTile = {
  label: string;
  value: string;
  hint: string;
  section: string;
  level?: CriticalityLevel;
};

export function KpiStrip({ metrics, atRiskCount, onNavigate }: KpiStripProps) {
  const adsDelta =
    metrics.adsImpact.withAds.retentionRate -
    metrics.adsImpact.withoutAds.retentionRate;
  const topCancel = metrics.cancelFeedback[0];
  const retentionLevel = rateCriticality(metrics.retention.retentionRate);
  const adsLevel = signedDeltaCriticality(adsDelta);
  const attentionLevel: CriticalityLevel =
    atRiskCount === 0 ? "good" : atRiskCount <= 5 ? "warn" : "bad";

  const tiles: KpiTile[] = [
    {
      label: "Needs attention",
      value: String(atRiskCount),
      hint: "Clients to review",
      section: "needs-attention",
      level: attentionLevel,
    },
    {
      label: "Retention",
      value: formatPercent(metrics.retention.retentionRate),
      hint: `${metrics.retention.retainedCount} kept · ${metrics.retention.churnedCount} left`,
      section: "retention",
      level: retentionLevel,
    },
    {
      label: "Ads retention gap",
      value: `${adsDelta >= 0 ? "+" : ""}${formatPercent(adsDelta)}`,
      hint: "With ads vs without",
      section: "ads-impact",
      level: adsLevel,
    },
    {
      label: "Top cancel reason",
      value: topCancel ? formatPercent(topCancel.share) : "—",
      hint: topCancel ? formatEnumLabel(topCancel.key) : "No feedback yet",
      section: "cancel-reasons",
    },
  ];

  return (
    <section
      id="overview"
      className="grid scroll-mt-20 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {tiles.map((tile) => (
        <button
          key={tile.label}
          type="button"
          onClick={() => onNavigate(tile.section)}
          aria-label={`${tile.label}: open details`}
          className={cn(
            "group relative cursor-pointer rounded-xl border border-border/80 bg-card px-4 py-3 pr-16 text-left shadow-sm transition-all",
            "hover:border-primary/35 hover:bg-secondary/40 hover:shadow-md",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
            "active:scale-[0.99]",
          )}
        >
          <p className="text-xs font-medium text-muted-foreground">
            {tile.label}
          </p>
          <p
            className={cn(
              "mt-1 font-heading text-2xl font-bold tracking-tight",
              tile.level
                ? CRITICALITY_TEXT_CLASS[tile.level]
                : "text-[var(--uprank-navy)]",
            )}
          >
            {tile.value}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{tile.hint}</p>
          {tile.level ? (
            <CriticalityBadge
              level={tile.level}
              className="absolute top-3 right-3 text-[10px]"
            >
              {criticalityLabel(tile.level)}
            </CriticalityBadge>
          ) : null}
          <ChevronRight
            aria-hidden
            className="absolute right-3 bottom-3 size-4 text-muted-foreground/45 transition-all group-hover:translate-x-0.5 group-hover:text-primary"
          />
        </button>
      ))}
    </section>
  );
}
