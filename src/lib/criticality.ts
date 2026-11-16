export type CriticalityLevel = "good" | "ok" | "warn" | "bad" | "neutral";

/**
 * Health score bands (0–100, higher = healthier).
 * ≥80 good · ≥60 ok · ≥40 warn · else bad
 */
export function healthCriticality(score: number): CriticalityLevel {
  if (score >= 80) {
    return "good";
  }
  if (score >= 60) {
    return "ok";
  }
  if (score >= 40) {
    return "warn";
  }
  return "bad";
}

/**
 * Retention / stay rate (0–1).
 * ≥0.8 good · ≥0.65 ok · ≥0.5 warn · else bad
 */
export function rateCriticality(rate: number): CriticalityLevel {
  if (rate >= 0.8) {
    return "good";
  }
  if (rate >= 0.65) {
    return "ok";
  }
  if (rate >= 0.5) {
    return "warn";
  }
  return "bad";
}

/**
 * Signed delta (e.g. ads retention gap). Positive = good.
 * ≥+5pp good · &gt;0 ok · ≥−5pp warn · else bad · ~0 neutral
 */
export function signedDeltaCriticality(delta: number): CriticalityLevel {
  if (Math.abs(delta) < 0.005) {
    return "neutral";
  }
  if (delta >= 0.05) {
    return "good";
  }
  if (delta > 0) {
    return "ok";
  }
  if (delta >= -0.05) {
    return "warn";
  }
  return "bad";
}

/** CEO-facing short labels for KPI badges. */
export function criticalityLabel(level: CriticalityLevel): string {
  switch (level) {
    case "good":
      return "Strong";
    case "ok":
      return "Steady";
    case "warn":
      return "Watch";
    case "bad":
      return "Weak";
    case "neutral":
      return "Even";
    default: {
      const _exhaustive: never = level;
      return _exhaustive;
    }
  }
}

export const CRITICALITY_TEXT_CLASS: Record<CriticalityLevel, string> = {
  good: "text-[var(--crit-good-fg)]",
  ok: "text-[var(--crit-ok-fg)]",
  warn: "text-[var(--crit-warn-fg)]",
  bad: "text-[var(--crit-bad-fg)]",
  neutral: "text-muted-foreground",
};

export const CRITICALITY_BG_CLASS: Record<CriticalityLevel, string> = {
  good: "bg-[var(--crit-good)] text-[var(--crit-good-fg)]",
  ok: "bg-[var(--crit-ok)] text-[var(--crit-ok-fg)]",
  warn: "bg-[var(--crit-warn)] text-[var(--crit-warn-fg)]",
  bad: "bg-[var(--crit-bad)] text-[var(--crit-bad-fg)]",
  neutral: "bg-[var(--crit-neutral)] text-muted-foreground",
};
