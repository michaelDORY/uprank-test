import { getCachedDashboard, setCachedDashboard } from "@/lib/dashboard/cache";
import type { DashboardPayload } from "@/lib/dashboard/types";
import { prisma } from "@/lib/db";
import { computeDashboardMetrics } from "@/lib/metrics";
import type { MetricClient } from "@/lib/metrics/types";
import { DEFAULT_REFERENCE_DATE } from "@/lib/reference-date";
import { ensureSynced } from "@/lib/sync/run-sync";

function mapClients(
  rows: Awaited<ReturnType<typeof fetchClientRows>>,
): MetricClient[] {
  return rows.map((client) => ({
    id: client.id,
    businessName: client.businessName,
    trade: client.trade,
    status: client.status,
    signupAt: client.signupAt,
    liveAt: client.liveAt,
    lastLoginAt: client.lastLoginAt,
    adsEnabled: client.adsEnabled,
    stripeCustomerId: client.stripeCustomerId,
    leads: client.leads.map((lead) => ({
      month: lead.month,
      leads: lead.leads,
    })),
    tickets: client.tickets.map((ticket) => ({
      createdAt: ticket.createdAt,
    })),
    customer: client.customer
      ? {
          delinquent: client.customer.delinquent,
          subscriptions: client.customer.subscriptions.map((sub) => ({
            id: sub.id,
            status: sub.status,
            startDate: sub.startDate,
            canceledAt: sub.canceledAt,
            cancellationReason: sub.cancellationReason,
            cancellationFeedback: sub.cancellationFeedback,
            items: sub.items.map((item) => ({
              productId: item.productId,
              priceId: item.priceId,
              unitAmount: item.unitAmount,
              quantity: item.quantity,
            })),
          })),
          invoices: client.customer.invoices.map((invoice) => ({
            status: invoice.status,
            attemptCount: invoice.attemptCount,
            created: invoice.created,
          })),
        }
      : null,
  }));
}

async function fetchClientRows() {
  return prisma.client.findMany({
    include: {
      leads: true,
      tickets: true,
      customer: {
        include: {
          subscriptions: { include: { items: true } },
          invoices: true,
        },
      },
    },
  });
}

export async function loadDashboard(): Promise<DashboardPayload> {
  const sync = await ensureSynced();

  const latestSync = await prisma.syncRun.findFirst({
    where: { status: "succeeded" },
    orderBy: { finishedAt: "desc" },
  });

  if (latestSync) {
    const cached = getCachedDashboard(latestSync.id);
    if (cached) {
      return {
        ...cached,
        syncedOnLoad: Boolean(sync) || cached.syncedOnLoad,
      };
    }
  }

  const referenceDate = latestSync?.referenceDate ?? DEFAULT_REFERENCE_DATE;
  const rows = await fetchClientRows();
  const metrics = computeDashboardMetrics(mapClients(rows), referenceDate);

  const payload: DashboardPayload = {
    syncedOnLoad: Boolean(sync),
    lastSync: latestSync
      ? {
          id: latestSync.id,
          finishedAt: latestSync.finishedAt?.toISOString() ?? null,
          referenceDate: latestSync.referenceDate.toISOString(),
          clientCount: latestSync.clientCount,
          customerCount: latestSync.customerCount,
        }
      : null,
    metrics,
  };

  if (latestSync) {
    setCachedDashboard(latestSync.id, payload);
  }

  return payload;
}
