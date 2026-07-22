# Architecture

FairwayServe is a Next.js App Router application with a typed local data layer.

## Layers

| Layer       | Location      | Responsibility                                  |
| ----------- | ------------- | ----------------------------------------------- |
| Routes      | `app/`        | Page routes, layout, global styles              |
| Components  | `components/` | UI shell, page components, shared UI            |
| Hooks       | `lib/hooks/`  | React context for app data and sync             |
| Core domain | `lib/core/`   | Models, seed data, business rules, repositories |
| Tests       | `tests/`      | Unit and workflow tests                         |

## Data flow

1. Components use `useAppData()` — never `localStorage` directly.
2. `store.load()` / `store.save()` persist `AppData` with schema version 24.
3. `repositories` expose typed async CRUD for each entity.
4. `subscribeSync()` listens on BroadcastChannel and storage events for multi-tab updates.

## Key modules

- `lib/core/orders.ts` — Checkout, multi-fulfilment creation, status machines
- `lib/core/assignment.ts` — Deterministic staff assignment and routing
- `lib/core/inventory.ts` — Reservation, release, deduction, transfers
- `lib/core/payments.ts` — Demo payment simulation
- `lib/core/alcohol.ts` — Manitoba demo alcohol workflow (18+)
- `lib/core/analytics.ts` — Local analytics computation
- `lib/core/operations.ts` — Kitchen and restaurant operations

## Future database migration

Replace `store` with API adapters. Keep domain rules in `lib/core/` — they are framework-agnostic.
