export const ADS_PRODUCT_ID = "prod_ads_management";
export const ADS_PRICE_ID = "price_ads_management";
export const SMALL_SAMPLE_THRESHOLD = 10;

export type HealthSignal =
  | "zero_leads_recently"
  | "falling_leads"
  | "failed_payment"
  | "support_spike"
  | "stuck_onboarding"
  | "no_login";

export type AtRiskClient = {
  clientId: string;
  businessName: string;
  trade: string | null;
  score: number;
  signals: HealthSignal[];
};

export type RetentionBucket = "1-3" | "4-6" | "6+";

export type RetentionSummary = {
  totalClients: number;
  retainedCount: number;
  churnedCount: number;
  retentionRate: number;
  leaveTiming: Record<RetentionBucket, number>;
};

export type TradeLeadsRow = {
  trade: string;
  clientCount: number;
  avgLeadsPerClientPerMonth: number;
  smallSample: boolean;
};

export type TradeRevenueRow = {
  trade: string;
  clientCount: number;
  avgMrrCents: number;
  avgMonthsRetained: number;
  avgLtvCents: number;
  smallSample: boolean;
};

export type AdsImpactSummary = {
  withAds: {
    clientCount: number;
    retainedCount: number;
    retentionRate: number;
  };
  withoutAds: {
    clientCount: number;
    retainedCount: number;
    retentionRate: number;
  };
};

export type CancelReasonRow = {
  key: string;
  kind: "reason" | "feedback";
  count: number;
  share: number;
};

export type MetricClient = {
  id: string;
  businessName: string;
  trade: string | null;
  status: string;
  signupAt: Date;
  liveAt: Date | null;
  lastLoginAt: Date | null;
  adsEnabled: boolean;
  stripeCustomerId: string | null;
  leads: Array<{ month: string; leads: number }>;
  tickets: Array<{ createdAt: Date }>;
  customer: {
    delinquent: boolean;
    subscriptions: Array<{
      id: string;
      status: string;
      startDate: Date;
      canceledAt: Date | null;
      cancellationReason: string | null;
      cancellationFeedback: string | null;
      items: Array<{
        productId: string;
        priceId: string;
        unitAmount: number;
        quantity: number;
      }>;
    }>;
    invoices: Array<{
      status: string;
      attemptCount: number;
      created: Date;
    }>;
  } | null;
};
