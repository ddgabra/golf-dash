# Master Requirements Checklist

Statuses allowed: `NOT STARTED`, `IN PROGRESS`, `IMPLEMENTED`, `TESTED`, `VERIFIED`, `BLOCKED`.

## Product area

- [IN PROGRESS] Maintain autonomous build state docs and never rely on undocumented session memory.
- [IN PROGRESS] Provide a golfer-facing order application with loading, empty, success, error, offline, and permission-denied states.
- [NOT STARTED] Implement full checkout, order tracking, substitutions, partial delivery, cancellation, refunds, and after-round meals.

## User role

- [IMPLEMENTED] Define all required roles: guest golfer, registered golfer, club member, beverage-cart staff, runner, kitchen employee, restaurant server, inventory manager, course manager, course owner, platform administrator.
- [TESTED] Enforce initial staff-vs-golfer order-management capability in core rules.
- [NOT STARTED] Complete end-to-end workflows and prohibited-action checks for every role.

## Technical system

- [IMPLEMENTED] Establish TypeScript build, lint, format, test, and static web shell.
- [TESTED] Add deterministic core order summarization tests.
- [NOT STARTED] Add realtime APIs, persistence, offline recovery, environment validation, observability, and deployment automation.

## Security

- [TESTED] Add first tenant-isolation rule that blocks cross-course access except platform administrators.
- [NOT STARTED] Implement authentication, authorization middleware, RLS, guest tokens, QR tokens, rate limiting, audit logs, secret scanning, input hardening, and error-leak prevention.

## Database

- [NOT STARTED] Create migrations, seed data, RLS policies, migration validation, and database documentation backed by executable checks.

## Payments

- [NOT STARTED] Implement payment adapter interface, card test adapter, member-account charging, minimum-spend ledger, idempotency, webhooks, refunds, reversals, and production Stripe blocker documentation.

## Location

- [NOT STARTED] Implement golfer location capture, course delivery notes, staff tracking, retention policy, poor-connection recovery, and missing map-provider blocker handling.

## Alcohol compliance

- [TESTED] Core order summary flags alcohol items as requiring physical ID confirmation.
- [NOT STARTED] Implement staff ID confirmation, refusal workflow, alcohol audit records, and privacy retention rules.

## Inventory

- [TESTED] Core summary creates inventory reservations and detects insufficient cart stock.
- [NOT STARTED] Implement database-backed reservation, release, substitution, unavailable-item, inventory manager, and cart-specific stock workflows.

## Kitchen

- [TESTED] Core summary routes kitchen-required items.
- [NOT STARTED] Implement kitchen queue, prep-time adjustments, restaurant table confirmation, runner handoff, and meal timing.

## Course operations

- [NOT STARTED] Implement staff reassignment, beverage cart operations, course onboarding, owner/admin controls, POS and club-management adapters.

## Testing

- [IN PROGRESS] Establish format, typecheck, lint, unit, build validation commands.
- [NOT STARTED] Add integration, e2e, RLS, tenant-isolation database, mobile, accessibility, payment, and production-readiness suites.

## Deployment

- [NOT STARTED] Document and verify clean install, zero-database migration, seed, web build, mobile build, monitoring, logging, backup, deployment, rollback, and production credential procedures.

## Accessibility

- [IN PROGRESS] Static shell includes semantic main region, aria-live region, accessible button description, focus outline, and responsive layout.
- [NOT STARTED] Complete screen-reader, keyboard, contrast, dynamic text, reduced-motion, and multi-breakpoint audits for every major screen.

## Final acceptance criteria

- [NOT STARTED] Complete every phase, every full-review loop, every role walkthrough, every order scenario, and final report with evidence.
