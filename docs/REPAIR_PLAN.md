# FairwayServe Repair Plan — Phase & Step Hierarchy

Granular individually verifiable steps. Each step requires its own verification loop before proceeding.

## Phase 00 — Tracking & browser infrastructure

| Step  | Title                                                                  |
| ----- | ---------------------------------------------------------------------- |
| 00.01 | Create STEP_LOOP_STATE.md, STEP_VERIFICATION_LOG.md, REGRESSION_LOG.md |
| 00.02 | Install Playwright and Chromium                                        |
| 00.03 | Create Playwright config and dev-server webServer hook                 |
| 00.04 | Verify Playwright can load `/round` at 390×844                         |

## Phase 01 — Repository foundation & validation

| Step  | Title                                              |
| ----- | -------------------------------------------------- |
| 01.01 | Verify `npm run format:check` passes               |
| 01.02 | Verify `npm run typecheck` passes                  |
| 01.03 | Verify `npm run lint` passes                       |
| 01.04 | Verify `npm run test` (20 unit tests) passes       |
| 01.05 | Verify `npm run build` passes                      |
| 01.06 | Verify seed data: 18 holes, 42 products, 9 roles   |
| 01.07 | Verify corrupt-storage recovery in store.ts        |
| 01.08 | Verify multi-tab BroadcastChannel sync hook exists |

## Phase 02 — App shell, navigation & roles

| Step  | Title                                               |
| ----- | --------------------------------------------------- |
| 02.01 | Verify loading state renders with aria-live         |
| 02.02 | Verify FairwayServe header and logo link to /round  |
| 02.03 | Verify role-filtered navigation per role            |
| 02.04 | Verify demo role switcher changes nav and access    |
| 02.05 | Verify RouteGuard blocks unauthorized direct routes |
| 02.06 | Verify offline banner when data.offline             |
| 02.07 | Verify notification toasts render                   |
| 02.08 | Verify cart count badge in nav when applicable      |

## Phase 03 — Round screen

| Step  | Title                                                 |
| ----- | ----------------------------------------------------- |
| 03.01 | Verify round page loads with active session           |
| 03.02 | Verify course stats (hole, progress, pace)            |
| 03.03 | Verify 18-hole course map renders                     |
| 03.04 | Verify meeting point display                          |
| 03.05 | Verify Start demo round action                        |
| 03.06 | Verify round setup form controls                      |
| 03.07 | Verify current hole selection updates map             |
| 03.08 | Verify meeting point manual selection not overwritten |
| 03.09 | Verify link to menu                                   |
| 03.10 | Verify responsive layout at all viewports             |

## Phase 04 — Menu (granular)

| Step  | Title                                                 |
| ----- | ----------------------------------------------------- |
| 04.01 | Build/verify mobile menu header (search + cart)       |
| 04.02 | Verify search filters products                        |
| 04.03 | Add/verify horizontal category controls               |
| 04.04 | Verify category filtering                             |
| 04.05 | Verify product-card hierarchy                         |
| 04.06 | Verify product-card spacing and actions               |
| 04.07 | Verify product visuals (image tokens)                 |
| 04.08 | Verify product visuals at every viewport              |
| 04.09 | Add/verify product-details route                      |
| 04.10 | Verify product routing                                |
| 04.11 | Add/verify variant selection                          |
| 04.12 | Verify variant selection                              |
| 04.13 | Add/verify required modifiers                         |
| 04.14 | Verify required modifiers cannot be skipped           |
| 04.15 | Add/verify optional modifiers                         |
| 04.16 | Verify optional modifiers                             |
| 04.17 | Add/verify quantity controls                          |
| 04.18 | Verify quantity controls                              |
| 04.19 | Add/verify notes on cart lines                        |
| 04.20 | Verify notes persist                                  |
| 04.21 | Add/verify substitution preference                    |
| 04.22 | Verify substitution preference                        |
| 04.23 | Verify Add to Order action                            |
| 04.24 | Verify loading, success, error, disabled states       |
| 04.25 | Verify menu scroll position preserved                 |
| 04.26 | Verify favourites toggle and filter                   |
| 04.27 | Regression: search, filtering, favourites, cart count |

## Phase 05 — Checkout (granular)

| Step  | Title                                   |
| ----- | --------------------------------------- |
| 05.01 | Verify cart grouping by fulfilment type |
| 05.02 | Verify quantity increase                |
| 05.03 | Verify quantity decrease                |
| 05.04 | Verify remove item                      |
| 05.05 | Verify edit customization               |
| 05.06 | Verify unavailable-item state           |
| 05.07 | Verify fulfilment selection per line    |
| 05.08 | Verify immediate delivery timing        |
| 05.09 | Verify selected-hole delivery timing    |
| 05.10 | Verify delayed delivery timing          |
| 05.11 | Verify turn delivery timing             |
| 05.12 | Verify clubhouse pickup fulfilment      |
| 05.13 | Verify dining-room fulfilment           |
| 05.14 | Verify patio fulfilment                 |
| 05.15 | Verify takeout fulfilment               |
| 05.16 | Verify after-round meal timing          |
| 05.17 | Verify requested ready time             |
| 05.18 | Verify estimated arrival display        |
| 05.19 | Verify party size (if applicable)       |
| 05.20 | Verify accessibility note               |
| 05.21 | Verify meeting location                 |
| 05.22 | Verify tip selection                    |
| 05.23 | Verify payment selection                |
| 05.24 | Verify alcohol confirmation             |
| 05.25 | Verify price calculation                |
| 05.26 | Verify minimum-spend calculation        |
| 05.27 | Verify validation summary / errors      |
| 05.28 | Verify duplicate-click protection       |
| 05.29 | Verify cross-tab duplicate protection   |
| 05.30 | Verify loading state                    |
| 05.31 | Verify payment failure state            |
| 05.32 | Verify successful order creation        |
| 05.33 | Verify confirmation redirect to orders  |
| 05.34 | Verify cart clearing after order        |
| 05.35 | Verify refresh persistence              |
| 05.36 | Verify empty cart state                 |

