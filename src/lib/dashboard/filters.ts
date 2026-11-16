export const RISK_LIMIT_OPTIONS = [10, 15, 25] as const;
export type RiskLimit = (typeof RISK_LIMIT_OPTIONS)[number];

export const DEFAULT_TRADE = "all";
export const DEFAULT_RISK_LIMIT: RiskLimit = 15;

export function parseTradeParam(value: string | null): string {
  if (!value || value.trim() === "") {
    return DEFAULT_TRADE;
  }
  return value;
}

export function parseRiskLimitParam(value: string | null): RiskLimit {
  const parsed = Number(value);
  if (RISK_LIMIT_OPTIONS.includes(parsed as RiskLimit)) {
    return parsed as RiskLimit;
  }
  return DEFAULT_RISK_LIMIT;
}
