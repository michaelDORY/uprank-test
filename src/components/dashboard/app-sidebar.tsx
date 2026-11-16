"use client";

import {
  AlertTriangle,
  BarChart3,
  LayoutDashboard,
  Megaphone,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const DASHBOARD_SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "needs-attention", label: "Needs attention", icon: AlertTriangle },
  { id: "retention", label: "Retention", icon: Users },
  { id: "trade-performance", label: "Trade performance", icon: BarChart3 },
  { id: "ads-cancels", label: "Ads & cancels", icon: Megaphone },
] as const;

export type DashboardSectionId = (typeof DASHBOARD_SECTIONS)[number]["id"];

type AppSidebarProps = {
  activeSection: DashboardSectionId;
  onNavigate: (id: DashboardSectionId) => void;
  className?: string;
};

export function AppSidebar({
  activeSection,
  onNavigate,
  className,
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "flex w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <span className="size-2 rounded-full bg-sidebar-primary" aria-hidden />
        <span className="font-heading text-lg font-semibold tracking-tight text-[var(--uprank-navy)]">
          UpRank
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Dashboard">
        {DASHBOARD_SECTIONS.map(({ id, label, icon: Icon }) => {
          const active = activeSection === id;
          return (
            <Button
              key={id}
              type="button"
              variant="ghost"
              className={cn(
                "h-9 w-full cursor-pointer justify-start gap-2 px-2.5 font-medium",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
              )}
              onClick={() => onNavigate(id)}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Button>
          );
        })}
      </nav>
      <p className="border-t border-sidebar-border px-4 py-3 text-xs text-muted-foreground">
        Operations
      </p>
    </aside>
  );
}
