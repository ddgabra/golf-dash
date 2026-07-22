# FairwayServe

Database-free local prototype for on-course golf hospitality — order food and drinks from the fairway, track fulfilments, and simulate staff workflows.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app redirects to `/round`.

## Demo roles

Use the **Demo role (not production auth)** switcher in the header:

| Role                   | Primary views                 |
| ---------------------- | ----------------------------- |
| Guest golfer           | Round, Menu, Checkout, Orders |
| Registered golfer      | Round, Menu, Orders           |
| Club member            | Round, Menu, Member, Orders   |
| Beverage-cart staff    | Staff                         |
| Runner                 | Staff                         |
| Kitchen employee       | Kitchen                       |
| Restaurant server      | Restaurant                    |
| Course manager         | Manager, Analytics, Demo      |
| Platform administrator | All routes including `/demo`  |

## Major routes

- `/round` — Active round, course map, meeting points
- `/menu` — 42-product catalog with search, filters, favourites
- `/checkout` — Cart, mixed fulfilment, simulated payment
- `/orders` — Order and fulfilment tracking
- `/member` — Minimum-spend club account
- `/staff` — Beverage-cart shift and delivery
- `/kitchen` — Kitchen display system
- `/restaurant` — Table readiness and dining requests
- `/manager` — Course operations controls
- `/analytics` — Local analytics dashboard
- `/demo` — Simulation control centre

## Validation

```bash
npm run validate
```

Runs format check, typecheck, lint, unit tests, e2e workflow tests, and production build.

## Architecture

- **Next.js 15** App Router, React 19, TypeScript, Tailwind CSS
- **Local storage** with schema versioning and corrupt-data recovery
- **Typed repositories** in `lib/core/` — components never access storage directly
- **BroadcastChannel** + storage events for multi-tab sync
- **Simulated** payments, location, notifications, and roles

## Documentation

- `docs/ARCHITECTURE.md`
- `docs/BUILD_STATUS.md`
- `docs/MASTER_REQUIREMENTS_CHECKLIST.md`
- `docs/TESTING.md`
- `docs/AI_LOOP_STATE.md`
