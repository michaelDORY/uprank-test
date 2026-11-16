<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UpRank Decision Dashboard

Hiring challenge: join Stripe-style billing + product data into one decision dashboard.

## Stack

- Next.js App Router + TypeScript
- Postgres via Docker Compose + Prisma
- Tailwind + shadcn/ui + Recharts
- Zod validation, Vitest for metric unit tests

## Mock APIs

| API     | Base                                                 | Auth                    |
| ------- | ---------------------------------------------------- | ----------------------- |
| Billing | `https://platform.up-rank.com.au/api/hiring-mock/v1` | `Authorization: Bearer` |
| Product | `https://platform.up-rank.com.au/api/hiring-mock`    | `X-API-Key`             |

Join key: `clients.stripe_customer_id` → `customers.id`.

Reference date for all “last N days” logic: **2026-11-01** (`X-Mock-Reference-Date`).

## Key paths

- Sync: `src/lib/sync/run-sync.ts`, `src/app/api/sync/route.ts`
- Metrics (pure): `src/lib/metrics/*`
- Dashboard load (SSR): `src/lib/dashboard/load-dashboard.ts`, `src/app/page.tsx`
- UI: `src/components/dashboard/*`
- Definitions: `docs/METRICS.md`
- Write-up: `docs/WRITEUP.md`

## Rules of thumb

- No hardcoded dashboard numbers — sync live mock data into Postgres.
- Server computes joins/metrics; the page only renders DTOs.
- Document metric thresholds in `docs/METRICS.md` when changing formulas.
