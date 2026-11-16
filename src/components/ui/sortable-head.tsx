"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortDir = "asc" | "desc";

type SortableHeadProps<T extends string> = {
  label: string;
  column: T;
  activeColumn: T;
  direction: SortDir;
  onSort: (column: T) => void;
  align?: "left" | "right";
  className?: string;
};

export function SortableHead<T extends string>({
  label,
  column,
  activeColumn,
  direction,
  onSort,
  align = "left",
  className,
}: SortableHeadProps<T>) {
  const active = activeColumn === column;
  return (
    <TableHead
      className={cn(align === "right" && "text-right", className)}
      aria-sort={
        active ? (direction === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <button
        type="button"
        className={cn(
          "inline-flex cursor-pointer items-center gap-1 rounded-sm font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          align === "right" && "flex-row-reverse",
          active ? "text-foreground" : "text-muted-foreground",
        )}
        onClick={() => onSort(column)}
      >
        {label}
        {active ? (
          direction === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 opacity-40" />
        )}
      </button>
    </TableHead>
  );
}
