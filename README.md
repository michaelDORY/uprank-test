# UpRank Decision Dashboard

Hiring challenge deliverable: one operations dashboard that joins Stripe-style billing with product/usage data so ops can decide who to call and where retention breaks.

## Prerequisites

- **Node.js 20+**
- **pnpm** (`corepack enable` then `corepack prepare pnpm@9.15.0 --activate`, or install pnpm another way)
- **Docker Desktop** running (Postgres)

You also need the hiring mock API key from the challenge invite.

## Quick start

```bash
cp .env.example .env
# Edit .env and set MOCK_API_KEY to your key

pnpm install
pnpm db:up
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

| What happens | Detail                                                                       |
| ------------ | ---------------------------------------------------------------------------- |
| First visit  | If Postgres is empty, the app auto-syncs mock APIs (skeleton until ready)    |
| Refresh      | Sidebar **Refresh** runs `POST /api/sync`, then reloads the page data        |
| Filters      | Trade / risk-limit controls update the URL; they do not re-hit the mock APIs |

Stop Postgres later with `pnpm db:down` if you want.

## Environment

Copy from `.env.example`. Required:

| Variable       | Purpose                                              |
| -------------- | ---------------------------------------------------- |
| `DATABASE_URL` | Postgres URL (matches `docker-compose.yml` defaults) |
| `MOCK_API_KEY` | Shared key for billing + product mock APIs           |

Optional overrides (defaults already match the challenge):

| Variable               | Default                                              |
| ---------------------- | ---------------------------------------------------- |
| `BILLING_API_BASE_URL` | `https://platform.up-rank.com.au/api/hiring-mock/v1` |
| `PRODUCT_API_BASE_URL` | `https://platform.up-rank.com.au/api/hiring-mock`    |

Auth headers used by sync:

- Billing: `Authorization: Bearer $MOCK_API_KEY`
- Product: `X-API-Key: $MOCK_API_KEY`

Business “today” for all “last N days” windows is **2026-11-01** (`X-Mock-Reference-Date`), not your machine clock.

Join key: product `clients.stripe_customer_id` → billing `customers.id`.

## Scripts

```bash
pnpm dev           # Next.js app (http://localhost:3000)
pnpm test          # Vitest — metric / criticality unit tests
pnpm typecheck     # tsc --noEmit
pnpm lint          # eslint
pnpm format        # prettier --write
pnpm format:check  # prettier --check
pnpm check         # typecheck + lint + format:check
pnpm db:up         # docker compose up -d
pnpm db:migrate    # prisma migrate + generate
pnpm db:down       # stop Postgres container
pnpm db:studio     # Prisma Studio (optional)
```

Husky runs **lint-staged** on commit (`eslint --fix` + Prettier on staged files). After `pnpm install`, the `prepare` script wires the hook automatically.

## Docs

- [docs/METRICS.md](docs/METRICS.md) — metric formulas and thresholds
- [docs/WRITEUP.md](docs/WRITEUP.md) — approach and trade-offs
- [docs/challenge/](docs/challenge/) — original brief + mock API reference

## Smoke check

1. `docker compose ps` — Postgres healthy
2. App loads at `/` with KPI strip + call list
3. Optional: `curl -X POST http://localhost:3000/api/sync` returns `{ "ok": true, … }`
4. Spot-check one product client’s `stripe_customer_id` exists in billing customers

## Stack

Next.js App Router + TypeScript · Postgres 16 (Docker) + Prisma · Tailwind + shadcn/ui + Recharts · Zod · Vitest
