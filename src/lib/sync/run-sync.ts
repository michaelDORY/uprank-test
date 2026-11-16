import { Prisma } from "@prisma/client";

import { mapWithConcurrency } from "@/lib/async";
import { invalidateDashboardCache } from "@/lib/dashboard/cache";
import { prisma } from "@/lib/db";
import {
  fetchAllCustomers,
  fetchAllInvoices,
  fetchAllSubscriptions,
} from "@/lib/mock/billing-client";
import {
  fetchAllClients,
  fetchAllSupportTickets,
  fetchClientLeads,
} from "@/lib/mock/product-client";
import {
  DEFAULT_REFERENCE_DATE,
  fromIso,
  fromUnixSeconds,
} from "@/lib/reference-date";

export type SyncResult = {
  syncRunId: string;
  referenceDate: string;
  customerCount: number;
  subscriptionCount: number;
  invoiceCount: number;
  clientCount: number;
  leadMonthCount: number;
  ticketCount: number;
};

let inFlightSync: Promise<SyncResult> | null = null;

async function clearBusinessTables(): Promise<void> {
  await prisma.$transaction([
    prisma.supportTicket.deleteMany(),
    prisma.leadMonth.deleteMany(),
    prisma.subscriptionItem.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.client.deleteMany(),
    prisma.customer.deleteMany(),
  ]);
}

