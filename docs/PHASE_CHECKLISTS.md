# Phase Checklists

## Phase 01 — Repository foundation, permanent state, and core order rules

| Requirement                | Implementation location                | Expected behaviour                                                  | Test method                      | Verification evidence                     | Current status |
| -------------------------- | -------------------------------------- | ------------------------------------------------------------------- | -------------------------------- | ----------------------------------------- | -------------- |
| Permanent state docs exist | docs/\*.md                             | Required build-state documents are present and current              | File inspection                  | This checklist and companion docs created | IMPLEMENTED    |
| Runnable web foundation    | index.html, src/main.ts, src/styles.ts | Accessible responsive shell renders demo order summary              | Typecheck/build; code inspection | `npm run build` pending                   | IMPLEMENTED    |
| Role model exists          | src/core/models.ts                     | All required roles are represented as types                         | Typecheck; test imports          | `npm run typecheck` pending               | IMPLEMENTED    |
| Course isolation rule      | src/core/orders.ts                     | Cross-course access fails except platform admin                     | Unit test                        | `tests/orders.test.mjs` pending           | TESTED         |
| Order summary rules        | src/core/orders.ts                     | Totals, stock, kitchen, alcohol, member-account checks are computed | Unit test                        | `tests/orders.test.mjs` pending           | TESTED         |
| Validation commands        | package.json, scripts/lint.mjs         | Format, lint, typecheck, test, build commands are available         | `npm run validate`               | Pending                                   | IN PROGRESS    |

## Phase 02 — Database, RLS, and persistence

Not started. Must create migrations, seed data, database tests, RLS policies, and tenant isolation checks.

## Phase 03 — Authentication and role enforcement

Not started. Must implement auth, guest/QR tokens, role authorization, and permission-denied UX.

## Phase 04+ — Product workflows and final reviews

Not started. Covers payments, location, inventory, kitchen, staff, course operations, mobile/accessibility, security, deployment, and full-app review loops.
