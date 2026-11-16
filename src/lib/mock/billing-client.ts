import { mockFetch } from "@/lib/mock/http";
import {
  billingCustomerSchema,
  billingInvoiceSchema,
  billingListSchema,
  billingSubscriptionSchema,
  type BillingCustomer,
  type BillingInvoice,
  type BillingSubscription,
} from "@/lib/mock/types";
import type { ZodType } from "zod";

type FetchAllResult<T> = {
  items: T[];
  referenceDate: Date | null;
};

async function fetchAllCursorPages<T extends { id: string }>(
  path: string,
  itemSchema: ZodType<T>,
  extraQuery = "",
): Promise<FetchAllResult<T>> {
  const items: T[] = [];
  let startingAfter: string | undefined;
  let referenceDate: Date | null = null;
  const listSchema = billingListSchema(itemSchema);

  for (;;) {
    const params = new URLSearchParams({ limit: "100" });
    if (startingAfter) {
      params.set("starting_after", startingAfter);
    }
    if (extraQuery) {
      for (const [key, value] of new URLSearchParams(extraQuery)) {
        params.set(key, value);
      }
    }

    const { json, referenceDate: headerDate } = await mockFetch(
      "billing",
      `${path}?${params.toString()}`,
    );
    if (headerDate) {
      referenceDate = headerDate;
    }

    const parsed = listSchema.parse(json);
    items.push(...parsed.data);

    if (!parsed.has_more || parsed.data.length === 0) {
      break;
    }

    startingAfter = parsed.data[parsed.data.length - 1]?.id;
    if (!startingAfter) {
      break;
    }
  }

  return { items, referenceDate };
}

export function fetchAllCustomers(): Promise<FetchAllResult<BillingCustomer>> {
  return fetchAllCursorPages("/customers", billingCustomerSchema);
}

export function fetchAllSubscriptions(): Promise<
  FetchAllResult<BillingSubscription>
> {
  return fetchAllCursorPages(
    "/subscriptions",
    billingSubscriptionSchema,
    "status=all",
  );
}

export function fetchAllInvoices(): Promise<FetchAllResult<BillingInvoice>> {
  return fetchAllCursorPages("/invoices", billingInvoiceSchema);
}
