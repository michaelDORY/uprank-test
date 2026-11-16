"use client";

import { useCallback, useState } from "react";

import { DashboardViews } from "@/components/dashboard/dashboard-views";
import type { DashboardPayload } from "@/lib/dashboard/types";

type DashboardShellProps = {
  payload: DashboardPayload;
};

export function DashboardShell({ payload }: DashboardShellProps) {
  const [busy, setBusy] = useState(false);
  const onBusyChange = useCallback((next: boolean) => {
    setBusy(next);
  }, []);

  return (
    <DashboardViews payload={payload} busy={busy} onBusyChange={onBusyChange} />
  );
}
