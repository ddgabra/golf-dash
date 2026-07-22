# Step Loop State

## Current phase

Phase 04 — Menu (granular)

## Current step number

04.11

## Current step title

Add/verify variant selection

## Current step-loop number

1

## Exact requirement

Product detail page must allow selecting size/variant before adding to cart; selection must persist on the cart line.

## Existing implementation

- `app/menu/[id]/page.tsx` + `components/pages/ProductDetailPage.tsx` with variant radio buttons
- Variant stored on `CartLine.variant`
- Playwright test `product detail page supports customization` passes

## Defects discovered

- None for variant selection on food products with variants

## Files being changed

- `components/pages/ProductDetailPage.tsx` (verified)
- `tests/playwright/workflows.spec.ts`

## Tests required

- `npx playwright test tests/playwright/workflows.spec.ts`
- Unit tests for cart line with variant

## Viewports required

- 390 × 844 (verified via Playwright mobile project)

## Roles required

- guest_golfer

## Current status

TESTING

## Next action

Verify variant appears on checkout line display, then mark 04.11 VERIFIED and continue 04.12.
