# Next Action

**Phase:** 04 — Menu (granular)  
**Step:** 04.11 — Add/verify variant selection  
**Step-loop:** 1  
**Defect being repaired:** Verify variant selection displays on checkout cart line after add  
**Tests to rerun:**

- `npx playwright test tests/playwright/workflows.spec.ts --project=chromium-mobile`
- `npm run test`

**Files involved:**

- `components/pages/ProductDetailPage.tsx`
- `components/pages/CheckoutPage.tsx`
- `tests/playwright/workflows.spec.ts`

Continue the current individual-step loop. Do not move to the next step until this step is verified. Do not request approval or a pull-request merge.
