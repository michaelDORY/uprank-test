import type { CriticalityLevel } from "@/lib/criticality";
import { CRITICALITY_BG_CLASS } from "@/lib/criticality";
import { cn } from "@/lib/utils";

type CriticalityBadgeProps = {
  level: CriticalityLevel;
  children: React.ReactNode;
  className?: string;
};

export function CriticalityBadge({
  level,
  children,
  className,
}: CriticalityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-w-8 items-center justify-center rounded-md px-1.5 py-0.5 text-sm font-semibold tabular-nums",
        CRITICALITY_BG_CLASS[level],
        className,
      )}
    >
      {children}
    </span>
  );
}
