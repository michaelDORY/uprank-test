import { mockFetch } from "@/lib/mock/http";
import {
  productClientsPageSchema,
  productLeadsSchema,
  supportTicketsPageSchema,
  type ProductClient,
  type SupportTicket,
} from "@/lib/mock/types";
import type { z } from "zod";

type FetchAllResult<T> = {
  items: T[];
  referenceDate: Date | null;
};

type PageSchema = z.ZodType<{
  data: unknown[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}>;

async function fetchAllPages<T>(
  path: string,
  schema: PageSchema,
): Promise<FetchAllResult<T>> {
  const items: T[] = [];
  let page = 1;
  let totalPages = 1;
  let referenceDate: Date | null = null;

  while (page <= totalPages) {
    const separator = path.includes("?") ? "&" : "?";
    const { json, referenceDate: headerDate } = await mockFetch(
      "product",
      `${path}${separator}page=${page}&per_page=100`,
    );
    if (headerDate) {
      referenceDate = headerDate;
    }

    const parsed = schema.parse(json);
    items.push(...(parsed.data as T[]));
    totalPages = parsed.total_pages;
    page += 1;
  }

  return { items, referenceDate };
}

export function fetchAllClients(): Promise<FetchAllResult<ProductClient>> {
  return fetchAllPages<ProductClient>("/clients", productClientsPageSchema);
}

export async function fetchClientLeads(
  clientId: string,
): Promise<Array<{ month: string; leads: number }>> {
  const { json } = await mockFetch("product", `/clients/${clientId}/leads`);
  return productLeadsSchema.parse(json).data;
}

export function fetchAllSupportTickets(): Promise<
  FetchAllResult<SupportTicket>
> {
  return fetchAllPages<SupportTicket>(
    "/support-tickets",
    supportTicketsPageSchema,
  );
}
