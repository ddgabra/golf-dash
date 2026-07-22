# Testing

Current commands:

- `npm run format` / `npm run format:check` — Prettier
- `npm run typecheck` — strict TypeScript
- `npm run lint` — ESLint + custom lint script
- `npm run test` — node:test unit tests (21 tests)
- `npm run test:e2e` — node:test workflow tests (6 tests)
- `npm run test:browser` — Playwright browser tests (real Chromium)
- `npm run test:browser:smoke` — Playwright smoke subset
- `npm run validate` — format + typecheck + lint + test + test:e2e + build

Playwright tests live in `tests/playwright/` and start the dev server automatically via `playwright.config.ts`.
