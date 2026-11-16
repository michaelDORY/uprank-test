# **Challenge API reference**

You have two APIs. They come from two different systems, so they behave differently.

- **Billing API**, Stripe-style: `https://platform.up-rank.com.au/api/hiring-mock/v1`
- **Product API**: `https://platform.up-rank.com.au/api/hiring-mock`

Your API key works for both, but each API expects it in a different header.

**"Today" is 1 November 2026\.** All data ends there, and every response includes an `X-Mock-Reference-Date` header. Use that date rather than your computer's clock for anything like "last 30 days".

The data is read-only.

---

## **Billing API (Stripe-style)**

**Auth:** `Authorization: Bearer YOUR_KEY`

**Formats:** amounts are in cents (AUD), and dates are Unix timestamps in seconds.

**Pagination:** lists are newest first. Use `limit` (1–100, default 10). To get the next page, pass `starting_after` with the `id` of the last item you received. Keep going while `has_more` is `true`.

```json
{ "object": "list", "url": "/v1/customers", "has_more": true, "data": [ ... ] }
```

**Errors:** `{ "error": { "type": "invalid_request_error", "message": "..." } }`

### **`GET /v1/customers`**

Optional filter: `email`.

```json
{
  "id": "cus_8fK2LmQ0aZx1Pd",
  "object": "customer",
  "name": "Harbour Plumbing",
  "email": "harbour-plumbing@example.com",
  "created": 1735689600,
  "currency": "aud",
  "delinquent": false,
  "metadata": {}
}
```

### **`GET /v1/subscriptions`**

Optional filters: `customer`, `status` (`active`, `past_due`, `canceled`, `all`).

As in Stripe, **cancelled subscriptions are left out unless you pass** `status=canceled` **or** `status=all`**.**

```json
{
  "id": "sub_3JtR9vB0cQe7Lm",
  "object": "subscription",
  "customer": "cus_8fK2LmQ0aZx1Pd",
  "status": "canceled",
  "created": 1735689600,
  "start_date": 1735689600,
  "canceled_at": 1756684800,
  "ended_at": 1756684800,
  "cancellation_details": {
    "reason": "cancellation_requested",
    "feedback": "too_expensive",
    "comment": null
  },
  "items": {
    "object": "list",
    "data": [
      {
        "id": "si_Q2w9Er7Ty1Ui3O",
        "object": "subscription_item",
        "created": 1735689600,
        "price": {
          "id": "price_growth_plumber",
          "object": "price",
          "nickname": "Growth Plan",
          "product": "prod_growth_plan",
          "unit_amount": 29700,
          "currency": "aud",
          "recurring": { "interval": "month", "interval_count": 1 }
        },
        "quantity": 1
      },
      {
        "id": "si_Zx8Cv6Bn4Mq2Wd",
        "object": "subscription_item",
        "created": 1738368000,
        "price": {
          "id": "price_ads_management",
          "object": "price",
          "nickname": "Ads Management add-on",
          "product": "prod_ads_management",
          "unit_amount": 14900,
          "currency": "aud",
          "recurring": { "interval": "month", "interval_count": 1 }
        },
        "quantity": 1
      }
    ]
  }
}
```

`cancellation_details.reason` is `cancellation_requested` (the client cancelled) or `payment_failed` (cancelled after payments failed). `feedback` is optional and uses Stripe's values: `too_expensive`, `low_quality`, `unused`, `too_complex`, `switched_service`, `customer_service`, `missing_features`, `other`.

### **`GET /v1/invoices`**

Optional filters: `customer`, `subscription`, `status` (`paid`, `open`, `uncollectible`, `void`).

```json
{
  "id": "in_7Hn3Kd9Lp2Qw5E",
  "object": "invoice",
  "customer": "cus_8fK2LmQ0aZx1Pd",
  "subscription": "sub_3JtR9vB0cQe7Lm",
  "status": "paid",
  "billing_reason": "subscription_cycle",
  "currency": "aud",
  "amount_due": 44600,
  "amount_paid": 44600,
  "post_payment_credit_notes_amount": 0,
  "attempt_count": 1,
  "created": 1738368000,
  "period_start": 1738368000,
  "period_end": 1740787200,
  "next_payment_attempt": null,
  "status_transitions": {
    "finalized_at": 1738368000,
    "paid_at": 1738368420,
    "marked_uncollectible_at": null,
    "voided_at": null
  }
}
```

`post_payment_credit_notes_amount` above 0 means money was refunded after payment.

---

## **Product API**

**Auth:** `X-API-Key: YOUR_KEY`

**Formats:** dates are ISO 8601 strings. Lead counts are per calendar month.

**Pagination:** `page` (from 1\) and `per_page` (1–100, default 50).

```json
{ "data": [ ... ], "page": 1, "per_page": 50, "total": 238, "total_pages": 5 }
```

**Errors:** `{ "error": "..." }`

### **`GET /clients`**

```json
{
  "id": "cl_0042",
  "business_name": "Harbour Plumbing",
  "trade": "plumber",
  "region": "Sydney",
  "stripe_customer_id": "cus_8fK2LmQ0aZx1Pd",
  "status": "live",
  "signup_at": "2025-01-01T09:12:44.000Z",
  "onboarding": {
    "assets_received_at": "2025-01-05T09:12:44.000Z",
    "site_approved_at": "2025-01-13T09:12:44.000Z",
    "live_at": "2025-01-16T09:12:44.000Z"
  },
  "last_login_at": "2026-10-28T21:03:10.000Z",
  "ads": {
    "enabled": true,
    "monthly_budget": 1500,
    "enabled_at": "2025-02-01T09:12:44.000Z"
  }
}
```

- `status` is `onboarding`, `live` or `cancelled`.
- `trade` can be `null`.
- `ads.monthly_budget` is the client's monthly ad spend in whole AUD. It's paid to the ad platform, not to us. The add-on fee is the subscription item in billing.
- `stripe_customer_id` links a client to the billing API.

### **`GET /clients/{id}/leads`**

```json
{
  "client_id": "cl_0042",
  "data": [
    { "month": "2025-01", "leads": 5 },
    { "month": "2025-02", "leads": 10 },
    { "month": "2025-03", "leads": 15 }
  ]
}
```

Months start from when the client went live. Clients that never went live return an empty list.

### **`GET /support-tickets`**

Optional filter: `client_id`. Newest first.

```json
{
  "id": "tkt_00311",
  "client_id": "cl_0042",
  "created_at": "2026-10-14T03:22:10.000Z",
  "category": "leads",
  "status": "closed"
}
```

`category` is `billing`, `website`, `leads` or `general`.

---

## **Quick test**

```sh
curl -H "Authorization: Bearer YOUR_KEY" "https://platform.up-rank.com.au/api/hiring-mock/v1/customers?limit=2"
curl -H "X-API-Key: YOUR_KEY" "https://platform.up-rank.com.au/api/hiring-mock/clients?per_page=2"
```

The data is the same for every candidate and doesn't change during the challenge.