async function runSyncInternal(): Promise<SyncResult> {
  const syncRun = await prisma.syncRun.create({
    data: {
      status: "running",
      referenceDate: DEFAULT_REFERENCE_DATE,
    },
  });

  try {
    const [
      customersResult,
      subscriptionsResult,
      invoicesResult,
      clientsResult,
      ticketsResult,
    ] = await Promise.all([
      fetchAllCustomers(),
      fetchAllSubscriptions(),
      fetchAllInvoices(),
      fetchAllClients(),
      fetchAllSupportTickets(),
    ]);

    const referenceDate =
      customersResult.referenceDate ??
      subscriptionsResult.referenceDate ??
      invoicesResult.referenceDate ??
      clientsResult.referenceDate ??
      ticketsResult.referenceDate ??
      DEFAULT_REFERENCE_DATE;

    await clearBusinessTables();

    if (customersResult.items.length > 0) {
      await prisma.customer.createMany({
        data: customersResult.items.map((customer) => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          created: fromUnixSeconds(customer.created)!,
          currency: customer.currency,
          delinquent: customer.delinquent,
          metadata: customer.metadata as Prisma.InputJsonValue,
        })),
      });
    }

    for (const subscription of subscriptionsResult.items) {
      await prisma.subscription.create({
        data: {
          id: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          created: fromUnixSeconds(subscription.created)!,
          startDate: fromUnixSeconds(subscription.start_date)!,
          canceledAt: fromUnixSeconds(subscription.canceled_at),
          endedAt: fromUnixSeconds(subscription.ended_at),
          cancellationReason: subscription.cancellation_details?.reason ?? null,
          cancellationFeedback:
            subscription.cancellation_details?.feedback ?? null,
          cancellationComment:
            subscription.cancellation_details?.comment ?? null,
          items: {
            create: subscription.items.data.map((item) => ({
              id: item.id,
              created: fromUnixSeconds(item.created)!,
              priceId: item.price.id,
              priceNickname: item.price.nickname ?? null,
              productId: item.price.product,
              unitAmount: item.price.unit_amount,
              currency: item.price.currency,
              interval: item.price.recurring.interval,
              intervalCount: item.price.recurring.interval_count,
              quantity: item.quantity,
            })),
          },
        },
      });
    }

    if (invoicesResult.items.length > 0) {
      await prisma.invoice.createMany({
        data: invoicesResult.items.map((invoice) => ({
          id: invoice.id,
          customerId: invoice.customer,
          subscriptionId: invoice.subscription ?? null,
          status: invoice.status,
          billingReason: invoice.billing_reason ?? null,
          currency: invoice.currency,
          amountDue: invoice.amount_due,
          amountPaid: invoice.amount_paid,
          postPaymentCreditNotesAmount:
            invoice.post_payment_credit_notes_amount,
          attemptCount: invoice.attempt_count,
          created: fromUnixSeconds(invoice.created)!,
          periodStart: fromUnixSeconds(invoice.period_start),
          periodEnd: fromUnixSeconds(invoice.period_end),
          paidAt: fromUnixSeconds(invoice.status_transitions?.paid_at),
          finalizedAt: fromUnixSeconds(
            invoice.status_transitions?.finalized_at,
          ),
          markedUncollectibleAt: fromUnixSeconds(
            invoice.status_transitions?.marked_uncollectible_at,
          ),
          voidedAt: fromUnixSeconds(invoice.status_transitions?.voided_at),
        })),
      });
    }

    const customerIds = new Set(customersResult.items.map((c) => c.id));

    if (clientsResult.items.length > 0) {
      await prisma.client.createMany({
        data: clientsResult.items.map((client) => ({
          id: client.id,
          businessName: client.business_name,
          trade: client.trade,
          region: client.region ?? null,
          stripeCustomerId:
            client.stripe_customer_id &&
            customerIds.has(client.stripe_customer_id)
              ? client.stripe_customer_id
              : null,
          status: client.status,
          signupAt: fromIso(client.signup_at)!,
          assetsReceivedAt: fromIso(client.onboarding.assets_received_at),
          siteApprovedAt: fromIso(client.onboarding.site_approved_at),
          liveAt: fromIso(client.onboarding.live_at),
          lastLoginAt: fromIso(client.last_login_at),
          adsEnabled: client.ads.enabled,
          adsMonthlyBudget: client.ads.monthly_budget,
          adsEnabledAt: fromIso(client.ads.enabled_at),
        })),
      });
    }

    const leadRows = await mapWithConcurrency(
      clientsResult.items,
      12,
      async (client) => {
        const months = await fetchClientLeads(client.id);
        return months.map((month) => ({
          clientId: client.id,
          month: month.month,
          leads: month.leads,
        }));
      },
    );

    const flattenedLeads = leadRows.flat();
    for (let i = 0; i < flattenedLeads.length; i += 500) {
      await prisma.leadMonth.createMany({
        data: flattenedLeads.slice(i, i + 500),
      });
    }

    if (ticketsResult.items.length > 0) {
      const clientIds = new Set(clientsResult.items.map((c) => c.id));
      await prisma.supportTicket.createMany({
        data: ticketsResult.items
          .filter((ticket) => clientIds.has(ticket.client_id))
          .map((ticket) => ({
            id: ticket.id,
            clientId: ticket.client_id,
            createdAt: fromIso(ticket.created_at)!,
            category: ticket.category,
            status: ticket.status,
          })),
      });
    }

    const counts = {
      customerCount: customersResult.items.length,
      subscriptionCount: subscriptionsResult.items.length,
      invoiceCount: invoicesResult.items.length,
      clientCount: clientsResult.items.length,
      leadMonthCount: flattenedLeads.length,
      ticketCount: ticketsResult.items.length,
    };

    await prisma.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: "succeeded",
        finishedAt: new Date(),
        referenceDate,
        ...counts,
      },
    });

    invalidateDashboardCache();

    return {
      syncRunId: syncRun.id,
      referenceDate: referenceDate.toISOString(),
      ...counts,
    };
  } catch (error) {
    await prisma.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: "failed",
        finishedAt: new Date(),
        errorMessage:
          error instanceof Error ? error.message : "Unknown sync error",
      },
    });
    throw error;
  }
}

/** Single-flight sync — concurrent callers share one in-flight run. */
export function runSync(): Promise<SyncResult> {
  if (!inFlightSync) {
    inFlightSync = runSyncInternal().finally(() => {
      inFlightSync = null;
    });
  }
  return inFlightSync;
}

export async function ensureSynced(): Promise<SyncResult | null> {
  const clientCount = await prisma.client.count();
  if (clientCount > 0) {
    return null;
  }
  return runSync();
}
