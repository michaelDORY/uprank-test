# Metric definitions

Reference date for all windows: **2026-11-01** (`X-Mock-Reference-Date`), never the machine clock.

The dashboard header **As of** is that business clock. **Updated** is when sync last finished (wall clock) and is not used in formulas.

Join key: product `Client.stripeCustomerId` → billing `Customer.id`.

## 1. At-risk / who to call

Score starts at **100**. Each triggered signal subtracts a fixed penalty (floor 0). List is sorted worst-first; cancelled product clients are excluded.

| Signal                | Rule                                                                                                               | Penalty |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ | ------- |
| `zero_leads_recently` | Live ≥30 days and leads in the two prior calendar months (Sep+Oct when today is Nov 1) sum to 0                    | −25     |
| `falling_leads`       | Last three prior calendar months each strictly lower than the previous                                             | −20     |
| `failed_payment`      | Customer `delinquent`, any `past_due` subscription, uncollectible invoice, or open invoice with `attemptCount ≥ 2` | −30     |
| `support_spike`       | ≥3 tickets in last 30 days, or ≥2× tickets vs prior 30 days (when prior ≥1)                                        | −15     |
| `stuck_onboarding`    | Product status `onboarding`, no `liveAt`, signup ≥14 days ago                                                      | −25     |
| `no_login`            | `lastLoginAt` null or more than 21 days before reference date                                                      | −15     |

Only clients with ≥1 signal appear on the call list (server returns top 25; UI filters via `riskLimit`).

### Health criticality bands (UI)

| Band | Score   | Meaning         |
| ---- | ------- | --------------- |
| good | ≥ 80    | Healthy         |
| ok   | ≥ 60    | Mild concern    |
| warn | ≥ 40    | Needs attention |
| bad  | &lt; 40 | Critical        |

Retention rate bands: ≥80% good · ≥65% ok · ≥50% warn · else bad.  
Ads retention gap: ≥+5pp good · &gt;0 ok · ≥−5pp warn · else bad (near 0 = neutral).

## 2. Retention and leave timing

- **Kept / lost** uses product `status`: anything other than `cancelled` counts as retained.
- **Leave timing** for churned clients uses the primary billing subscription:  
  `months = (canceledAt − startDate) / 30 days`, then buckets **1–3**, **4–6**, **6+**.
- **Fallback:** if that subscription has no `canceledAt` (or there is no usable cancel date), tenure is approximated as `(referenceDate − signupAt) / 30`. This is an approximation when billing cancel metadata is missing.
- Clients with no billing join cannot contribute payment signals; they still count in product-side retention if product status is set.

## 3. Leads by trade

- Population: clients with `liveAt` and at least one lead month through the last complete calendar month (October 2026 when reference is Nov 1).
- Metric: total leads ÷ total client-months (not an average of averages).
- `trade = null` → **Unknown**.
- `smallSample = true` when client count &lt; 10.

## 4. Revenue and LTV by trade

- Pick the active/past_due subscription if present; otherwise the most recently ended subscription.
- Clients with **no billing subscription** are excluded from revenue/LTV (no invented MRR).
- Clients with **no billing join** also cannot raise `failed_payment` on the call list.
- **MRR** = sum of `unitAmount × quantity` on that subscription’s items (cents, includes ads add-on _subscription_ items billed by UpRank).
- **Months retained** = `(canceledAt ?? referenceDate − startDate) / 30`, minimum ~1 day.
- **LTV** = MRR × months retained.
- Trade averages are means across clients in that trade; `smallSample` when n &lt; 10.

## 5. Ads add-on impact

A client is “with ads” if product `adsEnabled` **or** any subscription item has `productId = prod_ads_management` / `priceId = price_ads_management`.

Compare retention rates (same kept/lost rule as §2) for with-ads vs without-ads cohorts. Sample sizes are always shown; selection bias is noted in the UI.

## Bonus: cancel reasons

Among canceled billing subscriptions, count:

- `cancellationReason` (Stripe-style reason)
- `cancellationFeedback` (optional feedback enum; missing → `none`)

Shares are over canceled subscriptions, not clients.
