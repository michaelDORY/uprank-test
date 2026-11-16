import type { ReactElement } from "react";
import { ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

/** Default Recharts margins — tight; category labels use axis width, not left margin. */
export const CHART_MARGIN = { top: 0, right: 8, bottom: 0, left: 0 } as const;

export const CHART_CATEGORY_AXIS_WIDTH = 100;

/** Compact height for horizontal bar charts (rowPx includes bar + gap). */
export function chartHeightForRows(rowCount: number, rowPx = 32, axisPx = 28) {
  return Math.max(rowCount, 1) * rowPx + axisPx;
}

type ChartFrameProps = {
  /** Fixed height. Prefer `fill` when aligning to a sibling table. */
  height?: number;
  /** Stretch to parent height (parent must be positioned / stretched). */
  fill?: boolean;
  className?: string;
  children: ReactElement;
};

export function ChartFrame({
  height,
  fill = false,
  className,
  children,
}: ChartFrameProps) {
  if (fill) {
    return (
      <div className={cn("absolute inset-0 min-w-0", className)}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div
      className={cn("w-full min-w-0", className)}
      style={{ height: height ?? 200 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
