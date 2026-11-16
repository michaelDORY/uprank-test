"use client";

import { CircleHelp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type AssumptionTopic =
  "health-score" | "retention-timing" | "ads-impact";

const TOPICS: Record<
  AssumptionTopic,
  { title: string; summary: string; body: React.ReactNode }
> = {
  "health-score": {
    title: "How we pick who needs attention",
    summary:
      "Health is a score we invent from warning signs — not one raw number from billing or product.",
    body: (
      <>
        <p>
          Every client starts at <strong>100</strong>. Each warning sign
          subtracts points. Lower score = call sooner. Only clients with at
          least one warning appear on this list.
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-4">
          <li>Zero leads recently (−25)</li>
          <li>Falling leads (−20)</li>
          <li>Failed payment (−30)</li>
          <li>Support spike (−15)</li>
          <li>Stuck in onboarding (−25)</li>
          <li>No recent login (−15)</li>
        </ul>
        <p className="mt-3 text-muted-foreground">
          Colour bands: 80+ healthy · 60–79 mild · 40–59 watch · under 40
          critical. Use this as a priority queue, not a prediction that someone
          will churn.
        </p>
      </>
    ),
  },
  "retention-timing": {
    title: "What leave timing usually means",
    summary:
      "This is our reading of the pattern — useful context, not a proven rule for every client.",
    body: (
      <>
        <p>
          When someone leaves in months <strong>1–3</strong>, it often points to
          onboarding or mismatched expectations.
        </p>
        <p className="mt-2">
          When they leave after <strong>6+ months</strong>, it more often points
          to results or perceived value.
        </p>
        <p className="mt-3 text-muted-foreground">
          The retention % and bar counts are measured. The “why” next to them is
          judgment — treat it as a prompt for the team, not a fact.
        </p>
      </>
    ),
  },
  "ads-impact": {
    title: "How to read the ads comparison",
    summary:
      "We compare stay-rates with vs without the ads add-on. Useful signal — not proof ads cause people to stay.",
    body: (
      <>
        <p>
          Clients who buy ads may already be more engaged or on different plans.
          A higher stay-rate with ads can mean the add-on helps — or that better
          clients choose ads.
        </p>
        <p className="mt-3 text-muted-foreground">
          Use the gap to decide whether to investigate further (sales pitch,
          packaging, support), not as a guarantee that pushing ads will lift
          retention.
        </p>
      </>
    ),
  },
};

type AssumptionHelpProps = {
  topic: AssumptionTopic;
  className?: string;
};

/** Violet ? control — opens a plain-language explanation modal. */
export function AssumptionHelp({ topic, className }: AssumptionHelpProps) {
  const content = TOPICS[topic];

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(
              "size-7 shrink-0 cursor-pointer text-[var(--assumption-from)] hover:bg-[color-mix(in_srgb,var(--assumption-from)_12%,transparent)] hover:text-[var(--assumption-to)]",
              className,
            )}
            aria-label={`Explain: ${content.title}`}
          >
            <CircleHelp className="size-4" strokeWidth={2.25} />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{content.title}</DialogTitle>
          <DialogDescription>{content.summary}</DialogDescription>
        </DialogHeader>
        <div className="text-sm leading-relaxed text-foreground">
          {content.body}
        </div>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="secondary" />}>
            Got it
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type AssumptionFrameProps = {
  children: React.ReactNode;
  className?: string;
};

/** Soft violet–pink frame for judgment / interpretation surfaces. */
export function AssumptionFrame({ children, className }: AssumptionFrameProps) {
  return (
    <div
      className={cn("rounded-xl p-px", className)}
      style={{
        backgroundImage:
          "linear-gradient(120deg, var(--assumption-from), var(--assumption-to))",
      }}
    >
      <div className="rounded-[calc(var(--radius-xl)-1px)] bg-card">
        {children}
      </div>
    </div>
  );
}
