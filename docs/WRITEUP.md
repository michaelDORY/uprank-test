# Implementation write-up

## Thought process

The costly gap isn’t collection — it’s **join → decide**. Billing and product already exist; ops need one place that answers who to call, where retention breaks, which trades pay, and whether ads help clients stay.

I treated that as a pipeline, not a UI exercise:

1. **Ingest live mock APIs into Postgres** (Bearer billing + `X-API-Key` product; full sync on demand / auto when empty).
2. **Join once** on `stripe_customer_id`, then compute every view on the server.
3. **Pure metric modules** (`src/lib/metrics/`) with explicit thresholds in `docs/METRICS.md` and unit tests — the page only renders DTOs.
4. **One ops page**, action-first: call queue → retention → trade performance → ads → bonus cancels.

Business clock is **2026-11-01** (`X-Mock-Reference-Date`), not the machine clock, so “last N days” is reproducible for every reviewer.

## Why this is the most optimised approach (for the brief)

- Matches the ask: live join, server-side calculations, single dashboard, local setup (`README` + Docker).
- Separates sync from scoring — formulas are reviewable without reading React.
- Prefer transparent rules (additive health penalties, shown `n` / small-sample flags, ads as correlation with a bias caveat) over a black-box “AI score.”
- Scope stays inside four hours: full re-sync and a frozen `asOf` are correct for a closed mock corpus; a date-range BI product would be a different problem.

Key metric calls (detail in `docs/METRICS.md`): kept/lost from product status; leave timing from billing tenure; ads add-on from subscription items (not `ads.monthly_budget`); MRR/LTV from UpRank line items.

## Bonus: cancel reasons / feedback

Required views cover _who_ and _where_. Cancel `cancellation_details` on canceled subscriptions answers _why_, which changes the playbook (e.g. `too_expensive` → pricing; `low_quality` → delivery; `unused` → activation). Surfaced as counts, shares, and a chart after the five required views.
