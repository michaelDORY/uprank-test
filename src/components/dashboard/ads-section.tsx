import {
  AssumptionFrame,
  AssumptionHelp,
} from "@/components/dashboard/assumption-mark";
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
  signedDeltaCriticality,
} from "@/lib/criticality";
import { formatPercent } from "@/lib/format";
import type { AdsImpactSummary } from "@/lib/metrics/types";
import { cn } from "@/lib/utils";

type AdsSectionProps = {
  adsImpact: AdsImpactSummary;
};

export function AdsSection({ adsImpact }: AdsSectionProps) {
  const delta =
    adsImpact.withAds.retentionRate - adsImpact.withoutAds.retentionRate;
  const level = signedDeltaCriticality(delta);

  return (
    <AssumptionFrame>
      <Card id="ads-impact" className="scroll-mt-20 ring-0">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <CardTitle>Ads add-on</CardTitle>
            <AssumptionHelp topic="ads-impact" />
          </div>
          <CardDescription>
            Do clients with ads stay longer than those without?
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-primary/15 bg-secondary/60 p-4">
            <p className="text-sm text-muted-foreground">With ads</p>
            <p className="mt-1 font-heading text-2xl font-bold text-[var(--uprank-navy)]">
              {formatPercent(adsImpact.withAds.retentionRate)}
            </p>
            <p className="text-sm text-muted-foreground">
              {adsImpact.withAds.retainedCount} of{" "}
              {adsImpact.withAds.clientCount} still with us
            </p>
          </div>
          <div className="rounded-xl border bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">Without ads</p>
            <p className="mt-1 font-heading text-2xl font-bold text-[var(--uprank-navy)]">
              {formatPercent(adsImpact.withoutAds.retentionRate)}
            </p>
            <p className="text-sm text-muted-foreground">
              {adsImpact.withoutAds.retainedCount} of{" "}
              {adsImpact.withoutAds.clientCount} still with us
            </p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">Difference</p>
              <CriticalityBadge level={level}>
                {criticalityLabel(level)}
              </CriticalityBadge>
            </div>
            <p
              className={cn(
                "mt-1 font-heading text-2xl font-bold",
                CRITICALITY_TEXT_CLASS[level],
              )}
            >
              {delta >= 0 ? "+" : ""}
              {formatPercent(delta)}
            </p>
            <p className="text-sm text-muted-foreground">With ads vs without</p>
          </div>
        </CardContent>
      </Card>
    </AssumptionFrame>
  );
}