## Phase 06 — Orders

| Step  | Title                                     |
| ----- | ----------------------------------------- |
| 06.01 | Verify order history list                 |
| 06.02 | Verify fulfilment status display          |
| 06.03 | Verify ETA display                        |
| 06.04 | Verify advance fulfilment (staff/manager) |
| 06.05 | Verify alcohol refusal flow               |
| 06.06 | Verify reorder action                     |
| 06.07 | Verify empty orders state                 |

## Phase 07 — Member account

| Step  | Title                                         |
| ----- | --------------------------------------------- |
| 07.01 | Verify member dashboard loads for club_member |
| 07.02 | Verify minimum-spend progress                 |
| 07.03 | Verify member tied to active identity         |
| 07.04 | Verify recent adjustments list                |
| 07.05 | Verify route blocked for non-members          |

## Phase 08 — Staff operations (granular)

| Step  | Title                                   |
| ----- | --------------------------------------- |
| 08.01 | Verify shift-start entry screen         |
| 08.02 | Verify cart selection display           |
| 08.03 | Verify alcohol-eligibility context      |
| 08.04 | Verify starting-inventory review        |
| 08.05 | Verify availability control buttons     |
| 08.06 | Verify incoming-task list               |
| 08.07 | Verify task details                     |
| 08.08 | Verify task acceptance                  |
| 08.09 | Verify exclusive acceptance             |
| 08.10 | Verify structured decline               |
| 08.11 | Verify reassignment request             |
| 08.12 | Verify clubhouse pickup state           |
| 08.13 | Verify item collection confirmation     |
| 08.14 | Verify en-route action                  |
| 08.15 | Verify cart movement display            |
| 08.16 | Verify arrival action                   |
| 08.17 | Verify unable-to-locate flow            |
| 08.18 | Verify item-level handoff               |
| 08.19 | Verify alcohol verification             |
| 08.20 | Verify alcohol refusal on staff page    |
| 08.21 | Verify payment adjustment after refusal |
| 08.22 | Verify inventory deduction              |
| 08.23 | Verify delivery completion              |
| 08.24 | Verify shift-end reconciliation         |
| 08.25 | Verify runner role staff UI             |

## Phase 09 — Kitchen

| Step  | Title                         |
| ----- | ----------------------------- |
| 09.01 | Verify kitchen display kanban |
| 09.02 | Verify ticket advance         |
| 09.03 | Verify delay action           |
| 09.04 | Verify contact golfer         |
| 09.05 | Verify reject kitchen item    |

## Phase 10 — Restaurant

| Step  | Title                           |
| ----- | ------------------------------- |
| 10.01 | Verify dining requests list     |
| 10.02 | Verify approaching groups       |
| 10.03 | Verify advance request workflow |
| 10.04 | Verify table ready action       |

## Phase 11 — Manager

| Step  | Title                              |
| ----- | ---------------------------------- |
| 11.01 | Verify operating toggles           |
| 11.02 | Verify alcohol pause blocks orders |
| 11.03 | Verify staff status list           |
| 11.04 | Verify all 42 products editable    |
| 11.05 | Verify inventory snapshot          |
| 11.06 | Verify manager reassignment UI     |

## Phase 12 — Analytics & Demo

| Step  | Title                                       |
| ----- | ------------------------------------------- |
| 12.01 | Verify analytics with real order data       |
| 12.02 | Verify analytics empty state (no fake data) |
| 12.03 | Verify demo control centre simulations      |
| 12.04 | Verify demo role quick switch               |

## Phase 13 — Responsive & accessibility

| Step  | Title                                |
| ----- | ------------------------------------ |
| 13.01 | Verify 320×568 layouts               |
| 13.02 | Verify 390×844 layouts               |
| 13.03 | Verify 768×1024 layouts              |
| 13.04 | Verify 1024×768 layouts              |
| 13.05 | Verify 1440×900 layouts              |
| 13.06 | Verify focus states and keyboard nav |
| 13.07 | Verify reduced-motion preference     |

## Phase 14 — Final project verification

| Step  | Title                                                   |
| ----- | ------------------------------------------------------- |
| 14.01 | Full guest golfer workflow (round→menu→checkout→orders) |
| 14.02 | Full club member mixed-fulfilment workflow              |
| 14.03 | Full alcohol refusal workflow (23 steps)                |
| 14.04 | Full staff delivery workflow                            |
| 14.05 | Role restriction audit all routes                       |
| 14.06 | Multi-tab sync verification                             |
| 14.07 | Run complete `npm run validate` + Playwright suite      |
