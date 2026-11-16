import { z } from "zod";

export const billingListSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    object: z.literal("list"),
    url: z.string(),
    has_more: z.boolean(),
    data: z.array(item),
  });

export const billingCustomerSchema = z.object({
  id: z.string(),
  object: z.literal("customer"),
  name: z.string(),
  email: z.string(),
  created: z.number(),
  currency: z.string(),
  delinquent: z.boolean(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const billingPriceSchema = z.object({
  id: z.string(),
  object: z.literal("price"),
  nickname: z.string().nullable().optional(),
  product: z.string(),
  unit_amount: z.number(),
  currency: z.string(),
  recurring: z.object({
    interval: z.string(),
    interval_count: z.number(),
  }),
});

export const billingSubscriptionItemSchema = z.object({
  id: z.string(),
  object: z.literal("subscription_item"),
  created: z.number(),
  price: billingPriceSchema,
  quantity: z.number(),
});

export const billingSubscriptionSchema = z.object({
  id: z.string(),
  object: z.literal("subscription"),
  customer: z.string(),
  status: z.string(),
  created: z.number(),
  start_date: z.number(),
  canceled_at: z.number().nullable().optional(),
  ended_at: z.number().nullable().optional(),
  cancellation_details: z
    .object({
      reason: z.string().nullable().optional(),
      feedback: z.string().nullable().optional(),
      comment: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  items: z.object({
    object: z.literal("list"),
    data: z.array(billingSubscriptionItemSchema),
  }),
});

export const billingInvoiceSchema = z.object({
  id: z.string(),
  object: z.literal("invoice"),
  customer: z.string(),
  subscription: z.string().nullable().optional(),
  status: z.string(),
  billing_reason: z.string().nullable().optional(),
  currency: z.string(),
  amount_due: z.number(),
  amount_paid: z.number(),
  post_payment_credit_notes_amount: z.number().default(0),
  attempt_count: z.number().default(0),
  created: z.number(),
  period_start: z.number().nullable().optional(),
  period_end: z.number().nullable().optional(),
  next_payment_attempt: z.number().nullable().optional(),
  status_transitions: z
    .object({
      finalized_at: z.number().nullable().optional(),
      paid_at: z.number().nullable().optional(),
      marked_uncollectible_at: z.number().nullable().optional(),
      voided_at: z.number().nullable().optional(),
    })
    .optional(),
});

export const productClientSchema = z.object({
  id: z.string(),
  business_name: z.string(),
  trade: z.string().nullable(),
  region: z.string().nullable().optional(),
  stripe_customer_id: z.string().nullable(),
  status: z.string(),
  signup_at: z.string(),
  onboarding: z.object({
    assets_received_at: z.string().nullable().optional(),
    site_approved_at: z.string().nullable().optional(),
    live_at: z.string().nullable().optional(),
  }),
  last_login_at: z.string().nullable(),
  ads: z.object({
    enabled: z.boolean(),
    monthly_budget: z.number().nullable(),
    enabled_at: z.string().nullable(),
  }),
});

export const productClientsPageSchema = z.object({
  data: z.array(productClientSchema),
  page: z.number(),
  per_page: z.number(),
  total: z.number(),
  total_pages: z.number(),
});

export const productLeadsSchema = z.object({
  client_id: z.string(),
  data: z.array(
    z.object({
      month: z.string(),
      leads: z.number(),
    }),
  ),
});

export const supportTicketSchema = z.object({
  id: z.string(),
  client_id: z.string(),
  created_at: z.string(),
  category: z.string(),
  status: z.string(),
});

export const supportTicketsPageSchema = z.object({
  data: z.array(supportTicketSchema),
  page: z.number(),
  per_page: z.number(),
  total: z.number(),
  total_pages: z.number(),
});

export type BillingCustomer = z.infer<typeof billingCustomerSchema>;
export type BillingSubscription = z.infer<typeof billingSubscriptionSchema>;
export type BillingInvoice = z.infer<typeof billingInvoiceSchema>;
export type ProductClient = z.infer<typeof productClientSchema>;
export type SupportTicket = z.infer<typeof supportTicketSchema>;
