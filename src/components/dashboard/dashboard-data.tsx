import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { loadDashboard } from "@/lib/dashboard/load-dashboard";

export async function DashboardData() {
  const payload = await loadDashboard();
  return <DashboardShell payload={payload} />;
}
