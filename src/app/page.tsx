import { Suspense } from "react";

import { DashboardData } from "@/components/dashboard/dashboard-data";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-skeleton";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <DashboardData />
    </Suspense>
  );
}
